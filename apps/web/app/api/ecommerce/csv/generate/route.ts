import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma.server';
import { getCurrentUser } from '@/lib/auth.server';

export const dynamic = 'force-dynamic';

// Server-side AI generation
async function generateProductData(imageUrl: string, language: string) {
  // Simulated AI generation - in production, call OpenAI Vision API
  const products = {
    en: {
      name: 'Premium Product',
      description: 'High-quality product with excellent features',
      tags: 'premium, quality, new',
      basePrice: 29.99,
    },
    he: {
      name: 'מוצר פרימיום',
      description: 'מוצר איכותי עם תכונות מצוינות',
      tags: 'פרימיום, איכות, חדש',
      basePrice: 29.99,
    },
  };

  return products[language as keyof typeof products] || products.en;
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { imageUrls, targetLanguage, pricingRule, aliExpressUrl } = body;

    if (!imageUrls || imageUrls.length === 0) {
      return NextResponse.json({ error: 'No images provided' }, { status: 400 });
    }

    // Generate product data for each image
    const products = await Promise.all(
      imageUrls.map((url: string) => generateProductData(url, targetLanguage))
    );

    // Save to database
    await prisma.ecomCSVSession.create({
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

    return NextResponse.json({
      products,
      sessionId: 'session-id',
    });
  } catch (error) {
    console.error('[POST /api/ecommerce/csv/generate] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate products' },
      { status: 500 }
    );
  }
}
