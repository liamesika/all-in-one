import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth.server';
import { prisma } from '@/lib/prisma.server';
import { generateCampaignContent } from '@/lib/openai.server';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit.server';

export const dynamic = 'force-dynamic';
export const maxDuration = 120; // 2 minutes for AI generation

interface CampaignBrief {
  goal: string;
  budget: string;
  targetRegion: string;
  targetAudience: string;
  productCategory: string;
  additionalNotes?: string;
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting - per user
    const rateLimitResult = await rateLimit({
      ...RATE_LIMITS.OPENAI_CAMPAIGNS,
      identifier: `campaigns-${currentUser.uid}`,
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
    const { brief } = body as { brief: CampaignBrief };

    if (!brief.goal || !brief.budget) {
      return NextResponse.json(
        { error: 'Goal and budget are required' },
        { status: 400 }
      );
    }

    // Generate audiences and ad copies using real GPT-4
    const { audiences, adCopies } = await generateCampaignContent(brief);

    // Add IDs to the results
    const audiencesWithIds = audiences.map((aud, index) => ({
      id: `aud-${Date.now()}-${index}`,
      ...aud,
    }));

    const adCopiesWithIds = adCopies.map((copy, index) => ({
      id: `copy-${Date.now()}-${index}`,
      ...copy,
    }));

    // Save to database
    const version = await prisma.ecomCampaignVersion.create({
      data: {
        ownerUid: currentUser.uid,
        brief: brief as any,
        audiences: audiencesWithIds as any,
        adCopies: adCopiesWithIds as any,
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

    console.log('[Campaign Assistant] Generated campaign with GPT-4:', version.id);

    return NextResponse.json({
      version: {
        id: version.id,
        brief: version.brief,
        audiences: version.audiences,
        adCopies: version.adCopies,
        createdAt: version.createdAt.toISOString(),
      },
      audiences: audiencesWithIds,
      adCopies: adCopiesWithIds,
    });
  } catch (error) {
    console.error('[POST /api/ecommerce/campaigns/assistant/generate] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate campaign. Check OpenAI API key.' },
      { status: 500 }
    );
  }
}
