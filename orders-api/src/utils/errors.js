/**
 * Custom error class for order operations
 */
export class OrderError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.name = 'OrderError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * Predefined error types
 */
export const ErrorTypes = {
  // Product errors
  PRODUCT_NOT_FOUND: {
    message: 'Product not found',
    statusCode: 404,
  },
  PRODUCT_ALREADY_EXISTS: {
    message: 'Product with this SKU already exists',
    statusCode: 409,
  },
  INSUFFICIENT_STOCK: {
    message: 'Insufficient stock',
    statusCode: 400,
  },
  
  // Order errors
  ORDER_NOT_FOUND: {
    message: 'Order not found',
    statusCode: 404,
  },
  CUSTOMER_NOT_FOUND: {
    message: 'Customer not found',
    statusCode: 400,
  },
  INVALID_ORDER_STATUS: {
    message: 'Invalid order status transition',
    statusCode: 400,
  },
  ORDER_ALREADY_CONFIRMED: {
    message: 'Order is already confirmed',
    statusCode: 400,
  },
  ORDER_ALREADY_CANCELED: {
    message: 'Order is already canceled',
    statusCode: 400,
  },
  IDEMPOTENCY_KEY_REQUIRED: {
    message: 'Idempotency key is required',
    statusCode: 400,
  },
  
  // General errors
  MISSING_FIELDS: {
    message: 'Missing required fields',
    statusCode: 400,
  },
  VALIDATION_ERROR: {
    message: 'Validation error',
    statusCode: 400,
  },
  INTERNAL_ERROR: {
    message: 'Internal server error',
    statusCode: 500,
  },
};
