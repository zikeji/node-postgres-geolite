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

const parse_file = (path, db, cs) => new Promise((resolve, reject) => {
  const parser = csv({
    objectMode: true,
    columns: true,
  });

  let acc = [];
  const p = [];
  parser.on('data', (line) => {
    const record = {
      network: line.network,
      geoname_id: line.geoname_id ? parseInt(line.geoname_id, 10) : null,
      registered_country_geoname_id: line.registered_country_geoname_id ? parseInt(line.registered_country_geoname_id, 10) : null,
      represented_country_geoname_id: line.represented_country_geoname_id ? parseInt(line.represented_country_geoname_id, 10) : null,
      postal_code: line.postal_code,
      latitude: parseFloat(line.latitude),
      longitude: parseFloat(line.longitude),
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
      .then(resolve)
      .catch(reject);
  });

  fs.createReadStream(path, {
    encoding: 'utf-8',
  }).pipe(parser);
});

module.exports = (db, config, proto, path_ips) => new Promise((resolve, reject) => {
  const dbname = `geolite2_city_${proto}`;
  const keyname = `gl2_${proto}`;
  db.none(`DROP TABLE IF EXISTS ${dbname}_new;
  CREATE TABLE ${dbname}_new (network cidr NOT NULL, geoname_id int, registered_country_geoname_id int, represented_country_geoname_id int, postal_code varchar(10), latitude decimal, longitude decimal);
  CREATE INDEX ${keyname}_network_index_new ON ${dbname}_new USING gist (network inet_ops);
  CREATE INDEX ${keyname}_geoname_index_new ON ${dbname}_new (geoname_id);
  CREATE INDEX ${keyname}_registered_county_geoname_index_new ON ${dbname}_new (registered_country_geoname_id);
  CREATE INDEX ${keyname}_represented_country_geoname_index_new ON ${dbname}_new (represented_country_geoname_id);
  CREATE INDEX ${keyname}_postal_code_index_new ON ${dbname}_new (postal_code);
  CREATE INDEX ${keyname}_coords_index_new ON ${dbname}_new (latitude, longitude);`).then(() => {
    const cs = new db.$config.pgp.helpers.ColumnSet(['network', 'geoname_id', 'registered_country_geoname_id', 'represented_country_geoname_id', 'postal_code', 'latitude', 'longitude'], {
      table: `${dbname}_new`,
    });

    const p = [];
    for (let path_i = 0; path_i < path_ips.length; path_i++) {
      p.push(parse_file(path_ips[path_i], db, cs));
    }
    Promise.all(p)
      .then(() => {
        db.none(`DROP TABLE IF EXISTS ${dbname};
        ALTER TABLE ${dbname}_new RENAME TO ${dbname};
        ALTER INDEX ${keyname}_network_index_new RENAME TO ${keyname}_network_index;
        ALTER INDEX ${keyname}_geoname_index_new RENAME TO ${keyname}_geoname_index;
        ALTER INDEX ${keyname}_registered_county_geoname_index_new RENAME TO ${keyname}_registered_county_geoname_index;
        ALTER INDEX ${keyname}_represented_country_geoname_index_new RENAME TO ${keyname}_represented_country_geoname_index;
        ALTER INDEX ${keyname}_postal_code_index_new RENAME TO ${keyname}_postal_code_index;
        ALTER INDEX ${keyname}_coords_index_new RENAME TO ${keyname}_coords_index;`)
          .then(resolve)
          .catch(reject);
      })
      .catch(reject);
  }).catch(reject);
});