import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth.server';
import { prisma } from '@/lib/prisma.server';

export const dynamic = 'force-dynamic';

interface CampaignBrief {
  goal: string;
  budget: string;
  targetRegion: string;
  targetAudience: string;
  productCategory: string;
  additionalNotes: string;
}

function generateAudiences(brief: CampaignBrief) {
  // In production, use OpenAI to analyze brief and generate audiences
  // For now, return realistic mock data

  const baseAudiences = [
    {
      name: 'Core Target Audience',
      description: `Primary audience segment based on ${brief.targetAudience || 'demographics'}`,
      demographics: brief.targetAudience || 'Adults 25-54',
      interests: [brief.productCategory || 'Shopping', 'Online Shopping', 'Product Discovery'],
      estimatedReach: '50K - 200K',
    },
    {
      name: 'Lookalike Audience',
      description: 'Similar profiles to your best customers with high conversion potential',
      demographics: brief.targetAudience || 'Adults 25-54',
      interests: [brief.productCategory || 'Shopping', 'E-commerce', 'Brand Enthusiasts'],
      estimatedReach: '100K - 500K',
    },
    {
      name: 'Retargeting Audience',
      description: 'Previous website visitors and engaged users',
      demographics: 'Site Visitors (Last 30 days)',
      interests: ['Your Products', 'Cart Abandoners', 'Product Viewers'],
      estimatedReach: '10K - 50K',
    },
  ];

  return baseAudiences.map((aud, index) => ({
    id: `aud-${Date.now()}-${index}`,
    ...aud,
  }));
}

function generateAdCopies(brief: CampaignBrief) {
  // In production, use OpenAI to generate personalized ad copy
  // For now, return realistic variants

  const variants = [
    {
      headline: `Discover Premium ${brief.productCategory || 'Products'}`,
      body: `Shop the latest collection with exclusive deals. Limited time offer - save up to 40%!`,
      cta: 'Shop Now',
      tone: 'Professional',
    },
    {
      headline: `${brief.productCategory || 'Products'} You'll Love`,
      body: `Join thousands of happy customers. Free shipping on orders over $50. Quality guaranteed.`,
      cta: 'Explore Collection',
      tone: 'Friendly',
    },
    {
      headline: `Limited Time: ${brief.productCategory || 'Sale'} Event`,
      body: `Don't miss out! Grab your favorites before they're gone. Flash sale ends soon!`,
      cta: 'Get Yours Now',
      tone: 'Urgent',
    },
  ];

  return variants.map((variant, index) => ({
    id: `copy-${Date.now()}-${index}`,
    ...variant,
  }));
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { brief } = body as { brief: CampaignBrief };

    if (!brief.goal || !brief.budget) {
      return NextResponse.json(
        { error: 'Goal and budget are required' },
        { status: 400 }
      );
    }

    // Generate audiences and ad copies
    const audiences = generateAudiences(brief);
    const adCopies = generateAdCopies(brief);

    // Save to database
    const version = await prisma.ecomCampaignVersion.create({
      data: {
        ownerUid: currentUser.uid,
        brief: brief as any,
        audiences: audiences as any,
        adCopies: adCopies as any,
      },
    });

    // Update stats
    await prisma.ecomStats.upsert({
      where: { ownerUid: currentUser.uid },
      create: {
        ownerUid: currentUser.uid,
        campaignsCreated: 1,
      },
      update: {
        campaignsCreated: { increment: 1 },
      },
    });

    console.log('[Campaign Assistant] Generated campaign:', version.id);

    return NextResponse.json({
      version: {
        id: version.id,
        brief: version.brief,
        audiences: version.audiences,
        adCopies: version.adCopies,
        createdAt: version.createdAt.toISOString(),
      },
      audiences,
      adCopies,
    });
  } catch (error) {
    console.error('[POST /api/ecommerce/campaigns/assistant/generate] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate campaign' },
      { status: 500 }
    );
  }
}
