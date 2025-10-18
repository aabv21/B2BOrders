import Joi from 'joi';

/**
 * Schema for creating a customer
 */
export const createCustomerSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(255)
    .required()
    .messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name must not exceed 255 characters',
      'any.required': 'Name is required'
    }),
  
  email: Joi.string()
    .email()
    .max(255)
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Email must be a valid email address',
      'string.max': 'Email must not exceed 255 characters',
      'any.required': 'Email is required'
    }),
  
  phone: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .max(20)
    .required()
    .messages({
      'string.empty': 'Phone is required',
      'string.pattern.base': 'Phone must be a valid phone number (E.164 format)',
      'string.max': 'Phone must not exceed 20 characters',
      'any.required': 'Phone is required'
    })
});

/**
 * Schema for updating a customer
 */
export const updateCustomerSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(255)
    .messages({
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name must not exceed 255 characters'
    }),
  
  email: Joi.string()
    .email()
    .max(255)
    .messages({
      'string.email': 'Email must be a valid email address',
      'string.max': 'Email must not exceed 255 characters'
    }),
  
  phone: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .max(20)
    .messages({
      'string.pattern.base': 'Phone must be a valid phone number (E.164 format)',
      'string.max': 'Phone must not exceed 20 characters'
    })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

/**
 * Schema for search query parameters with defaults
 */
export const searchCustomersSchema = Joi.object({
  search: Joi.string()
    .allow('', null)
    .default('')
    .max(255)
    .messages({
      'string.max': 'Search term must not exceed 255 characters'
    }),
  
  cursor: Joi.number()
    .integer()
    .min(0)
    .default(0)
    .messages({
      'number.base': 'Cursor must be a number',
      'number.integer': 'Cursor must be an integer',
      'number.min': 'Cursor must be a positive number'
    }),
  
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit must not exceed 100'
    })
});

/**
 * Schema for customer ID parameter
 */
export const customerIdSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Customer ID must be a number',
      'number.integer': 'Customer ID must be an integer',
      'number.positive': 'Customer ID must be a positive number',
      'any.required': 'Customer ID is required'
    })
});
