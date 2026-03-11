// import { Router, Request, Response } from 'express';
// import { TaxService } from '../services/taxService.js';
// import { authenticateUser, AuthenticatedRequest } from '../middleware/authMiddleware.js';

// const router = Router();

// // GET /api/tax/rates - Public endpoint for tax rate information
// router.get('/rates', (req: Request, res: Response) => {
//   try {
//     const result = TaxService.getTaxRates();
//     return res.status(200).json(result);
//   } catch (error) {
//     console.error('Get tax rates route error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: 'SERVER_ERROR',
//     });
//   }
// });

// // Protected routes require authentication
// router.use(authenticateUser);

// // POST /api/tax/calculate/cit - Calculate Companies Income Tax
// router.post('/calculate/cit', (req: AuthenticatedRequest, res: Response) => {
//   try {
//     const { annualTurnover, assessableProfit } = req.body;

//     if (annualTurnover === undefined || assessableProfit === undefined) {
//       return res.status(400).json({
//         success: false,
//         message: 'Annual turnover and assessable profit are required',
//         error: 'MISSING_FIELDS',
//       });
//     }

//     const result = TaxService.calculateCIT({
//       annualTurnover: parseFloat(annualTurnover),
//       assessableProfit: parseFloat(assessableProfit),
//     });

//     return res.status(200).json(result);
//   } catch (error) {
//     console.error('Calculate CIT route error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: 'SERVER_ERROR',
//     });
//   }
// });

// // POST /api/tax/calculate/vat - Calculate VAT
// router.post('/calculate/vat', (req: AuthenticatedRequest, res: Response) => {
//   try {
//     const { amount, isInclusive } = req.body;

//     if (amount === undefined) {
//       return res.status(400).json({
//         success: false,
//         message: 'Amount is required',
//         error: 'MISSING_AMOUNT',
//       });
//     }

//     const result = TaxService.calculateVAT({
//       amount: parseFloat(amount),
//       isInclusive: isInclusive === true || isInclusive === 'true',
//     });

//     return res.status(200).json(result);
//   } catch (error) {
//     console.error('Calculate VAT route error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: 'SERVER_ERROR',
//     });
//   }
// });

// // POST /api/tax/calculate/pit - Calculate Personal Income Tax
// router.post('/calculate/pit', (req: AuthenticatedRequest, res: Response) => {
//   try {
//     const { annualGrossIncome, reliefs } = req.body;

//     if (annualGrossIncome === undefined) {
//       return res.status(400).json({
//         success: false,
//         message: 'Annual gross income is required',
//         error: 'MISSING_INCOME',
//       });
//     }

//     const result = TaxService.calculatePIT({
//       annualGrossIncome: parseFloat(annualGrossIncome),
//       reliefs: reliefs
//         ? {
//             consolidatedRelief: reliefs.consolidatedRelief,
//             pensionContribution: reliefs.pensionContribution
//               ? parseFloat(reliefs.pensionContribution)
//               : undefined,
//             nhfContribution: reliefs.nhfContribution
//               ? parseFloat(reliefs.nhfContribution)
//               : undefined,
//             lifeInsurance: reliefs.lifeInsurance
//               ? parseFloat(reliefs.lifeInsurance)
//               : undefined,
//             nationalHealthInsurance: reliefs.nationalHealthInsurance
//               ? parseFloat(reliefs.nationalHealthInsurance)
//               : undefined,
//           }
//         : undefined,
//     });

//     return res.status(200).json(result);
//   } catch (error) {
//     console.error('Calculate PIT route error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: 'SERVER_ERROR',
//     });
//   }
// });

// // POST /api/tax/calculate/wht - Calculate Withholding Tax
// router.post('/calculate/wht', (req: AuthenticatedRequest, res: Response) => {
//   try {
//     const { amount, type } = req.body;

//     if (amount === undefined || !type) {
//       return res.status(400).json({
//         success: false,
//         message: 'Amount and WHT type are required',
//         error: 'MISSING_FIELDS',
//       });
//     }

//     const validTypes = [
//       'dividends',
//       'interest',
//       'rent',
//       'royalties',
//       'commission',
//       'consultancy',
//       'management_fees',
//       'technical_fees',
//       'contracts',
//       'director_fees',
//     ];

//     if (!validTypes.includes(type)) {
//       return res.status(400).json({
//         success: false,
//         message: `Invalid WHT type. Must be one of: ${validTypes.join(', ')}`,
//         error: 'INVALID_TYPE',
//       });
//     }

//     const result = TaxService.calculateWHT(parseFloat(amount), type);

//     if (!result.success) {
//       return res.status(400).json(result);
//     }

//     return res.status(200).json(result);
//   } catch (error) {
//     console.error('Calculate WHT route error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: 'SERVER_ERROR',
//     });
//   }
// });

// // POST /api/tax/calculate/payroll - Calculate payroll deductions
// router.post('/calculate/payroll', (req: AuthenticatedRequest, res: Response) => {
//   try {
//     const { basicSalary, housing, transport, otherAllowances } = req.body;

//     if (basicSalary === undefined) {
//       return res.status(400).json({
//         success: false,
//         message: 'Basic salary is required',
//         error: 'MISSING_SALARY',
//       });
//     }

//     const result = TaxService.calculatePayroll({
//       basicSalary: parseFloat(basicSalary),
//       housing: housing ? parseFloat(housing) : undefined,
//       transport: transport ? parseFloat(transport) : undefined,
//       otherAllowances: otherAllowances ? parseFloat(otherAllowances) : undefined,
//     });

//     return res.status(200).json(result);
//   } catch (error) {
//     console.error('Calculate payroll route error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: 'SERVER_ERROR',
//     });
//   }
// });

// export default router;


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