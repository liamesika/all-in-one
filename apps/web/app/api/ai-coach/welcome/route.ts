import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { organizationId, language = 'en' } = body;

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 });
    }

    // Generate welcome message based on language
    const welcomeMessages = {
      en: {
        message: "👋 Welcome to your AI Coach! I'm here to help you optimize your leads, campaigns, and business growth. What would you like to focus on today?",
        suggestions: [
          {
            id: 'review_leads',
            title: 'Review Recent Leads',
            description: 'Check new leads and follow-up opportunities',
            action: 'navigate',
            params: { route: '/e-commerce/leads' }
          },
          {
            id: 'campaign_performance',
            title: 'Campaign Analysis',
            description: 'Analyze your marketing campaign performance',
            action: 'navigate',
            params: { route: '/e-commerce/campaigns' }
          },
          {
            id: 'quick_insights',
            title: 'Quick Insights',
            description: 'Get AI-powered business insights',
            action: 'generate_insights',
            params: {}
          }
        ]
      },
      he: {
        message: "👋 ברוכים הבאים למאמן האישי שלכם! אני כאן כדי לעזור לכם לייעל את הלידים, הקמפיינים והצמיחה העסקית שלכם. על מה הייתם רוצים להתמקד היום?",
        suggestions: [
          {
            id: 'review_leads',
            title: 'סקירת לידים אחרונים',
            description: 'בדיקת לידים חדשים והזדמנויות מעקב',
            action: 'navigate',
            params: { route: '/e-commerce/leads' }
          },
          {
            id: 'campaign_performance',
            title: 'ניתוח קמפיינים',
            description: 'ניתוח ביצועי קמפיינים שיווקיים',
            action: 'navigate',
            params: { route: '/e-commerce/campaigns' }
          },
          {
            id: 'quick_insights',
            title: 'תובנות מהירות',
            description: 'קבלת תובנות עסקיות מבוססות AI',
            action: 'generate_insights',
            params: {}
          }
        ]
      }
    };

    const selectedLanguage = language === 'he' ? 'he' : 'en';
    const welcomeData = welcomeMessages[selectedLanguage];

    const response = {
      message: welcomeData.message,
      suggestions: welcomeData.suggestions,
      toolCalls: [], // No initial tool calls for welcome message
      toolResults: [] // No initial tool results
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error generating welcome message:', error);
    return NextResponse.json(
      { error: 'Failed to generate welcome message' },
      { status: 500 }
    );
  }
}