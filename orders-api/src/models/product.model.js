import db from '../config/database.js';

export class ProductModel {
  /**
   * Create a new product
   */
  static async create({ sku, name, price_cents, stock = 0 }) {
    const [result] = await db.query(
      'INSERT INTO products (sku, name, price_cents, stock) VALUES (?, ?, ?, ?)',
      [sku, name, price_cents, stock]
    );
    return result.insertId;
  }

  /**
   * Find product by ID
   */
  static async findById(id) {
    const [rows] = await db.query(
      'SELECT id, sku, name, price_cents, stock, created_at, updated_at FROM products WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  /**
   * Find product by SKU
   */
  static async findBySku(sku) {
    const [rows] = await db.query(
      'SELECT id, sku, name, price_cents, stock, created_at, updated_at FROM products WHERE sku = ?',
      [sku]
    );
    return rows[0] || null;
  }

  /**
   * Search products with pagination
   */
  static async search({ search = '', cursor = 0, limit = 10 }) {
    const cursorInt = Number.isInteger(cursor)
      ? cursor
      : parseInt(cursor, 10) || 0;
    const limitInt = Number.isInteger(limit)
      ? limit
      : parseInt(limit, 10) || 10;

    let query =
      'SELECT id, sku, name, price_cents, stock, created_at, updated_at FROM products WHERE 1=1';
    const params = [];

    // Add search condition only if search term is provided
    if (search && search.trim() !== '') {
      const searchPattern = `%${search}%`;
      query += ` AND (sku LIKE ? OR name LIKE ?)`;
      params.push(searchPattern, searchPattern);
    }

    // Add cursor condition
    query += ` AND id > ?`;
    params.push(cursorInt);

    // Add ordering and limit
    query += ` ORDER BY id ASC LIMIT ?`;
    params.push(limitInt);

    const [rows] = await db.query(query, params);
    return rows;
  }

  /**
   * Update product price and/or stock
   */
  static async update(id, data) {
    const fields = [];
    const values = [];

    if (data.price_cents !== undefined) {
      fields.push('price_cents = ?');
      values.push(data.price_cents);
    }
    if (data.stock !== undefined) {
      fields.push('stock = ?');
      values.push(data.stock);
    }

    if (fields.length === 0) {
      return false;
    }

    values.push(id);

    const [result] = await db.query(
      `UPDATE products SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  /**
   * Decrease stock (for order creation) - uses transaction
   */
  static async decreaseStock(connection, productId, quantity) {
    const [result] = await connection.execute(
      'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
      [quantity, productId, quantity]
    );
    return result.affectedRows > 0;
  }

  /**
   * Increase stock (for order cancellation) - uses transaction
   */
  static async increaseStock(connection, productId, quantity) {
    const [result] = await connection.execute(
      'UPDATE products SET stock = stock + ? WHERE id = ?',
      [quantity, productId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Check if SKU exists
   */
  static async skuExists(sku, excludeId = null) {
    let query = 'SELECT id FROM products WHERE sku = ?';
    const params = [sku];

    if (excludeId) {
      query += ' AND id != ?';
      params.push(excludeId);
    }

    const [rows] = await db.query(query, params);
    return rows.length > 0;
  }

  /**
   * Delete product
   */
  static async delete(id) {
    const [result] = await db.query('DELETE FROM products WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}
