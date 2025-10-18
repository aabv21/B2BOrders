import express from 'express';
import { CustomerController } from '../controllers/customer.controller.js';
import { validateBody, validateQuery } from '../middlewares/validator.js';
import { authenticateToken } from '../middlewares/auth.js';
import {
  createCustomerSchema,
  updateCustomerSchema,
  searchCustomersSchema,
} from '../validators/customer.validator.js';

const router = express.Router();

router.get(
  '/',
  authenticateToken,
  validateQuery(searchCustomersSchema),
  CustomerController.search
);
router.post(
  '/',
  authenticateToken,
  validateBody(createCustomerSchema),
  CustomerController.create
);
router.get('/:id', authenticateToken, CustomerController.getById);
router.put(
  '/:id',
  authenticateToken,
  validateBody(updateCustomerSchema),
  CustomerController.update
);
router.delete('/:id', authenticateToken, CustomerController.delete);

export default router;
