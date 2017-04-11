'use strict';

const pgp = require('pg-promise')({});

module.exports = (config) => new Promise((resolve, reject) => {
  const db = pgp(config.database);

  db.connect()
    .then((conn) => {
      conn.done();

      const importer = require('./importer')(config, db);
      const queries = require('./queries')(db);

      importer.init()
        .then(() => {
          // todo finish DB
          const geoliteDB = {
            update: importer.update,
            get: queries.get,
          };
          resolve(geoliteDB);
        })
        .catch(reject);
    })
    .catch(reject);
});