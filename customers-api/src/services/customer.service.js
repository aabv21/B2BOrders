import { CustomerModel } from '../models/customer.model.js';
import { CustomerError, ErrorTypes } from '../utils/errors.js';

export class CustomerService {
  /**
   * @description Create a new customer
   * @param {string} data.name - Customer name
   * @param {string} data.email - Customer email
   * @param {string} data.phone - Customer phone
   * @returns {Promise<Object>} Created customer object
   */
  static async createCustomer({ name, email, phone }) {
    // Check if email already exists
    const existingCustomer = await CustomerModel.findByEmail(email);
    if (existingCustomer) {
      throw new CustomerError(
        ErrorTypes.CUSTOMER_ALREADY_EXISTS.message,
        ErrorTypes.CUSTOMER_ALREADY_EXISTS.statusCode,
        `Email ${email} is already registered`
      );
    }

    const customerId = await CustomerModel.create({ name, email, phone });
    const customer = await CustomerModel.findById(customerId);
    return customer;
  }

  /**
   * @description Get customer by ID
   * @param {string|number} id - Customer ID
   * @returns {Promise<Object>} Customer object
   */
  static async getCustomerById(id) {
    const customer = await CustomerModel.findById(id);
    if (!customer) {
      throw new CustomerError(
        ErrorTypes.CUSTOMER_NOT_FOUND.message,
        ErrorTypes.CUSTOMER_NOT_FOUND.statusCode,
        `Customer with ID ${id} not found`
      );
    }
    return customer;
  }

  /**
   * @description Search customers with pagination
   * @param {Object} params - Search parameters
   * @param {string} [params.search=''] - Search term
   * @param {number} [params.cursor=0] - Pagination cursor (last ID)
   * @param {number} [params.limit=10] - Results limit
   * @returns {Promise<Object>} Object with data array and pagination info
   */
  static async searchCustomers({ search = '', cursor = 0, limit = 10 }) {
    const cursorNum = parseInt(cursor, 10);
    const limitNum = parseInt(limit, 10);

    const customers = await CustomerModel.search({
      search,
      cursor: cursorNum,
      limit: limitNum,
    });

    const nextCursor =
      customers.length > 0 ? customers[customers.length - 1].id : null;
    const hasMore = customers.length === limitNum;

    return {
      data: customers,
      pagination: {
        nextCursor: hasMore ? nextCursor : null,
        hasMore,
        limit: limitNum,
      },
    };
  }

  /**
   * @description Update customer
   * @param {string|number} id - Customer ID
   * @param {string} [updateData.name] - Customer name
   * @param {string} [updateData.email] - Customer email
   * @param {string} [updateData.phone] - Customer phone
   * @returns {Promise<Object>} Updated customer object
   */
  static async updateCustomer(id, updateData) {
    // Check if customer exists
    const customer = await CustomerModel.findById(id);
    if (!customer) {
      throw new CustomerError(
        ErrorTypes.CUSTOMER_NOT_FOUND.message,
        ErrorTypes.CUSTOMER_NOT_FOUND.statusCode,
        `Customer with ID ${id} not found`
      );
    }

    // Check if email is being updated and if it already exists
    if (updateData.email && updateData.email !== customer.email) {
      const emailExists = await CustomerModel.emailExists(updateData.email, id);
      if (emailExists) {
        throw new CustomerError(
          ErrorTypes.CUSTOMER_ALREADY_EXISTS.message,
          ErrorTypes.CUSTOMER_ALREADY_EXISTS.statusCode,
          `Email ${updateData.email} is already registered`
        );
      }
    }

    const updated = await CustomerModel.update(id, updateData);
    if (!updated) {
      throw new CustomerError(
        ErrorTypes.VALIDATION_ERROR.message,
        ErrorTypes.VALIDATION_ERROR.statusCode,
        'No changes were made'
      );
    }

    const updatedCustomer = await CustomerModel.findById(id);
    return updatedCustomer;
  }

  /**
   * @description Delete customer (soft delete)
   * @param {string|number} id - Customer ID
   * @returns {Promise<void>}
   */
  static async deleteCustomer(id) {
    const customer = await CustomerModel.findById(id);
    if (!customer) {
      throw new CustomerError(
        ErrorTypes.CUSTOMER_NOT_FOUND.message,
        ErrorTypes.CUSTOMER_NOT_FOUND.statusCode,
        `Customer with ID ${id} not found`
      );
    }

    await CustomerModel.softDelete(id);
  }
}
