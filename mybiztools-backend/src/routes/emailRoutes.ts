import { Router } from 'express';
import { EmailNotificationService } from '../services/emailNotificationService.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import multer from 'multer';

const router = Router();
const upload = multer();

router.post('/send', authenticateUser, upload.any(), async (req, res) => {
  console.log('[Email Route] Request body:', JSON.stringify(req.body));
  
  const { to, recipient, email, subject, html, body } = req.body;
  const recipientEmail = to || recipient || email;
  const emailBody = html || body;

  if (!recipientEmail) {
    res.status(400).json({ success: false, message: 'Missing recipient email' });
    return;
  }

  const result = await EmailNotificationService.sendEmail({
    to: recipientEmail,
    subject,
    html: emailBody,
  });

  res.status(result.success ? 200 : 400).json(result);
});

export default router;