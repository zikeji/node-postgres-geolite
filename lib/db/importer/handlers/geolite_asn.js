'use strict';

const fs = require('fs');
const byline = require('byline');
const ip = require('ip');

module.exports = (db, config, files) => new Promise((resolve, reject) => {
  db.none('DROP TABLE IF EXISTS geolite_asn_new').then(() => {
    db.none('CREATE TABLE geolite_asn_new (ip_start inet, ip_end inet, asn varchar(50), org varchar(512));').then(() => {
      for (let file_i = 0; file_i < files.length; file_i++) {
        if (files[file_i].path === 'GeoIPASNum2.csv') {
          const rs = byline(fs.createReadStream(`${config.downloads.location}/${files[file_i].path}`, {
            encoding: 'utf8',
          }));

          const acc = [
            [],
          ];
          let c = 0;
          rs.on('data', (line) => {
            const x = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
            const y = /^(?:"|)(AS\d+)(?: ([^"]+)|)(?:"|)$/g.exec(x[2]) || [null, null, x[2]];
            const record = {
              ip_start: ip.fromLong(parseInt(x[0], 10)),
              ip_end: ip.fromLong(parseInt(x[1], 10)),
              asn: y[1],
              org: y[2],
            };
            if (acc[c].length > 10000) {
              c = acc.length;
              acc.push([]);
            }
            acc[c].push(record);
          });
          rs.on('end', () => {
            const cs = new db.$config.pgp.helpers.ColumnSet(['ip_start', 'ip_end', 'asn', 'org'], {
              table: 'geolite_asn_new',
            });
            db.tx(t => t.batch(acc.map(set => t.none(db.$config.pgp.helpers.insert(set, cs)))))
              .then(() => {
                db.none('DROP TABLE IF EXISTS geolite_asn; ALTER TABLE geolite_asn_new RENAME TO geolite_asn')
                  .then(() => {
                    resolve();
                  })
                  .catch(reject);
              })
              .catch(reject);
          });
        }
      }
    }).catch(reject);
  }).catch(reject);
});