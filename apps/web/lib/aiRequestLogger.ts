/**
 * AI Request Logger
 * Logs all AI requests with prompts, responses, and metadata for audit trail
 * In production, should write to database table AIRequestLog
 */

export interface AIRequestLog {
  id: string;
  orgId: string;
  userId: string;
  endpoint: string;
  prompt: string;
  response: string;
  model: string;
  tokensUsed?: number;
  durationMs: number;
  status: 'success' | 'error';
  errorMessage?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

// In-memory store (in production, use database)
const logs: AIRequestLog[] = [];

export class AIRequestLogger {
  /**
   * Log AI request
   */
  static async log(log: Omit<AIRequestLog, 'id' | 'createdAt'>): Promise<void> {
    const entry: AIRequestLog = {
      ...log,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };

    logs.push(entry);

    // TODO: In production, write to database
    // await prisma.aIRequestLog.create({ data: entry });

    // Keep only last 1000 logs in memory
    if (logs.length > 1000) {
      logs.shift();
    }

    console.log('[AI Request Log]', {
      endpoint: entry.endpoint,
      orgId: entry.orgId,
      status: entry.status,
      durationMs: entry.durationMs,
    });
  }

  /**
   * Get logs for organization
   */
  static async getOrgLogs(orgId: string, limit = 100): Promise<AIRequestLog[]> {
    return logs.filter((log) => log.orgId === orgId).slice(-limit);
  }

  /**
   * Get logs for specific endpoint
   */
  static async getEndpointLogs(
    orgId: string,
    endpoint: string,
    limit = 100
  ): Promise<AIRequestLog[]> {
    return logs
      .filter((log) => log.orgId === orgId && log.endpoint === endpoint)
      .slice(-limit);
  }
}
