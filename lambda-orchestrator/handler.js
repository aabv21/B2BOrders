import { OrchestratorService } from './src/services/orchestrator.service.js';
import { OrchestratorError, ErrorTypes } from './src/utils/errors.js';

/**
 * Lambda handler to create and confirm an order
 *
 * Expected input:
 * {
 *   "customer_id": 1,
 *   "items": [{"product_id": 2, "qty": 3}],
 *   "idempotency_key": "abc-123",
 *   "correlation_id": "req-789" (optional)
 * }
 *
 * Returns:
 * {
 *   "success": true,
 *   "correlationId": "req-789",
 *   "data": {
 *     "customer": {...},
 *     "order": {...}
 *   }
 * }
 */
export const createAndConfirmOrder = async (event) => {
  const body =
    typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
  const correlationId = body?.correlation_id || `corr-${Date.now()}`;

  try {
    const { customer_id, items, idempotency_key } = body;

    // Validate required fields
    if (!customer_id || !items || !Array.isArray(items) || items.length === 0) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          error: 'Missing required fields: customer_id, items',
        }),
      };
    }

    if (!idempotency_key) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          error: 'Missing required field: idempotency_key',
        }),
      };
    }

    // Call service
    const data = await OrchestratorService.createAndConfirmOrder({
      customerId: customer_id,
      items,
      idempotencyKey: idempotency_key,
      correlationId,
    });

    return {
      statusCode: 201,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        correlationId,
        data,
      }),
    };
  } catch (error) {
    console.error(`[${correlationId}] Lambda handler error:`, error);

    // Handle OrchestratorError
    if (error instanceof OrchestratorError) {
      return {
        statusCode: error.statusCode,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          correlationId,
          error: error.message,
          ...(error.details && { details: error.details }),
        }),
      };
    }

    // Handle unexpected errors
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        correlationId,
        error: ErrorTypes.INTERNAL_ERROR.message,
      }),
    };
  }
};
