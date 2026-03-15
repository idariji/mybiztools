import { Router } from 'express';
import { TaxController } from '../controllers/taxController.js';
import { authenticateUser, requirePlan } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import {
  calculateCITSchema,
  calculateVATSchema,
  calculatePITSchema,
  calculateWHTSchema,
  calculatePayrollSchema,
} from '../validators/taxValidator.js';

// ============================================================================
// TAX ROUTES
// ============================================================================

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Tax
 *   description: Nigerian tax calculators (CIT, VAT, PIT, WHT, Payroll)
 */

/**
 * @swagger
 * /api/tax/rates:
 *   get:
 *     summary: Get all Nigerian tax rates
 *     tags: [Tax]
 *     responses:
 *       200:
 *         description: Tax rates retrieved successfully
 */
router.get('/rates', TaxController.getTaxRates);

// All calculation routes require authentication
router.use(authenticateUser);
router.use(requirePlan('starter', 'pro', 'enterprise'));

/**
 * @swagger
 * /api/tax/calculate/cit:
 *   post:
 *     summary: Calculate Companies Income Tax (CIT)
 *     tags: [Tax]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [annualTurnover, assessableProfit]
 *             properties:
 *               annualTurnover:
 *                 type: number
 *                 example: 50000000
 *               assessableProfit:
 *                 type: number
 *                 example: 10000000
 *     responses:
 *       200:
 *         description: CIT calculated successfully
 */
router.post('/calculate/cit', validate(calculateCITSchema), TaxController.calculateCIT);

/**
 * @swagger
 * /api/tax/calculate/vat:
 *   post:
 *     summary: Calculate VAT (7.5%)
 *     tags: [Tax]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount]
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 100000
 *               isInclusive:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: VAT calculated successfully
 */
router.post('/calculate/vat', validate(calculateVATSchema), TaxController.calculateVAT);

/**
 * @swagger
 * /api/tax/calculate/pit:
 *   post:
 *     summary: Calculate Personal Income Tax / PAYE
 *     tags: [Tax]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [annualGrossIncome]
 *             properties:
 *               annualGrossIncome:
 *                 type: number
 *                 example: 3600000
 *               reliefs:
 *                 type: object
 *     responses:
 *       200:
 *         description: PIT calculated successfully
 */
router.post('/calculate/pit', validate(calculatePITSchema), TaxController.calculatePIT);

/**
 * @swagger
 * /api/tax/calculate/wht:
 *   post:
 *     summary: Calculate Withholding Tax (WHT)
 *     tags: [Tax]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, type]
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 500000
 *               type:
 *                 type: string
 *                 example: consultancy
 *     responses:
 *       200:
 *         description: WHT calculated successfully
 */
router.post('/calculate/wht', validate(calculateWHTSchema), TaxController.calculateWHT);

/**
 * @swagger
 * /api/tax/calculate/payroll:
 *   post:
 *     summary: Calculate full payroll deductions
 *     tags: [Tax]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [basicSalary]
 *             properties:
 *               basicSalary:
 *                 type: number
 *                 example: 200000
 *               housing:
 *                 type: number
 *                 example: 80000
 *               transport:
 *                 type: number
 *                 example: 40000
 *               otherAllowances:
 *                 type: number
 *                 example: 30000
 *     responses:
 *       200:
 *         description: Payroll calculated successfully
 */
router.post('/calculate/payroll', validate(calculatePayrollSchema), TaxController.calculatePayroll);

export default router;