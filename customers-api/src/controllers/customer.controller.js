import { CustomerService } from '../services/customer.service.js';
import { CustomerError, ErrorTypes } from '../utils/errors.js';
import logger from '../config/logger.js';

export class CustomerController {
  /**
   * @description Create a new customer
   * @param {string} req.validatedBody.name - Customer name
   * @param {string} req.validatedBody.email - Customer email
   * @param {string} req.validatedBody.phone - Customer phone
   * @param {Object} res - Express response object
   * @returns {Promise<void>} Created customer data or error response
   */
  static async create(req, res) {
    try {
      const { name, email, phone } = req.validatedBody;
      const customer = await CustomerService.createCustomer({
        name,
        email,
        phone,
      });
      res.status(201).json(customer);
    } catch (error) {
      if (error instanceof CustomerError) {
        return res.status(error.statusCode).json({
          error: error.message,
          ...(error.details && { details: error.details }),
        });
      }
      logger.error('Error creating customer:', {
        error: error.message,
        stack: error.stack,
      });
      res.status(500).json({ error: ErrorTypes.INTERNAL_ERROR.message });
    }
  }

  /**
   * @description Get customer by ID
   * @param {string} req.params.id - Customer ID
   * @param {Object} res - Express response object
   * @returns {Promise<void>} Customer data or error response
   */
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const customer = await CustomerService.getCustomerById(id);
      res.json(customer);
    } catch (error) {
      if (error instanceof CustomerError) {
        return res.status(error.statusCode).json({
          error: error.message,
          ...(error.details && { details: error.details }),
        });
      }
      logger.error('Error fetching customer:', {
        error: error.message,
        stack: error.stack,
      });
      res.status(500).json({ error: ErrorTypes.INTERNAL_ERROR.message });
    }
  }

  /**
   * @description Search customers with pagination
   * @param {string} req.validatedQuery.search - Search term
   * @param {number} req.validatedQuery.cursor - Pagination cursor
   * @param {number} req.validatedQuery.limit - Results limit
   * @param {Object} res - Express response object
   * @returns {Promise<void>} Paginated customer list or error response
   */
  static async search(req, res) {
    try {
      const { search = '', cursor = 0, limit = 10 } = req.validatedQuery;
      const result = await CustomerService.searchCustomers({
        search,
        cursor,
        limit,
      });
      res.json(result);
    } catch (error) {
      logger.error('Error searching customers:', {
        error: error.message,
        stack: error.stack,
      });
      res.status(500).json({ error: ErrorTypes.INTERNAL_ERROR.message });
    }
  }

  /**
   * @description Update customer
   * @param {string} [req.validatedBody.name] - Customer name
   * @param {string} [req.validatedBody.email] - Customer email
   * @param {string} [req.validatedBody.phone] - Customer phone
   * @param {Object} res - Express response object
   * @returns {Promise<void>} Updated customer data or error response
   */
  static async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.validatedBody;
      const updatedCustomer = await CustomerService.updateCustomer(
        id,
        updateData
      );
      res.json(updatedCustomer);
    } catch (error) {
      if (error instanceof CustomerError) {
        return res.status(error.statusCode).json({
          error: error.message,
          ...(error.details && { details: error.details }),
        });
      }
      logger.error('Error updating customer:', {
        error: error.message,
        stack: error.stack,
      });
      res.status(500).json({ error: ErrorTypes.INTERNAL_ERROR.message });
    }
  }

  /**
   * @description Soft delete customers
   * @param {string} req.params.id - Customer ID
   * @param {Object} res - Express response object
   * @returns {Promise<void>} 204 No Content or error response
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;
      await CustomerService.deleteCustomer(id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof CustomerError) {
        return res.status(error.statusCode).json({
          error: error.message,
          ...(error.details && { details: error.details }),
        });
      }
      logger.error('Error deleting customer:', {
        error: error.message,
        stack: error.stack,
      });
      res.status(500).json({ error: ErrorTypes.INTERNAL_ERROR.message });
    }
  }
}
