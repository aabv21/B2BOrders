import Joi from 'joi';

/**
 * Middleware factory to validate request body against a Joi schema
 */
export const validateBody = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }
    
    req.validatedBody = value;
    next();
  };
};

/**
 * Middleware factory to validate query parameters against a Joi schema
 */
export const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }
    
    req.validatedQuery = value;
    next();
  };
};
