import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import customerRoutes from './routes/customer.routes.js';
import internalRoutes from './routes/internal.routes.js';
import logger from './config/logger.js';
import { httpLogger, errorLogger } from './middlewares/logger.js';

dotenv.config();

const app = express();
const PORT = process.env.CUSTOMERS_API_PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(httpLogger); // Winston HTTP logger

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'customers-api', timestamp: new Date().toISOString() });
});

// Routes
app.use('/customers', customerRoutes);
app.use('/internal', internalRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error logging middleware
app.use(errorLogger);

// Error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info(`🚀 Customers API running on http://localhost:${PORT}`);
  });
}

export default app;
