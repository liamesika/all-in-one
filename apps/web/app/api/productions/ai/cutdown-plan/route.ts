export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuthAndOrg } from '@/lib/apiAuth';
import { AIPromptBuilder, CutdownPlanContext } from '@/lib/aiPromptBuilders';
import { withAIRateLimit } from '@/lib/aiRateLimiter';
import { AIRequestLogger } from '@/lib/aiRequestLogger';

const cutdownPlanSchema = z.object({
  videoDuration: z.number().min(1),
  targetDurations: z.array(z.number().min(1)),
  description: z.string().min(1),
  keyMoments: z.array(z.string()).optional(),
});

export const POST = withAuthAndOrg(async (request, { user, orgId }) => {
  const startTime = Date.now();

  return withAIRateLimit(orgId, 'cutdown-plan', async () => {
    try {
      const body = await request.json();
      const validated = cutdownPlanSchema.parse(body);

      const prompt = AIPromptBuilder.buildCutdownPlanPrompt(validated as CutdownPlanContext);

      const mockResponse = generateMockCutdownPlan(validated as CutdownPlanContext);

      await AIRequestLogger.log({
        orgId,
        userId: user.uid,
        endpoint: 'cutdown-plan',
        prompt,
        response: JSON.stringify(mockResponse),
        model: 'gpt-4',
        durationMs: Date.now() - startTime,
        status: 'success',
        metadata: {
          videoDuration: validated.videoDuration,
          targetDurations: validated.targetDurations,
        },
      });

      return NextResponse.json({
        cutdownPlan: mockResponse,
        metadata: {
          prompt,
          model: 'gpt-4',
          videoDuration: validated.videoDuration,
        },
      });
    } catch (error: any) {
      await AIRequestLogger.log({
        orgId,
        userId: user.uid,
        endpoint: 'cutdown-plan',
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
        { error: 'Failed to generate cutdown plan', message: error.message },
        { status: 500 }
      );
    }
  });
});

function generateMockCutdownPlan(context: CutdownPlanContext): any[] {
  const { targetDurations } = context;

  return targetDurations.map((duration) => ({
    targetDuration: duration,
    timestamps: {
      start: '00:00',
      end: `00:${duration.toString().padStart(2, '0')}`,
    },
    scenes: [
      { name: 'Hook', timing: '0-3s', priority: 'high', description: 'Attention-grabbing opening' },
      {
        name: 'Key Message',
        timing: `3-${duration - 5}s`,
        priority: 'high',
        description: 'Core value proposition',
      },
      {
        name: 'CTA',
        timing: `${duration - 5}-${duration}s`,
        priority: 'high',
        description: 'Clear call to action',
      },
    ],
    edits: [
      'Speed up establishing shots to 1.2x',
      'Cut transition scenes between main points',
      'Keep hook and CTA intact',
      'Add quick fade transitions',
    ],
    transitions: ['Quick cuts', 'Jump cuts between scenes', 'Fade to black at end'],
    platformOptimization: {
      format: duration <= 15 ? 'Stories (9:16)' : duration <= 30 ? 'Feed (1:1)' : 'Video (16:9)',
      recommendations: [
        'Add captions for sound-off viewing',
        duration <= 15 ? 'Optimize for Stories - vertical format' : 'Keep key visual in safe zones',
        'Hook in first 3 seconds is critical',
      ],
    },
  }));
}
