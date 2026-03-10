import Joi from 'joi';


// USER VALIDATORS
const strongPasswordField = Joi.string()
  .min(8)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_#^()\-+=])[A-Za-z\d@$!%*?&_#^()\-+=]{8,}$/)
  .required()
  .messages({
    'string.min': 'Password must be at least 8 characters long',
    'string.pattern.base':
      'Password must contain at least one uppercase letter (A-Z), one lowercase letter (a-z), one number (0-9), and one special character (e.g. @$!%*?&)',
    'string.empty': 'Password cannot be empty',
    'any.required': 'Password is required',
  });

export const updateProfileSchema = Joi.object({
  firstName: Joi.string().trim().max(50).optional(),
  lastName: Joi.string().trim().max(50).optional(),
  businessName: Joi.string().trim().max(100).optional(),
  phone: Joi.string()
    .pattern(/^[+\d\s\-()]{7,20}$/)
    .optional()
    .messages({ 'string.pattern.base': 'Please provide a valid phone number' }),
  avatarUrl: Joi.string().uri().optional().messages({
    'string.uri': 'Avatar URL must be a valid URL',
  }),
});

export const updateAvatarSchema = Joi.object({
  avatarUrl: Joi.string().uri().required().messages({
    'string.uri': 'Avatar URL must be a valid URL',
    'any.required': 'Avatar URL is required',
  }),
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'string.empty': 'Current password cannot be empty',
    'any.required': 'Current password is required',
  }),
  newPassword: strongPasswordField,
});

export const deleteAccountSchema = Joi.object({
  password: Joi.string().required().messages({
    'string.empty': 'Password cannot be empty',
    'any.required': 'Password is required to delete account',
  }),
});

export const createSupportTicketSchema = Joi.object({
  subject: Joi.string().trim().min(5).max(150).required().messages({
    'string.min': 'Subject must be at least 5 characters',
    'string.max': 'Subject cannot exceed 150 characters',
    'any.required': 'Subject is required',
  }),
  message: Joi.string().trim().min(10).max(5000).required().messages({
    'string.min': 'Message must be at least 10 characters',
    'string.max': 'Message cannot exceed 5000 characters',
    'any.required': 'Message is required',
  }),
  priority: Joi.string()
    .valid('low', 'medium', 'high', 'urgent')
    .default('medium'),
});