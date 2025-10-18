import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export const customersApiClient = axios.create({
  baseURL: process.env.CUSTOMERS_API_BASE || 'http://localhost:3001',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.SERVICE_TOKEN}`
  }
});
