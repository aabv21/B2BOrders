import logger from '../config/logger.js';

/**
 * Middleware to log HTTP requests
 */
export const httpLogger = (req, res, next) => {
  const start = Date.now();
  
  // Capture response body for errors
  const originalSend = res.send;
  let responseBody;
  
  res.send = function(body) {
    responseBody = body;
    return originalSend.call(this, body);
  };
  
  // Log request
  logger.http(`${req.method} ${req.url}`, {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    body: req.body,
  });

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? 'warn' : 'http';
    
    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    };

    // Add request body for errors
    if (res.statusCode >= 400) {
      logData.requestBody = req.body;
      
      // Parse and add response body for errors
      if (responseBody) {
        try {
          logData.responseBody = typeof responseBody === 'string' 
            ? JSON.parse(responseBody) 
            : responseBody;
        } catch (e) {
          logData.responseBody = responseBody;
        }
      }
    }
    
    // Create detailed message for errors
    const message = res.statusCode >= 400 
      ? `${req.method} ${req.url} ${res.statusCode} ${duration}ms - ${logData.responseBody?.error || 'Error'}`
      : `${req.method} ${req.url} ${res.statusCode} ${duration}ms`;
    
    logger[logLevel](message, logData);
  });

  next();
};

/**
 * Middleware to log errors
 */
export const errorLogger = (err, req, res, next) => {
  logger.error(`Error in ${req.method} ${req.url}`, {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    body: req.body,
    params: req.params,
    query: req.query,
  });

  next(err);
};
