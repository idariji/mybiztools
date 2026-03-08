import Joi from 'joi';

// ============================================================================
// SOCIAL VALIDATORS
// ============================================================================

const VALID_PLATFORMS = ['twitter', 'facebook', 'instagram', 'linkedin', 'tiktok'];

export const createPostSchema = Joi.object({
  content: Joi.string().trim().min(1).max(5000).required().messages({
    'string.empty': 'Content cannot be empty',
    'string.max': 'Content cannot exceed 5000 characters',
    'any.required': 'Content is required',
  }),
  platforms: Joi.array()
    .items(Joi.string().valid(...VALID_PLATFORMS))
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one platform is required',
      'any.required': 'Platforms are required',
      'any.only': `Each platform must be one of: ${VALID_PLATFORMS.join(', ')}`,
    }),
  mediaUrls: Joi.array().items(Joi.string().uri()).optional(),
  scheduledAt: Joi.date().greater('now').optional().messages({
    'date.greater': 'Scheduled date must be in the future',
  }),
});

export const updatePostSchema = Joi.object({
  content: Joi.string().trim().min(1).max(5000).optional(),
  platforms: Joi.array()
    .items(Joi.string().valid(...VALID_PLATFORMS))
    .min(1)
    .optional(),
  mediaUrls: Joi.array().items(Joi.string().uri()).optional(),
  scheduledAt: Joi.date().allow(null).optional(),
});