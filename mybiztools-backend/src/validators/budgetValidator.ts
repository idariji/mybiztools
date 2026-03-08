import Joi from 'joi';

// ============================================================================
// BUDGET VALIDATORS
// ============================================================================

export const createBudgetSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'string.min': 'Budget name must be at least 2 characters',
    'any.required': 'Budget name is required',
  }),
  amount: Joi.number().positive().required().messages({
    'number.positive': 'Amount must be a positive number',
    'any.required': 'Amount is required',
  }),
  period: Joi.string()
    .valid('monthly', 'quarterly', 'yearly', 'custom')
    .required()
    .messages({
      'any.only': 'Period must be: monthly, quarterly, yearly, or custom',
      'any.required': 'Period is required',
    }),
  category: Joi.string()
    .valid('marketing', 'operations', 'salary', 'utilities', 'inventory', 'rent', 'transport', 'other')
    .required()
    .messages({
      'any.only': 'Invalid category',
      'any.required': 'Category is required',
    }),
  startDate: Joi.date().required().messages({
    'any.required': 'Start date is required',
  }),
  endDate: Joi.date().greater(Joi.ref('startDate')).required().messages({
    'date.greater': 'End date must be after start date',
    'any.required': 'End date is required',
  }),
  alertThreshold: Joi.number().integer().min(1).max(100).default(80),
});

export const updateBudgetSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  amount: Joi.number().positive().optional(),
  alertThreshold: Joi.number().integer().min(1).max(100).optional(),
  isActive: Joi.boolean().optional(),
});

export const createExpenseSchema = Joi.object({
  budgetId: Joi.string().uuid().optional(),
  amount: Joi.number().positive().required().messages({
    'number.positive': 'Amount must be a positive number',
    'any.required': 'Amount is required',
  }),
  description: Joi.string().trim().min(2).max(500).required().messages({
    'string.min': 'Description must be at least 2 characters',
    'any.required': 'Description is required',
  }),
  category: Joi.string().required().messages({
    'any.required': 'Category is required',
  }),
  expenseDate: Joi.date().required().messages({
    'any.required': 'Expense date is required',
  }),
  paymentMethod: Joi.string().valid('cash', 'transfer', 'card', 'mobile').optional(),
  vendor: Joi.string().trim().max(100).optional(),
  receiptUrl: Joi.string().uri().optional(),
  isRecurring: Joi.boolean().default(false),
  recurringFrequency: Joi.string()
    .valid('daily', 'weekly', 'monthly')
    .when('isRecurring', { is: true, then: Joi.required() })
    .optional(),
});

export const updateExpenseSchema = Joi.object({
  amount: Joi.number().positive().optional(),
  description: Joi.string().trim().min(2).max(500).optional(),
  category: Joi.string().optional(),
  expenseDate: Joi.date().optional(),
  paymentMethod: Joi.string().valid('cash', 'transfer', 'card', 'mobile').optional(),
  vendor: Joi.string().trim().max(100).optional(),
  receiptUrl: Joi.string().uri().optional(),
});