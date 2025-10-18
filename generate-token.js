import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'b2b-orders-jwt-secret-key';
const SERVICE_SECRET = process.env.SERVICE_SECRET || 'b2b-orders-service-internal-secret-key';

// Service token (no expiration)
const serviceToken = jwt.sign(
  {
    service: 'orders-api',
    purpose: 'internal-communication',
  },
  SERVICE_SECRET
);

// Development/User token (no expiration)
const devToken = jwt.sign(
  {
    userId: 1,
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
  },
  JWT_SECRET
);

console.log('\n========================================');
console.log('Tokens Generated Successfully!');
console.log('========================================\n');

console.log('SERVICE_TOKEN (for inter-service communication):');
console.log(serviceToken);
console.log('\n');

console.log('DEV_TOKEN (for user requests):');
console.log(devToken);

console.log('\n========================================');
console.log('Usage:');
console.log('========================================\n');
console.log('For internal endpoints (/internal/*):');
console.log(`Authorization: Bearer ${serviceToken}`);
console.log('\n');
console.log('For user endpoints:');
console.log(`Authorization: Bearer ${devToken}`);
console.log('\n========================================\n');
