import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import admin from 'firebase-admin';

export const runtime = 'nodejs';

const prisma = new PrismaClient();

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    // Try base64 encoded service account first
    if (process.env.FIREBASE_SERVICE_ACCOUNT_B64) {
      const serviceAccount = JSON.parse(
        Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_B64, 'base64').toString('utf8')
      );
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      });
    }
    // Try 3-variable setup
    else if (process.env.FIREBASE_ADMIN_CLIENT_EMAIL && process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      });
    }
    // Fallback to application default credentials
    else {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      });
    }
  } catch (error) {
    console.error('Firebase Admin initialization failed:', error);
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get session cookie from request
    const sessionCookie = request.cookies.get('session')?.value;

    if (!sessionCookie) {
      return NextResponse.json({ error: 'No session cookie' }, { status: 401 });
    }

    // Verify Firebase session cookie
    const decodedClaims = await admin.auth().verifySessionCookie(sessionCookie, true);

    if (!decodedClaims) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Look up user profile in database
    const userProfile = await prisma.userProfile.findUnique({
      where: { uid: decodedClaims.uid },
      select: {
        uid: true,
        email: true,
        firstName: true,
        lastName: true,
        emailVerified: true,
        mustChangePassword: true,
        defaultVertical: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Return real user data from database
    return NextResponse.json({
      id: userProfile.uid,
      email: userProfile.email,
      firstName: userProfile.firstName,
      lastName: userProfile.lastName,
      emailVerified: userProfile.emailVerified,
      mustChangePassword: userProfile.mustChangePassword,
      defaultVertical: userProfile.defaultVertical,
      createdAt: userProfile.createdAt.toISOString(),
      updatedAt: userProfile.updatedAt.toISOString(),
    });

  } catch (error) {
    console.error('Auth me error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
  }
}