'use strict';

class IPNotFoundError extends Error {
  constructor(message, ip) {
    super();
    this.name = this.constructor.name;
    this.message = message;
    Error.captureStackTrace(this, this.constructor);
    if (ip) this.ip = ip;
  }
}

module.exports = IPNotFoundError;