'use strict';

const fs = require('fs');
const csv = require('csv-streamify');

const handle_set = (db, set, cs) => new Promise((resolve, reject) => {
  db.tx(t => t.none(db.$config.pgp.helpers.insert(set, cs)))
    .then(() => {
      resolve();
    })
    .catch(reject);
});

module.exports = (db, config, files) => new Promise((resolve, reject) => {
  db.none(`DROP TABLE IF EXISTS geolite_asn_ipv6_new;
  CREATE TABLE geolite_asn_ipv6_new (ip_cidr cidr, asn varchar(50), org varchar(512));
  CREATE UNIQUE INDEX glv6_ip_index_new ON geolite_asn_ipv6_new (ip_cidr);
  CREATE INDEX glv6_asn_index_new ON geolite_asn_ipv6_new (asn);`).then(() => {
    for (let file_i = 0; file_i < files.length; file_i++) {
      if (files[file_i].path.includes('GeoIPASNum2v6.csv')) {
        const cs = new db.$config.pgp.helpers.ColumnSet(['ip_cidr', 'asn', 'org'], {
          table: 'geolite_asn_ipv6_new',
        });

        const parser = csv({
          objectMode: true,
        });

        fs.createReadStream(`${config.downloads.location}/${files[file_i].path}`, {
          encoding: 'latin1',
        }).pipe(parser);

        let acc = [];
        const p = [];
        parser.on('data', (line) => {
          const asn_split = /^(AS\d+)(?: ([^"]+)|)$/g.exec(line[0]) || [null, null, line[0]];
          const record = {
            ip_cidr: `${line[1]}/${line[3]}`,
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
          p.push(handle_set(db, acc, cs));
          Promise.all(p)
            .then(() => {
              db.none(`DROP TABLE IF EXISTS geolite_asn_ipv6;
                ALTER TABLE geolite_asn_ipv6_new RENAME TO geolite_asn_ipv6;
                ALTER INDEX glv6_ip_index_new RENAME TO glv6_ip_index;
                ALTER INDEX glv6_asn_index_new RENAME TO glv6_asn_index;`)
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
});