import dotenv from 'dotenv';

dotenv.config();

export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'b2b-orders-jwt-secret-key',
  serviceSecret: process.env.SERVICE_SECRET || 'b2b-orders-service-internal-secret-key'
};
