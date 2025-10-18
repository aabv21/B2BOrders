import express from 'express';
import { OrderController } from '../controllers/order.controller.js';
import { validateBody, validateQuery } from '../middlewares/validator.js';
import { authenticateToken } from '../middlewares/auth.js';
import {
  createOrderSchema,
  searchOrdersSchema,
} from '../schemas/order.schema.js';

const router = express.Router();

router.get(
  '/',
  authenticateToken,
  validateQuery(searchOrdersSchema),
  OrderController.search
);
router.post(
  '/',
  authenticateToken,
  validateBody(createOrderSchema),
  OrderController.create
);
router.get('/:id', authenticateToken, OrderController.getById);
router.post('/:id/confirm', authenticateToken, OrderController.confirm);
router.post('/:id/cancel', authenticateToken, OrderController.cancel);

export default router;
