import Joi from 'joi';

export const createCustomerSchema = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  email: Joi.string().email().max(255).required(),
  phone: Joi.string().min(7).max(50).required()
});

export const updateCustomerSchema = Joi.object({
  name: Joi.string().min(2).max(255),
  email: Joi.string().email().max(255),
  phone: Joi.string().min(7).max(50)
}).min(1); // At least one field must be present

export const searchCustomersSchema = Joi.object({
  search: Joi.string().allow('').optional(),
  cursor: Joi.number().integer().min(0).optional(),
  limit: Joi.number().integer().min(1).max(100).default(10)
});
