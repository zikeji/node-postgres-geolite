'use strict';

const pgp = require('pg-promise')({});

module.exports = (config) => new Promise((resolve, reject) => {
  const db = pgp(config.database);
  const importer = require('./importer')(config);

  console.time('import');
  importer.init(db)
    .then(() => {
      console.timeEnd('import');
      console.log('here_init');
    })
    .catch(reject);
});