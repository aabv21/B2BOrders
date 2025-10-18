import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const CUSTOMERS_API_BASE =
  process.env.CUSTOMERS_API_BASE || 'http://localhost:3001';
const ORDERS_API_BASE = process.env.ORDERS_API_BASE || 'http://localhost:3002';
const SERVICE_TOKEN = process.env.SERVICE_TOKEN || process.env.DEV_TOKEN;
const DEV_TOKEN = process.env.DEV_TOKEN;

/**
 * Customers API Client
 */
export const customersApi = {
  async getCustomer(customerId) {
    const response = await axios.get(`${CUSTOMERS_API_BASE}/internal/customers/${customerId}`, {
      headers: {
        Authorization: `Bearer ${SERVICE_TOKEN}`,
      },
    });
    return response.data;
  },
};

/**
 * Orders API Client
 */
export const ordersApi = {
  async createOrder(customerId, items) {
    const response = await axios.post(
      `${ORDERS_API_BASE}/orders`,
      { customer_id: customerId, items },
      {
        headers: {
          Authorization: `Bearer ${DEV_TOKEN}`,
        },
      }
    );
    return response.data;
  },

  async confirmOrder(orderId, idempotencyKey) {
    const response = await axios.post(
      `${ORDERS_API_BASE}/orders/${orderId}/confirm`,
      {},
      {
        headers: {
          Authorization: `Bearer ${DEV_TOKEN}`,
          'X-Idempotency-Key': idempotencyKey,
        },
      }
    );
    return response.data;
  },
};
