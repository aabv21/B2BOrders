import express from 'express';
import { OrchestratorController } from '../controllers/orchestrator.controller.js';

const router = express.Router();

router.post(
  '/create-and-confirm-order',
  OrchestratorController.createAndConfirmOrder
);

export default router;
