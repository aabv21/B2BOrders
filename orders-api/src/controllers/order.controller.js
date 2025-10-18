import { OrderService } from '../services/order.service.js';
import { OrderError, ErrorTypes } from '../utils/errors.js';
import { customersApiClient } from '../config/axios.js';
import db from '../config/database.js';

export class OrderController {
  /**
   * @description Create a new order
   * @param {Object} req - Express request object
   * @param {Object} req.validatedBody - Validated request body
   * @param {number} req.validatedBody.customer_id - Customer ID
   * @param {Array} req.validatedBody.items - Order items
   * @param {number} req.validatedBody.items[].product_id - Product ID
   * @param {number} req.validatedBody.items[].qty - Quantity
   * @param {Object} res - Express response object
   * @returns {Promise<void>} Created order data or error response
   */
  static async create(req, res) {
    try {
      const { customer_id, items } = req.validatedBody;

      // Validate customer exists (call Customers API internal endpoint)
      try {
        await customersApiClient.get(`/internal/customers/${customer_id}`);
      } catch (error) {
        if (error.response?.status === 404) {
          return res.status(400).json({ error: 'Customer not found' });
        }
        throw error;
      }

      const order = await OrderService.createOrder({ customer_id, items });
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof OrderError) {
        return res.status(error.statusCode).json({
          error: error.message,
          ...(error.details && { details: error.details }),
        });
      }
      console.error('Error creating order:', error);
      res.status(500).json({ error: ErrorTypes.INTERNAL_ERROR.message });
    }
  }

  /**
   * @description Get order by ID with items
   * @param {Object} req - Express request object
   * @param {Object} req.params - Request parameters
   * @param {string} req.params.id - Order ID
   * @param {Object} res - Express response object
   * @returns {Promise<void>} Order data or error response
   */
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const order = await OrderService.getOrderById(id);
      res.json(order);
    } catch (error) {
      if (error instanceof OrderError) {
        return res.status(error.statusCode).json({
          error: error.message,
          ...(error.details && { details: error.details }),
        });
      }
      console.error('Error fetching order:', error);
      res.status(500).json({ error: ErrorTypes.INTERNAL_ERROR.message });
    }
  }

  /**
   * @description Search orders with filters and pagination
   * @param {Object} req - Express request object
   * @param {Object} req.validatedQuery - Validated query parameters
   * @param {string} [req.validatedQuery.status] - Order status filter
   * @param {string} [req.validatedQuery.from] - Date from filter
   * @param {string} [req.validatedQuery.to] - Date to filter
   * @param {number} req.validatedQuery.cursor - Pagination cursor
   * @param {number} req.validatedQuery.limit - Results limit
   * @param {Object} res - Express response object
   * @returns {Promise<void>} Paginated order list or error response
   */
  static async search(req, res) {
    try {
      const { status, from, to, cursor = 0, limit = 10 } = req.validatedQuery;
      const result = await OrderService.searchOrders({ status, from, to, cursor, limit });
      res.json(result);
    } catch (error) {
      console.error('Error searching orders:', error);
      res.status(500).json({ error: ErrorTypes.INTERNAL_ERROR.message });
    }
  }

  /**
   * @description Confirm order (idempotent with X-Idempotency-Key)
   * @param {Object} req - Express request object
   * @param {Object} req.params - Request parameters
   * @param {string} req.params.id - Order ID
   * @param {Object} req.headers - Request headers
   * @param {string} req.headers['x-idempotency-key'] - Idempotency key
   * @param {Object} res - Express response object
   * @returns {Promise<void>} Confirmed order data or error response
   */
  static async confirm(req, res) {
    const connection = await db.getConnection();
    
    try {
      const { id } = req.params;
      const idempotencyKey = req.headers['x-idempotency-key'];

      if (!idempotencyKey) {
        return res.status(400).json({ error: 'X-Idempotency-Key header required' });
      }

      await connection.beginTransaction();

      // Check idempotency key
      const [existingKeys] = await connection.execute(
        'SELECT * FROM idempotency_keys WHERE key_value = ? AND expires_at > NOW()',
        [idempotencyKey]
      );

      if (existingKeys.length > 0) {
        // Return cached response
        await connection.rollback();
        connection.release();
        return res.status(200).json(JSON.parse(existingKeys[0].response_body));
      }

      const confirmedOrder = await OrderService.confirmOrder(id, idempotencyKey);
      const responseBody = JSON.stringify(confirmedOrder);

      // Store idempotency key
      await connection.execute(
        'INSERT INTO idempotency_keys (key_value, target_type, target_id, status, response_body, expires_at) VALUES (?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR))',
        [idempotencyKey, 'order', id, 'CONFIRMED', responseBody]
      );

      await connection.commit();
      res.json(confirmedOrder);
    } catch (error) {
      await connection.rollback();
      if (error instanceof OrderError) {
        return res.status(error.statusCode).json({
          error: error.message,
          ...(error.details && { details: error.details }),
        });
      }
      console.error('Error confirming order:', error);
      res.status(500).json({ error: ErrorTypes.INTERNAL_ERROR.message });
    } finally {
      connection.release();
    }
  }

  /**
   * @description Cancel order (restore stock)
   * @param {Object} req - Express request object
   * @param {Object} req.params - Request parameters
   * @param {string} req.params.id - Order ID
   * @param {Object} req.headers - Request headers
   * @param {string} [req.headers['x-idempotency-key']] - Idempotency key
   * @param {Object} res - Express response object
   * @returns {Promise<void>} Cancelled order data or error response
   */
  static async cancel(req, res) {
    try {
      const { id } = req.params;
      const idempotencyKey = req.headers['x-idempotency-key'];
      
      const canceledOrder = await OrderService.cancelOrder(id, idempotencyKey);
      res.json(canceledOrder);
    } catch (error) {
      if (error instanceof OrderError) {
        return res.status(error.statusCode).json({
          error: error.message,
          ...(error.details && { details: error.details }),
        });
      }
      console.error('Error canceling order:', error);
      res.status(500).json({ error: ErrorTypes.INTERNAL_ERROR.message });
    }
  }
}
