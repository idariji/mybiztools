import { Router, Request, Response } from 'express';
import { authenticateUser, requirePlan } from '../middleware/authMiddleware.js';
import {
  InvoiceService,
  QuotationService,
  ReceiptService,
  PayslipService,
  DocumentStatsService,
} from '../services/documentGeneratorService.js';
import { validatePagination } from '../utils/validation.js';

// ============================================================================
// DOCUMENT GENERATOR ROUTES
// Invoices, Quotations, Receipts, Payslips
// ============================================================================

const router = Router();

// ── Stats ────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/generate/stats:
 *   get:
 *     summary: Get document counts for current user
 *     tags: [Documents Generator]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Document counts retrieved
 */
router.get('/stats', authenticateUser, async (req: Request, res: Response) => {
  const result = await DocumentStatsService.getUserDocumentCounts(req.user!.id);
  res.status(result.success ? 200 : 400).json(result);
});

// ── Invoice routes ────────────────────────────────────────────────────────────

/**
 * @swagger
 * tags:
 *   name: Documents Generator
 *   description: Invoice, Quotation, Receipt and Payslip generation
 */

router.post('/invoices', authenticateUser, async (req: Request, res: Response) => {
  const result = await InvoiceService.create(req.user!.id, req.body);
  res.status(result.success ? 201 : 400).json(result);
});

router.get('/invoices', authenticateUser, async (req: Request, res: Response) => {
  const { page, limit, status } = req.query;
  const pagination = validatePagination(page as string, limit as string);
  const result = await InvoiceService.getAll(req.user!.id, {
    page: pagination.page,
    limit: pagination.limit,
    status: status as string,
  });
  res.status(result.success ? 200 : 400).json(result);
});

router.get('/invoices/:invoiceId', authenticateUser, async (req: Request, res: Response) => {
  const result = await InvoiceService.getById(req.user!.id, req.params.invoiceId);
  res.status(result.success ? 200 : 404).json(result);
});

router.put('/invoices/:invoiceId', authenticateUser, async (req: Request, res: Response) => {
  const result = await InvoiceService.update(req.user!.id, req.params.invoiceId, req.body);
  res.status(result.success ? 200 : 400).json(result);
});

router.delete('/invoices/:invoiceId', authenticateUser, async (req: Request, res: Response) => {
  const result = await InvoiceService.delete(req.user!.id, req.params.invoiceId);
  res.status(result.success ? 200 : 400).json(result);
});

// ── Quotation routes ──────────────────────────────────────────────────────────

router.post('/quotations', authenticateUser, async (req: Request, res: Response) => {
  const result = await QuotationService.create(req.user!.id, req.body);
  res.status(result.success ? 201 : 400).json(result);
});

router.get('/quotations', authenticateUser, async (req: Request, res: Response) => {
  const { page, limit, status } = req.query;
  const pagination = validatePagination(page as string, limit as string);
  const result = await QuotationService.getAll(req.user!.id, {
    page: pagination.page,
    limit: pagination.limit,
    status: status as string,
  });
  res.status(result.success ? 200 : 400).json(result);
});

// NOTE: public link route must be before /:quotationId
router.get('/quotations/public/:publicLink', async (req: Request, res: Response) => {
  const result = await QuotationService.getByPublicLink(req.params.publicLink);
  res.status(result.success ? 200 : 404).json(result);
});

router.get('/quotations/:quotationId', authenticateUser, async (req: Request, res: Response) => {
  const result = await QuotationService.getById(req.user!.id, req.params.quotationId);
  res.status(result.success ? 200 : 404).json(result);
});

router.put('/quotations/:quotationId', authenticateUser, async (req: Request, res: Response) => {
  const result = await QuotationService.update(req.user!.id, req.params.quotationId, req.body);
  res.status(result.success ? 200 : 400).json(result);
});

router.delete('/quotations/:quotationId', authenticateUser, async (req: Request, res: Response) => {
  const result = await QuotationService.delete(req.user!.id, req.params.quotationId);
  res.status(result.success ? 200 : 400).json(result);
});

// ── Receipt routes ────────────────────────────────────────────────────────────

router.post('/receipts', authenticateUser, async (req: Request, res: Response) => {
  const result = await ReceiptService.create(req.user!.id, req.body);
  res.status(result.success ? 201 : 400).json(result);
});

router.get('/receipts', authenticateUser, async (req: Request, res: Response) => {
  const { page, limit } = req.query;
  const pagination = validatePagination(page as string, limit as string);
  const result = await ReceiptService.getAll(req.user!.id, {
    page: pagination.page,
    limit: pagination.limit,
  });
  res.status(result.success ? 200 : 400).json(result);
});

router.get('/receipts/:receiptId', authenticateUser, async (req: Request, res: Response) => {
  const result = await ReceiptService.getById(req.user!.id, req.params.receiptId);
  res.status(result.success ? 200 : 404).json(result);
});

router.delete('/receipts/:receiptId', authenticateUser, async (req: Request, res: Response) => {
  const result = await ReceiptService.delete(req.user!.id, req.params.receiptId);
  res.status(result.success ? 200 : 400).json(result);
});

// ── Payslip routes ────────────────────────────────────────────────────────────

router.post('/payslips', authenticateUser, async (req: Request, res: Response) => {
  const result = await PayslipService.create(req.user!.id, req.body);
  res.status(result.success ? 201 : 400).json(result);
});

router.get('/payslips', authenticateUser, async (req: Request, res: Response) => {
  const { page, limit } = req.query;
  const pagination = validatePagination(page as string, limit as string);
  const result = await PayslipService.getAll(req.user!.id, {
    page: pagination.page,
    limit: pagination.limit,
  });
  res.status(result.success ? 200 : 400).json(result);
});

router.get('/payslips/:payslipId', authenticateUser, async (req: Request, res: Response) => {
  const result = await PayslipService.getById(req.user!.id, req.params.payslipId);
  res.status(result.success ? 200 : 404).json(result);
});

router.delete('/payslips/:payslipId', authenticateUser, async (req: Request, res: Response) => {
  const result = await PayslipService.delete(req.user!.id, req.params.payslipId);
  res.status(result.success ? 200 : 400).json(result);
});

export default router;