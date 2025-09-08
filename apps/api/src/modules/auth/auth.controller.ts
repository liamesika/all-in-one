// apps/api/src/modules/auth/auth.controller.ts
import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  HttpCode,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { getFirebaseAdmin } from '../../lib/firebaseAdmin';

const SESSION_COOKIE_NAME = 'session';
const SESSION_TTL_MS = 14 * 24 * 60 * 60 * 1000; // 14 ימים

// שימי לב: יש כאן api/auth כדי להתאים לקריאה מהפרונט: /api/auth/...
@Controller('auth')
export class AuthController {
  @Post('firebase/session')
@HttpCode(200)
async createSession(
  @Body() body: any,
  @Res({ passthrough: true }) res: Response,
) {
  const idToken: string | undefined = body?.idToken;
  if (!idToken) {
    console.error('❌ Missing idToken in body:', body);
    throw new UnauthorizedException('Missing idToken');
  }

  try {
    console.log('🔑 Got idToken', idToken.substring(0, 12) + '...');
    const admin = getFirebaseAdmin();
    const expiresIn = SESSION_TTL_MS;

    const sessionCookie = await admin
      .auth()
      .createSessionCookie(idToken, { expiresIn });

    console.log('✅ Created session cookie');

    const secure = process.env.NODE_ENV === 'production';
    res.cookie(SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      maxAge: expiresIn,
      path: '/',
    });

    return { ok: true };
  } catch (err) {
    console.error('🔥 createSession failed', err);
    throw err;
  }
}


  @Get('me')
  async me(@Req() req: Request) {
    const session = req.cookies?.[SESSION_COOKIE_NAME];
    if (!session) throw new UnauthorizedException('No session');

    const admin = getFirebaseAdmin();
    const decoded = await admin.auth().verifySessionCookie(session, true);
    return { uid: decoded.uid ?? null, email: (decoded as any).email ?? null };
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const session = req.cookies?.[SESSION_COOKIE_NAME];

    // ננקה את הקוקי בצד הלקוח
    const secure = process.env.NODE_ENV === 'production';
    res.cookie(SESSION_COOKIE_NAME, '', {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    // אופציונלי: ביטול רענון טוקן בצד Firebase
    if (session) {
      try {
        const admin = getFirebaseAdmin();
        const decoded = await admin.auth().verifySessionCookie(session, true);
        await admin.auth().revokeRefreshTokens(decoded.sub as string);
      } catch {
        // מתעלמים משגיאות כאן
      }
    }

    return { ok: true };
  }
}
