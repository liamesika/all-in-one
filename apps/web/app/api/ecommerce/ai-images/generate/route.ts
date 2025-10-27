import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth.server';
import { prisma } from '@/lib/prisma.server';
import { generateImage } from '@/lib/openai.server';
import { uploadImageFromUrl } from '@/lib/s3.server';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit.server';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes for batch image generation

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting - per user
    const rateLimitResult = await rateLimit({
      ...RATE_LIMITS.OPENAI_IMAGES,
      identifier: `ai-images-${currentUser.uid}`,
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. Please try again later.',
          resetAt: rateLimitResult.resetAt,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetAt.toString(),
          },
        }
      );
    }

    const body = await request.json();
    const { prompt, count, size, format } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // DALL-E 3 only supports n=1, so we need to make multiple calls for batch
    const batchCount = count || 1;
    const imageSize = (size || '1024x1024') as '1024x1024' | '1024x1792' | '1792x1024';

    const images = [];

    for (let i = 0; i < batchCount; i++) {
      try {
        // Generate image with DALL-E 3
        const tempImageUrl = await generateImage(prompt, imageSize);

        if (!tempImageUrl) {
          throw new Error('No image URL returned from DALL-E');
        }

        // Upload to S3 for permanent storage
        let permanentUrl: string;
        try {
          const s3Key = `ecommerce/${currentUser.uid}/ai-images/${Date.now()}-${i}.png`;
          permanentUrl = await uploadImageFromUrl(tempImageUrl, s3Key);
          console.log('[AI Images] Uploaded to S3:', s3Key);
        } catch (s3Error) {
          console.warn('[S3] Upload failed, using temporary URL:', s3Error);
          permanentUrl = tempImageUrl;
        }

        // Save to database
        const savedImage = await prisma.ecomAIImage.create({
          data: {
            ownerUid: currentUser.uid,
            prompt,
            imageUrl: permanentUrl,
            size: imageSize,
            format: format || 'webp',
          },
        });

        images.push({
          id: savedImage.id,
          url: savedImage.imageUrl,
          prompt: savedImage.prompt,
          createdAt: savedImage.createdAt.toISOString(),
        });
      } catch (imageError) {
        console.error(`[AI Images] Failed to generate image ${i + 1}:`, imageError);
        // Continue with next image instead of failing entire batch
      }
    }

    if (images.length === 0) {
      return NextResponse.json(
        { error: 'Failed to generate any images. Check OpenAI API key.' },
        { status: 500 }
      );
    }

    // Update stats
    await prisma.ecomStats.upsert({
      where: { ownerUid: currentUser.uid },
      create: {
        ownerUid: currentUser.uid,
        aiImagesGenerated: images.length,
      },
      update: {
        aiImagesGenerated: { increment: images.length },
      },
    });

    console.log('[AI Images] Successfully generated', images.length, 'images with DALL-E 3');

    return NextResponse.json({ images });
  } catch (error) {
    console.error('[POST /api/ecommerce/ai-images/generate] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate images' },
      { status: 500 }
    );
  }
}
