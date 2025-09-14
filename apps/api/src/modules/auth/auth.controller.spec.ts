/**
 * AuthController Integration Tests
 * 
 * Tests HTTP endpoints for authentication including:
 * - Registration endpoints
 * - Login endpoints  
 * - Session cookie management
 * - Firebase authentication integration
 * - Input validation and error handling
 */

import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaService } from '../../lib/prisma.service';
import { Vertical } from './dto/register.dto';
import request from 'supertest';
import cookieParser from 'cookie-parser';

describe('AuthController (Integration)', () => {
  let app: INestApplication;
  let authService: AuthService;
  let prismaService: PrismaService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    createSessionToken: jest.fn(),
    verifyFirebaseToken: jest.fn(),
    getUserByFirebaseUid: jest.fn(),
    registerWithFirebase: jest.fn(),
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    app = module.createNestApplication();
    
    // Configure app like production
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    app.use(cookieParser());

    await app.init();

    authService = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);

    // Reset all mocks
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    const validRegisterDto = {
      fullName: 'John Doe',
      email: 'john@example.com',
      password: 'SecurePassword123!',
      vertical: Vertical.REAL_ESTATE,
      lang: 'en',
      termsConsent: true,
    };

    const mockRegisterResponse = {
      redirectPath: '/real-estate/dashboard',
      user: {
        id: 'user-id',
        fullName: 'John Doe',
        email: 'john@example.com',
        defaultVertical: Vertical.REAL_ESTATE,
      },
    };

    beforeEach(() => {
      mockAuthService.register.mockResolvedValue(mockRegisterResponse);
      mockAuthService.createSessionToken.mockResolvedValue('mock-session-token');
    });

    it('should register user successfully and set session cookie', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(validRegisterDto)
        .expect(HttpStatus.CREATED);

      expect(response.body).toEqual(mockRegisterResponse);
      expect(mockAuthService.register).toHaveBeenCalledWith(validRegisterDto);
      expect(mockAuthService.createSessionToken).toHaveBeenCalledWith(mockRegisterResponse.user);
      
      // Check that session cookie was set
      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie'][0]).toContain('session=mock-session-token');
    });

    it('should validate required fields', async () => {
      const invalidDto = { email: 'john@example.com' }; // Missing required fields

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(invalidDto)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toContain('fullName should not be empty');
      expect(response.body.message).toContain('password should not be empty');
      expect(mockAuthService.register).not.toHaveBeenCalled();
    });

    it('should validate email format', async () => {
      const invalidDto = {
        ...validRegisterDto,
        email: 'invalid-email',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(invalidDto)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toContain('email must be an email');
      expect(mockAuthService.register).not.toHaveBeenCalled();
    });

    it('should validate terms consent', async () => {
      const invalidDto = {
        ...validRegisterDto,
        termsConsent: false,
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(invalidDto)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toContain('termsConsent must be a boolean');
      expect(mockAuthService.register).not.toHaveBeenCalled();
    });

    it('should validate vertical enum', async () => {
      const invalidDto = {
        ...validRegisterDto,
        vertical: 'INVALID_VERTICAL',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(invalidDto)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toContain('vertical must be a valid enum value');
      expect(mockAuthService.register).not.toHaveBeenCalled();
    });

    it('should reject extra fields not in whitelist', async () => {
      const invalidDto = {
        ...validRegisterDto,
        extraField: 'should be rejected',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(invalidDto)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toContain('property extraField should not exist');
    });

    it('should handle service errors gracefully', async () => {
      mockAuthService.register.mockRejectedValue(new Error('Database error'));

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(validRegisterDto)
        .expect(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  describe('POST /auth/login', () => {
    const validLoginDto = {
      email: 'john@example.com',
      password: 'SecurePassword123!',
    };

    const mockLoginResponse = {
      redirectPath: '/real-estate/dashboard',
      user: {
        id: 'user-id',
        fullName: 'John Doe',
        email: 'john@example.com',
        defaultVertical: Vertical.REAL_ESTATE,
      },
    };

    beforeEach(() => {
      mockAuthService.login.mockResolvedValue(mockLoginResponse);
      mockAuthService.createSessionToken.mockResolvedValue('mock-session-token');
    });

    it('should login user successfully and set session cookie', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(validLoginDto)
        .expect(HttpStatus.OK);

      expect(response.body).toEqual(mockLoginResponse);
      expect(mockAuthService.login).toHaveBeenCalledWith(validLoginDto);
      expect(mockAuthService.createSessionToken).toHaveBeenCalledWith(mockLoginResponse.user);
      
      // Check that session cookie was set
      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie'][0]).toContain('session=mock-session-token');
    });

    it('should validate required fields', async () => {
      const invalidDto = { email: 'john@example.com' }; // Missing password

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(invalidDto)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toContain('password should not be empty');
      expect(mockAuthService.login).not.toHaveBeenCalled();
    });

    it('should validate email format', async () => {
      const invalidDto = {
        email: 'invalid-email',
        password: 'password',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(invalidDto)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toContain('email must be an email');
      expect(mockAuthService.login).not.toHaveBeenCalled();
    });

    it('should handle authentication failures', async () => {
      const unauthorizedError = {
        statusCode: 401,
        message: 'Invalid credentials',
      };
      mockAuthService.login.mockRejectedValue(unauthorizedError);

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(validLoginDto)
        .expect(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  describe('POST /auth/session-cookie', () => {
    it('should create session cookie from Firebase ID token', async () => {
      const mockDecodedToken = {
        uid: 'firebase-uid',
        email: 'test@example.com',
        name: 'Test User',
      };

      const mockUser = {
        id: 'firebase-uid',
        fullName: 'Test User',
        email: 'test@example.com',
        userProfile: {
          defaultVertical: 'REAL_ESTATE',
        },
      };

      mockAuthService.verifyFirebaseToken.mockResolvedValue(mockDecodedToken);
      mockAuthService.getUserByFirebaseUid.mockResolvedValue(mockUser);
      mockAuthService.createSessionToken.mockResolvedValue('mock-session-token');

      const response = await request(app.getHttpServer())
        .post('/auth/session-cookie')
        .send({ idToken: 'valid-firebase-token' })
        .expect(HttpStatus.OK);

      expect(response.body).toEqual({
        success: true,
        redirectPath: '/real-estate/dashboard',
        user: {
          id: 'firebase-uid',
          fullName: 'Test User',
          email: 'test@example.com',
          defaultVertical: 'REAL_ESTATE',
        },
      });

      // Check that session cookie was set
      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie'][0]).toContain('session=mock-session-token');
    });

    it('should handle user not found scenario', async () => {
      const mockDecodedToken = {
        uid: 'firebase-uid',
        email: 'new@example.com',
        name: 'New User',
      };

      mockAuthService.verifyFirebaseToken.mockResolvedValue(mockDecodedToken);
      mockAuthService.getUserByFirebaseUid.mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .post('/auth/session-cookie')
        .send({ idToken: 'valid-firebase-token' })
        .expect(HttpStatus.OK);

      expect(response.body).toEqual({
        success: false,
        action: 'register',
        userInfo: {
          email: 'new@example.com',
          fullName: 'New User',
          firebaseUid: 'firebase-uid',
        },
      });
    });

    it('should validate Firebase ID token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/session-cookie')
        .send({ idToken: '' })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toContain('idToken should not be empty');
      expect(mockAuthService.verifyFirebaseToken).not.toHaveBeenCalled();
    });

    it('should handle invalid Firebase tokens', async () => {
      mockAuthService.verifyFirebaseToken.mockRejectedValue(new Error('Invalid token'));

      await request(app.getHttpServer())
        .post('/auth/session-cookie')
        .send({ idToken: 'invalid-token' })
        .expect(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  describe('POST /auth/register-firebase', () => {
    const validFirebaseRegisterDto = {
      fullName: 'John Doe',
      email: 'john@example.com',
      vertical: Vertical.REAL_ESTATE,
      lang: 'en',
      termsConsent: true,
      firebaseUid: 'firebase-uid-123',
    };

    const mockRegisterResponse = {
      redirectPath: '/real-estate/dashboard',
      user: {
        id: 'firebase-uid-123',
        fullName: 'John Doe',
        email: 'john@example.com',
        defaultVertical: Vertical.REAL_ESTATE,
      },
    };

    beforeEach(() => {
      mockAuthService.registerWithFirebase.mockResolvedValue(mockRegisterResponse);
      mockAuthService.createSessionToken.mockResolvedValue('mock-session-token');
    });

    it('should register Firebase user successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register-firebase')
        .send(validFirebaseRegisterDto)
        .expect(HttpStatus.CREATED);

      expect(response.body).toEqual(mockRegisterResponse);
      expect(mockAuthService.registerWithFirebase).toHaveBeenCalledWith(validFirebaseRegisterDto);
      expect(mockAuthService.createSessionToken).toHaveBeenCalledWith(mockRegisterResponse.user);

      // Check that session cookie was set
      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie'][0]).toContain('session=mock-session-token');
    });

    it('should validate Firebase UID', async () => {
      const invalidDto = {
        ...validFirebaseRegisterDto,
        firebaseUid: '',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register-firebase')
        .send(invalidDto)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toContain('firebaseUid should not be empty');
      expect(mockAuthService.registerWithFirebase).not.toHaveBeenCalled();
    });

    it('should validate other required fields', async () => {
      const invalidDto = {
        firebaseUid: 'firebase-uid-123',
        email: 'john@example.com',
        // Missing fullName, vertical, termsConsent
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register-firebase')
        .send(invalidDto)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toContain('fullName should not be empty');
      expect(response.body.message).toContain('vertical must be a valid enum value');
      expect(mockAuthService.registerWithFirebase).not.toHaveBeenCalled();
    });

    it('should handle service errors gracefully', async () => {
      mockAuthService.registerWithFirebase.mockRejectedValue(new Error('Database error'));

      await request(app.getHttpServer())
        .post('/auth/register-firebase')
        .send(validFirebaseRegisterDto)
        .expect(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  describe('POST /auth/logout', () => {
    it('should clear session cookie', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/logout')
        .expect(HttpStatus.OK);

      expect(response.body).toEqual({
        success: true,
        message: 'Logged out successfully',
      });

      // Check that session cookie was cleared
      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie'][0]).toMatch(/session=;.*expires=/);
    });
  });

  describe('Cookie Configuration', () => {
    it('should set secure cookie configuration in production', async () => {
      // Set NODE_ENV to production for this test
      process.env.NODE_ENV = 'production';

      mockAuthService.register.mockResolvedValue({
        redirectPath: '/dashboard',
        user: { id: '1', fullName: 'Test', email: 'test@test.com', defaultVertical: 'E_COMMERCE' },
      });
      mockAuthService.createSessionToken.mockResolvedValue('token');

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          fullName: 'Test User',
          email: 'test@example.com',
          password: 'Password123!',
          vertical: Vertical.E_COMMERCE,
          termsConsent: true,
        })
        .expect(HttpStatus.CREATED);

      const cookieHeader = response.headers['set-cookie'][0];
      expect(cookieHeader).toContain('HttpOnly');
      expect(cookieHeader).toContain('SameSite=Strict');

      // Reset NODE_ENV
      process.env.NODE_ENV = 'test';
    });

    it('should handle missing session cookie name gracefully', async () => {
      // This test ensures the controller handles edge cases in cookie configuration
      mockAuthService.login.mockResolvedValue({
        redirectPath: '/dashboard',
        user: { id: '1', fullName: 'Test', email: 'test@test.com', defaultVertical: 'E_COMMERCE' },
      });
      mockAuthService.createSessionToken.mockResolvedValue('token');

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password',
        })
        .expect(HttpStatus.OK);

      // Should still set a cookie even if session name is not explicitly configured
      expect(response.headers['set-cookie']).toBeDefined();
    });
  });
});