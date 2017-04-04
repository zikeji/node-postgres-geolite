'use strict';
const download = require('download');
const del = require('delete');

module.exports = (config) => {
  const importer = {
    init: (db) => new Promise((resolve, reject) => {
      importer.update(db)
        .then(() => {
          resolve();
        })
        .catch(reject);
    }),
    update: (db) => new Promise((resolve, reject) => {
      /* const p1 = download(config.downloads.geolite2_city, config.downloads.location, {
        extract: true,
      }).then((files) => {

      }).catch(reject); */
      const p2 = download(config.downloads.geolite_asn, config.downloads.location, {
        extract: true,
      }).then((files) => require('./handlers/geolite_asn.js')(db, config, files));
      const p3 = download(config.downloads.geolite_asn_ipv6, config.downloads.location, {
        extract: true,
      }).then((files) => require('./handlers/geolite_asn_ipv6.js')(db, config, files));
      Promise.all([p2])
        .then(() => {
          // todo: cleanup
          del(config.downloads.location);
          resolve();
        })
        .catch(reject);
    }),
  };
  return importer;
};