import { NextResponse } from 'next/server';
import { prisma } from '../../../../../packages/server/db/client';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') || '').trim();
    const status = searchParams.get('status') || undefined;
    const score = searchParams.get('score') || undefined;
    const source = searchParams.get('source') || undefined;
    const ownerUid = searchParams.get('ownerUid') || undefined;
    const limit = Math.min(200, Math.max(1, Number(searchParams.get('limit') || 100)));
    const page = Math.max(1, Number(searchParams.get('page') || 1));
    const skip = (page - 1) * limit;

    // Build WHERE clause for e-commerce leads
    const where: any = {
      ...(ownerUid ? { ownerUid } : {}),
      ...(status ? { status } : {}),
      ...(score ? { score } : {}),
      ...(source ? { source } : {}),
    };

    if (q) {
      // Search across multiple fields
      where.OR = [
        { email: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
        { fullName: { contains: q, mode: 'insensitive' } },
        { firstName: { contains: q, mode: 'insensitive' } },
        { lastName: { contains: q, mode: 'insensitive' } },
        { city: { contains: q, mode: 'insensitive' } },
      ];
    }

    // Fetch e-commerce leads from database
    const [leads, totalCount] = await Promise.all([
      prisma.ecommerceLead.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
        include: {
          campaign: {
            select: {
              id: true,
              name: true,
              platform: true,
              status: true,
            },
          },
        },
      }),
      prisma.ecommerceLead.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      leads: leads.map((lead: any) => ({
        id: lead.id,
        fullName: lead.fullName,
        firstName: lead.firstName,
        lastName: lead.lastName,
        email: lead.email,
        phone: lead.phone,
        city: lead.city,
        source: lead.source,
        sourceName: lead.sourceName,
        status: lead.status,
        score: lead.score,
        budget: lead.budget,
        interests: lead.interests,
        notes: lead.notes,
        phoneValid: lead.phoneValid,
        emailValid: lead.emailValid,
        isDuplicate: lead.isDuplicate,
        duplicateOfId: lead.duplicateOfId,
        firstContactAt: lead.firstContactAt,
        lastContactAt: lead.lastContactAt,
        createdAt: lead.createdAt,
        updatedAt: lead.updatedAt,
        campaign: lead.campaign,
        campaignId: lead.campaignId,
        platformAdSetId: lead.platformAdSetId,
        utmSource: lead.utmSource,
        utmMedium: lead.utmMedium,
        utmCampaign: lead.utmCampaign,
        utmTerm: lead.utmTerm,
        utmContent: lead.utmContent,
      })),
      pagination: {
        page,
        limit,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error: any) {
    console.error('E-commerce leads API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}