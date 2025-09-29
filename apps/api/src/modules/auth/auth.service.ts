import { Injectable, ConflictException, Logger, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { RegisterDto, Vertical, RegisterResponseDto } from './dto/register.dto';
import { LoginDto, LoginResponseDto } from './dto/login.dto';
import { PrismaService } from '../../lib/prisma.service';
import { getFirebaseAdmin } from '../../lib/firebaseAdmin';

const SECRET = process.env.JWT_SECRET || 'dev-secret';
const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'session';
const TERMS_VERSION = process.env.TERMS_VERSION || '1.0';
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly prisma: PrismaService) {}

  sign(user: any) {
    return jwt.sign(user, SECRET, { expiresIn: '14d' });
  }

  verify(token: string) {
    try { 
      return jwt.verify(token, SECRET); 
    } catch { 
      return null; 
    }
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  resolveDashboardPath(vertical: Vertical): string {
    const verticalRoutes = {
      [Vertical.REAL_ESTATE]: '/dashboard/real-estate/dashboard',
      [Vertical.LAW]: '/dashboard/law/dashboard',
      [Vertical.E_COMMERCE]: '/dashboard/e-commerce/dashboard',
      [Vertical.PRODUCTION]: '/dashboard/production/dashboard',
    };

    return verticalRoutes[vertical] || '/dashboard/e-commerce/dashboard';
  }

  async register(registerDto: RegisterDto): Promise<RegisterResponseDto> {
    this.logger.log(`Registration attempt for email: ${registerDto.email.substring(0, 3)}***`);

    // Validate terms consent
    if (!registerDto.termsConsent) {
      throw new ConflictException('Terms consent is required');
    }

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email.toLowerCase() },
    });

    if (existingUser) {
      this.logger.warn(`Registration failed: email already exists ${registerDto.email.substring(0, 3)}***`);
      throw new ConflictException({
        message: 'Email already exists',
        action: 'login_or_reset',
      });
    }

    try {
      // Hash password
      const passwordHash = await this.hashPassword(registerDto.password);

      // Create user in transaction
      const result = await this.prisma.$transaction(async (tx) => {
        // Create user
        const user = await tx.user.create({
          data: {
            fullName: registerDto.fullName.trim(),
            email: registerDto.email.toLowerCase(),
            passwordHash,
            lang: registerDto.lang || 'en',
          },
        });

        // Create organization for the user
        const organization = await tx.organization.create({
          data: {
            ownerUid: user.id,
            name: `${registerDto.fullName.trim()}'s Organization`,
          },
        });

        // Create membership with OWNER role
        await tx.membership.create({
          data: {
            userId: user.id,
            ownerUid: organization.id,
            role: 'OWNER',
          },
        });

        // Create user profile
        const userProfile = await tx.userProfile.create({
          data: {
            userId: user.id,
            defaultVertical: registerDto.vertical,
            termsConsentAt: new Date(),
            termsVersion: TERMS_VERSION,
          },
        });

        return { user, userProfile };
      });

      this.logger.log(`User registered successfully: ${result.user.id}`);

      // Emit telemetry event (placeholder)
      this.emitEvent('user_registered', {
        userId: result.user.id,
        vertical: registerDto.vertical,
        lang: registerDto.lang || 'en',
      });

      const redirectPath = this.resolveDashboardPath(registerDto.vertical);

      return {
        redirectPath,
        user: {
          id: result.user.id,
          fullName: result.user.fullName,
          email: result.user.email,
          defaultVertical: registerDto.vertical,
        },
      };
    } catch (error) {
      this.logger.error('Registration failed:', error);
      throw error;
    }
  }

  async createSessionToken(user: any): Promise<string> {
    const payload = {
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
    };
    return this.sign(payload);
  }

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    this.logger.log(`Login attempt for email: ${loginDto.email.substring(0, 3)}***`);

    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email.toLowerCase() },
      include: {
        userProfile: true,
      },
    });

    if (!user || !user.userProfile) {
      this.logger.warn(`Login failed: user not found ${loginDto.email.substring(0, 3)}***`);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const passwordValid = await this.comparePassword(loginDto.password, user.passwordHash);
    if (!passwordValid) {
      this.logger.warn(`Login failed: invalid password ${loginDto.email.substring(0, 3)}***`);
      throw new UnauthorizedException('Invalid credentials');
    }

    this.logger.log(`User logged in successfully: ${user.id}`);

    // Emit telemetry event
    this.emitEvent('login_success', {
      userId: user.id,
      vertical: user.userProfile.defaultVertical,
      lang: user.lang,
    });

    const redirectPath = this.resolveDashboardPath(user.userProfile.defaultVertical as Vertical);

    return {
      redirectPath,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        defaultVertical: user.userProfile.defaultVertical,
      },
    };
  }

  async registerWithFirebase(registerDto: RegisterDto & { firebaseUid: string }): Promise<RegisterResponseDto> {
    this.logger.log(`Firebase registration attempt for email: ${registerDto.email.substring(0, 3)}***`);

    // Validate terms consent
    if (!registerDto.termsConsent) {
      throw new ConflictException('Terms consent is required');
    }

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email.toLowerCase() },
    });

    if (existingUser) {
      this.logger.warn(`Registration failed: email already exists ${registerDto.email.substring(0, 3)}***`);
      throw new ConflictException({
        message: 'Email already exists',
        action: 'login_or_reset',
      });
    }

    try {
      // Create user in transaction (no password hash needed for Firebase users)
      const result = await this.prisma.$transaction(async (tx) => {
        // Create user with Firebase UID
        const user = await tx.user.create({
          data: {
            id: registerDto.firebaseUid, // Use Firebase UID as primary key
            fullName: registerDto.fullName.trim(),
            email: registerDto.email.toLowerCase(),
            passwordHash: '', // Empty for Firebase users
            lang: registerDto.lang || 'en',
          },
        });

        // Create organization for the user
        const organization = await tx.organization.create({
          data: {
            ownerUid: user.id,
            name: `${registerDto.fullName.trim()}'s Organization`,
          },
        });

        // Create membership with OWNER role
        await tx.membership.create({
          data: {
            userId: user.id,
            ownerUid: organization.id,
            role: 'OWNER',
          },
        });

        // Create user profile
        const userProfile = await tx.userProfile.create({
          data: {
            userId: user.id,
            defaultVertical: registerDto.vertical,
            termsConsentAt: new Date(),
            termsVersion: TERMS_VERSION,
          },
        });

        return { user, userProfile };
      });

      this.logger.log(`Firebase user registered successfully: ${result.user.id}`);

      // Emit telemetry event
      this.emitEvent('user_registered_firebase', {
        userId: result.user.id,
        vertical: registerDto.vertical,
        lang: registerDto.lang || 'en',
      });

      const redirectPath = this.resolveDashboardPath(registerDto.vertical);

      return {
        redirectPath,
        user: {
          id: result.user.id,
          fullName: result.user.fullName,
          email: result.user.email,
          defaultVertical: registerDto.vertical,
        },
      };
    } catch (error) {
      this.logger.error('Firebase registration failed:', error);
      throw error;
    }
  }

  async verifyFirebaseToken(idToken: string) {
    try {
      const admin = getFirebaseAdmin();
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      return decodedToken;
    } catch (error) {
      this.logger.error('Firebase token verification failed:', error);
      throw new UnauthorizedException('Invalid Firebase token');
    }
  }

  async getUserByFirebaseUid(firebaseUid: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: firebaseUid },
      include: {
        userProfile: true,
      },
    });

    return user;
  }

  async getUserWithProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userProfile: true,
      },
    });

    return user;
  }

  private emitEvent(eventName: string, data: any) {
    // Placeholder for telemetry/analytics
    this.logger.log(`Event: ${eventName}`, JSON.stringify(data));
  }

}
