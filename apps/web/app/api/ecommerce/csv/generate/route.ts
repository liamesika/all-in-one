import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma.server';
import { getCurrentUser } from '@/lib/auth.server';
import { generateProductData } from '@/lib/openai.server';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit.server';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes for batch processing

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting - per user
    const rateLimitResult = await rateLimit({
      ...RATE_LIMITS.OPENAI_CSV,
      identifier: `csv-generate-${currentUser.uid}`,
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
    const { imageUrls, targetLanguage, pricingRule, aliExpressUrl, productCategory } = body;

    if (!imageUrls || imageUrls.length === 0) {
      return NextResponse.json({ error: 'No images provided' }, { status: 400 });
    }

    // Generate product data for each image using real OpenAI
    const products = await Promise.all(
      imageUrls.map(async (url: string) => {
        try {
          return await generateProductData(
            url,
            targetLanguage as 'en' | 'he',
            productCategory
          );
        } catch (aiError) {
          console.error('[OpenAI] Generation failed for image:', url, aiError);
          // Fallback to basic product if AI fails
          return {
            name: targetLanguage === 'he' ? 'מוצר' : 'Product',
            description:
              targetLanguage === 'he'
                ? 'תיאור המוצר יתווסף בקרוב'
                : 'Product description coming soon',
            tags: 'product',
            basePrice: 29.99,
          };
        }
      })
    );

    // Save to database
    const session = await prisma.ecomCSVSession.create({
      data: {
        ownerUid: currentUser.uid,
        sourceType: aliExpressUrl ? 'ALIEXPRESS_IMPORT' : 'MANUAL_UPLOAD',
        sourceUrl: aliExpressUrl || null,
        uploadedImages: imageUrls,
        targetLanguage,
        pricingRules: pricingRule,
        generatedData: products,
        productCount: products.length,
        status: 'COMPLETED',
      },
    });

    // Update stats
    await prisma.ecomStats.upsert({
      where: { ownerUid: currentUser.uid },
      create: {
        ownerUid: currentUser.uid,
        productsUploaded: products.length,
        csvSessionsCompleted: 1,
      },
      update: {
        productsUploaded: { increment: products.length },
        csvSessionsCompleted: { increment: 1 },
      },
    });

    console.log('[CSV Generate] Generated', products.length, 'products with OpenAI');

    return NextResponse.json({
      products,
      sessionId: session.id,
    });
  } catch (error) {
    console.error('[POST /api/ecommerce/csv/generate] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate products' },
      { status: 500 }
    );
  }
}
