import logger from '../utils/logger.js';

const errorHandler = (err, req, res, next) => {
  logger.error(`[${req.method}] ${req.originalUrl}`, {
    message: err.message,
    stack: err.stack,
    body: req.body,
    params: req.params,
    query: req.query,
    user: req.user || 'Unauthenticated',
  });

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = null;

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errors = {};
    Object.keys(err.errors).forEach((key) => {
      errors[key] = err.errors[key].message;
    });
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  } else if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate field value: ${field}. Please use another value.`;
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please log in again.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Your token has expired. Please log in again.';
  } else if (err.type === 'entity.too.large') {
    statusCode = 413;
    message = 'Request payload is too large';
  }

  const showStack = process.env.NODE_ENV === 'development';

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
        stack: err.stack,
      },
    }),
  });
};

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export { errorHandler, notFound };
