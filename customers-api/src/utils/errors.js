/**
 * Custom error class for customer operations
 */
export class CustomerError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.name = 'CustomerError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * Predefined error types
 */
export const ErrorTypes = {
  CUSTOMER_NOT_FOUND: {
    message: 'Customer not found',
    statusCode: 404,
  },
  CUSTOMER_ALREADY_EXISTS: {
    message: 'Customer with this email already exists',
    statusCode: 409,
  },
  INVALID_EMAIL: {
    message: 'Invalid email format',
    statusCode: 400,
  },
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
