import { Injectable, Logger } from '@nestjs/common';
import { EnvService } from './env.service';

export interface RequestConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
}

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number; // milliseconds
  maxDelay: number; // milliseconds
  backoffFactor: number;
  retryableStatuses: number[];
  retryableErrors: string[];
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  requestId?: string;
}

export interface ApiError {
  status?: number;
  statusText?: string;
  message: string;
  code?: string;
  provider?: string;
  requestId?: string;
  retryAfter?: number;
  details?: any;
}

@Injectable()
export class ProviderClientService {
  private readonly logger = new Logger(ProviderClientService.name);

  private readonly defaultRetryConfig: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000, // 1 second
    maxDelay: 30000, // 30 seconds
    backoffFactor: 2,
    retryableStatuses: [408, 429, 500, 502, 503, 504],
    retryableErrors: ['ECONNRESET', 'ECONNREFUSED', 'ETIMEDOUT', 'EAI_AGAIN'],
  };

  constructor(private readonly envService: EnvService) {}

  /**
   * Make HTTP request with retry logic and comprehensive error handling
   */
  async request<T = any>(
    provider: string,
    config: RequestConfig,
    retryConfig: Partial<RetryConfig> = {}
  ): Promise<ApiResponse<T>> {
    const finalRetryConfig = { ...this.defaultRetryConfig, ...retryConfig };
    const requestId = this.generateRequestId();

    this.logger.log(`Making ${config.method} request to ${provider}`, {
      requestId,
      url: this.sanitizeUrl(config.url),
      provider,
    });

    for (let attempt = 0; attempt <= finalRetryConfig.maxRetries; attempt++) {
      try {
        const response = await this.makeHttpRequest(config, requestId);

        this.logger.log(`Request successful to ${provider}`, {
          requestId,
          provider,
          status: response.status,
          attempt: attempt + 1,
        });

        return response as ApiResponse<T>;
      } catch (error) {
        const isLastAttempt = attempt === finalRetryConfig.maxRetries;
        const shouldRetry = this.shouldRetry(error, finalRetryConfig);

        if (isLastAttempt || !shouldRetry) {
          this.logger.error(`Request failed to ${provider} (final attempt)`, {
            requestId,
            provider,
            error: error.message,
            status: error.status,
            attempt: attempt + 1,
            totalAttempts: finalRetryConfig.maxRetries + 1,
          });

          throw this.normalizeError(error, provider, requestId);
        }

        const delay = this.calculateRetryDelay(attempt, finalRetryConfig, error.retryAfter);

        this.logger.warn(`Request failed to ${provider}, retrying in ${delay}ms`, {
          requestId,
          provider,
          error: error.message,
          status: error.status,
          attempt: attempt + 1,
          nextRetryIn: delay,
        });

        await this.sleep(delay);
      }
    }

    // This should never be reached, but TypeScript requires it
    throw new Error('Unexpected error in retry loop');
  }

  /**
   * Make OAuth token exchange requests with specific error handling
   */
  async requestOAuthToken<T = any>(
    provider: string,
    tokenUrl: string,
    tokenData: Record<string, string>,
    retryConfig?: Partial<RetryConfig>
  ): Promise<ApiResponse<T>> {
    const config: RequestConfig = {
      url: tokenUrl,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': `Effinity-Platform/1.0 (${provider}-integration)`,
        'Accept': 'application/json',
      },
      body: new URLSearchParams(tokenData).toString(),
      timeout: 10000, // 10 seconds for token requests
    };

    try {
      return await this.request(`${provider}-oauth`, config, {
        ...retryConfig,
        maxRetries: 2, // OAuth tokens usually shouldn't be retried too much
        retryableStatuses: [500, 502, 503, 504], // Don't retry 4xx for OAuth
      });
    } catch (error) {
      // Enhance error with OAuth-specific context
      throw this.enhanceOAuthError(error, provider);
    }
  }

  /**
   * Make API requests to platform-specific endpoints
   */
  async requestPlatformApi<T = any>(
    provider: string,
    endpoint: string,
    accessToken: string,
    options: Partial<RequestConfig> = {},
    retryConfig?: Partial<RetryConfig>
  ): Promise<ApiResponse<T>> {
    const config: RequestConfig = {
      method: 'GET',
      timeout: 30000, // 30 seconds for API requests
      ...options,
      url: endpoint,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': `Effinity-Platform/1.0 (${provider}-integration)`,
        'Accept': 'application/json',
        ...options.headers,
      },
    };

    try {
      return await this.request(`${provider}-api`, config, retryConfig);
    } catch (error) {
      // Check if this might be a token expiration issue
      if (this.isTokenExpiredError(error)) {
        this.logger.warn(`Possible token expiration for ${provider}`, {
          provider,
          status: error.status,
          error: error.message,
        });
      }

      throw error;
    }
  }

  private async makeHttpRequest<T>(config: RequestConfig, requestId: string): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout || 30000);

    try {
      const response = await fetch(config.url, {
        method: config.method,
        headers: config.headers || {},
        body: config.body,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      let data: T;
      const contentType = response.headers.get('content-type') || '';

      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text() as any;
      }

      if (!response.ok) {
        throw {
          status: response.status,
          statusText: response.statusText,
          message: this.extractErrorMessage(data),
          data,
          headers: Object.fromEntries(response.headers.entries()),
          requestId,
        };
      }

      return {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        requestId,
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw {
          status: 408,
          statusText: 'Request Timeout',
          message: 'Request timed out',
          code: 'TIMEOUT',
          requestId,
        };
      }

      if (error.status) {
        throw error; // Already formatted error from !response.ok
      }

      // Network or other errors
      throw {
        message: error.message || 'Network error',
        code: error.code || 'NETWORK_ERROR',
        requestId,
      };
    }
  }

  private shouldRetry(error: any, retryConfig: RetryConfig): boolean {
    // Check status codes
    if (error.status && retryConfig.retryableStatuses.includes(error.status)) {
      return true;
    }

    // Check error codes
    if (error.code && retryConfig.retryableErrors.includes(error.code)) {
      return true;
    }

    // Don't retry 4xx errors (except 408 and 429)
    if (error.status && error.status >= 400 && error.status < 500) {
      return error.status === 408 || error.status === 429;
    }

    return false;
  }

  private calculateRetryDelay(attempt: number, config: RetryConfig, retryAfter?: number): number {
    // Honor Retry-After header if present
    if (retryAfter) {
      return Math.min(retryAfter * 1000, config.maxDelay);
    }

    // Exponential backoff with jitter
    const exponentialDelay = config.baseDelay * Math.pow(config.backoffFactor, attempt);
    const jitter = Math.random() * 0.1 * exponentialDelay; // 10% jitter

    return Math.min(exponentialDelay + jitter, config.maxDelay);
  }

  private normalizeError(error: any, provider: string, requestId: string): ApiError {
    const normalized: ApiError = {
      status: error.status,
      statusText: error.statusText,
      message: error.message || 'Unknown error',
      provider,
      requestId,
    };

    if (error.code) {
      normalized.code = error.code;
    }

    if (error.retryAfter) {
      normalized.retryAfter = error.retryAfter;
    }

    if (error.data) {
      normalized.details = error.data;
    }

    return normalized;
  }

  private enhanceOAuthError(error: any, provider: string): ApiError {
    const enhanced = { ...error };

    // Add provider-specific OAuth error handling
    if (error.status === 400) {
      enhanced.message = 'OAuth authorization failed - check credentials and redirect URI';
    } else if (error.status === 401) {
      enhanced.message = 'OAuth authorization failed - invalid client credentials';
    }

    enhanced.code = `OAUTH_${enhanced.code || 'ERROR'}`;

    return enhanced;
  }

  private isTokenExpiredError(error: any): boolean {
    if (error.status === 401) {
      return true;
    }

    const message = (error.message || '').toLowerCase();
    const expiredKeywords = ['expired', 'invalid_grant', 'token', 'unauthorized'];

    return expiredKeywords.some(keyword => message.includes(keyword));
  }

  private extractErrorMessage(data: any): string {
    if (typeof data === 'string') {
      return data;
    }

    if (data && typeof data === 'object') {
      // Try common error message fields
      const messageFields = ['error_description', 'message', 'error', 'detail', 'details'];
      for (const field of messageFields) {
        if (data[field]) {
          return String(data[field]);
        }
      }

      // Try nested error objects
      if (data.error && typeof data.error === 'object') {
        return this.extractErrorMessage(data.error);
      }
    }

    return 'Unknown error';
  }

  private sanitizeUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      // Remove sensitive query parameters
      const sensitiveParams = ['access_token', 'client_secret', 'code', 'refresh_token'];
      sensitiveParams.forEach(param => {
        if (urlObj.searchParams.has(param)) {
          urlObj.searchParams.set(param, '[REDACTED]');
        }
      });
      return urlObj.toString();
    } catch {
      return url.replace(/([?&](?:access_token|client_secret|code|refresh_token)=)[^&]+/g, '$1[REDACTED]');
    }
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Health check endpoint for monitoring
   */
  async healthCheck(): Promise<{ status: string; timestamp: string; version: string }> {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }

  /**
   * Get service statistics for observability
   */
  getStats(): {
    uptime: number;
    environment: string;
    nodeVersion: string;
  } {
    return {
      uptime: process.uptime(),
      environment: this.envService.get('NODE_ENV'),
      nodeVersion: process.version,
    };
  }
}