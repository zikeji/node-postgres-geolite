'use strict';

class ValidationError extends Error {
  constructor(message, invalid) {
    super();
    this.name = this.constructor.name;
    this.message = message;
    Error.captureStackTrace(this, this.constructor);
    if (invalid) this.invalid = invalid;
  }
}

module.exports = ValidationError;