import db from '../config/database.js';
import logger from '../config/logger.js';

export class CustomerModel {
  /**
   * Create a new customer
   */
  static async create({ name, email, phone }) {
    const [result] = await db.query(
      'INSERT INTO customers (name, email, phone) VALUES (?, ?, ?)',
      [name, email, phone]
    );
    return result.insertId;
  }

  /**
   * Find customer by ID (excluding soft-deleted)
   */
  static async findById(id) {
    const [rows] = await db.query(
      'SELECT id, name, email, phone, created_at FROM customers WHERE id = ? AND deleted_at IS NULL',
      [id]
    );
    return rows[0] || null;
  }

  /**
   * Find customer by email (excluding soft-deleted)
   */
  static async findByEmail(email) {
    const [rows] = await db.query(
      'SELECT id, name, email, phone, created_at FROM customers WHERE email = ? AND deleted_at IS NULL',
      [email]
    );
    return rows[0] || null;
  }

  /**
   * Search customers with pagination
   */
  static async search({ search = '', cursor = 0, limit = 10 }) {
    // Ensure cursor and limit are integers
    const cursorInt = Number.isInteger(cursor)
      ? cursor
      : parseInt(cursor, 10) || 0;
    const limitInt = Number.isInteger(limit)
      ? limit
      : parseInt(limit, 10) || 10;

    let query =
      'SELECT id, name, email, phone, created_at FROM customers WHERE deleted_at IS NULL';
    const params = [];

    // Add search condition only if search term is provided
    if (search && search.trim() !== '') {
      const searchPattern = `%${search}%`;
      query += ` AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)`;
      params.push(searchPattern, searchPattern, searchPattern);
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
   * Update customer by ID
   */
  static async update(id, data) {
    const fields = [];
    const values = [];

    if (data.name !== undefined) {
      fields.push('name = ?');
      values.push(data.name);
    }
    if (data.email !== undefined) {
      fields.push('email = ?');
      values.push(data.email);
    }
    if (data.phone !== undefined) {
      fields.push('phone = ?');
      values.push(data.phone);
    }

    if (fields.length === 0) {
      return false;
    }

    values.push(id);

    const [result] = await db.query(
      `UPDATE customers SET ${fields.join(
        ', '
      )} WHERE id = ? AND deleted_at IS NULL`,
      values
    );

    return result.affectedRows > 0;
  }

  /**
   * Soft delete customer by ID
   */
  static async softDelete(id) {
    const [result] = await db.query(
      'UPDATE customers SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL',
      [id]
    );
    return result.affectedRows > 0;
  }

  /**
   * Check if email exists (excluding soft-deleted)
   */
  static async emailExists(email, excludeId = null) {
    let query =
      'SELECT id FROM customers WHERE email = ? AND deleted_at IS NULL';
    const params = [email];

    if (excludeId) {
      query += ' AND id != ?';
      params.push(excludeId);
    }

    const [rows] = await db.query(query, params);
    return rows.length > 0;
  }
}
