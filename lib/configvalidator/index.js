'use strict';

const Joi = require('joi');
const ValidationError = require('./validationerror.js');

module.exports = {
  validate: (config) => new Promise((resolve, reject) => {
    const schema = Joi.object({
      database: {
        host: Joi.string().default('localhost'),
        port: Joi.number().integer().min(1).max(65535).default(5432),
        user: Joi.string().required(),
        password: Joi.string().default(''),
        database: Joi.string().required(),
        ssl: Joi.bool().default(false),
        poolSize: Joi.number().integer().default(10),
        poolIdleTimeout: Joi.number().integer().default(30000),
      },
      downloads: {
        location: Joi.string().default('./tmp'),
        cleanup: Joi.bool().default(false),
        local: Joi.bool().default(false),
        resources: {
          geolite2_city: Joi.string().uri().required(),
          geolite_asn: Joi.string().uri().required(),
          geolite_asn_ipv6: Joi.string().uri().required(),
        },
      },
    });

    const validation = Joi.validate(config, schema, {
      abortEarly: false,
    });

    if (validation.error) {
      reject(new ValidationError('node-postgres-geolite configuration invalid', validation.error.details));
    } else {
      resolve(validation.value);
    }
  }),
};