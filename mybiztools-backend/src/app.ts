import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createRequire } from 'module';
import multer from 'multer';
import { env } from './config/env.js';
import { swaggerSpec } from './config/swagger.js';
// import * as swaggerUi from 'swagger-ui-express';

const require = createRequire(import.meta.url);
const swaggerUi = require('swagger-ui-express');

// ROUTE IMPORTS
// Add new route files here as the project grows
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import userRoutes from './routes/userRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import paymentGatewayRoutes from './routes/paymentGatewayRoutes.js';
import dedaRoutes from './routes/dedaRoutes.js';
import socialRoutes from './routes/socialRoutes.js';
import taxRoutes from './routes/taxRoutes.js';
import documentGeneratorRoutes from './routes/documentGeneratorRoutes.js';
import supportRoutes from './routes/supportRoutes.js';
import smsRoutes from './routes/smsRoutes.js';

// APP INIT
const app = express();

// CORS
const corsOrigins = [
  /^http:\/\/localhost:\d+$/,
  env.frontendUrl,
  'https://www.mybiztools.ng',
  'https://mybiztools.ng',
  'https://mybiztools.onrender.com',
];

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// SECURITY HEADERS
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  })
);

// BODY PARSERS
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// GLOBAL RATE LIMITER (fallback for unprotected routes)
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/health',
});

app.use(globalLimiter);

//SWAGGER DOCS
app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'MyBizTools API Docs',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true, // Keeps JWT token between page refreshes
    },
  })
);

// Expose raw JSON spec (useful for Postman import)
app.get('/api/docs.json', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// HEALTH CHECK
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString(), uptime: process.uptime() });
});


// ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/payments', paymentGatewayRoutes);
app.use('/api/deda', dedaRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/tax', taxRoutes);
app.use('/api/generator', documentGeneratorRoutes);
app.use('/api/admin/support', supportRoutes);
app.use('/api/sms', smsRoutes);


// 404 HANDLER

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.path}`,
  });
});

// GLOBAL ERROR HANDLER

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Error]', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(env.nodeEnv === 'development' && { details: err.message }),
  });
});

export default app;