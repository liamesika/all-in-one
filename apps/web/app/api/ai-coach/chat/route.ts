import { NextResponse, NextRequest } from 'next/server';
import OpenAI from 'openai';
import { resolveTenantContext, logTenantOperation } from '../../../../lib/auth/tenant-guard';

// Lazy-initialize OpenAI only when needed to avoid build-time errors
function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 30000, // 30 seconds timeout
    maxRetries: 2,
  });
}

interface ChatRequest {
  message: string;
  sessionId: string;
  language: 'en' | 'he';
}

interface QuickAction {
  text: string;
  action: string;
  params?: Record<string, any>;
  variant?: 'default' | 'destructive' | 'outline';
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  let sessionId: string | undefined;

  try {
    // Resolve tenant context with proper authentication
    const guardResult = resolveTenantContext(req);

    if (!guardResult.success) {
      logTenantOperation({
        module: 'ai-coach',
        action: 'chat',
        status: 'error',
        errorCode: guardResult.error?.code,
        duration: Date.now() - startTime,
      });

      return NextResponse.json(
        {
          code: guardResult.error?.code || 'UNAUTHORIZED',
          message: guardResult.error?.message || 'Authentication required',
        },
        { status: guardResult.error?.status || 401 }
      );
    }

    const { ownerUid, isDevFallback } = guardResult.context!;

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      logTenantOperation({
        module: 'ai-coach',
        action: 'chat',
        ownerUid,
        status: 'error',
        errorCode: 'OPENAI_NOT_CONFIGURED',
        duration: Date.now() - startTime,
        metadata: { isDevFallback },
      });

      return NextResponse.json(
        {
          code: 'SERVICE_UNAVAILABLE',
          message: 'AI chat service is not configured',
        },
        { status: 503 }
      );
    }

    // Parse and validate request body
    const body: ChatRequest = await req.json();
    sessionId = body.sessionId;

    if (!body.message?.trim()) {
      logTenantOperation({
        module: 'ai-coach',
        action: 'chat',
        ownerUid,
        status: 'error',
        errorCode: 'INVALID_MESSAGE',
        duration: Date.now() - startTime,
        metadata: { sessionId, isDevFallback },
      });

      return NextResponse.json(
        {
          code: 'VALIDATION_ERROR',
          message: 'Message content is required',
        },
        { status: 400 }
      );
    }

    // Build conversation context
    const systemPrompt = body.language === 'he'
      ? `אתה מאמן אישי AI מומחה בשיווק דיגיטלי ומכירות. אתה עוזר לבעלי עסקים לנהל לידים, קמפיינים ומכירות.
מומחיותך כוללת:
- ניהול לידים ומעקב אחר לקוחות פוטנציאליים
- אופטימיזציה של קמפיינים במטה, גוגל, טיקטוק ולינקדאין
- אסטרטגיות מכירות וטיפוח לקוחות
- ניתוח נתונים ודוחות ביצועים
- אוטומציה של תהליכי מכירות

עליך לתת מענה מועיל, מדויק ומעשי. אם משתמש שואל על פעולה ספציפית במערכת, הציע פעולות מהירות.`
      : `You are an expert AI personal coach specializing in digital marketing and sales. You help business owners manage leads, campaigns, and sales.

Your expertise includes:
- Lead management and prospect tracking
- Campaign optimization for Meta, Google, TikTok, and LinkedIn
- Sales strategies and customer nurturing
- Data analysis and performance reporting
- Sales process automation

Provide helpful, accurate, and actionable responses. When users ask about specific system actions, suggest quick actions they can take.`;

    const userMessage = body.message.trim();

    // Call OpenAI API with timeout and error handling
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Use the more cost-effective model
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      max_tokens: 500,
      temperature: 0.7,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    });

    const assistantMessage = completion.choices[0]?.message?.content;

    if (!assistantMessage) {
      throw new Error('No response from OpenAI');
    }

    // Generate contextual quick actions based on the message
    const quickActions: QuickAction[] = generateQuickActions(userMessage, body.language);

    logTenantOperation({
      module: 'ai-coach',
      action: 'chat',
      ownerUid,
      status: 'success',
      duration: Date.now() - startTime,
      metadata: {
        sessionId,
        messageLength: userMessage.length,
        responseLength: assistantMessage.length,
        model: 'gpt-4o-mini',
        tokensUsed: completion.usage?.total_tokens || 0,
        isDevFallback,
      },
    });

    return NextResponse.json({
      message: assistantMessage,
      suggestions: quickActions,
      sessionId: body.sessionId,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    const isOpenAIError = error.constructor.name.includes('OpenAI');
    const isTimeoutError = error.message?.includes('timeout') || error.code === 'ECONNABORTED';

    let errorCode = 'INTERNAL_ERROR';
    let statusCode = 500;
    let userMessage = 'An error occurred while processing your message';

    if (isOpenAIError) {
      errorCode = 'OPENAI_ERROR';
      if (error.status === 429) {
        errorCode = 'RATE_LIMIT_EXCEEDED';
        statusCode = 429;
        userMessage = 'Too many requests. Please try again in a moment.';
      } else if (error.status === 401) {
        errorCode = 'OPENAI_AUTH_ERROR';
        statusCode = 503;
        userMessage = 'AI service authentication failed';
      } else if (isTimeoutError) {
        errorCode = 'OPENAI_TIMEOUT';
        statusCode = 504;
        userMessage = 'Request timed out. Please try again.';
      }
    } else if (isTimeoutError) {
      errorCode = 'REQUEST_TIMEOUT';
      statusCode = 504;
      userMessage = 'Request timed out. Please try again.';
    }

    logTenantOperation({
      module: 'ai-coach',
      action: 'chat',
      status: 'error',
      errorCode,
      duration: Date.now() - startTime,
      metadata: {
        sessionId,
        error: error.message,
        isOpenAIError,
        isTimeoutError,
        openaiStatus: error.status,
      },
    });

    console.error('[AiCoachChat] Error:', {
      message: error.message,
      status: error.status,
      type: error.constructor.name,
      sessionId,
    });

    return NextResponse.json(
      {
        code: errorCode,
        message: userMessage,
      },
      { status: statusCode }
    );
  }
}

function generateQuickActions(userMessage: string, language: 'en' | 'he'): QuickAction[] {
  const messageLower = userMessage.toLowerCase();
  const actions: QuickAction[] = [];

  // Lead-related actions
  if (messageLower.includes('lead') || messageLower.includes('prospect') || messageLower.includes('ליד')) {
    actions.push({
      text: language === 'he' ? 'צור ליד חדש' : 'Create New Lead',
      action: 'create_lead',
      variant: 'default',
    });
    actions.push({
      text: language === 'he' ? 'צפה בלידים' : 'View Leads',
      action: 'view_leads',
      variant: 'outline',
    });
  }

  // Campaign-related actions
  if (messageLower.includes('campaign') || messageLower.includes('ads') || messageLower.includes('קמפיין')) {
    actions.push({
      text: language === 'he' ? 'צור קמפיין חדש' : 'Create New Campaign',
      action: 'create_campaign',
      variant: 'default',
    });
    actions.push({
      text: language === 'he' ? 'צפה בקמפיינים' : 'View Campaigns',
      action: 'view_campaigns',
      variant: 'outline',
    });
  }

  // Analysis-related actions
  if (messageLower.includes('report') || messageLower.includes('analysis') || messageLower.includes('performance') || messageLower.includes('דוח')) {
    actions.push({
      text: language === 'he' ? 'דוח ביצועים' : 'Performance Report',
      action: 'view_performance',
      variant: 'outline',
    });
  }

  // Connection-related actions
  if (messageLower.includes('connect') || messageLower.includes('facebook') || messageLower.includes('google') || messageLower.includes('חיבור')) {
    actions.push({
      text: language === 'he' ? 'נהל חיבורים' : 'Manage Connections',
      action: 'manage_connections',
      variant: 'outline',
    });
  }

  // Default helpful actions if no specific ones match
  if (actions.length === 0) {
    actions.push({
      text: language === 'he' ? 'לוח בקרה' : 'Dashboard',
      action: 'view_dashboard',
      variant: 'outline',
    });
  }

  return actions.slice(0, 3); // Limit to 3 actions to avoid clutter
}