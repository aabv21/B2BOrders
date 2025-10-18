import db from '../config/database.js';

export class OrderModel {
  /**
   * Create a new order with items (transaction)
   */
  static async create(connection, { customer_id, total_cents, items }) {
    // Insert order
    const [orderResult] = await connection.execute(
      'INSERT INTO orders (customer_id, status, total_cents) VALUES (?, ?, ?)',
      [customer_id, 'CREATED', total_cents]
    );

    const orderId = orderResult.insertId;

    // Insert order items
    for (const item of items) {
      await connection.execute(
        'INSERT INTO order_items (order_id, product_id, qty, unit_price_cents, subtotal_cents) VALUES (?, ?, ?, ?, ?)',
        [
          orderId,
          item.product_id,
          item.qty,
          item.unit_price_cents,
          item.subtotal_cents,
        ]
      );
    }

    return orderId;
  }

  /**
   * Find order by ID with items
   */
  static async findById(id) {
    const [orderRows] = await db.query(
      'SELECT id, customer_id, status, total_cents, created_at, updated_at FROM orders WHERE id = ?',
      [id]
    );

    if (orderRows.length === 0) {
      return null;
    }

    const order = orderRows[0];

    // Get order items
    const [itemRows] = await db.query(
      `SELECT oi.id, oi.product_id, oi.qty, oi.unit_price_cents, oi.subtotal_cents, p.sku, p.name
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [id]
    );

    order.items = itemRows;
    return order;
  }

  /**
   * Search orders with filters and pagination
   */
  static async search({ status, from, to, cursor = 0, limit = 10 }) {
    const cursorInt = Number.isInteger(cursor)
      ? cursor
      : parseInt(cursor, 10) || 0;
    const limitInt = Number.isInteger(limit)
      ? limit
      : parseInt(limit, 10) || 10;

    let query =
      'SELECT id, customer_id, status, total_cents, created_at, updated_at FROM orders WHERE id > ?';
    const params = [cursorInt];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (from) {
      query += ' AND created_at >= ?';
      params.push(from);
    }

    if (to) {
      query += ' AND created_at <= ?';
      params.push(to);
    }

    query += ' ORDER BY id ASC LIMIT ?';
    params.push(limitInt);

    const [rows] = await db.query(query, params);
    return rows;
  }

  /**
   * Update order status (transaction)
   */
  static async updateStatus(connection, orderId, newStatus) {
    const [result] = await connection.execute(
      'UPDATE orders SET status = ? WHERE id = ?',
      [newStatus, orderId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Get order items
   */
  static async getOrderItems(orderId) {
    const [rows] = await db.query(
      'SELECT id, product_id, qty, unit_price_cents, subtotal_cents FROM order_items WHERE order_id = ?',
      [orderId]
    );
    return rows;
  }

  /**
   * Cancel order
   */
  static async cancel(connection, orderId) {
    const [orderRows] = await connection.execute(
      'SELECT status FROM orders WHERE id = ?',
      [orderId]
    );

    if (orderRows.length === 0) {
      throw new Error('Order not found');
    }

    const currentStatus = orderRows[0].status;

    if (currentStatus === 'CANCELED') {
      throw new Error('Order already canceled');
    }

    if (currentStatus === 'CONFIRMED') {
      const [timeCheckRows] = await connection.execute(
        'SELECT TIMESTAMPDIFF(MINUTE, created_at, NOW()) as minutes_elapsed FROM orders WHERE id = ?',
        [orderId]
      );

      if (timeCheckRows[0].minutes_elapsed > 10) {
        throw new Error('Cannot cancel confirmed order after 10 minutes');
      }
    }

    await connection.execute('UPDATE orders SET status = ? WHERE id = ?', [
      'CANCELED',
      orderId,
    ]);

    return true;
  }
}
