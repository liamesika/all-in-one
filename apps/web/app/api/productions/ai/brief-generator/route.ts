export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuthAndOrg } from '@/lib/apiAuth';
import { AIPromptBuilder, BriefGeneratorContext } from '@/lib/aiPromptBuilders';
import { withAIRateLimit } from '@/lib/aiRateLimiter';
import { AIRequestLogger } from '@/lib/aiRequestLogger';

const briefSchema = z.object({
  vertical: z.enum(['real-estate', 'e-commerce', 'law']),
  propertyDetails: z
    .object({
      title: z.string(),
      description: z.string(),
      price: z.number(),
      location: z.string(),
      features: z.array(z.string()),
    })
    .optional(),
  campaignDetails: z
    .object({
      name: z.string(),
      objective: z.string(),
      targetAudience: z.string(),
      budget: z.number().optional(),
    })
    .optional(),
  targetLocale: z.enum(['EN', 'HE']),
});

export const POST = withAuthAndOrg(async (request, { user, orgId }) => {
  const startTime = Date.now();

  return withAIRateLimit(orgId, 'brief-generator', async () => {
    try {
      const body = await request.json();
      const validated = briefSchema.parse(body);

      // Build deterministic prompt
      const prompt = AIPromptBuilder.buildBriefPrompt(validated as BriefGeneratorContext);

      // TODO: Call OpenAI API
      // For now, return mock response
      const mockResponse = generateMockBrief(validated as BriefGeneratorContext);

      // Log request
      await AIRequestLogger.log({
        orgId,
        userId: user.uid,
        endpoint: 'brief-generator',
        prompt,
        response: JSON.stringify(mockResponse),
        model: 'gpt-4',
        durationMs: Date.now() - startTime,
        status: 'success',
        metadata: {
          vertical: validated.vertical,
          locale: validated.targetLocale,
        },
      });

      return NextResponse.json({
        brief: mockResponse,
        metadata: {
          prompt,
          model: 'gpt-4',
          locale: validated.targetLocale,
        },
      });
    } catch (error: any) {
      // Log error
      await AIRequestLogger.log({
        orgId,
        userId: user.uid,
        endpoint: 'brief-generator',
        prompt: '',
        response: '',
        model: 'gpt-4',
        durationMs: Date.now() - startTime,
        status: 'error',
        errorMessage: error.message,
      });

      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Validation error', details: error.errors },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to generate brief', message: error.message },
        { status: 500 }
      );
    }
  });
});

function generateMockBrief(context: BriefGeneratorContext): any {
  const locale = context.targetLocale;

  if (locale === 'HE') {
    return {
      sections: [
        {
          title: 'סקירת הקמפיין',
          content:
            'קמפיין שיווקי ממוקד לקידום נכס נדל"ן יוקרתי באזור מרכזי. המטרה היא למשוך רוכשים פוטנציאליים בעלי יכולת כלכלית גבוהה.',
        },
        {
          title: 'קהל יעד',
          content:
            'משפחות בעלות הכנסה גבוהה, גילאי 35-55, מעוניינות בנכסי יוקרה באזורים מרכזיים. מחפשים איכות חיים, קרבה למרכזי תעסוקה ובתי ספר איכותיים.',
        },
        {
          title: 'מסר מרכזי',
          content:
            'חיים ברמה אחרת - שילוב של מיקום מרכזי, עיצוב יוקרתי ואיכות בנייה ללא פשרות.',
        },
        {
          title: 'יעדים ו-KPIs',
          content:
            '50 לידים איכותיים תוך 30 יום, 10 סיורים מתוכננים, 2-3 הזמנות מקדמה. CPL מטרה: $200.',
        },
        {
          title: 'כיוון קריאייטיבי',
          content:
            'צילום מקצועי באור טבעי, דגש על חללים פתוחים ונוף. טון יוקרתי אך לא מתנשא. פלטת צבעים חמה ומזמינה.',
        },
        {
          title: 'קריאה לפעולה',
          content: 'הזמינו סיור פרטי עוד היום - מספר יחידות מוגבל',
        },
        {
          title: 'ערוצים ופורמטים',
          content:
            'Facebook & Instagram (קרוסלה, וידאו), Google Search Ads, יד2 פרימיום, WhatsApp Business',
        },
        {
          title: 'ציר זמן ותקציב',
          content: 'משך הקמפיין: 6 שבועות. תקציב: ₪50,000 (70% דיגיטל, 30% הפקה)',
        },
      ],
    };
  }

  return {
    sections: [
      {
        title: 'Campaign Overview',
        content:
          'Targeted marketing campaign to promote a luxury real estate property in a prime location. Goal is to attract high-net-worth potential buyers.',
      },
      {
        title: 'Target Audience',
        content:
          'High-income families, ages 35-55, interested in luxury properties in central areas. Seeking quality of life, proximity to business centers and quality schools.',
      },
      {
        title: 'Key Message',
        content:
          'Live at a different level - combination of central location, luxury design, and uncompromising construction quality.',
      },
      {
        title: 'Goals & KPIs',
        content:
          '50 quality leads within 30 days, 10 scheduled tours, 2-3 reservations. Target CPL: $200.',
      },
      {
        title: 'Creative Direction',
        content:
          'Professional photography in natural light, emphasis on open spaces and views. Luxurious but not pretentious tone. Warm and inviting color palette.',
      },
      {
        title: 'Call to Action',
        content: 'Book a private tour today - limited units available',
      },
      {
        title: 'Channels & Formats',
        content:
          'Facebook & Instagram (carousel, video), Google Search Ads, Premium listings, WhatsApp Business',
      },
      {
        title: 'Timeline & Budget',
        content: 'Campaign duration: 6 weeks. Budget: $15,000 (70% digital, 30% production)',
      },
    ],
  };
}
