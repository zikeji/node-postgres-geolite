'use strict';

const fs = require('fs');
const byline = require('byline');

const parse_file = (path) => new Promise((resolve, reject) => {
  const rs = byline(fs.createReadStream(path, {
    encoding: 'utf-8',
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

  });
});

module.exports = (db, config, path_ips) => new Promise((resolve, reject) => {
  db.none(`DROP TABLE IF EXISTS geolite2_city;
  CREATE TABLE geolite2_city(network cidr, geoname_id int, registered_country_geoname_id int, represented_country_geoname_id int, postal_code varchar(10), latitude decimal, longitude decimal);
  CREATE UNIQUE INDEX gl_ip_index_new ON geolite_asn_new (ip_start, ip_end);
  CREATE INDEX gl_asn_index_new ON geolite_asn_new (asn);`).then(() => {
    const p = [];
    for (let path_i = 0; path_i < path_ips.length; path_i++) {
      p.push(parse_file(path_ips[path_i]));
    }
    Promise.all(p)
      .then((data) => {
        // handle
      })
      .catch(reject);
  }).catch(reject);
});