import Joi from 'joi';

// ============================================================================
// INVENTORY VALIDATORS
// ============================================================================

export const createProductSchema = Joi.object({
  name: Joi.string().trim().min(1).max(200).required().messages({
    'string.min': 'Product name is required',
    'any.required': 'Product name is required',
  }),
  sku: Joi.string().trim().min(1).max(100).optional(),
  category: Joi.string().trim().max(100).optional(),
  price: Joi.number().min(0).optional().messages({
    'number.min': 'Price must be 0 or greater',
  }),
  sellingPrice: Joi.number().min(0).optional().messages({
    'number.min': 'Selling price must be 0 or greater',
  }),
  unitCost: Joi.number().min(0).optional().messages({
    'number.min': 'Unit cost must be 0 or greater',
  }),
  quantity: Joi.number().integer().min(0).optional().messages({
    'number.integer': 'Quantity must be a whole number',
    'number.min': 'Quantity must be 0 or greater',
  }),
  lowStockThreshold: Joi.number().integer().min(0).optional(),
  supplier: Joi.string().trim().max(200).optional().allow('', null),
  description: Joi.string().trim().max(1000).optional().allow('', null),
});

export const updateProductSchema = Joi.object({
  name: Joi.string().trim().min(1).max(200).optional(),
  sku: Joi.string().trim().min(1).max(100).optional(),
  category: Joi.string().trim().max(100).optional(),
  price: Joi.number().min(0).optional().messages({
    'number.min': 'Price must be 0 or greater',
  }),
  sellingPrice: Joi.number().min(0).optional().messages({
    'number.min': 'Selling price must be 0 or greater',
  }),
  unitCost: Joi.number().min(0).optional().messages({
    'number.min': 'Unit cost must be 0 or greater',
  }),
  quantity: Joi.number().integer().min(0).optional().messages({
    'number.integer': 'Quantity must be a whole number',
    'number.min': 'Quantity must be 0 or greater',
  }),
  lowStockThreshold: Joi.number().integer().min(0).optional(),
  supplier: Joi.string().trim().max(200).optional().allow('', null),
  description: Joi.string().trim().max(1000).optional().allow('', null),
});

export const adjustStockSchema = Joi.object({
  quantity: Joi.number().integer().required().messages({
    'number.integer': 'Quantity must be a whole number',
    'any.required': 'Quantity is required',
  }),
  reason: Joi.string().trim().max(500).optional().allow('', null),
  type: Joi.string().valid('in', 'out').optional(),
  notes: Joi.string().trim().max(1000).optional().allow('', null),
});
