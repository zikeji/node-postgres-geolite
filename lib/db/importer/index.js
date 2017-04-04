'use strict';

const download = require('download');
const del = require('delete');

module.exports = (config, db) => {
  const importer = {
    init: () => new Promise((resolve, reject) => {
      importer.update(db)
        .then(resolve)
        .catch(reject);
    }),
    update: () => new Promise((resolve, reject) => {
      const p = [];
      /* p.push(download(config.downloads.geolite2_city, config.downloads.location, {
        extract: true,
      }).then((files) => require('./handlers/geolite2_city')(db, config, files))); */
      p.push(download(config.downloads.geolite_asn, config.downloads.location, {
        extract: true,
      }).then((files) => require('./handlers/geolite_asn.js')(db, config, files)));
      p.push(download(config.downloads.geolite_asn_ipv6, config.downloads.location, {
        extract: true,
      }).then((files) => require('./handlers/geolite_asn_ipv6.js')(db, config, files)));
      Promise.all(p)
        .then(() => {
          // del(config.downloads.location, {
          //   force: true,
          // });
          resolve();
        })
        .catch(reject);
    }),
  };

  return importer;
};