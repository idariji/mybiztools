// import { Router, Request, Response } from 'express';
// import { SmsService } from '../services/smsService.js';
// import { authenticateUser, optionalAuth } from '../middleware/authMiddleware.js';
// import rateLimit from 'express-rate-limit';

// const router = Router();

// // Rate limiting for SMS endpoints
// const smsLimiter = rateLimit({
//   windowMs: 60 * 1000, // 1 minute
//   max: 10, // 10 SMS per minute
//   message: {
//     success: false,
//     message: 'Too many SMS requests, please try again later.',
//     error: 'RATE_LIMITED',
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
// });

// // POST /api/sms/send - Send single SMS
// router.post('/send', smsLimiter, optionalAuth, async (req: Request, res: Response) => {
//   try {
//     const { to, message, channel } = req.body;

//     // Validate required fields
//     if (!to || !message) {
//       return res.status(400).json({
//         success: false,
//         message: 'Phone number (to) and message are required',
//         error: 'MISSING_FIELDS',
//       });
//     }

//     // Validate phone number format (basic check)
//     const phoneRegex = /^[\d\s+()-]{10,15}$/;
//     if (!phoneRegex.test(to.replace(/\s/g, ''))) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid phone number format',
//         error: 'INVALID_PHONE',
//       });
//     }

//     // Validate message length
//     if (message.length > 918) { // 6 SMS pages max
//       return res.status(400).json({
//         success: false,
//         message: 'Message is too long (max 918 characters)',
//         error: 'MESSAGE_TOO_LONG',
//         length: message.length,
//       });
//     }

//     // Validate channel
//     const validChannels = ['generic', 'dnd', 'whatsapp'];
//     if (channel && !validChannels.includes(channel)) {
//       return res.status(400).json({
//         success: false,
//         message: `Channel must be one of: ${validChannels.join(', ')}`,
//         error: 'INVALID_CHANNEL',
//       });
//     }

//     const result = await SmsService.sendSms({ to, message, channel });

//     if (!result.success) {
//       return res.status(400).json(result);
//     }

//     return res.status(200).json(result);
//   } catch (error) {
//     console.error('Send SMS route error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: 'SERVER_ERROR',
//     });
//   }
// });

// // POST /api/sms/bulk-send - Send bulk SMS
// router.post('/bulk-send', smsLimiter, authenticateUser, async (req: Request, res: Response) => {
//   try {
//     const { to, message, channel } = req.body;

//     // Validate required fields
//     if (!to || !Array.isArray(to) || to.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'Phone numbers array (to) is required',
//         error: 'MISSING_FIELDS',
//       });
//     }

//     if (!message) {
//       return res.status(400).json({
//         success: false,
//         message: 'Message is required',
//         error: 'MISSING_FIELDS',
//       });
//     }

//     // Limit bulk recipients
//     if (to.length > 100) {
//       return res.status(400).json({
//         success: false,
//         message: 'Maximum 100 recipients allowed per bulk send',
//         error: 'TOO_MANY_RECIPIENTS',
//         count: to.length,
//       });
//     }

//     // Validate message length
//     if (message.length > 918) {
//       return res.status(400).json({
//         success: false,
//         message: 'Message is too long (max 918 characters)',
//         error: 'MESSAGE_TOO_LONG',
//         length: message.length,
//       });
//     }

//     const result = await SmsService.sendBulkSms({ to, message, channel });

//     if (!result.success) {
//       return res.status(400).json(result);
//     }

//     return res.status(200).json(result);
//   } catch (error) {
//     console.error('Send bulk SMS route error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: 'SERVER_ERROR',
//     });
//   }
// });

// // GET /api/sms/balance - Check SMS balance
// router.get('/balance', authenticateUser, async (req: Request, res: Response) => {
//   try {
//     const result = await SmsService.getBalance();

//     if (!result.success) {
//       return res.status(400).json(result);
//     }

//     return res.status(200).json(result);
//   } catch (error) {
//     console.error('Get SMS balance route error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: 'SERVER_ERROR',
//     });
//   }
// });

// // POST /api/sms/validate - Validate phone number
// router.post('/validate', optionalAuth, async (req: Request, res: Response) => {
//   try {
//     const { phoneNumber } = req.body;

//     if (!phoneNumber) {
//       return res.status(400).json({
//         success: false,
//         message: 'Phone number is required',
//         error: 'MISSING_FIELDS',
//       });
//     }

//     const result = await SmsService.validatePhone(phoneNumber);

//     if (!result.success) {
//       return res.status(400).json(result);
//     }

//     return res.status(200).json(result);
//   } catch (error) {
//     console.error('Validate phone route error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: 'SERVER_ERROR',
//     });
//   }
// });

// // GET /api/sms/history - Get SMS history
// router.get('/history', authenticateUser, async (req: Request, res: Response) => {
//   try {
//     const { page } = req.query;
//     const pageNum = page ? parseInt(page as string) : 1;

//     const result = await SmsService.getHistory(pageNum);

//     if (!result.success) {
//       return res.status(400).json(result);
//     }

//     return res.status(200).json(result);
//   } catch (error) {
//     console.error('Get SMS history route error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: 'SERVER_ERROR',
//     });
//   }
// });

// export default router;
