import { Injectable, Logger } from '@nestjs/common';
import { BotDataService, UserDataSnapshot } from './bot-data.service';
import { BotToolsService, BotToolResult } from './bot-tools.service';
import { PrismaService } from './prisma.service';
import { EnvService } from './env.service';
import OpenAI from 'openai';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  toolCalls?: any[];
  metadata?: {
    tokens?: number;
    model?: string;
    duration?: number;
  };
}

export interface ChatSession {
  id: string;
  ownerUid: string;
  messages: ChatMessage[];
  language: 'he' | 'en';
  createdAt: string;
  updatedAt: string;
  metadata?: {
    userAgent?: string;
    sessionStart?: string;
  };
}

export interface BotToolCall {
  id: string;
  name: string;
  parameters: Record<string, any>;
}

export interface BotResponse {
  message: string;
  toolCalls?: BotToolCall[];
  toolResults?: Array<BotToolResult & { toolCall: BotToolCall }>;
  suggestions?: Array<{
    text: string;
    action: string;
    params?: Record<string, any>;
  }>;
  language: 'he' | 'en';
  metadata: {
    tokens: number;
    model: string;
    duration: number;
    cached?: boolean;
  };
}

@Injectable()
export class AiCoachService {
  private readonly logger = new Logger(AiCoachService.name);
  private readonly openai: OpenAI;
  private readonly sessionCache = new Map<string, ChatSession>();
  private readonly RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
  private readonly RATE_LIMIT_MAX_REQUESTS = 10;
  private readonly rateLimitTracker = new Map<string, { count: number; resetTime: number }>();

  constructor(
    private readonly botDataService: BotDataService,
    private readonly botToolsService: BotToolsService,
    private readonly prisma: PrismaService,
    private readonly envService: EnvService
  ) {
    const apiKey = this.envService.get('OPENAI_API_KEY');
    if (!apiKey) {
      this.logger.warn('OPENAI_API_KEY not configured, AI coach will be disabled');
      return;
    }

    this.openai = new OpenAI({
      apiKey,
      timeout: 30000, // 30 seconds
    });

    this.logger.log('AI Coach service initialized');
  }

  private async executeToolCalls(
    toolCalls: BotToolCall[],
    ownerUid: string,
    organizationId?: string
  ): Promise<Array<BotToolResult & { toolCall: BotToolCall }>> {
    const results: Array<BotToolResult & { toolCall: BotToolCall }> = [];

    for (const toolCall of toolCalls) {
      this.logger.log(`Executing tool ${toolCall.name} for ${ownerUid}`);

      try {
        const result = await this.botToolsService.executeToolCall(
          ownerUid,
          toolCall.name,
          toolCall.parameters,
          organizationId
        );

        results.push({
          ...result,
          toolCall,
        });

        this.logger.log(`Tool ${toolCall.name} executed:`, { success: result.success, message: result.message });
      } catch (error) {
        this.logger.error(`Failed to execute tool ${toolCall.name}:`, error);
        results.push({
          success: false,
          message: `Failed to execute ${toolCall.name}`,
          error: error.message,
          toolCall,
        });
      }
    }

    return results;
  }

  async generateWelcomeMessage(
    ownerUid: string,
    organizationId?: string,
    language: 'he' | 'en' = 'en'
  ): Promise<BotResponse> {
    const startTime = Date.now();

    try {
      // Check rate limits
      this.checkRateLimit(ownerUid);

      // Get user data snapshot
      const snapshot = await this.botDataService.getUserDataSnapshot(ownerUid, organizationId);

      // Generate contextual welcome message
      const systemPrompt = this.buildSystemPrompt(language, snapshot);
      const userPrompt = this.buildWelcomePrompt(language, snapshot);

      const completion = await this.openai.chat.completions.create({
        model: this.envService.get('OPENAI_MODEL') as string,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        functions: this.getBotTools(),
        function_call: 'auto',
        temperature: 0.7,
        max_tokens: 500,
      });

      const assistantMessage = completion.choices[0]?.message;
      if (!assistantMessage) {
        throw new Error('No response from OpenAI');
      }

      // Parse function calls if any
      const toolCalls: BotToolCall[] = [];
      if (assistantMessage.function_call) {
        try {
          const params = JSON.parse(assistantMessage.function_call.arguments || '{}');
          toolCalls.push({
            id: `tool_${Date.now()}`,
            name: assistantMessage.function_call.name,
            parameters: params,
          });
        } catch (error) {
          this.logger.warn('Failed to parse function call arguments:', error);
        }
      }

      // Execute tool calls if any
      let toolResults: Array<BotToolResult & { toolCall: BotToolCall }> = [];
      if (toolCalls.length > 0) {
        toolResults = await this.executeToolCalls(toolCalls, ownerUid, organizationId);
      }

      // Generate quick action suggestions
      const suggestions = this.generateQuickActions(snapshot, language);

      const duration = Date.now() - startTime;

      // Log metrics (no PII)
      this.logger.log(`Generated welcome message for ${ownerUid}`, {
        language,
        tokens: completion.usage?.total_tokens || 0,
        duration,
        hasRecommendations: snapshot.recommendations.length > 0,
        toolCallsExecuted: toolResults.length,
      });

      return {
        message: assistantMessage.content || '',
        toolCalls,
        toolResults,
        suggestions,
        language,
        metadata: {
          tokens: completion.usage?.total_tokens || 0,
          model: completion.model,
          duration,
        },
      };
    } catch (error) {
      this.logger.error(`Error generating welcome message for ${ownerUid}:`, error);

      // Return fallback message
      return {
        message: this.getFallbackMessage(language),
        language,
        metadata: {
          tokens: 0,
          model: 'fallback',
          duration: Date.now() - startTime,
        },
      };
    }
  }

  async processChatMessage(
    ownerUid: string,
    message: string,
    sessionId?: string,
    language: 'he' | 'en' = 'en',
    organizationId?: string
  ): Promise<BotResponse> {
    const startTime = Date.now();

    try {
      // Check rate limits
      this.checkRateLimit(ownerUid);

      // Get or create chat session
      const session = await this.getOrCreateSession(ownerUid, sessionId, language);

      // Get fresh user data
      const snapshot = await this.botDataService.getUserDataSnapshot(ownerUid, organizationId);

      // Build conversation context
      const systemPrompt = this.buildSystemPrompt(language, snapshot);
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: 'system', content: systemPrompt },
        ...session.messages.slice(-8).map(msg => ({ // Last 8 messages for context
          role: msg.role as any,
          content: msg.content,
        })),
        { role: 'user', content: message },
      ];

      const completion = await this.openai.chat.completions.create({
        model: this.envService.get('OPENAI_MODEL') as string,
        messages,
        functions: this.getBotTools(),
        function_call: 'auto',
        temperature: 0.7,
        max_tokens: 800,
      });

      const assistantMessage = completion.choices[0]?.message;
      if (!assistantMessage) {
        throw new Error('No response from OpenAI');
      }

      // Parse function calls
      const toolCalls: BotToolCall[] = [];
      if (assistantMessage.function_call) {
        try {
          const params = JSON.parse(assistantMessage.function_call.arguments || '{}');
          toolCalls.push({
            id: `tool_${Date.now()}`,
            name: assistantMessage.function_call.name,
            parameters: params,
          });
        } catch (error) {
          this.logger.warn('Failed to parse function call arguments:', error);
        }
      }

      // Execute tool calls if any
      let toolResults: Array<BotToolResult & { toolCall: BotToolCall }> = [];
      if (toolCalls.length > 0) {
        toolResults = await this.executeToolCalls(toolCalls, ownerUid, organizationId);
      }

      // Update session with messages
      this.addMessageToSession(session.id, {
        id: `msg_${Date.now()}_user`,
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
      });

      this.addMessageToSession(session.id, {
        id: `msg_${Date.now()}_assistant`,
        role: 'assistant',
        content: assistantMessage.content || '',
        timestamp: new Date().toISOString(),
        toolCalls,
        metadata: {
          tokens: completion.usage?.total_tokens || 0,
          model: completion.model,
          duration: Date.now() - startTime,
        },
      });

      const duration = Date.now() - startTime;

      // Log metrics (no PII)
      this.logger.log(`Processed chat message for ${ownerUid}`, {
        language,
        sessionId: session.id,
        tokens: completion.usage?.total_tokens || 0,
        duration,
        toolCallsCount: toolCalls.length,
        toolCallsExecuted: toolResults.length,
      });

      return {
        message: assistantMessage.content || '',
        toolCalls,
        toolResults,
        language,
        metadata: {
          tokens: completion.usage?.total_tokens || 0,
          model: completion.model,
          duration,
        },
      };
    } catch (error) {
      this.logger.error(`Error processing chat message for ${ownerUid}:`, error);

      return {
        message: this.getFallbackMessage(language, 'chat_error'),
        language,
        metadata: {
          tokens: 0,
          model: 'fallback',
          duration: Date.now() - startTime,
        },
      };
    }
  }

  private buildSystemPrompt(language: 'he' | 'en', snapshot: UserDataSnapshot): string {
    const isHebrew = language === 'he';

    const basePrompt = isHebrew ? `
אתה המאמן העסקי האישי של המשתמש. אתה עוזר לו לנהל את העסק שלו בפלטפורמה הזו.

הנחיות:
- תמיד תהיה תמציתי, פרקטי ופעיל
- תשתמש בנתונים של המשתמש כדי לתת המלצות ספציפיות
- אל תשאל שאלות כלליות - אתה כבר מכיר את הנתונים
- תענה בעברית בלבד
- תציע פעולות קונקרטיות שהמשתמש יכול לבצע

רול: מאמן עסקי אישי
שפה: עברית
טון: ידידותי אבל מקצועי
אורך תשובות: קצר ומעשי (עד 3 משפטים)
` : `
You are the user's personal business coach for this platform. You help them manage their business efficiently.

Guidelines:
- Always be concise, practical, and actionable
- Use the user's actual data to provide specific recommendations
- Don't ask generic questions - you already know their data
- Respond in English only
- Suggest concrete actions the user can take

Role: Personal Business Coach
Language: English
Tone: Friendly but professional
Response length: Short and practical (max 3 sentences)
`;

    // Add data context (sanitized)
    const dataContext = isHebrew ? `
נתוני המשתמש (נכון לעכשיו):
- לידים: ${snapshot.leads.stats.total} סה"כ, ${snapshot.leads.stats.stale} מיושנים, ${snapshot.leads.stats.hot} חמים
- קמפיינים: ${snapshot.campaigns.stats.total} סה"כ, ${snapshot.campaigns.stats.active} פעילים, ${snapshot.campaigns.issues.length} עם בעיות
- נכסים: ${snapshot.properties.stats.total} סה"כ, ${snapshot.properties.stats.stale} מיושנים
- משימות: ${snapshot.tasks.stats.total} סה"כ, ${snapshot.tasks.stats.overdue} באיחור
- המלצות זמינות: ${snapshot.recommendations.length}

בעיות דחופות: ${snapshot.campaigns.issues.filter(i => i.severity === 'high').length + snapshot.connections.issues.length}
` : `
User Data (current):
- Leads: ${snapshot.leads.stats.total} total, ${snapshot.leads.stats.stale} stale, ${snapshot.leads.stats.hot} hot
- Campaigns: ${snapshot.campaigns.stats.total} total, ${snapshot.campaigns.stats.active} active, ${snapshot.campaigns.issues.length} with issues
- Properties: ${snapshot.properties.stats.total} total, ${snapshot.properties.stats.stale} stale
- Tasks: ${snapshot.tasks.stats.total} total, ${snapshot.tasks.stats.overdue} overdue
- Recommendations available: ${snapshot.recommendations.length}

Urgent issues: ${snapshot.campaigns.issues.filter(i => i.severity === 'high').length + snapshot.connections.issues.length}
`;

    return basePrompt + '\n' + dataContext;
  }

  private buildWelcomePrompt(language: 'he' | 'en', snapshot: UserDataSnapshot): string {
    if (language === 'he') {
      // Hebrew welcome prompt
      let prompt = 'הכן הודעת פתיחה אישית למשתמש. תציין 2-3 פרטים ספציפיים מהנתונים שלו ותציע פעולות מיידיות.';

      if (snapshot.leads.stats.stale > 0) {
        const staleLead = snapshot.leads.staleList[0];
        prompt += ` למשל: יש לך ${snapshot.leads.stats.stale} לידים שמחכים למעקב`;
        if (staleLead?.fullName) {
          prompt += `, כולל ${staleLead.fullName}`;
        }
        prompt += '.';
      }

      if (snapshot.campaigns.issues.length > 0) {
        const issue = snapshot.campaigns.issues[0];
        prompt += ` קמפיין "${issue.name}" צריך תשומת לב (${issue.issue}).`;
      }

      return prompt;
    } else {
      // English welcome prompt
      let prompt = 'Create a personalized welcome message for the user. Mention 2-3 specific items from their data and suggest immediate actions.';

      if (snapshot.leads.stats.stale > 0) {
        const staleLead = snapshot.leads.staleList[0];
        prompt += ` For example: You have ${snapshot.leads.stats.stale} leads waiting for follow-up`;
        if (staleLead?.fullName) {
          prompt += `, including ${staleLead.fullName}`;
        }
        prompt += '.';
      }

      if (snapshot.campaigns.issues.length > 0) {
        const issue = snapshot.campaigns.issues[0];
        prompt += ` Campaign "${issue.name}" needs attention (${issue.issue}).`;
      }

      return prompt;
    }
  }

  private getBotTools(): OpenAI.Chat.ChatCompletionCreateParams.Function[] {
    return [
      {
        name: 'list_user_data',
        description: 'Get detailed information about user\'s business data',
        parameters: {
          type: 'object',
          properties: {
            ownerUid: {
              type: 'string',
              description: 'User ID to get data for'
            },
            windowDays: {
              type: 'number',
              description: 'Number of days to look back for data (default: 30)',
              default: 30
            }
          },
          required: ['ownerUid']
        }
      },
      {
        name: 'create_task',
        description: 'Create a new task for the user',
        parameters: {
          type: 'object',
          properties: {
            ownerUid: {
              type: 'string',
              description: 'User ID'
            },
            title: {
              type: 'string',
              description: 'Task title'
            },
            description: {
              type: 'string',
              description: 'Task description'
            },
            dueDate: {
              type: 'string',
              description: 'Due date in ISO format (optional)'
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'Task tags'
            }
          },
          required: ['ownerUid', 'title']
        }
      },
      {
        name: 'update_lead_status',
        description: 'Update a lead\'s status and add notes',
        parameters: {
          type: 'object',
          properties: {
            ownerUid: {
              type: 'string',
              description: 'User ID'
            },
            leadId: {
              type: 'string',
              description: 'Lead ID to update'
            },
            status: {
              type: 'string',
              enum: ['NEW', 'CONTACTED', 'QUALIFIED', 'MEETING', 'OFFER', 'DEAL', 'WON', 'LOST'],
              description: 'New lead status'
            },
            note: {
              type: 'string',
              description: 'Note to add to lead'
            }
          },
          required: ['ownerUid', 'leadId', 'status']
        }
      },
      {
        name: 'pause_campaign',
        description: 'Pause an advertising campaign',
        parameters: {
          type: 'object',
          properties: {
            ownerUid: {
              type: 'string',
              description: 'User ID'
            },
            campaignId: {
              type: 'string',
              description: 'Campaign ID to pause'
            },
            reason: {
              type: 'string',
              description: 'Reason for pausing'
            }
          },
          required: ['ownerUid', 'campaignId']
        }
      },
      {
        name: 'resume_campaign',
        description: 'Resume a paused advertising campaign',
        parameters: {
          type: 'object',
          properties: {
            ownerUid: {
              type: 'string',
              description: 'User ID'
            },
            campaignId: {
              type: 'string',
              description: 'Campaign ID to resume'
            }
          },
          required: ['ownerUid', 'campaignId']
        }
      },
      {
        name: 'send_message',
        description: 'Draft a message or email for the user',
        parameters: {
          type: 'object',
          properties: {
            ownerUid: {
              type: 'string',
              description: 'User ID'
            },
            channel: {
              type: 'string',
              enum: ['email', 'sms', 'whatsapp', 'internal'],
              description: 'Message channel'
            },
            text: {
              type: 'string',
              description: 'Message content'
            },
            recipient: {
              type: 'string',
              description: 'Recipient identifier (lead ID, email, etc.)'
            }
          },
          required: ['ownerUid', 'channel', 'text']
        }
      },
      {
        name: 'open_entity',
        description: 'Provide a deep link to open a specific entity in the UI',
        parameters: {
          type: 'object',
          properties: {
            ownerUid: {
              type: 'string',
              description: 'User ID'
            },
            type: {
              type: 'string',
              enum: ['lead', 'campaign', 'property', 'connections', 'tasks'],
              description: 'Entity type to open'
            },
            id: {
              type: 'string',
              description: 'Entity ID'
            }
          },
          required: ['ownerUid', 'type', 'id']
        }
      }
    ];
  }

  private generateQuickActions(snapshot: UserDataSnapshot, language: 'he' | 'en'): Array<{
    text: string;
    action: string;
    params?: Record<string, any>;
  }> {
    const actions: Array<{ text: string; action: string; params?: Record<string, any> }> = [];

    if (language === 'he') {
      // Hebrew quick actions
      if (snapshot.leads.stats.stale > 0) {
        actions.push({
          text: `עקוב אחרי ${snapshot.leads.stats.stale} לידים`,
          action: 'open_entity',
          params: { type: 'lead', id: 'stale' }
        });
      }

      if (snapshot.campaigns.issues.length > 0) {
        const issue = snapshot.campaigns.issues[0];
        actions.push({
          text: `בדוק קמפיין "${issue.name}"`,
          action: 'open_entity',
          params: { type: 'campaign', id: issue.id }
        });
      }

      if (snapshot.recommendations.length > 0) {
        actions.push({
          text: `צפה בכל ההמלצות`,
          action: 'list_user_data',
          params: { windowDays: 30 }
        });
      }
    } else {
      // English quick actions
      if (snapshot.leads.stats.stale > 0) {
        actions.push({
          text: `Follow up ${snapshot.leads.stats.stale} leads`,
          action: 'open_entity',
          params: { type: 'lead', id: 'stale' }
        });
      }

      if (snapshot.campaigns.issues.length > 0) {
        const issue = snapshot.campaigns.issues[0];
        actions.push({
          text: `Check campaign "${issue.name}"`,
          action: 'open_entity',
          params: { type: 'campaign', id: issue.id }
        });
      }

      if (snapshot.recommendations.length > 0) {
        actions.push({
          text: 'View all recommendations',
          action: 'list_user_data',
          params: { windowDays: 30 }
        });
      }
    }

    return actions.slice(0, 3);
  }

  private getFallbackMessage(language: 'he' | 'en', type: 'welcome' | 'chat_error' = 'welcome'): string {
    if (language === 'he') {
      return type === 'welcome'
        ? 'שלום! אני המאמן העסקי שלך. איך אוכל לעזור לך היום לנהל את העסק שלך?'
        : 'מצטער, יש לי בעיה טכנית. נסה שוב בעוד רגע.';
    } else {
      return type === 'welcome'
        ? 'Hello! I\'m your business coach. How can I help you manage your business today?'
        : 'Sorry, I\'m experiencing technical difficulties. Please try again in a moment.';
    }
  }

  private checkRateLimit(ownerUid: string): void {
    const now = Date.now();
    const userLimit = this.rateLimitTracker.get(ownerUid);

    if (!userLimit || now > userLimit.resetTime) {
      // Reset or create new limit window
      this.rateLimitTracker.set(ownerUid, {
        count: 1,
        resetTime: now + this.RATE_LIMIT_WINDOW,
      });
      return;
    }

    if (userLimit.count >= this.RATE_LIMIT_MAX_REQUESTS) {
      const waitTime = Math.ceil((userLimit.resetTime - now) / 1000);
      throw new Error(`Rate limit exceeded. Please wait ${waitTime} seconds.`);
    }

    userLimit.count++;
  }

  private async getOrCreateSession(
    ownerUid: string,
    sessionId?: string,
    language: 'he' | 'en' = 'en'
  ): Promise<ChatSession> {
    if (sessionId && this.sessionCache.has(sessionId)) {
      return this.sessionCache.get(sessionId)!;
    }

    const session: ChatSession = {
      id: sessionId || `session_${ownerUid}_${Date.now()}`,
      ownerUid,
      messages: [],
      language,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.sessionCache.set(session.id, session);
    return session;
  }

  private addMessageToSession(sessionId: string, message: ChatMessage): void {
    const session = this.sessionCache.get(sessionId);
    if (session) {
      session.messages.push(message);
      session.updatedAt = new Date().toISOString();

      // Keep only last 20 messages per session
      if (session.messages.length > 20) {
        session.messages = session.messages.slice(-20);
      }
    }
  }

  async getChatHistory(sessionId: string): Promise<ChatMessage[]> {
    const session = this.sessionCache.get(sessionId);
    return session?.messages || [];
  }

  async clearSession(sessionId: string): Promise<void> {
    this.sessionCache.delete(sessionId);
  }

  // Health check method
  isAvailable(): boolean {
    return !!this.openai;
  }

  getStats(): {
    activeSessions: number;
    rateLimitedUsers: number;
    cacheSize: number;
  } {
    return {
      activeSessions: this.sessionCache.size,
      rateLimitedUsers: Array.from(this.rateLimitTracker.values())
        .filter(limit => Date.now() < limit.resetTime && limit.count >= this.RATE_LIMIT_MAX_REQUESTS)
        .length,
      cacheSize: this.sessionCache.size,
    };
  }
}