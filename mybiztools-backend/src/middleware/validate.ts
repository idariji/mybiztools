import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

// VALIDATION MIDDLEWARE FACTORY
// Validates req.body against a Joi schema before hitting the controller
export const validate =
  (schema: Joi.ObjectSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errors = error.details.map((d) => d.message.replace(/['"]/g, ''));
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
      return;
    }

    next();
  };