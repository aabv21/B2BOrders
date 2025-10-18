import { OrderModel } from '../models/order.model.js';
import { ProductModel } from '../models/product.model.js';
import { OrderError, ErrorTypes } from '../utils/errors.js';
import db from '../config/database.js';

export class OrderService {
  /**
   * @description Create a new order with items
   * @param {number} data.customer_id - Customer ID
   * @param {number} data.items[].product_id - Product ID
   * @param {number} data.items[].qty - Quantity
   * @returns {Promise<Object>} Created order object with items
   */
  static async createOrder({ customer_id, items }) {
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      let totalCents = 0;
      const orderItems = [];

      // Validate products and calculate total
      for (const item of items) {
        const product = await ProductModel.findById(item.product_id);
        if (!product) {
          await connection.rollback();
          throw new OrderError(
            ErrorTypes.PRODUCT_NOT_FOUND.message,
            ErrorTypes.PRODUCT_NOT_FOUND.statusCode,
            `Product with ID ${item.product_id} not found`
          );
        }

        if (product.stock < item.qty) {
          await connection.rollback();
          throw new OrderError(
            ErrorTypes.INSUFFICIENT_STOCK.message,
            ErrorTypes.INSUFFICIENT_STOCK.statusCode,
            `Product '${product.name}' only has ${product.stock} units available, requested ${item.qty}`
          );
        }

        const subtotalCents = product.price_cents * item.qty;
        totalCents += subtotalCents;

        orderItems.push({
          product_id: item.product_id,
          qty: item.qty,
          unit_price_cents: product.price_cents,
          subtotal_cents: subtotalCents,
        });

        // Decrease stock
        const stockDecreased = await ProductModel.decreaseStock(
          connection,
          item.product_id,
          item.qty
        );
        if (!stockDecreased) {
          await connection.rollback();
          throw new OrderError(
            ErrorTypes.INSUFFICIENT_STOCK.message,
            ErrorTypes.INSUFFICIENT_STOCK.statusCode,
            'Failed to update stock'
          );
        }
      }

      // Create order
      const orderId = await OrderModel.create(connection, {
        customer_id,
        total_cents: totalCents,
        items: orderItems,
      });

      await connection.commit();

      const order = await OrderModel.findById(orderId);
      return order;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * @description Get order by ID
   * @param {string|number} id - Order ID
   * @returns {Promise<Object>} Order object with items
   */
  static async getOrderById(id) {
    const order = await OrderModel.findById(id);
    if (!order) {
      throw new OrderError(
        ErrorTypes.ORDER_NOT_FOUND.message,
        ErrorTypes.ORDER_NOT_FOUND.statusCode,
        `Order with ID ${id} not found`
      );
    }
    return order;
  }

  /**
   * @description Search orders with filters and pagination
   * @param {Object} params - Search parameters
   * @param {string} [params.status] - Order status filter
   * @param {string} [params.from] - Date from filter
   * @param {string} [params.to] - Date to filter
   * @param {number} [params.cursor=0] - Pagination cursor (last ID)
   * @param {number} [params.limit=10] - Results limit
   * @returns {Promise<Object>} Object with data array and pagination info
   */
  static async searchOrders({ status, from, to, cursor = 0, limit = 10 }) {
    const cursorNum = parseInt(cursor, 10);
    const limitNum = parseInt(limit, 10);

    const orders = await OrderModel.search({
      status,
      from,
      to,
      cursor: cursorNum,
      limit: limitNum,
    });

    const nextCursor = orders.length > 0 ? orders[orders.length - 1].id : null;
    const hasMore = orders.length === limitNum;

    return {
      data: orders,
      pagination: {
        nextCursor: hasMore ? nextCursor : null,
        hasMore,
        limit: limitNum,
      },
    };
  }

  /**
   * @description Confirm order (idempotent)
   * @param {string|number} orderId - Order ID
   * @param {string} idempotencyKey - Idempotency key
   * @returns {Promise<Object>} Confirmed order object
   */
  static async confirmOrder(orderId, idempotencyKey) {
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      const order = await OrderModel.findById(orderId);
      if (!order) {
        await connection.rollback();
        throw new Error('ORDER_NOT_FOUND');
      }

      // Idempotency: if already confirmed, return it
      if (order.status === 'CONFIRMED') {
        await connection.commit();
        return order;
      }

      // Can only confirm CREATED orders
      if (order.status !== 'CREATED') {
        await connection.rollback();
        throw new OrderError(
          ErrorTypes.ORDER_ALREADY_CONFIRMED.message,
          ErrorTypes.ORDER_ALREADY_CONFIRMED.statusCode,
          `Order is already ${order.status}`
        );
      }

      await OrderModel.updateStatus(connection, orderId, 'CONFIRMED');
      await connection.commit();

      const confirmedOrder = await OrderModel.findById(orderId);
      return confirmedOrder;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * @description Cancel order and restore stock
   * CONFIRMED orders can only be canceled within 10 minutes
   * @param {string|number} orderId - Order ID
   * @param {string} idempotencyKey - Idempotency key for the operation
   * @returns {Promise<Object>} Cancelled order object
   */
  static async cancelOrder(orderId, idempotencyKey) {
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      const order = await OrderModel.findById(orderId);
      if (!order) {
        await connection.rollback();
        throw new OrderError(
          ErrorTypes.ORDER_NOT_FOUND.message,
          ErrorTypes.ORDER_NOT_FOUND.statusCode,
          `Order with ID ${orderId} not found`
        );
      }

      // Check if already canceled
      if (order.status === 'CANCELED') {
        await connection.rollback();
        throw new OrderError(
          ErrorTypes.ORDER_ALREADY_CANCELED.message,
          ErrorTypes.ORDER_ALREADY_CANCELED.statusCode
        );
      }

      // Can only cancel CREATED or CONFIRMED orders
      if (order.status !== 'CREATED' && order.status !== 'CONFIRMED') {
        await connection.rollback();
        throw new OrderError(
          ErrorTypes.INVALID_ORDER_STATUS.message,
          ErrorTypes.INVALID_ORDER_STATUS.statusCode,
          `Cannot cancel order with status ${order.status}`
        );
      }

      // CONFIRMED orders can only be canceled within 10 minutes
      if (order.status === 'CONFIRMED') {
        const now = new Date();
        const updatedAt = new Date(order.updated_at);
        const minutesSinceConfirmation = (now - updatedAt) / (1000 * 60);

        if (minutesSinceConfirmation > 10) {
          await connection.rollback();
          throw new OrderError(
            ErrorTypes.INVALID_ORDER_STATUS.message,
            ErrorTypes.INVALID_ORDER_STATUS.statusCode,
            `Cannot cancel confirmed order after 10 minutes. Order was confirmed ${Math.floor(
              minutesSinceConfirmation
            )} minutes ago.`
          );
        }
      }

      // Restore stock
      const items = await OrderModel.getOrderItems(orderId);
      for (const item of items) {
        await ProductModel.increaseStock(connection, item.product_id, item.qty);
      }

      await OrderModel.updateStatus(connection, orderId, 'CANCELED');
      await connection.commit();

      const cancelledOrder = await OrderModel.findById(orderId);
      return cancelledOrder;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}
