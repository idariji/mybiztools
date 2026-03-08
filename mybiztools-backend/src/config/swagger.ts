import { env } from './env.js';

// ============================================================================
// SWAGGER CONFIG
// Docs available at: /api/docs
// ============================================================================

// const { createRequire } = await import('module');
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MyBizTools API',
      version: '1.0.0',
      description: 'Backend API documentation for MyBizTools — a business management platform for Nigerian SMEs.',
      contact: {
        name: 'MyBizTools Support',
        email: 'support@mybiztools.ng',
      },
    },
    servers: [
      {
        url: env.nodeEnv === 'production'
          ? 'https://api.mybiztools.ng'
          : `http://localhost:${env.port}`,
        description: env.nodeEnv === 'production' ? 'Production Server' : 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token. Example: Bearer eyJhbGci...',
        },
      },
      schemas: {
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operation successful' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Something went wrong' },
            error: { type: 'string', example: 'ERROR_CODE' },
          },
        },
        ValidationErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Validation failed' },
            errors: {
              type: 'array',
              items: { type: 'string' },
              example: [
                'Please provide a valid email address (e.g. example@gmail.com)',
                'Password must contain at least one uppercase letter',
              ],
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            firstName: { type: 'string', example: 'John', nullable: true },
            lastName: { type: 'string', example: 'Doe', nullable: true },
            businessName: { type: 'string', example: 'John Enterprises', nullable: true },
            phone: { type: 'string', example: '+2348012345678', nullable: true },
            avatarUrl: { type: 'string', example: 'https://cdn.mybiztools.ng/avatars/abc.jpg', nullable: true },
            emailVerified: { type: 'boolean', example: false },
            currentPlan: { type: 'string', example: 'free', enum: ['free', 'pro', 'enterprise'] },
            subscriptionStatus: { type: 'string', example: 'active', enum: ['active', 'suspended', 'cancelled'] },
            createdAt: { type: 'string', format: 'date-time' },
            lastLoginAt: { type: 'string', format: 'date-time', nullable: true },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            password: { type: 'string', example: 'SecurePass@123', minLength: 8 },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            businessName: { type: 'string', example: 'John Enterprises' },
            phone: { type: 'string', example: '+2348012345678' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            password: { type: 'string', example: 'SecurePass@123' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Login successful' },
            data: {
              type: 'object',
              properties: {
                user: { $ref: '#/components/schemas/User' },
                token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
              },
            },
          },
        },
        VerifyOtpRequest: {
          type: 'object',
          required: ['email', 'otp', 'purpose'],
          properties: {
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            otp: { type: 'string', example: '482910', minLength: 6, maxLength: 6 },
            purpose: {
              type: 'string',
              enum: ['email_verification', 'password_reset'],
              example: 'email_verification',
            },
          },
        },
        ResendOtpRequest: {
          type: 'object',
          required: ['email'],
          properties: {
            email: { type: 'string', format: 'email', example: 'john@example.com' },
          },
        },
        ForgotPasswordRequest: {
          type: 'object',
          required: ['email'],
          properties: {
            email: { type: 'string', format: 'email', example: 'john@example.com' },
          },
        },
        ResetPasswordRequest: {
          type: 'object',
          required: ['email', 'otp', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            otp: { type: 'string', example: '482910', minLength: 6, maxLength: 6 },
            password: { type: 'string', example: 'NewSecurePass@123', minLength: 8 },
          },
        },
      },
    },
    security: [],
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec: object = swaggerJsdoc(options);