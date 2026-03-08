import Joi from 'joi';

// ============================================================================
// TAX VALIDATORS
// ============================================================================

const WHT_TYPES = [
  'dividends', 'interest', 'rent', 'royalties', 'commission',
  'consultancy', 'management_fees', 'technical_fees', 'contracts', 'director_fees',
];

export const calculateCITSchema = Joi.object({
  annualTurnover: Joi.number().positive().required().messages({
    'number.positive': 'Annual turnover must be a positive number',
    'any.required': 'Annual turnover is required',
  }),
  assessableProfit: Joi.number().min(0).required().messages({
    'any.required': 'Assessable profit is required',
  }),
});

export const calculateVATSchema = Joi.object({
  amount: Joi.number().positive().required().messages({
    'number.positive': 'Amount must be a positive number',
    'any.required': 'Amount is required',
  }),
  isInclusive: Joi.boolean().default(false),
});

export const calculatePITSchema = Joi.object({
  annualGrossIncome: Joi.number().positive().required().messages({
    'number.positive': 'Annual gross income must be a positive number',
    'any.required': 'Annual gross income is required',
  }),
  reliefs: Joi.object({
    consolidatedRelief: Joi.boolean().optional(),
    pensionContribution: Joi.number().min(0).optional(),
    nhfContribution: Joi.number().min(0).optional(),
    lifeInsurance: Joi.number().min(0).optional(),
    nationalHealthInsurance: Joi.number().min(0).optional(),
  }).optional(),
});

export const calculateWHTSchema = Joi.object({
  amount: Joi.number().positive().required().messages({
    'number.positive': 'Amount must be a positive number',
    'any.required': 'Amount is required',
  }),
  type: Joi.string().valid(...WHT_TYPES).required().messages({
    'any.only': `WHT type must be one of: ${WHT_TYPES.join(', ')}`,
    'any.required': 'WHT type is required',
  }),
});

export const calculatePayrollSchema = Joi.object({
  basicSalary: Joi.number().positive().required().messages({
    'number.positive': 'Basic salary must be a positive number',
    'any.required': 'Basic salary is required',
  }),
  housing: Joi.number().min(0).optional(),
  transport: Joi.number().min(0).optional(),
  otherAllowances: Joi.number().min(0).optional(),
});