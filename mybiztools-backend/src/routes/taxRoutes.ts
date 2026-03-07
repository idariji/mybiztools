import { Router, Request, Response } from 'express';
import { TaxService } from '../services/taxService.js';
import { authenticateUser, requirePlan, AuthenticatedRequest } from '../middleware/authMiddleware.js';

const router = Router();

// GET /api/tax/rates - Public endpoint for tax rate information
router.get('/rates', (req: Request, res: Response) => {
  try {
    const result = TaxService.getTaxRates();
    return res.status(200).json(result);
  } catch (error) {
    console.error('Get tax rates route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'SERVER_ERROR',
    });
  }
});

// Protected routes require authentication + any paid plan
router.use(authenticateUser);
router.use(requirePlan('starter', 'pro', 'enterprise'));

// POST /api/tax/calculate/cit - Calculate Companies Income Tax
router.post('/calculate/cit', (req: AuthenticatedRequest, res: Response) => {
  try {
    const { annualTurnover, assessableProfit } = req.body;

    if (annualTurnover === undefined || assessableProfit === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Annual turnover and assessable profit are required',
        error: 'MISSING_FIELDS',
      });
    }

    const result = TaxService.calculateCIT({
      annualTurnover: parseFloat(annualTurnover),
      assessableProfit: parseFloat(assessableProfit),
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error('Calculate CIT route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'SERVER_ERROR',
    });
  }
});

// POST /api/tax/calculate/vat - Calculate VAT
router.post('/calculate/vat', (req: AuthenticatedRequest, res: Response) => {
  try {
    const { amount, isInclusive } = req.body;

    if (amount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Amount is required',
        error: 'MISSING_AMOUNT',
      });
    }

    const result = TaxService.calculateVAT({
      amount: parseFloat(amount),
      isInclusive: isInclusive === true || isInclusive === 'true',
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error('Calculate VAT route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'SERVER_ERROR',
    });
  }
});

// POST /api/tax/calculate/pit - Calculate Personal Income Tax
router.post('/calculate/pit', (req: AuthenticatedRequest, res: Response) => {
  try {
    const { annualGrossIncome, reliefs } = req.body;

    if (annualGrossIncome === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Annual gross income is required',
        error: 'MISSING_INCOME',
      });
    }

    const result = TaxService.calculatePIT({
      annualGrossIncome: parseFloat(annualGrossIncome),
      reliefs: reliefs
        ? {
            consolidatedRelief: reliefs.consolidatedRelief,
            pensionContribution: reliefs.pensionContribution
              ? parseFloat(reliefs.pensionContribution)
              : undefined,
            nhfContribution: reliefs.nhfContribution
              ? parseFloat(reliefs.nhfContribution)
              : undefined,
            lifeInsurance: reliefs.lifeInsurance
              ? parseFloat(reliefs.lifeInsurance)
              : undefined,
            nationalHealthInsurance: reliefs.nationalHealthInsurance
              ? parseFloat(reliefs.nationalHealthInsurance)
              : undefined,
          }
        : undefined,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error('Calculate PIT route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'SERVER_ERROR',
    });
  }
});

// POST /api/tax/calculate/wht - Calculate Withholding Tax
router.post('/calculate/wht', (req: AuthenticatedRequest, res: Response) => {
  try {
    const { amount, type } = req.body;

    if (amount === undefined || !type) {
      return res.status(400).json({
        success: false,
        message: 'Amount and WHT type are required',
        error: 'MISSING_FIELDS',
      });
    }

    const validTypes = [
      'dividends',
      'interest',
      'rent',
      'royalties',
      'commission',
      'consultancy',
      'management_fees',
      'technical_fees',
      'contracts',
      'director_fees',
    ];

    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid WHT type. Must be one of: ${validTypes.join(', ')}`,
        error: 'INVALID_TYPE',
      });
    }

    const result = TaxService.calculateWHT(parseFloat(amount), type);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Calculate WHT route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'SERVER_ERROR',
    });
  }
});

// POST /api/tax/calculate/payroll - Calculate payroll deductions
router.post('/calculate/payroll', (req: AuthenticatedRequest, res: Response) => {
  try {
    const { basicSalary, housing, transport, otherAllowances } = req.body;

    if (basicSalary === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Basic salary is required',
        error: 'MISSING_SALARY',
      });
    }

    const result = TaxService.calculatePayroll({
      basicSalary: parseFloat(basicSalary),
      housing: housing ? parseFloat(housing) : undefined,
      transport: transport ? parseFloat(transport) : undefined,
      otherAllowances: otherAllowances ? parseFloat(otherAllowances) : undefined,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error('Calculate payroll route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'SERVER_ERROR',
    });
  }
});

export default router;
