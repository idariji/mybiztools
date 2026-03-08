import Joi from 'joi'

// AUTH VALIDATORS (Joi)
// Reusable email rule
const emailField = Joi.string().email().required().messages({
  'string.email': 'Please provide a valid email address (e.g. example@gmail.com)',
  'string.empty': 'Email cannot be empty',
  'any.required': 'Email is required',
});

// Reusable strong password rule
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

// Reusable OTP rule
const otpField = Joi.string().length(6).pattern(/^\d+$/).required().messages({
  'string.length': 'OTP must be exactly 6 digits',
  'string.pattern.base': 'OTP must contain only numbers',
  'string.empty': 'OTP cannot be empty',
  'any.required': 'OTP is required',
});

// SCHEMAS
export const registerSchema = Joi.object({
  email: emailField,
  password: strongPasswordField,
  firstName: Joi.string().trim().max(50).optional(),
  lastName: Joi.string().trim().max(50).optional(),
  businessName: Joi.string().trim().max(100).optional(),
  phone: Joi.string()
    .pattern(/^[+\d\s\-()]{7,20}$/)
    .optional()
    .messages({ 'string.pattern.base': 'Please provide a valid phone number' }),
});

export const loginSchema = Joi.object({
  email: emailField,
  password: Joi.string().required().messages({
    'string.empty': 'Password cannot be empty',
    'any.required': 'Password is required',
  }),
});

export const emailSchema = Joi.object({
  email: emailField,
});

export const resetPasswordSchema = Joi.object({
  email: emailField,
  otp: otpField,
  password: strongPasswordField,
});

export const verifyOtpSchema = Joi.object({
  email: emailField,
  otp: otpField,
  purpose: Joi.string()
    .valid('email_verification', 'password_reset')
    .required()
    .messages({
      'any.only': 'Purpose must be email_verification or password_reset',
      'any.required': 'OTP purpose is required',
    }),
});