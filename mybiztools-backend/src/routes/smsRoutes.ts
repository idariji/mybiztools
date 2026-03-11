import { Router } from 'express';
import { SmsController } from '../controllers/smsController.js';
import { authenticateUser, optionalAuth } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import rateLimit from 'express-rate-limit';
import Joi from 'joi';

const router = Router();

const smsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many SMS requests, please try again later.', error: 'RATE_LIMITED' },
  standardHeaders: true,
  legacyHeaders: false,
});

//Validators 

const sendSmsSchema = Joi.object({
  to:      Joi.string().trim().required().messages({ 'any.required': 'Phone number (to) is required' }),
  message: Joi.string().trim().min(1).max(918).required().messages({ 'string.max': 'Message too long (max 918 characters)' }),
  channel: Joi.string().valid('generic', 'dnd', 'whatsapp').optional(),
});

const bulkSmsSchema = Joi.object({
  to:      Joi.array().items(Joi.string()).min(1).max(100).required().messages({
    'array.max': 'Maximum 100 recipients per bulk send',
    'any.required': 'Phone numbers array (to) is required',
  }),
  message: Joi.string().trim().min(1).max(918).required(),
  channel: Joi.string().valid('generic', 'dnd', 'whatsapp').optional(),
});

const validatePhoneSchema = Joi.object({
  phoneNumber: Joi.string().trim().required().messages({ 'any.required': 'Phone number is required' }),
});


/**
 * @swagger
 * tags:
 *   name: SMS
 *   description: SMS notifications via Termii
 */

/**
 * @swagger
 * /api/sms/send:
 *   post:
 *     summary: Send a single SMS
 *     tags: [SMS]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [to, message]
 *             properties:
 *               to:      { type: string, description: Recipient phone number }
 *               message: { type: string, maxLength: 918 }
 *               channel: { type: string, enum: [generic, dnd, whatsapp] }
 *     responses:
 *       200: { description: SMS sent }
 *       400: { description: Validation error }
 *       429: { description: Rate limited }
 */
router.post('/send', smsLimiter, optionalAuth, validate(sendSmsSchema), SmsController.sendSms);

/**
 * @swagger
 * /api/sms/bulk-send:
 *   post:
 *     summary: Send bulk SMS (max 100 recipients)
 *     tags: [SMS]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [to, message]
 *             properties:
 *               to:      { type: array, items: { type: string }, maxItems: 100 }
 *               message: { type: string, maxLength: 918 }
 *               channel: { type: string, enum: [generic, dnd, whatsapp] }
 *     responses:
 *       200: { description: Bulk SMS sent }
 *       429: { description: Rate limited }
 */
router.post('/bulk-send', smsLimiter, authenticateUser, validate(bulkSmsSchema), SmsController.sendBulkSms);

/**
 * @swagger
 * /api/sms/balance:
 *   get:
 *     summary: Check Termii account balance
 *     tags: [SMS]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200: { description: Balance retrieved }
 */
router.get('/balance', authenticateUser, SmsController.getBalance);

/**
 * @swagger
 * /api/sms/validate:
 *   post:
 *     summary: Validate a phone number
 *     tags: [SMS]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phoneNumber]
 *             properties:
 *               phoneNumber: { type: string }
 *     responses:
 *       200: { description: Phone number validated }
 */
router.post('/validate', optionalAuth, validate(validatePhoneSchema), SmsController.validatePhone);

/**
 * @swagger
 * /api/sms/history:
 *   get:
 *     summary: Get SMS history
 *     tags: [SMS]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer } }
 *     responses:
 *       200: { description: History retrieved }
 */
router.get('/history', authenticateUser, SmsController.getHistory);

export default router;