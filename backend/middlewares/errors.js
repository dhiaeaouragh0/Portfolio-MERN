const ErrorHandler = require('../utils/errorHandler');

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;

  // Handling errors in development environment
  if (process.env.NODE_ENV === 'DEVELOPMENT') {
    return res.status(err.statusCode).json({
      success: false,
      error: err,
      errMessage: err.message,
      stack: err.stack,
    });
  }

  // Handling errors in production environment
  if (process.env.NODE_ENV === 'PRODUCTION') {
    let error = { ...err };
    error.message = err.message;

    // Handling Mongoose invalid ObjectId error
    if (err.name === 'CastError') {
      const message = `Resource not found. Invalid: ${err.path}`;
      error = new ErrorHandler(message, 400);
    }

    // Handling Mongoose validation error
    if (err.name === 'ValidationError') {
      const message = Object.values(err.errors).map(value => value.message).join(', ');
      error = new ErrorHandler(message, 400);
    }

    // Handling Mongoose duplicate key error
    if (err.code === 11000) {
      const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
      error = new ErrorHandler(message, 400);
    }

    // Handling JWT errors
    if (err.name === 'JsonWebTokenError') {
      const message = 'JSON Web Token is invalid. Try again!';
      error = new ErrorHandler(message, 400);
    }

    if (err.name === 'TokenExpiredError') {
      const message = 'JSON Web Token has expired. Try again!';
      error = new ErrorHandler(message, 400);
    }

    // Send generic error message if no specific handler was triggered
    return res.status(error.statusCode).json({
      success: false,
      message: error.message || 'Internal Server Error',
    });
  }
};
