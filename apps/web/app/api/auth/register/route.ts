import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, email, vertical, accountType, firebaseUid, lang } = body;

    // Validate required fields
    if (!fullName || !email || !vertical || !firebaseUid) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate Production-specific requirements
    if (vertical === 'PRODUCTION' && !accountType) {
      return NextResponse.json(
        { message: 'Account type is required for Production vertical' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        {
          message: 'User already exists',
          action: 'login_or_reset'
        },
        { status: 409 }
      );
    }

    // Create user in database
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        fullName: fullName.trim(),
        passwordHash: '', // Firebase handles auth, so we can leave this empty
        lang: lang || 'en'
      }
    });

    // Create user profile with vertical preference and account type
    await prisma.userProfile.create({
      data: {
        userId: user.id,
        defaultVertical: vertical as any, // Convert string to Vertical enum
        accountType: accountType ? accountType as any : null, // Convert string to AccountType enum
        termsConsentAt: new Date(),
        termsVersion: '1.0'
      }
    });

    // Determine redirect path based on vertical
    let redirectPath = '/dashboard/e-commerce/dashboard'; // default

    switch (vertical) {
      case 'REAL_ESTATE':
        redirectPath = '/dashboard/real-estate/dashboard';
        break;
      case 'LAW':
        redirectPath = '/dashboard/law/dashboard';
        break;
      case 'PRODUCTION':
        // Route based on account type for Production
        redirectPath = accountType === 'COMPANY'
          ? '/dashboard/production/company'
          : '/dashboard/production/private';
        break;
      case 'E_COMMERCE':
      default:
        redirectPath = '/dashboard/e-commerce/dashboard';
        break;
    }

    return NextResponse.json({
      success: true,
      userId: user.id,
      redirectPath,
      message: 'User registered successfully'
    });

  } catch (error: any) {
    console.error('Registration API error:', error);

    // Handle Prisma unique constraint violations
    if (error.code === 'P2002') {
      return NextResponse.json(
        {
          message: 'User already exists',
          action: 'login_or_reset'
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}