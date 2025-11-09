export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuthAndOrg } from '@/lib/apiAuth';
import { AIPromptBuilder, AdCopyContext } from '@/lib/aiPromptBuilders';
import { withAIRateLimit } from '@/lib/aiRateLimiter';
import { AIRequestLogger } from '@/lib/aiRequestLogger';

const adCopySchema = z.object({
  productName: z.string().min(1),
  description: z.string().min(1),
  targetAudience: z.string().min(1),
  tone: z.enum(['professional', 'casual', 'urgent', 'friendly', 'luxury']),
  channel: z.enum(['meta', 'google', 'linkedin', 'tiktok', 'youtube']),
  variantsCount: z.number().min(1).max(10).default(5),
  maxLength: z.number().optional(),
  targetLocale: z.enum(['EN', 'HE']),
});

export const POST = withAuthAndOrg(async (request, { user, orgId }) => {
  const startTime = Date.now();

  return withAIRateLimit(orgId, 'ad-copy', async () => {
    try {
      const body = await request.json();
      const validated = adCopySchema.parse(body);

      // Build deterministic prompt
      const prompt = AIPromptBuilder.buildAdCopyPrompt(validated as AdCopyContext);

      // TODO: Call OpenAI API
      // For now, return mock response
      const mockResponse = generateMockAdCopy(validated as AdCopyContext);

      // Log request
      await AIRequestLogger.log({
        orgId,
        userId: user.uid,
        endpoint: 'ad-copy',
        prompt,
        response: JSON.stringify(mockResponse),
        model: 'gpt-4',
        durationMs: Date.now() - startTime,
        status: 'success',
        metadata: {
          channel: validated.channel,
          tone: validated.tone,
          variantsCount: validated.variantsCount,
          locale: validated.targetLocale,
        },
      });

      return NextResponse.json({
        variants: mockResponse,
        metadata: {
          prompt,
          model: 'gpt-4',
          channel: validated.channel,
          locale: validated.targetLocale,
        },
      });
    } catch (error: any) {
      await AIRequestLogger.log({
        orgId,
        userId: user.uid,
        endpoint: 'ad-copy',
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
        { error: 'Failed to generate ad copy', message: error.message },
        { status: 500 }
      );
    }
  });
});

function generateMockAdCopy(context: AdCopyContext): any[] {
  const { variantsCount, tone, channel, targetLocale } = context;

  if (targetLocale === 'HE') {
    const variants = [
      {
        id: 1,
        headline: 'גלה את הבית של החלומות שלך',
        primaryText:
          'דירות יוקרה במיקום מרכזי. עיצוב מודרני, גימורים ברמה הגבוהה ביותר. הזדמנות שלא תחזור.',
        description: 'מספר יחידות מוגבל. הזמן סיור פרטי עוד היום.',
        cta: 'הזמינו סיור',
        hook: 'Problem/Solution',
      },
      {
        id: 2,
        headline: 'חיים ברמה אחרת מתחילים כאן',
        primaryText:
          'הצטרפו למשפחות שבחרו באיכות חיים מעולה. כל דירה מתוכננת בקפידה עם תשומת לב לפרטים הקטנים.',
        description: 'ייעוץ אישי ללא התחייבות. נציגים זמינים 24/7.',
        cta: 'דברו איתנו',
        hook: 'Social Proof',
      },
      {
        id: 3,
        headline: 'מבצע מיוחד - רק השבוע',
        primaryText:
          'הנחה של 5% על דירות נבחרות. זה הזמן להשקיע בעתיד שלכם. הצעה מוגבלת לזמן מוגבל.',
        description: 'מימון עד 75%. תנאים מיוחדים לרוכשים ראשונים.',
        cta: 'למדו עוד',
        hook: 'Urgency',
      },
      {
        id: 4,
        headline: 'הבית שתמיד חלמתם עליו',
        primaryText:
          'גנים פרטיים, בריכה, חדר כושר ומרחבים ירוקים. הכל במקום אחד. נוף פתוח ושקט מוחלט.',
        description: 'צרו קשר עכשיו וקבלו מצגת מלאה של הפרויקט.',
        cta: 'שלחו פרטים',
        hook: 'Benefit-Driven',
      },
      {
        id: 5,
        headline: 'איכות שאפשר למגוע בה',
        primaryText:
          'כל פרט נבחר בקפידה. חומרים איכותיים, אדריכלות עכשווית וטכנולוגיה מתקדמת בכל דירה.',
        description: 'הזמינו פגישה עם המתכנן הראשי.',
        cta: 'קבעו פגישה',
        hook: 'Feature-Focused',
      },
    ];

    return variants.slice(0, variantsCount);
  }

  const variants = [
    {
      id: 1,
      headline: 'Discover Your Dream Home Today',
      primaryText:
        'Luxury apartments in prime location. Modern design, premium finishes. An opportunity that won\'t come again.',
      description: 'Limited units available. Book a private tour today.',
      cta: 'Book a Tour',
      hook: 'Problem/Solution',
    },
    {
      id: 2,
      headline: 'Living at a Different Level Starts Here',
      primaryText:
        'Join families who chose exceptional quality of life. Every apartment designed with attention to detail.',
      description: 'Personal consultation with no obligation. Representatives available 24/7.',
      cta: 'Talk to Us',
      hook: 'Social Proof',
    },
    {
      id: 3,
      headline: 'Special Offer - This Week Only',
      primaryText:
        '5% discount on select apartments. Now is the time to invest in your future. Limited-time offer.',
      description: 'Financing up to 75%. Special terms for first-time buyers.',
      cta: 'Learn More',
      hook: 'Urgency',
    },
    {
      id: 4,
      headline: 'The Home You\'ve Always Dreamed Of',
      primaryText:
        'Private gardens, pool, gym, and green spaces. All in one place. Open views and absolute quiet.',
      description: 'Contact now and receive a full project presentation.',
      cta: 'Send Details',
      hook: 'Benefit-Driven',
    },
    {
      id: 5,
      headline: 'Quality You Can Touch',
      primaryText:
        'Every detail carefully selected. Quality materials, contemporary architecture, and advanced technology in every apartment.',
      description: 'Schedule a meeting with the lead architect.',
      cta: 'Book Meeting',
      hook: 'Feature-Focused',
    },
  ];

  return variants.slice(0, variantsCount);
}
