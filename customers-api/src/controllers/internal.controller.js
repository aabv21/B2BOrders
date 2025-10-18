import { CustomerService } from '../services/customer.service.js';
import logger from '../config/logger.js';

export class InternalController {
  /**
   * @description Get customer by ID (internal use with service token)
   * @param {string} req.params.id - Customer ID
   * @param {Object} res - Express response object
   * @returns {Promise<void>} Customer data or error response
   */
  static async getCustomerById(req, res) {
    try {
      const { id } = req.params;
      const customer = await CustomerService.getCustomerById(id);
      res.json(customer);
    } catch (error) {
      if (error.message === 'CUSTOMER_NOT_FOUND') {
        return res.status(404).json({ error: 'Customer not found' });
      }
      logger.error('Error fetching customer (internal):', {
        error: error.message,
        stack: error.stack,
      });
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
