'use strict';

const download = require('download');
const del = require('delete');

module.exports = (config, db) => {
  const importer = {
    init: () => new Promise((resolve, reject) => {
      importer.update(db)
        .then(() => {
          resolve();
        })
        .catch(reject);
    }),
    update: () => new Promise((resolve, reject) => {
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
      Promise.all([p2, p3])
        .then(() => {
          del(config.downloads.location);
          resolve();
        })
        .catch(reject);
    }),
  };

  return importer;
};