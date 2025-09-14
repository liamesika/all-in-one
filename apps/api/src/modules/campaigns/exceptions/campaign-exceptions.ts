import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Campaign-specific exception classes
 * 
 * Provides standardized error handling with proper HTTP status codes
 * and user-friendly error messages.
 */

export class CampaignNotFoundException extends HttpException {
  constructor(campaignId: string) {
    super(
      {
        error: 'Campaign Not Found',
        message: `Campaign with ID "${campaignId}" was not found`,
        statusCode: HttpStatus.NOT_FOUND,
        timestamp: new Date().toISOString(),
        details: { campaignId }
      },
      HttpStatus.NOT_FOUND
    );
  }
}

export class CampaignValidationException extends HttpException {
  constructor(errors: Array<{ field: string; message: string; code?: string }>) {
    super(
      {
        error: 'Campaign Validation Failed',
        message: 'The campaign data provided is invalid',
        statusCode: HttpStatus.BAD_REQUEST,
        timestamp: new Date().toISOString(),
        details: { validationErrors: errors }
      },
      HttpStatus.BAD_REQUEST
    );
  }
}

export class CampaignUnauthorizedException extends HttpException {
  constructor(campaignId: string, userId: string) {
    super(
      {
        error: 'Unauthorized Access',
        message: 'You do not have permission to access this campaign',
        statusCode: HttpStatus.FORBIDDEN,
        timestamp: new Date().toISOString(),
        details: { campaignId, userId }
      },
      HttpStatus.FORBIDDEN
    );
  }
}

export class CampaignConflictException extends HttpException {
  constructor(message: string, details?: any) {
    super(
      {
        error: 'Campaign Conflict',
        message,
        statusCode: HttpStatus.CONFLICT,
        timestamp: new Date().toISOString(),
        details
      },
      HttpStatus.CONFLICT
    );
  }
}

export class CampaignServiceException extends HttpException {
  constructor(operation: string, originalError?: Error) {
    super(
      {
        error: 'Campaign Service Error',
        message: `Failed to ${operation}. Please try again later.`,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        timestamp: new Date().toISOString(),
        details: {
          operation,
          originalError: originalError?.message
        }
      },
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

export class CampaignRateLimitException extends HttpException {
  constructor(operation: string, retryAfter: number) {
    super(
      {
        error: 'Rate Limit Exceeded',
        message: `Too many ${operation} requests. Please try again later.`,
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        timestamp: new Date().toISOString(),
        details: {
          operation,
          retryAfter
        }
      },
      HttpStatus.TOO_MANY_REQUESTS
    );
  }
}

export class PlatformIntegrationException extends HttpException {
  constructor(platform: string, operation: string, platformError?: any) {
    super(
      {
        error: 'Platform Integration Error',
        message: `Failed to ${operation} with ${platform}. The advertising platform may be temporarily unavailable.`,
        statusCode: HttpStatus.BAD_GATEWAY,
        timestamp: new Date().toISOString(),
        details: {
          platform,
          operation,
          platformError: platformError?.message || platformError
        }
      },
      HttpStatus.BAD_GATEWAY
    );
  }
}

export class OAuthException extends HttpException {
  constructor(platform: string, operation: string, details?: any) {
    super(
      {
        error: 'OAuth Authentication Error',
        message: `Authentication with ${platform} failed during ${operation}. Please reconnect your account.`,
        statusCode: HttpStatus.UNAUTHORIZED,
        timestamp: new Date().toISOString(),
        details: {
          platform,
          operation,
          ...details
        }
      },
      HttpStatus.UNAUTHORIZED
    );
  }
}

/**
 * Exception Filter for Campaign-related errors
 * 
 * Provides consistent error responses across the campaign system
 */
export function handleCampaignError(error: any, operation: string): never {
  // Log the original error for debugging
  console.error(`Campaign ${operation} error:`, error);

  // Handle known error types
  if (error.name === 'PrismaClientKnownRequestError') {
    if (error.code === 'P2002') {
      throw new CampaignConflictException(
        'A campaign with this data already exists',
        { prismaError: error.code }
      );
    }
    if (error.code === 'P2025') {
      throw new CampaignNotFoundException(error.meta?.target || 'unknown');
    }
  }

  if (error.name === 'ValidationError') {
    throw new CampaignValidationException(
      error.errors || [{ field: 'unknown', message: error.message }]
    );
  }

  if (error.status >= 400 && error.status < 500) {
    // Re-throw HTTP exceptions
    throw error;
  }

  // Default to service exception
  throw new CampaignServiceException(operation, error);
}

/**
 * Validation helper functions
 */
export function validateCampaignData(data: any): Array<{ field: string; message: string; code?: string }> {
  const errors: Array<{ field: string; message: string; code?: string }> = [];

  if (!data.goal || typeof data.goal !== 'string' || data.goal.trim().length === 0) {
    errors.push({
      field: 'goal',
      message: 'Campaign goal is required and must be a non-empty string',
      code: 'REQUIRED_FIELD'
    });
  }

  if (!data.copy || typeof data.copy !== 'string' || data.copy.trim().length === 0) {
    errors.push({
      field: 'copy',
      message: 'Campaign copy is required and must be a non-empty string',
      code: 'REQUIRED_FIELD'
    });
  }

  if (data.copy && data.copy.length > 500) {
    errors.push({
      field: 'copy',
      message: 'Campaign copy must be 500 characters or less',
      code: 'MAX_LENGTH_EXCEEDED'
    });
  }

  if (!data.ownerUid || typeof data.ownerUid !== 'string' || data.ownerUid.trim().length === 0) {
    errors.push({
      field: 'ownerUid',
      message: 'Owner UID is required and must be a valid string',
      code: 'REQUIRED_FIELD'
    });
  }

  if (data.image && typeof data.image === 'string') {
    try {
      new URL(data.image);
    } catch {
      errors.push({
        field: 'image',
        message: 'Image must be a valid URL',
        code: 'INVALID_URL'
      });
    }
  }

  if (data.status && !['DRAFT', 'READY', 'SCHEDULED', 'ACTIVE', 'PAUSED', 'ARCHIVED'].includes(data.status)) {
    errors.push({
      field: 'status',
      message: 'Status must be one of: DRAFT, READY, SCHEDULED, ACTIVE, PAUSED, ARCHIVED',
      code: 'INVALID_ENUM_VALUE'
    });
  }

  if (data.audience && typeof data.audience === 'object') {
    const audience = data.audience;
    
    if (audience.ageMin && (typeof audience.ageMin !== 'number' || audience.ageMin < 13 || audience.ageMin > 100)) {
      errors.push({
        field: 'audience.ageMin',
        message: 'Minimum age must be between 13 and 100',
        code: 'INVALID_RANGE'
      });
    }

    if (audience.ageMax && (typeof audience.ageMax !== 'number' || audience.ageMax < 13 || audience.ageMax > 100)) {
      errors.push({
        field: 'audience.ageMax',
        message: 'Maximum age must be between 13 and 100',
        code: 'INVALID_RANGE'
      });
    }

    if (audience.ageMin && audience.ageMax && audience.ageMin > audience.ageMax) {
      errors.push({
        field: 'audience.ageRange',
        message: 'Minimum age must be less than or equal to maximum age',
        code: 'INVALID_RANGE'
      });
    }

    if (audience.locations && Array.isArray(audience.locations)) {
      if (audience.locations.length > 10) {
        errors.push({
          field: 'audience.locations',
          message: 'Maximum of 10 locations allowed',
          code: 'MAX_ARRAY_LENGTH_EXCEEDED'
        });
      }
    }

    if (audience.interests && Array.isArray(audience.interests)) {
      if (audience.interests.length > 25) {
        errors.push({
          field: 'audience.interests',
          message: 'Maximum of 25 interests allowed',
          code: 'MAX_ARRAY_LENGTH_EXCEEDED'
        });
      }
    }
  }

  return errors;
}

/**
 * Rate limiting helper
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  isRateLimited(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(key) || [];
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(time => now - time < windowMs);
    
    if (validRequests.length >= maxRequests) {
      return true;
    }
    
    // Add current request
    validRequests.push(now);
    this.requests.set(key, validRequests);
    
    return false;
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, requests] of this.requests.entries()) {
      const validRequests = requests.filter(time => now - time < 3600000); // 1 hour
      if (validRequests.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, validRequests);
      }
    }
  }
}