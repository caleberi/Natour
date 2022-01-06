const config = require('../config');

class AppError extends Error {
  constructor(message, code, isOperational) {
    super(message);
    this.statusCode = code || 400;
    this.status = Math.floor(this.statusCode / 100) == 4 ? 'fail' : 'error';
    this.isOperational = isOperational ? true : false;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, statusCode) {
    super(message, statusCode, false);
  }
}

class DuplicateFieldsError extends AppError {
  constructor(message, statusCode) {
    super(message, statusCode);
  }
}

class CastError extends AppError {
  constructor(message, statusCode) {
    super(message, statusCode);
  }
}

class ConfigurationError extends Error {
  constructor(message) {
    super(message);
  }
}

module.exports = {
  AppError,
  ValidationError,
  CastError,
  DuplicateFieldsError,
  ConfigurationError,
};
