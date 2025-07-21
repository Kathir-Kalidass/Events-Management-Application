const errorHandler = (err, req, res, next) => {
  // Log the error for debugging
  console.error(`[${new Date().toISOString()}] Error:`, {
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    body: req.body,
    params: req.params,
    query: req.query,
    user: req.user || 'Unauthenticated'
  });

  // Default error status and message
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = null;

  // Handle specific error types
  if (err.name === 'ValidationError') {
    // Mongoose validation error
    statusCode = 400;
    message = 'Validation Error';
    errors = {};
    Object.keys(err.errors).forEach((key) => {
      errors[key] = err.errors[key].message;
    });
  } else if (err.name === 'CastError') {
    // Mongoose cast error (invalid ID format)
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  } else if (err.code === 11000) {
    // MongoDB duplicate key error
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate field value: ${field}. Please use another value.`;
  } else if (err.name === 'JsonWebTokenError') {
    // JWT error
    statusCode = 401;
    message = 'Invalid token. Please log in again.';
  } else if (err.name === 'TokenExpiredError') {
    // JWT expired
    statusCode = 401;
    message = 'Your token has expired. Please log in again.';
  } else if (err.type === 'entity.too.large') {
    // Payload too large
    statusCode = 413;
    message = 'Request payload is too large';
  }

  // Determine if we should show the stack trace
  const showStack = process.env.NODE_ENV === 'development';

  // Send error response
  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message,
    errors,
    stack: showStack ? err.stack : undefined,
    ...(process.env.NODE_ENV === 'development' && {
      originalError: {
        name: err.name,
        message: err.message,
        stack: err.stack
      }
    })
  });
};

// Not Found Middleware
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export { errorHandler, notFound };