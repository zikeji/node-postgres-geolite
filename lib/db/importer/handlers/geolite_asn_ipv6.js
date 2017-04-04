const fs = require('fs');
const byline = require('byline');

module.exports = (db, config, files) => new Promise((resolve, reject) => {
  db.none('DROP TABLE IF EXISTS geolite_asn_ipv6_new').then(() => {
    db.none('CREATE TABLE geolite_asn_ipv6_new (ip_cidr cidr, org varchar(50));').then(() => {
      for (let file_i = 0; file_i < files.length; file_i++) {
        if (files[file_i].path === 'GeoIPASNum2v6.csv') {
          const rs = byline(fs.createReadStream(`${config.downloads.location}/${files[file_i].path}`, {
            encoding: 'utf8',
          }));

          const acc = [
            [],
          ];
          let c = 0;
          rs.on('data', (line) => {
            const x = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
            const record = {
              ip_cidr: `${x[1]}/${x[3]}`,
              org: x[0].slice(1, -1),
            };
            if (acc[c].length > 10000) {
              c = acc.length;
              acc.push([]);
            }
            acc[c].push(record);
          });
          rs.on('end', () => {
            const cs = new db.$config.pgp.helpers.ColumnSet(['ip_cidr', 'org'], {
              table: 'geolite_asn_ipv6_new',
            });
            db.tx(t => t.batch(acc.map(set => t.none(db.$config.pgp.helpers.insert(set, cs)))))
              .then(() => {
                db.none('DROP TABLE IF EXISTS geolite_asn_ipv6; ALTER TABLE geolite_asn_ipv6_new RENAME TO geolite_asn_ipv6')
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