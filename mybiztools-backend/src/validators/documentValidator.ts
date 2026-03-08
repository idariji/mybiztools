import Joi from 'joi';

// ============================================================================
// DOCUMENT VALIDATORS
// ============================================================================

export const uploadDocumentSchema = Joi.object({
  name: Joi.string().trim().max(255).optional(),
  category: Joi.string()
    .valid('invoice', 'receipt', 'contract', 'report', 'other')
    .default('other'),
  description: Joi.string().trim().max(1000).optional(),
  tags: Joi.alternatives()
    .try(Joi.array().items(Joi.string()), Joi.string())
    .optional(),
});

export const updateDocumentSchema = Joi.object({
  name: Joi.string().trim().max(255).optional(),
  category: Joi.string()
    .valid('invoice', 'receipt', 'contract', 'report', 'other')
    .optional(),
  description: Joi.string().trim().max(1000).allow('').optional(),
  tags: Joi.alternatives()
    .try(Joi.array().items(Joi.string()), Joi.string())
    .optional(),
});