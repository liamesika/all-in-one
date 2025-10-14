import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuthAndOrg } from '@/lib/apiAuth';
import { AIPromptBuilder, ScriptContext } from '@/lib/aiPromptBuilders';
import { withAIRateLimit } from '@/lib/aiRateLimiter';
import { AIRequestLogger } from '@/lib/aiRequestLogger';

const scriptSchema = z.object({
  duration: z.enum([30, 60, 90]),
  productName: z.string().min(1),
  keyMessage: z.string().min(1),
  targetAudience: z.string().min(1),
  callToAction: z.string().min(1),
  tone: z.enum(['professional', 'casual', 'urgent', 'friendly', 'luxury']),
  targetLocale: z.enum(['EN', 'HE']),
});

export const POST = withAuthAndOrg(async (request, { user, orgId }) => {
  const startTime = Date.now();

  return withAIRateLimit(orgId, 'script', async () => {
    try {
      const body = await request.json();
      const validated = scriptSchema.parse(body);

      const prompt = AIPromptBuilder.buildScriptPrompt(validated as ScriptContext);

      const mockResponse = generateMockScript(validated as ScriptContext);

      await AIRequestLogger.log({
        orgId,
        userId: user.uid,
        endpoint: 'script',
        prompt,
        response: JSON.stringify(mockResponse),
        model: 'gpt-4',
        durationMs: Date.now() - startTime,
        status: 'success',
        metadata: {
          duration: validated.duration,
          tone: validated.tone,
          locale: validated.targetLocale,
        },
      });

      return NextResponse.json({
        script: mockResponse,
        metadata: {
          prompt,
          model: 'gpt-4',
          duration: validated.duration,
          locale: validated.targetLocale,
        },
      });
    } catch (error: any) {
      await AIRequestLogger.log({
        orgId,
        userId: user.uid,
        endpoint: 'script',
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
        { error: 'Failed to generate script', message: error.message },
        { status: 500 }
      );
    }
  });
});

function generateMockScript(context: ScriptContext): any {
  const { duration, targetLocale } = context;

  if (targetLocale === 'HE') {
    if (duration === 30) {
      return {
        voiceover: [
          { timing: '0-3s', text: 'מחפשים את הבית המושלם?' },
          { timing: '3-10s', text: 'אתם לא לבד. רוב האנשים מתקשים למצוא את הנכס שמתאים להם בדיוק.' },
          { timing: '10-25s', text: 'עם שירות החיפוש החכם שלנו, מצאנו את הבית המושלם ל-500 משפחות השנה. מתקדמים? מסורתיים? יוקרה? יש לנו הכל.' },
          { timing: '25-30s', text: 'צרו קשר עכשיו וקבלו ייעוץ אישי חינם.' },
        ],
        scenes: [
          {
            scene: 1,
            timing: '0-3s',
            visual: 'זוג צעיר מסתכל על מחשב נייד, נראים מתוסכלים',
            onScreenText: 'מחפשים בית?',
          },
          {
            scene: 2,
            timing: '3-10s',
            visual: 'מונטאז\' של חיפושים באתרי נדל"ן, פגישות עם סוכנים',
            onScreenText: 'זה לא חייב להיות מורכב',
          },
          {
            scene: 3,
            timing: '10-25s',
            visual: 'שירות החיפוש בפעולה - ממשק נקי, תוצאות מדויקות. משפחות מרוצות בבתיהם החדשים',
            onScreenText: '500+ משפחות מרוצות',
          },
          {
            scene: 4,
            timing: '25-30s',
            visual: 'לוגו החברה, פרטי יצירת קשר',
            onScreenText: 'התחילו עכשיו',
          },
        ],
        shotlist: [
          'Shot 1: Close-up - ידיים על מקלדת',
          'Shot 2: Wide - משרד עם שלטי "נמכר"',
          'Shot 3: Medium - ממשק דיגיטלי עם התאמות מושלמות',
          'Shot 4: Montage - משפחות בבתים חדשים',
          'Shot 5: Logo reveal עם CTA',
        ],
      };
    }
  }

  if (duration === 30) {
    return {
      voiceover: [
        { timing: '0-3s', text: 'Looking for the perfect home?' },
        { timing: '3-10s', text: 'You\'re not alone. Most people struggle to find the property that fits them exactly.' },
        { timing: '10-25s', text: 'With our smart search service, we found the perfect home for 500 families this year. Modern? Traditional? Luxury? We have it all.' },
        { timing: '25-30s', text: 'Contact us now and get free personal consultation.' },
      ],
      scenes: [
        {
          scene: 1,
          timing: '0-3s',
          visual: 'Young couple looking at laptop, appearing frustrated',
          onScreenText: 'Looking for a home?',
        },
        {
          scene: 2,
          timing: '3-10s',
          visual: 'Montage of searches on real estate sites, meetings with agents',
          onScreenText: 'It doesn\'t have to be complicated',
        },
        {
          scene: 3,
          timing: '10-25s',
          visual: 'Search service in action - clean interface, accurate results. Happy families in their new homes',
          onScreenText: '500+ Happy Families',
        },
        {
          scene: 4,
          timing: '25-30s',
          visual: 'Company logo, contact details',
          onScreenText: 'Get Started Now',
        },
      ],
      shotlist: [
        'Shot 1: Close-up - hands on keyboard',
        'Shot 2: Wide - office with "SOLD" signs',
        'Shot 3: Medium - digital interface with perfect matches',
        'Shot 4: Montage - families in new homes',
        'Shot 5: Logo reveal with CTA',
      ],
    };
  }

  return { voiceover: [], scenes: [], shotlist: [] };
}
