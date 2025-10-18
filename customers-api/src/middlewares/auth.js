import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt.js';

/**
 * Middleware to verify JWT token for user authentication
 */
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, jwtConfig.secret, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

/**
 * Middleware to verify service token for internal API communication
 */
export const authenticateService = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer SERVICE_TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Service token required' });
  }

  // Verify JWT service token with SERVICE_SECRET
  jwt.verify(token, jwtConfig.serviceSecret, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid service token' });
    }

    if (decoded.service !== 'orders-api') {
      return res.status(403).json({ error: 'Invalid service token' });
    }

    req.service = decoded;
    next();
  });
};
