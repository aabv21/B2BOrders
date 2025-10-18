import Joi from 'joi';

export const createProductSchema = Joi.object({
  sku: Joi.string().min(1).max(100).optional(), // Optional - auto-generated if not provided
  name: Joi.string().min(2).max(255).required(),
  price_cents: Joi.number().integer().min(0).required(),
  stock: Joi.number().integer().min(0).default(0)
});

export const updateProductSchema = Joi.object({
  price_cents: Joi.number().integer().min(0),
  stock: Joi.number().integer().min(0)
}).min(1); // At least one field must be present

export const searchProductsSchema = Joi.object({
  search: Joi.string().allow('').optional(),
  cursor: Joi.number().integer().min(0).optional(),
  limit: Joi.number().integer().min(1).max(100).default(10)
});
