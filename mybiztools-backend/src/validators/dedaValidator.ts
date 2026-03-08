import Joi from 'joi';

// ============================================================================
// DEDA VALIDATORS
// ============================================================================

export const chatSchema = Joi.object({
  message: Joi.string().trim().min(1).max(5000).required().messages({
    'string.empty':   'Message cannot be empty',
    'string.max':     'Message too long. Maximum 5000 characters.',
    'any.required':   'Message is required',
  }),
  conversationId: Joi.string().uuid().optional(),
  context:        Joi.string().trim().max(2000).optional(),
});

export const feedbackSchema = Joi.object({
  feedback: Joi.string().valid('helpful', 'not_helpful').required().messages({
    'any.only':     'Feedback must be "helpful" or "not_helpful"',
    'any.required': 'Feedback is required',
  }),
});