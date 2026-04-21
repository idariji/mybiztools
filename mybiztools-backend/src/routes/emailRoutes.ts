import { Router } from 'express';
import { EmailNotificationService } from '../services/emailNotificationService.js';
import { PdfService } from '../services/pdfService.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import prisma from '../lib/prisma.js';
import multer from 'multer';

const router = Router();
const upload = multer();

router.post('/send', authenticateUser, upload.any(), async (req, res) => {
  console.log('[Email Route] Request body:', JSON.stringify(req.body));

  const {
    to, subject, html, body, message,
    invoiceId, quotationId, receiptId,
    businessName, businessEmail,
  } = req.body;

  const recipientEmail = to;

  if (!recipientEmail) {
    res.status(400).json({ success: false, message: 'Missing recipient email' });
    return;
  }

  const emailBody = html || body || (message ? `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:8px;">
      <div style="background:#f97316;padding:16px 24px;border-radius:8px 8px 0 0;margin:-32px -32px 24px -32px;">
        <h2 style="color:#fff;margin:0;">${businessName ?? 'MyBizTools'}</h2>
        ${businessEmail ? `<p style="color:#fed7aa;margin:4px 0 0;">${businessEmail}</p>` : ''}
      </div>
      <h3 style="color:#111827;">${subject}</h3>
      <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:16px 0;">
        ${message.split('\n').map((line: string) =>
          line.trim() ? `<p style="margin:4px 0;color:#374151;">${line}</p>` : '<br/>'
        ).join('')}
      </div>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
      <p style="color:#9ca3af;font-size:12px;text-align:center;">Sent via MyBizTools · © ${new Date().getFullYear()}</p>
    </div>
  ` : '<p>No content</p>');

  // Generate PDF attachment if document ID is provided
  let attachments: { filename: string; content: Buffer }[] | undefined;

  try {
    if (invoiceId) {
      const invoice = await prisma.invoice.findFirst({
        where: { id: invoiceId, userId: req.user!.id },
        include: { items: true, contact: { select: { name: true, email: true } } },
      }) as any;

      if (invoice) {
        const invoiceData = invoice.documentData ?? invoice;
        const pdfResult = await PdfService.generateInvoicePdf(invoiceData, businessName, businessEmail);
        if (pdfResult.success && pdfResult.data) {
          attachments = [{ filename: pdfResult.data.filename, content: pdfResult.data.buffer }];
        }
      }
    } else if (quotationId) {
      const quotation = await prisma.quotation.findFirst({
        where: { id: quotationId, userId: req.user!.id },
        include: { items: true },
      }) as any;

      if (quotation) {
        const quotationData = quotation.documentData ?? quotation;
        const pdfResult = await PdfService.generateQuotationPdf(quotationData, businessName);
        if (pdfResult.success && pdfResult.data) {
          attachments = [{ filename: pdfResult.data.filename, content: pdfResult.data.buffer }];
        }
      }
    } else if (receiptId) {
      const receipt = await prisma.receipt.findFirst({
        where: { id: receiptId, userId: req.user!.id },
        include: { items: true },
      }) as any;

      if (receipt) {
        const receiptData = receipt.documentData ?? receipt;
        const pdfResult = await PdfService.generateReceiptPdf(receiptData, businessName);
        if (pdfResult.success && pdfResult.data) {
          attachments = [{ filename: pdfResult.data.filename, content: pdfResult.data.buffer }];
        }
      }
    }
  } catch (pdfErr: any) {
    // Don't block email sending if PDF generation fails
    console.error('[Email Route] PDF generation failed:', pdfErr?.message);
  }

  const result = await EmailNotificationService.sendEmail({
    to: recipientEmail,
    subject,
    html: emailBody,
    attachments,
  });

  res.status(result.success ? 200 : 400).json({
    ...result,
    attachmentIncluded: !!attachments?.length,
  });
});

export default router;