import Joi from 'joi';

// ============================================================================
// SUPPORT VALIDATORS
// ============================================================================

export const respondToTicketSchema = Joi.object({
  message: Joi.string().trim().min(1).max(5000).required().messages({
    'string.empty': 'Message cannot be empty',
    'any.required': 'Message is required',
  }),
  channel: Joi.string().valid('email', 'whatsapp', 'sms').required().messages({
    'any.only': 'Channel must be one of: email, whatsapp, sms',
    'any.required': 'Channel is required',
  }),
});

export const updateTicketStatusSchema = Joi.object({
  status: Joi.string()
    .valid('open', 'in_progress', 'resolved', 'closed')
    .required()
    .messages({
      'any.only': 'Status must be one of: open, in_progress, resolved, closed',
      'any.required': 'Status is required',
    }),
});