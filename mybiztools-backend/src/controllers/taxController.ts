import { Request, Response } from 'express';
import { TaxService, WhtType } from '../services/taxService.js';

// ============================================================================
// TAX CONTROLLER
// ============================================================================

export class TaxController {
  /** GET /api/tax/rates */
  static getTaxRates(_req: Request, res: Response): void {
    const result = TaxService.getTaxRates();
    res.status(200).json(result);
  }

  /** POST /api/tax/calculate/cit */
  static calculateCIT(req: Request, res: Response): void {
    const { annualTurnover, assessableProfit } = req.body;
    const result = TaxService.calculateCIT({
      annualTurnover: parseFloat(annualTurnover),
      assessableProfit: parseFloat(assessableProfit),
    });
    res.status(result.success ? 200 : 400).json(result);
  }

  /** POST /api/tax/calculate/vat */
  static calculateVAT(req: Request, res: Response): void {
    const { amount, isInclusive } = req.body;
    const result = TaxService.calculateVAT({
      amount: parseFloat(amount),
      isInclusive: isInclusive === true || isInclusive === 'true',
    });
    res.status(result.success ? 200 : 400).json(result);
  }

  /** POST /api/tax/calculate/pit */
  static calculatePIT(req: Request, res: Response): void {
    const { annualGrossIncome, reliefs } = req.body;
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
    res.status(result.success ? 200 : 400).json(result);
  }

  /** POST /api/tax/calculate/wht */
  static calculateWHT(req: Request, res: Response): void {
    const { amount, type } = req.body;
    const result = TaxService.calculateWHT(parseFloat(amount), type as WhtType);
    res.status(result.success ? 200 : 400).json(result);
  }

  /** POST /api/tax/calculate/payroll */
  static calculatePayroll(req: Request, res: Response): void {
    const { basicSalary, housing, transport, otherAllowances } = req.body;
    const result = TaxService.calculatePayroll({
      basicSalary: parseFloat(basicSalary),
      housing: housing ? parseFloat(housing) : undefined,
      transport: transport ? parseFloat(transport) : undefined,
      otherAllowances: otherAllowances ? parseFloat(otherAllowances) : undefined,
    });
    res.status(result.success ? 200 : 400).json(result);
  }
}