export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuthAndOrg } from '@/lib/apiAuth';
import { AIPromptBuilder, AutoTagContext } from '@/lib/aiPromptBuilders';
import { withAIRateLimit } from '@/lib/aiRateLimiter';
import { AIRequestLogger } from '@/lib/aiRequestLogger';

const autoTagSchema = z.object({
  assetType: z.enum(['image', 'video', 'document']),
  fileName: z.string().min(1),
  description: z.string().optional(),
  existingTags: z.array(z.string()).optional(),
});

export const POST = withAuthAndOrg(async (request, { user, orgId }) => {
  const startTime = Date.now();

  return withAIRateLimit(orgId, 'auto-tag', async () => {
    try {
      const body = await request.json();
      const validated = autoTagSchema.parse(body);

      const prompt = AIPromptBuilder.buildAutoTagPrompt(validated as AutoTagContext);

      const mockResponse = generateMockTags(validated as AutoTagContext);

      await AIRequestLogger.log({
        orgId,
        userId: user.uid,
        endpoint: 'auto-tag',
        prompt,
        response: JSON.stringify(mockResponse),
        model: 'gpt-4-vision',
        durationMs: Date.now() - startTime,
        status: 'success',
        metadata: {
          assetType: validated.assetType,
          fileName: validated.fileName,
        },
      });

      return NextResponse.json({
        tags: mockResponse,
        metadata: {
          prompt,
          model: 'gpt-4-vision',
          assetType: validated.assetType,
        },
      });
    } catch (error: any) {
      await AIRequestLogger.log({
        orgId,
        userId: user.uid,
        endpoint: 'auto-tag',
        prompt: '',
        response: '',
        model: 'gpt-4-vision',
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
        { error: 'Failed to generate tags', message: error.message },
        { status: 500 }
      );
    }
  });
});

function generateMockTags(context: AutoTagContext): string[] {
  const { assetType, fileName } = context;

  if (assetType === 'image') {
    return [
      'product-photo',
      'real-estate',
      'interior',
      'modern-design',
      'instagram',
      'facebook',
      'high-quality',
      'professional',
      'natural-light',
      'wide-angle',
    ];
  }

  if (assetType === 'video') {
    return [
      'promotional-video',
      'property-tour',
      '30-seconds',
      'social-media',
      'instagram-reel',
      'tiktok',
      'professional',
      'aerial-shot',
      'cinematic',
      'background-music',
    ];
  }

  return [
    'document',
    'pdf',
    'campaign-brief',
    'marketing-material',
    'internal',
    'draft',
    'text-heavy',
    'multi-page',
  ];
}
