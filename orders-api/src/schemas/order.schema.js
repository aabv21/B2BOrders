import Joi from 'joi';

export const createOrderSchema = Joi.object({
  customer_id: Joi.number().integer().min(1).required(),
  items: Joi.array().items(
    Joi.object({
      product_id: Joi.number().integer().min(1).required(),
      qty: Joi.number().integer().min(1).required()
    })
  ).min(1).required()
});

export const searchOrdersSchema = Joi.object({
  status: Joi.string().valid('CREATED', 'CONFIRMED', 'CANCELED').optional(),
  from: Joi.date().iso().optional(),
  to: Joi.date().iso().optional(),
  cursor: Joi.number().integer().min(0).optional(),
  limit: Joi.number().integer().min(1).max(100).default(10)
});
