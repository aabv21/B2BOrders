import { OrchestratorService } from '../services/orchestrator.service.js';
import { OrchestratorError, ErrorTypes } from '../utils/errors.js';

export class OrchestratorController {
  /**
   * Create and confirm order
   */
  static async createAndConfirmOrder(req, res) {
    const correlationId = req.body?.correlation_id || `corr-${Date.now()}`;

    try {
      // Validate required fields
      const { customer_id, items, idempotency_key } = req.body;

      if (
        !customer_id ||
        !items ||
        !Array.isArray(items) ||
        items.length === 0
      ) {
        return res.status(400).json({
          success: false,
          correlationId,
          error: ErrorTypes.MISSING_FIELDS.message,
          details: 'customer_id and items are required',
        });
      }

      if (!idempotency_key) {
        return res.status(400).json({
          success: false,
          correlationId,
          error: ErrorTypes.MISSING_FIELDS.message,
          details: 'idempotency_key is required',
        });
      }

      // Call service
      const data = await OrchestratorService.createAndConfirmOrder({
        customerId: customer_id,
        items,
        idempotencyKey: idempotency_key,
        correlationId,
      });

      return res.status(201).json({
        success: true,
        correlationId,
        data,
      });
    } catch (error) {
      console.error(`[${correlationId}] Controller error:`, error);

      // Handle OrchestratorError
      if (error instanceof OrchestratorError) {
        return res.status(error.statusCode).json({
          success: false,
          correlationId,
          error: error.message,
          ...(error.details && { details: error.details }),
        });
      }

      // Handle unexpected errors
      return res.status(500).json({
        success: false,
        correlationId,
        error: ErrorTypes.INTERNAL_ERROR.message,
      });
    }
  }
}
