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
  CREATE TABLE geolite_asn_ipv6_new (network cidr NOT NULL, asn varchar(50) NOT NULL, org varchar(512));
  CREATE INDEX glv6_network_index_new ON geolite_asn_ipv6_new USING gist (network inet_ops);
  CREATE INDEX glv6_asn_index_new ON geolite_asn_ipv6_new (asn);`).then(() => {
    for (let file_i = 0; file_i < files.length; file_i++) {
      if (files[file_i].path.includes('GeoIPASNum2v6.csv')) {
        const cs = new db.$config.pgp.helpers.ColumnSet(['network', 'asn', 'org'], {
          table: 'geolite_asn_ipv6_new',
        });

        const parser = csv({
          objectMode: true,
        });

        let acc = [];
        const p = [];
        parser.on('data', (line) => {
          const asn_split = /^(AS\d+)(?: ([^"]+)|)$/g.exec(line[0]) || [null, null, line[0]];
          const record = {
            network: `${line[1]}/${line[3]}`,
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
              db.none(`DROP TABLE IF EXISTS geolite_asn_ipv6;
                ALTER TABLE geolite_asn_ipv6_new RENAME TO geolite_asn_ipv6;
                ALTER INDEX glv6_network_index_new RENAME TO glv6_network_index;
                ALTER INDEX glv6_asn_index_new RENAME TO glv6_asn_index;`)
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