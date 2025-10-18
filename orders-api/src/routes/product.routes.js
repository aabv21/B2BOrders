import express from 'express';
import { ProductController } from '../controllers/product.controller.js';
import { validateBody, validateQuery } from '../middlewares/validator.js';
import { authenticateToken } from '../middlewares/auth.js';
import {
  createProductSchema,
  updateProductSchema,
  searchProductsSchema,
} from '../schemas/product.schema.js';

const router = express.Router();

router.get(
  '/',
  authenticateToken,
  validateQuery(searchProductsSchema),
  ProductController.search
);
router.post(
  '/',
  authenticateToken,
  validateBody(createProductSchema),
  ProductController.create
);
router.get('/:id', authenticateToken, ProductController.getById);
router.patch(
  '/:id',
  authenticateToken,
  validateBody(updateProductSchema),
  ProductController.update
);
router.delete('/:id', authenticateToken, ProductController.delete);

export default router;
