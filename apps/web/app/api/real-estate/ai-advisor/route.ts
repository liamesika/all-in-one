export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import {
  detectLanguage,
  determineConversationLanguage,
  getLanguageInstruction,
  type DetectedLanguage,
} from '@/lib/languageDetection';
import { withAuth, getOwnerUid } from '@/lib/apiAuth';

// Initialize OpenAI client (server-side only)
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

export const POST = withAuth(async (request, { user }) => {
  try {
    const {
      message,
      context,
      conversationHistory,
      conversationLocale,
      forceLocale,
    } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Detect language for this message
    const detection = detectLanguage(message);
    const responseLocale = determineConversationLanguage(
      message,
      conversationLocale,
      forceLocale
    );

    let response: string;

    // Only use OpenAI if API key is available
    if (openai) {
      // Build system prompt based on page context and language
      const systemPrompt = buildSystemPrompt(context, responseLocale);

      // Build conversation history for OpenAI
      const messages: any[] = [
        {
          role: 'system',
          content: systemPrompt,
        },
      ];

      // Add conversation history (last 5 messages)
      if (conversationHistory && Array.isArray(conversationHistory)) {
        conversationHistory.forEach((msg: any) => {
          messages.push({
            role: msg.role,
            content: msg.content,
          });
        });
      }

      // Add current message
      messages.push({
        role: 'user',
        content: message,
      });

      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages,
        temperature: 0.7,
        max_tokens: 500,
      });

      response = completion.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a response.';
    } else {
      // Fallback response when OpenAI is not available
      response = getFallbackResponse(context, message, responseLocale);
    }

    // Log for telemetry (production should use proper logging service)
    console.log('[AI Advisor] Request processed:', {
      page: context.page,
      userMessage: message.substring(0, 50),
      detectedLanguage: detection.language,
      responseLanguage: responseLocale,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      message: response,
      locale: responseLocale,
      detection: {
        language: detection.language,
        confidence: detection.confidence,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('[AI Advisor] Error:', error);

    // Don't expose internal errors to client
    return NextResponse.json(
      {
        error: 'Failed to process request',
        message: 'I\'m experiencing technical difficulties. Please try again in a moment.',
      },
      { status: 500 }
    );
  }
});

function buildSystemPrompt(context: any, locale: DetectedLanguage): string {
  const { page, data } = context;

  // Get language-specific instruction
  const languageInstruction = getLanguageInstruction(locale);

  const basePrompt = `You are an expert Real Estate Advisor AI assistant. You provide actionable, practical advice to real estate agents and brokers. You think like a successful real estate professional with years of experience in lead management, property marketing, pricing strategies, and client relationships.

${languageInstruction}

Key guidelines:
- Be concise and actionable (2-3 sentences max unless asked for more detail)
- Prioritize immediate next steps and quick wins
- Use real estate industry terminology appropriately
- Focus on ROI, conversion rates, and time efficiency
- Be encouraging but realistic
- When suggesting actions, be specific (e.g., "Call John Doe within 2 hours" vs "Follow up with leads")`;

  const contextPrompts: Record<string, string> = {
    dashboard: `\n\nCurrent context: User is on the main dashboard. Help them prioritize tasks, identify opportunities in their pipeline, and suggest data-driven actions based on KPIs like lead conversion rates, days on market, and pipeline value.`,

    leads: `\n\nCurrent context: User is managing leads. Help them qualify leads (hot/warm/cold), suggest follow-up strategies, recommend which leads to contact first, and provide templates for outreach messages.`,

    properties: `\n\nCurrent context: User is managing their property listings. Help them optimize listings, suggest which properties need price adjustments, recommend marketing strategies, and identify stale listings that need attention.`,

    'property-detail': `\n\nCurrent context: User is viewing a specific property. Provide market analysis, pricing recommendations, marketing copy suggestions, and comparable property insights.`,

    'ad-generator': `\n\nCurrent context: User is creating property advertisements. Help craft compelling headlines, engaging descriptions, suggest price points, and recommend image selection strategies.`,

    comps: `\n\nCurrent context: User is analyzing comparable properties. Help interpret market trends, explain price variations, suggest pricing strategies, and identify competitive advantages.`,

    'open-house': `\n\nCurrent context: User is planning an open house event. Provide checklists, timing recommendations, marketing tips, and post-event follow-up strategies.`,

    marketing: `\n\nCurrent context: User is creating marketing campaigns. Suggest ad copy variations, target audience strategies, budget allocation, and A/B testing ideas.`,
  };

  const contextPrompt = contextPrompts[page] || contextPrompts.dashboard;

  // Add data context if available
  let dataContext = '';
  if (data) {
    dataContext = `\n\nAdditional context: ${JSON.stringify(data).substring(0, 500)}`;
  }

  return basePrompt + contextPrompt + dataContext;
}

function getFallbackResponse(context: any, message: string, locale: DetectedLanguage): string {
  const lowerMessage = message.toLowerCase();

  // Hebrew responses
  if (locale === 'he') {
    if (lowerMessage.includes('lead') || lowerMessage.includes('ליד')) {
      return 'התמקדו תחילה במעקב אחר לידים חמים - אלו עם מימון מאושר מראש ולוח זמנים דחוף. השתמשו בבוט סיווג הלידים להערכה שיטתית של לידים חדשים.';
    }

    if (lowerMessage.includes('property') || lowerMessage.includes('נכס')) {
      return 'בדקו את רשימות הנכסים שלכם וודאו שלכל אחד יש תמונות איכותיות ותיאורים מושכים. השתמשו במחולל מודעות AI ליצירת עותק שיווקי מקצועי במספר שפות.';
    }

    if (lowerMessage.includes('price') || lowerMessage.includes('מחיר')) {
      return 'נתחו נכסים דומים באזור כדי להבטיח תמחור תחרותי. נכסים שמחירם 5-10% מתחת לממוצע השוק מייצרים בדרך כלל פי 3 יותר פניות.';
    }

    if (lowerMessage.includes('market') || lowerMessage.includes('שוק')) {
      return 'עקבו אחר מגמות השוק המקומי שלכם מדי שבוע. התמקדו בנכסים שנמצאים בשוק יותר מ-30 יום - ייתכן שהם צריכים התאמות במחיר או בשיווק.';
    }

    return 'אני כאן כדי לעזור עם ניהול לידים, שיווק נכסים, אסטרטגיות תמחור ויחסי לקוחות. אילו אתגרים ספציפיים אתם מתמודדים איתם?';
  }

  // English responses
  if (lowerMessage.includes('lead') || lowerMessage.includes('ליד')) {
    return 'Focus on following up with hot leads first - those with pre-approved financing and urgent timelines. Use the Lead Qualification Bot to assess new leads systematically.';
  }

  if (lowerMessage.includes('property') || lowerMessage.includes('נכס')) {
    return 'Review your property listings and ensure each has high-quality photos and compelling descriptions. Use the AI Ad Generator to create professional marketing copy in multiple languages.';
  }

  if (lowerMessage.includes('price') || lowerMessage.includes('מחיר')) {
    return 'Analyze comparable properties in the area to ensure competitive pricing. Properties priced 5-10% below market average typically generate 3x more inquiries.';
  }

  if (lowerMessage.includes('market') || lowerMessage.includes('שוק')) {
    return 'Monitor your local market trends weekly. Focus on properties that have been on the market for 30+ days - they may need pricing or marketing adjustments.';
  }

  return `I'm here to help with lead management, property marketing, pricing strategies, and client relationships. While AI features are currently in demo mode, I can still provide general guidance. What specific challenge are you facing?`;
}
