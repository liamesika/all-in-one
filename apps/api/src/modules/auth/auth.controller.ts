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
  ValidationPipe,
  ConflictException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { getFirebaseAdmin } from '../../lib/firebaseAdmin';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const SESSION_COOKIE_NAME = 'session';
const SESSION_TTL_MS = 14 * 24 * 60 * 60 * 1000; // 14 ימים

// שימי לב: יש כאן api/auth כדי להתאים לקריאה מהפרונט: /api/auth/...
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts per minute
  async register(
    @Body(ValidationPipe) registerDto: RegisterDto & { firebaseUid?: string; idToken?: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      let result;
      
      if (registerDto.firebaseUid && registerDto.idToken) {
        // Firebase registration path
        await this.authService.verifyFirebaseToken(registerDto.idToken);
        result = await this.authService.registerWithFirebase({
          ...registerDto,
          firebaseUid: registerDto.firebaseUid
        });
      } else {
        // Traditional registration path
        result = await this.authService.register(registerDto);
        
        // Create session token and set cookie for traditional auth
        const sessionToken = await this.authService.createSessionToken(result.user);
        
        const secure = process.env.NODE_ENV === 'production';
        res.cookie(SESSION_COOKIE_NAME, sessionToken, {
          httpOnly: true,
          secure,
          sameSite: 'strict',
          maxAge: SESSION_TTL_MS,
          path: '/',
        });
      }

      return result;
    } catch (error) {
      if (error instanceof ConflictException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new ConflictException('Registration failed');
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 attempts per minute
  async login(
    @Body(ValidationPipe) loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const result = await this.authService.login(loginDto);
      
      // Create session token and set cookie
      const sessionToken = await this.authService.createSessionToken(result.user);
      
      const secure = process.env.NODE_ENV === 'production';
      res.cookie(SESSION_COOKIE_NAME, sessionToken, {
        httpOnly: true,
        secure,
        sameSite: 'strict',
        maxAge: SESSION_TTL_MS,
        path: '/',
      });

      return result;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Login failed');
    }
  }

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

      // Verify the ID token first
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      console.log('✅ Token verified for user:', decodedToken.uid);

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

      return { 
        ok: true,
        user: {
          uid: decodedToken.uid,
          email: decodedToken.email
        }
      };
    } catch (err: any) {
      console.error('🔥 createSession failed', err);
      
      if (err.code === 'auth/invalid-id-token') {
        throw new UnauthorizedException('Invalid Firebase ID token. Please sign in again.');
      } else if (err.code === 'auth/id-token-expired') {
        throw new UnauthorizedException('Firebase ID token has expired. Please sign in again.');
      }
      
      throw new UnauthorizedException('Failed to create session. Please try again.');
    }
  }


  @Get('me')
  async me(@Req() req: Request) {
    const session = req.cookies?.[SESSION_COOKIE_NAME];
    if (!session) throw new UnauthorizedException('No session');

    const decoded = this.authService.verify(session);
    if (!decoded) throw new UnauthorizedException('Invalid session');

    // Get full user data including vertical preference
    const userData = await this.authService.getUserWithProfile((decoded as any).userId);
    
    return { 
      userId: userData?.id ?? null, 
      email: userData?.email ?? null,
      fullName: userData?.fullName ?? null,
      defaultVertical: userData?.userProfile?.defaultVertical ?? null
    };
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
