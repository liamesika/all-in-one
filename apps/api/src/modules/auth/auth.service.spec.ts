/**
 * AuthService Unit Tests
 * 
 * Tests authentication functionality including:
 * - User registration and login
 * - Password hashing and verification
 * - JWT token management
 * - Firebase authentication integration
 * - Multi-tenant data creation
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../../lib/prisma.service';
import { RegisterDto, Vertical } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

// Mock external dependencies
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../../lib/firebaseAdmin');

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    organization: {
      create: jest.fn(),
    },
    membership: {
      create: jest.fn(),
    },
    userProfile: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);

    // Reset all mocks
    jest.clearAllMocks();

    // Setup default mock implementations
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue('mock-jwt-token');
    (jwt.verify as jest.Mock).mockReturnValue({ userId: 'test-user-id' });
  });

  describe('Password Management', () => {
    it('should hash password correctly', async () => {
      const password = 'test-password';
      const hashedPassword = await service.hashPassword(password);

      expect(bcrypt.hash).toHaveBeenCalledWith(password, 4); // Uses test environment BCRYPT_ROUNDS
      expect(hashedPassword).toBe('hashed-password');
    });

    it('should compare passwords correctly', async () => {
      const password = 'test-password';
      const hash = 'hashed-password';
      
      const result = await service.comparePassword(password, hash);

      expect(bcrypt.compare).toHaveBeenCalledWith(password, hash);
      expect(result).toBe(true);
    });

    it('should handle password comparison failure', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      
      const result = await service.comparePassword('wrong-password', 'hash');
      expect(result).toBe(false);
    });
  });

  describe('JWT Token Management', () => {
    it('should sign JWT tokens correctly', () => {
      const payload = { userId: 'test-user', email: 'test@example.com' };
      const token = service.sign(payload);

      expect(jwt.sign).toHaveBeenCalledWith(payload, 'test-jwt-secret', { expiresIn: '14d' });
      expect(token).toBe('mock-jwt-token');
    });

    it('should verify JWT tokens correctly', () => {
      const token = 'valid-token';
      const decoded = service.verify(token);

      expect(jwt.verify).toHaveBeenCalledWith(token, 'test-jwt-secret');
      expect(decoded).toEqual({ userId: 'test-user-id' });
    });

    it('should handle invalid JWT tokens', () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = service.verify('invalid-token');
      expect(result).toBeNull();
    });
  });

  describe('Dashboard Path Resolution', () => {
    it('should resolve real estate dashboard path', () => {
      const path = service.resolveDashboardPath(Vertical.REAL_ESTATE);
      expect(path).toBe('/real-estate/dashboard');
    });

    it('should resolve e-commerce dashboard path', () => {
      const path = service.resolveDashboardPath(Vertical.E_COMMERCE);
      expect(path).toBe('/e-commerce/dashboard');
    });

    it('should resolve law dashboard path', () => {
      const path = service.resolveDashboardPath(Vertical.LAW);
      expect(path).toBe('/law/dashboard');
    });

    it('should default to e-commerce dashboard for unknown vertical', () => {
      const path = service.resolveDashboardPath('UNKNOWN' as Vertical);
      expect(path).toBe('/e-commerce/dashboard');
    });
  });

  describe('User Registration', () => {
    const mockRegisterDto: RegisterDto = {
      fullName: 'John Doe',
      email: 'john@example.com',
      password: 'secure-password',
      vertical: Vertical.REAL_ESTATE,
      lang: 'en',
      termsConsent: true,
    };

    const mockUser = {
      id: 'user-id',
      fullName: 'John Doe',
      email: 'john@example.com',
      passwordHash: 'hashed-password',
      lang: 'en',
    };

    const mockOrganization = {
      id: 'org-id',
      ownerUid: 'user-id',
      name: "John Doe's Organization",
    };

    const mockUserProfile = {
      id: 'profile-id',
      userId: 'user-id',
      defaultVertical: Vertical.REAL_ESTATE,
      termsConsentAt: new Date(),
      termsVersion: '1.0',
    };

    beforeEach(() => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.$transaction.mockImplementation(async (fn) => {
        return fn({
          user: { create: jest.fn().mockResolvedValue(mockUser) },
          organization: { create: jest.fn().mockResolvedValue(mockOrganization) },
          membership: { create: jest.fn().mockResolvedValue({}) },
          userProfile: { create: jest.fn().mockResolvedValue(mockUserProfile) },
        });
      });
    });

    it('should register a new user successfully', async () => {
      const result = await service.register(mockRegisterDto);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'john@example.com' },
      });

      expect(result).toEqual({
        redirectPath: '/real-estate/dashboard',
        user: {
          id: 'user-id',
          fullName: 'John Doe',
          email: 'john@example.com',
          defaultVertical: Vertical.REAL_ESTATE,
        },
      });
    });

    it('should reject registration without terms consent', async () => {
      const invalidDto = { ...mockRegisterDto, termsConsent: false };

      await expect(service.register(invalidDto)).rejects.toThrow(
        new ConflictException('Terms consent is required')
      );
    });

    it('should reject registration for existing email', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 'existing-user' });

      await expect(service.register(mockRegisterDto)).rejects.toThrow(
        new ConflictException({
          message: 'Email already exists',
          action: 'login_or_reset',
        })
      );
    });

    it('should normalize email to lowercase during registration', async () => {
      const dtoWithUpperEmail = { ...mockRegisterDto, email: 'JOHN@EXAMPLE.COM' };
      
      await service.register(dtoWithUpperEmail);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'john@example.com' },
      });
    });

    it('should trim whitespace from full name', async () => {
      const dtoWithSpaces = { ...mockRegisterDto, fullName: '  John Doe  ' };
      
      await service.register(dtoWithSpaces);

      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });
  });

  describe('User Login', () => {
    const mockLoginDto: LoginDto = {
      email: 'john@example.com',
      password: 'secure-password',
    };

    const mockUser = {
      id: 'user-id',
      fullName: 'John Doe',
      email: 'john@example.com',
      passwordHash: 'hashed-password',
      lang: 'en',
      userProfile: {
        defaultVertical: Vertical.REAL_ESTATE,
      },
    };

    it('should login user successfully', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.login(mockLoginDto);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'john@example.com' },
        include: { userProfile: true },
      });

      expect(bcrypt.compare).toHaveBeenCalledWith('secure-password', 'hashed-password');

      expect(result).toEqual({
        redirectPath: '/real-estate/dashboard',
        user: {
          id: 'user-id',
          fullName: 'John Doe',
          email: 'john@example.com',
          defaultVertical: Vertical.REAL_ESTATE,
        },
      });
    });

    it('should reject login for non-existent user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(mockLoginDto)).rejects.toThrow(
        new UnauthorizedException('Invalid credentials')
      );
    });

    it('should reject login for user without profile', async () => {
      const userWithoutProfile = { ...mockUser, userProfile: null };
      mockPrismaService.user.findUnique.mockResolvedValue(userWithoutProfile);

      await expect(service.login(mockLoginDto)).rejects.toThrow(
        new UnauthorizedException('Invalid credentials')
      );
    });

    it('should reject login with incorrect password', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(mockLoginDto)).rejects.toThrow(
        new UnauthorizedException('Invalid credentials')
      );
    });

    it('should normalize email to lowercase during login', async () => {
      const dtoWithUpperEmail = { ...mockLoginDto, email: 'JOHN@EXAMPLE.COM' };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await service.login(dtoWithUpperEmail);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'john@example.com' },
        include: { userProfile: true },
      });
    });
  });

  describe('Session Token Creation', () => {
    it('should create session token with correct payload', async () => {
      const user = {
        id: 'user-id',
        email: 'test@example.com',
        fullName: 'Test User',
      };

      const token = await service.createSessionToken(user);

      expect(jwt.sign).toHaveBeenCalledWith({
        userId: 'user-id',
        email: 'test@example.com',
        fullName: 'Test User',
      }, 'test-jwt-secret', { expiresIn: '14d' });

      expect(token).toBe('mock-jwt-token');
    });
  });

  describe('Firebase Integration', () => {
    it('should register user with Firebase UID', async () => {
      const registerDto = {
        fullName: 'John Doe',
        email: 'john@example.com',
        password: '', // Not needed for Firebase registration
        vertical: Vertical.REAL_ESTATE,
        lang: 'en',
        termsConsent: true,
        firebaseUid: 'firebase-uid-123',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.$transaction.mockImplementation(async (fn) => {
        return fn({
          user: { create: jest.fn().mockResolvedValue({ 
            id: 'firebase-uid-123', 
            fullName: 'John Doe',
            email: 'john@example.com',
            passwordHash: '',
            lang: 'en'
          }) },
          organization: { create: jest.fn().mockResolvedValue({}) },
          membership: { create: jest.fn().mockResolvedValue({}) },
          userProfile: { create: jest.fn().mockResolvedValue({}) },
        });
      });

      const result = await service.registerWithFirebase(registerDto);

      expect(result.user.id).toBe('firebase-uid-123');
      expect(result.redirectPath).toBe('/real-estate/dashboard');
    });

    it('should get user by Firebase UID', async () => {
      const mockUser = { id: 'firebase-uid', email: 'test@example.com' };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getUserByFirebaseUid('firebase-uid');

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'firebase-uid' },
        include: { userProfile: true },
      });

      expect(result).toBe(mockUser);
    });
  });

  describe('User Retrieval', () => {
    it('should get user with profile', async () => {
      const mockUser = { 
        id: 'user-id', 
        email: 'test@example.com',
        userProfile: { defaultVertical: 'REAL_ESTATE' }
      };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getUserWithProfile('user-id');

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-id' },
        include: { userProfile: true },
      });

      expect(result).toBe(mockUser);
    });
  });
});