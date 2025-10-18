/**
 * Custom error class for orchestrator operations
 */
export class OrchestratorError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.name = 'OrchestratorError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * Predefined error types
 */
export const ErrorTypes = {
  CUSTOMER_NOT_FOUND: {
    message: 'Customer not found or validation failed',
    statusCode: 400,
  },
  CUSTOMER_INACTIVE: {
    message: 'Customer is not active',
    statusCode: 400,
  },
  ORDER_CREATION_FAILED: {
    message: 'Failed to create order',
    statusCode: 400,
  },
  ORDER_CONFIRMATION_FAILED: {
    message: 'Failed to confirm order',
    statusCode: 400,
  },
  INSUFFICIENT_STOCK: {
    message: 'Insufficient stock for one or more products',
    statusCode: 400,
  },
  INVALID_PRODUCT: {
    message: 'One or more products are invalid',
    statusCode: 400,
  },
  MISSING_FIELDS: {
    message: 'Missing required fields',
    statusCode: 400,
  },
  INTERNAL_ERROR: {
    message: 'Internal server error',
    statusCode: 500,
  },
};
