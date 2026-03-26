import Joi from 'joi';

// ============================================================================
// CONTACT VALIDATORS
// ============================================================================

const VALID_TYPES = ['customer', 'supplier', 'partner', 'lead', 'other', 'VIP', 'Wholesale', 'Retail', 'Inactive'];

const baseContactFields = {
  email: Joi.string().email().optional().messages({
    'string.email': 'Please provide a valid email address (e.g. example@gmail.com)',
  }),
  phone: Joi.string().pattern(/^[+\d\s\-()]{7,20}$/).optional().messages({
    'string.pattern.base': 'Please provide a valid phone number',
  }),
  company: Joi.string().trim().max(150).optional(),
  jobTitle: Joi.string().trim().max(100).optional(),
  type: Joi.string().valid(...VALID_TYPES).default('customer').messages({
    'any.only': `Type must be one of: ${VALID_TYPES.join(', ')}`,
  }),
  address: Joi.string().trim().max(300).optional(),
  city: Joi.string().trim().max(100).optional(),
  state: Joi.string().trim().max(100).optional(),
  country: Joi.string().trim().max(100).default('Nigeria'),
  postalCode: Joi.string().trim().max(20).optional(),
  taxId: Joi.string().trim().max(50).optional(),
  website: Joi.string().uri().optional().messages({
    'string.uri': 'Website must be a valid URL',
  }),
  notes: Joi.string().trim().max(2000).optional(),
  tags: Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.string()
  ).optional(),
};

export const createContactSchema = Joi.object({
  name: Joi.string().trim().min(1).max(150).required().messages({
    'string.empty': 'Name cannot be empty',
    'any.required': 'Name is required',
  }),
  ...baseContactFields,
});

export const updateContactSchema = Joi.object({
  name: Joi.string().trim().min(1).max(150).optional(),
  isActive: Joi.boolean().optional(),
  ...baseContactFields,
});