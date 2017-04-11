'use strict';

const fs = require('fs');
const csv = require('csv-streamify');
const ip = require('ip');

const handle_set = (db, set, cs) => new Promise((resolve, reject) => {
  db.tx(t => t.none(db.$config.pgp.helpers.insert(set, cs)))
    .then(() => {
      resolve();
    })
    .catch(reject);
});

module.exports = (db, config, files) => new Promise((resolve, reject) => {
  db.none(`DROP TABLE IF EXISTS geolite_asn_new;
  CREATE TABLE geolite_asn_new(ip_start inet NOT NULL, ip_end inet NOT NULL, asn varchar(50) NOT NULL, org varchar(512));
  CREATE INDEX gl_ip_index_new ON geolite_asn_new (ip_start, ip_end);
  CREATE INDEX gl_asn_index_new ON geolite_asn_new (asn);`).then(() => {
    for (let file_i = 0; file_i < files.length; file_i++) {
      if (files[file_i].path.includes('GeoIPASNum2')) {
        const cs = new db.$config.pgp.helpers.ColumnSet(['ip_start', 'ip_end', 'asn', 'org'], {
          table: 'geolite_asn_new',
        });

        const parser = csv({
          objectMode: true,
        });

        let acc = [];
        const p = [];
        parser.on('data', (line) => {
          const asn_split = /^(AS\d+)(?: ([^"]+)|)$/g.exec(line[2]) || [null, null, line[2]];
          const record = {
            ip_start: ip.fromLong(parseInt(line[0], 10)),
            ip_end: ip.fromLong(parseInt(line[1], 10)),
            asn: asn_split[1],
            org: asn_split[2],
          };
          acc.push(record);
          if (acc.length > 10000) {
            p.push(handle_set(db, acc, cs));
            acc = [];
          }
        });

        parser.on('end', () => {
          if (acc.length > 0) p.push(handle_set(db, acc, cs));
          acc = null;
          Promise.all(p)
            .then(() => {
              db.none(`DROP TABLE IF EXISTS geolite_asn;
                ALTER TABLE geolite_asn_new RENAME TO geolite_asn;
                ALTER INDEX gl_ip_index_new RENAME TO gl_ip_index;
                ALTER INDEX gl_asn_index_new RENAME TO gl_asn_index;`)
                .then(resolve)
                .catch(reject);
            })
            .catch(reject);
        });

        fs.createReadStream(`${config.downloads.location}/${files[file_i].path}`, {
          encoding: 'latin1',
        }).pipe(parser);
      }
    }
  }).catch(reject);
});