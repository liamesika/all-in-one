import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { resolveTenantContext, logTenantOperation } from '../../../lib/auth/tenant-guard';
import { CreateLeadSchema } from '../../../lib/validation/leads';

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

export async function POST(req: Request) {
  const startTime = Date.now();
  let leadId: string | undefined;

  try {
    // Resolve tenant context with proper authentication
    const guardResult = resolveTenantContext(req as NextRequest);

    if (!guardResult.success) {
      logTenantOperation({
        module: 'leads',
        action: 'create',
        status: 'error',
        errorCode: guardResult.error?.code,
        duration: Date.now() - startTime,
      });

      return NextResponse.json(
        {
          code: guardResult.error?.code || 'UNAUTHORIZED',
          message: guardResult.error?.message || 'Authentication required',
        },
        { status: guardResult.error?.status || 401 }
      );
    }

    const { ownerUid, isDevFallback } = guardResult.context!;

    // Parse and validate request body
    const body = await req.json();

    // Transform invalid source values to prevent Prisma enum errors
    if (body.source && !['FACEBOOK', 'INSTAGRAM', 'WHATSAPP', 'CSV_UPLOAD', 'GOOGLE_SHEETS', 'MANUAL', 'OTHER'].includes(body.source)) {
      const originalSource = body.source;
      console.warn(`[LeadsAPI] Invalid source value '${originalSource}' transformed to 'OTHER'`);
      // Store the original source in sourceName if not already provided
      if (!body.sourceName) {
        body.sourceName = originalSource;
      }
      body.source = 'OTHER';
    }

    console.log(`[LeadsAPI] Processing lead with source: '${body.source}'`);
    const validationResult = CreateLeadSchema.safeParse(body);

    if (!validationResult.success) {
      logTenantOperation({
        module: 'leads',
        action: 'create',
        ownerUid,
        status: 'error',
        errorCode: 'VALIDATION_ERROR',
        duration: Date.now() - startTime,
        metadata: {
          validationErrors: validationResult.error.issues,
          isDevFallback,
        },
      });

      return NextResponse.json(
        {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const validData = validationResult.data;

    // Create the lead data with validated input
    console.log(`[LeadsAPI] Creating leadData with validData.source: '${validData.source}'`);
    const leadData = {
      ownerUid,
      fullName: validData.fullName,
      firstName: validData.firstName || null,
      lastName: validData.lastName || null,
      email: validData.email || null,
      phone: validData.phone || null,
      city: validData.city || null,
      source: validData.source,
      sourceName: validData.sourceName || null,
      status: validData.status,
      score: validData.score,
      budget: validData.budget || null,
      interests: validData.interests,
      notes: validData.notes || null,
      phoneValid: 'PENDING',
      emailValid: 'PENDING',
      isDuplicate: false,
      campaignId: validData.campaignId || null,
      platformAdSetId: validData.platformAdSetId || null,
      utmSource: validData.utmSource || null,
      utmMedium: validData.utmMedium || null,
      utmCampaign: validData.utmCampaign || null,
      utmTerm: validData.utmTerm || null,
      utmContent: validData.utmContent || null,
    };

    // Create the lead in the database
    const newLead = await prisma.ecommerceLead.create({
      data: leadData,
    });

    leadId = newLead.id;

    logTenantOperation({
      module: 'leads',
      action: 'create',
      ownerUid,
      status: 'success',
      id: leadId,
      duration: Date.now() - startTime,
      metadata: {
        source: validData.source,
        isDevFallback,
      },
    });

    return NextResponse.json(
      {
        id: newLead.id,
        createdAt: newLead.createdAt.toISOString(),
        success: true,
      },
      { status: 201 }
    );
  } catch (error: any) {
    logTenantOperation({
      module: 'leads',
      action: 'create',
      status: 'error',
      errorCode: 'DATABASE_ERROR',
      id: leadId,
      duration: Date.now() - startTime,
      metadata: {
        error: error?.message,
      },
    });

    console.error('[LeadsAPI] Create error:', error);

    return NextResponse.json(
      {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create lead',
      },
      { status: 500 }
    );
  }
}