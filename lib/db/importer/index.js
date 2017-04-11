'use strict';

const download = require('download');
const decompress = require('decompress');
const del = require('delete');

module.exports = (config, db) => {
  const importer = {
    init: () => new Promise((resolve, reject) => {
      require('./dbvalidator')(db)
        .then(resolve)
        .catch(() => {
          importer.update(db)
            .then(resolve)
            .catch(reject);
        });
    }),
    update: () => new Promise((resolve, reject) => {
      const p = [];
      if (config.downloads.local) {
        p.push(decompress(config.downloads.resources.geolite2_city, config.downloads.location).then((files) => require('./handlers/geolite2_city')(db, config, files)));
        p.push(decompress(config.downloads.resources.geolite_asn, config.downloads.location).then((files) => require('./handlers/geolite_asn')(db, config, files)));
        p.push(decompress(config.downloads.resources.geolite_asn_ipv6, config.downloads.location).then((files) => require('./handlers/geolite_asn_ipv6')(db, config, files)));
      } else {
        p.push(download(config.downloads.resources.geolite2_city, config.downloads.location, {
          extract: true,
        }).then((files) => require('./handlers/geolite2_city')(db, config, files)));
        p.push(download(config.downloads.resources.geolite_asn, config.downloads.location, {
          extract: true,
        }).then((files) => require('./handlers/geolite_asn.js')(db, config, files)));
        p.push(download(config.downloads.resources.geolite_asn_ipv6, config.downloads.location, {
          extract: true,
        }).then((files) => require('./handlers/geolite_asn_ipv6.js')(db, config, files)));
      }
      Promise.all(p)
        .then(() => {
          if (config.downloads.cleanup) {
            del.promise(config.downloads.location, {
              force: true,
            }).then(resolve).catch(reject);
          } else {
            resolve();
          }
        })
        .catch(reject);
    }),
  };

  return importer;
};