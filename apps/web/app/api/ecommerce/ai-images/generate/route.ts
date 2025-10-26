import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth.server';
import { prisma } from '@/lib/prisma.server';

export const dynamic = 'force-dynamic';

async function generateAIImage(prompt: string, size: string, format: string) {
  // In production with OpenAI API:
  // const response = await openai.images.generate({
  //   model: "dall-e-3",
  //   prompt: prompt,
  //   size: size,
  //   quality: "hd",
  //   n: 1,
  // });
  // const imageUrl = response.data[0].url;
  // Then download and upload to S3

  // For now, simulate with placeholder
  const width = size.split('x')[0];
  const height = size.split('x')[1];
  return `https://placehold.co/${width}x${height}/2979FF/FFFFFF/png?text=AI+Generated`;
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { prompt, count, size, format } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Generate images
    const imagePromises = Array.from({ length: count || 1 }, () =>
      generateAIImage(prompt, size || '1024x1024', format || 'webp')
    );

    const imageUrls = await Promise.all(imagePromises);

    // Save to database
    const images = await Promise.all(
      imageUrls.map(url =>
        prisma.ecomAIImage.create({
          data: {
            ownerUid: currentUser.uid,
            prompt,
            imageUrl: url,
            size: size || '1024x1024',
            format: format || 'webp',
          },
        })
      )
    );

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

    console.log('[AI Images] Generated', images.length, 'images');

    return NextResponse.json({
      images: images.map(img => ({
        id: img.id,
        url: img.imageUrl,
        prompt: img.prompt,
        createdAt: img.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('[POST /api/ecommerce/ai-images/generate] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate images' },
      { status: 500 }
    );
  }
}
