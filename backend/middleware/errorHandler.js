/**
 * ============================================================
 * Global Error Handler Middleware
 * ============================================================
 * 
 * Catches all errors thrown or passed via next(error) in route
 * handlers. Normalizes common Mongoose errors (invalid ObjectId,
 * duplicate keys, validation failures) into user-friendly
 * HTTP responses. In development, the error stack trace is
 * included; in production, it is hidden for security.
 * 
 * Must be registered AFTER all route definitions in server.js.
 * ============================================================
 */

/**
 * Express error-handling middleware (4 parameters required).
 * 
 * @param {Error}    err  - The error object
 * @param {Object}   req  - Express request object
 * @param {Object}   res  - Express response object
 * @param {Function} next - Express next function (required by Express error middleware signature)
 */
const errorHandler = (err, req, res, next) => {
  console.error('[errorHandler] Error caught:', err);

  // Default to 500 if the response status hasn't been set by the route handler
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // ── Mongoose: Invalid ObjectId (CastError) ──────────────
  // Occurs when a route parameter doesn't match a valid MongoDB ObjectId format
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found';
  }

  // ── Mongoose: Duplicate Key Error (code 11000) ──────────
  // Occurs when a unique index constraint is violated (e.g., duplicate email)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate value for '${field}'`;
  }

  // ── Mongoose: Validation Error ──────────────────────────
  // Occurs when required fields are missing or values fail schema validation
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  }

  // Send the error response to the client
  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack, // Hide stack in production
  });
};

module.exports = errorHandler;
