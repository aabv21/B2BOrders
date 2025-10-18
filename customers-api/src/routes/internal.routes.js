import express from 'express';
import { InternalController } from '../controllers/internal.controller.js';
import { authenticateService } from '../middlewares/auth.js';

const router = express.Router();

// Internal routes (require service token)
router.get('/customers/:id', authenticateService, InternalController.getCustomerById);

export default router;
