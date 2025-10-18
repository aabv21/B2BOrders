import { customersApi, ordersApi } from '../config/api-clients.js';
import { OrchestratorError, ErrorTypes } from '../utils/errors.js';

export class OrchestratorService {
  /**
   * Validate customer exists and is active
   */
  static async validateCustomer(customerId, correlationId) {
    try {
      const customer = await customersApi.getCustomer(customerId);

      // Defensive check: validate customer is not soft-deleted
      if (customer.deleted_at) {
        console.error(
          `[${correlationId}] Customer ${customerId} is soft-deleted`
        );
        throw new OrchestratorError(
          ErrorTypes.CUSTOMER_INACTIVE.message,
          ErrorTypes.CUSTOMER_INACTIVE.statusCode
        );
      }

      console.log(`[${correlationId}] Customer validated: ${customer.name}`);
      return customer;
    } catch (error) {
      if (error instanceof OrchestratorError) {
        throw error;
      }
      console.error(
        `[${correlationId}] Customer validation failed:`,
        error.message
      );
      throw new OrchestratorError(
        ErrorTypes.CUSTOMER_NOT_FOUND.message,
        ErrorTypes.CUSTOMER_NOT_FOUND.statusCode
      );
    }
  }

  /**
   * Create order with items
   */
  static async createOrder(customerId, items, correlationId) {
    try {
      const order = await ordersApi.createOrder(customerId, items);
      console.log(
        `[${correlationId}] Order created: ${order.id} with status ${order.status}`
      );
      return order;
    } catch (error) {
      console.error(
        `[${correlationId}] Order creation failed:`,
        error.response?.data || error.message
      );
      
      // Map specific API errors
      const apiError = error.response?.data?.error;
      if (apiError?.includes('stock')) {
        throw new OrchestratorError(
          ErrorTypes.INSUFFICIENT_STOCK.message,
          ErrorTypes.INSUFFICIENT_STOCK.statusCode,
          apiError
        );
      }
      if (apiError?.includes('product')) {
        throw new OrchestratorError(
          ErrorTypes.INVALID_PRODUCT.message,
          ErrorTypes.INVALID_PRODUCT.statusCode,
          apiError
        );
      }
      
      throw new OrchestratorError(
        apiError || ErrorTypes.ORDER_CREATION_FAILED.message,
        error.response?.status || ErrorTypes.ORDER_CREATION_FAILED.statusCode,
        apiError
      );
    }
  }

  /**
   * Confirm order with idempotency
   */
  static async confirmOrder(orderId, idempotencyKey, correlationId) {
    try {
      const order = await ordersApi.confirmOrder(orderId, idempotencyKey);
      console.log(
        `[${correlationId}] Order confirmed: ${order.id} with status ${order.status}`
      );
      return order;
    } catch (error) {
      console.error(
        `[${correlationId}] Order confirmation failed:`,
        error.response?.data || error.message
      );
      
      const apiError = error.response?.data?.error;
      throw new OrchestratorError(
        apiError || ErrorTypes.ORDER_CONFIRMATION_FAILED.message,
        error.response?.status || ErrorTypes.ORDER_CONFIRMATION_FAILED.statusCode,
        apiError
      );
    }
  }

  /**
   * Orchestrate complete order flow: validate customer, create order, confirm order
   */
  static async createAndConfirmOrder({
    customerId,
    items,
    idempotencyKey,
    correlationId,
  }) {
    console.log(
      `[${correlationId}] Starting order orchestration for customer ${customerId}`
    );

    // Step 1: Validate customer
    const customer = await this.validateCustomer(customerId, correlationId);

    // Step 2: Create order
    let order = await this.createOrder(customerId, items, correlationId);

    // Step 3: Confirm order
    order = await this.confirmOrder(order.id, idempotencyKey, correlationId);

    console.log(
      `[${correlationId}] Order orchestration completed successfully`
    );

    return {
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      },
      order: {
        id: order.id,
        status: order.status,
        total_cents: order.total_cents,
        items: order.items,
      },
    };
  }
}
