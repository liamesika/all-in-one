import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { resolveTenantContext, logTenantOperation } from '../../../../lib/auth/tenant-guard';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const startTime = Date.now();

  // Resolve tenant context (ownerUid) - moved outside try block for error logging
  const tenantResult = resolveTenantContext(req);

  try {
    if (!tenantResult.success) {
      return NextResponse.json(
        tenantResult.error,
        { status: tenantResult.error?.status || 400 }
      );
    }

    const { ownerUid } = tenantResult.context!;

    // Fetch user profile from database
    const userProfile = await prisma.userProfile.findUnique({
      where: {
        userId: ownerUid
      },
      select: {
        defaultVertical: true,
        termsConsentAt: true,
        termsVersion: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    console.log(`🔍 [UserProfile] User ${ownerUid} has vertical: ${userProfile.defaultVertical}`);

    logTenantOperation({
      module: 'user-profile',
      action: 'get',
      ownerUid,
      status: 'success',
      duration: Date.now() - startTime,
      metadata: {
        vertical: userProfile.defaultVertical
      }
    });

    return NextResponse.json({
      defaultVertical: userProfile.defaultVertical,
      termsConsentAt: userProfile.termsConsentAt,
      termsVersion: userProfile.termsVersion,
      createdAt: userProfile.createdAt,
      updatedAt: userProfile.updatedAt
    });

  } catch (error) {
    console.error('🔍 [UserProfile] Error fetching user profile:', error);

    logTenantOperation({
      module: 'user-profile',
      action: 'get',
      ownerUid: tenantResult.context?.ownerUid || 'unknown',
      status: 'error',
      duration: Date.now() - startTime,
      errorCode: 'FETCH_ERROR',
      metadata: {
        error: error instanceof Error ? error.message : String(error)
      }
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}