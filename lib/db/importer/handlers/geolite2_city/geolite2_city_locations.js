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

const parse_file = (path, db, en, cs_locations, cs_locales) => new Promise((resolve, reject) => {
  const parser = csv({
    objectMode: true,
    columns: true,
  });

  let acc = {
    locations: [],
    locales: [],
  };
  const p = [];
  parser.on('data', (line) => {
    if (en) {
      const location = {
        geoname_id: line.geoname_id,
        continent_code: line.continent_code,
        country_iso_code: line.country_iso_code,
        subdivision_1_iso_code: line.subdivision_1_iso_code,
        subdivision_2_iso_code: line.subdivision_2_iso_code,
        metro_code: line.metro_code ? parseInt(line.metro_code, 10) : null,
        time_zone: line.time_zone,
      };
      acc.locations.push(location);
      if (acc.locations.length > 10000) {
        p.push(handle_set(db, acc.locations, cs_locations));
        acc.locations = [];
      }
    }

    const locale = {
      geoname_id: line.geoname_id,
      locale_code: line.locale_code,
      continent_name: line.continent_name,
      country_name: line.country_name,
      subdivision_1_name: line.subdivision_1_name,
      subdivision_2_name: line.subdivision_2_name,
      city_name: line.city_name,
    };
    acc.locales.push(locale);
    if (acc.locales.length > 10000) {
      p.push(handle_set(db, acc.locales, cs_locales));
      acc.locales = [];
    }
  });

  parser.on('end', () => {
    if (acc.locations.length > 0) p.push(handle_set(db, acc.locations, cs_locations));
    if (acc.locales.length > 0) p.push(handle_set(db, acc.locales, cs_locales));
    acc = null;
    Promise.all(p)
      .then(resolve)
      .catch(reject);
  });

  fs.createReadStream(path, {
    encoding: 'utf-8',
  }).pipe(parser);
});
// separate lang table unique geoname_id to locale_code index perform inserts alongside static data, dump the [res] object altogether.

module.exports = (db, config, path_locs) => new Promise((resolve, reject) => {
  const cs_locations = new db.$config.pgp.helpers.ColumnSet(['geoname_id', 'continent_code', 'country_iso_code', 'subdivision_1_iso_code', 'subdivision_2_iso_code', 'metro_code', 'time_zone'], {
    table: 'geolite2_city_locations_new',
  });
  const cs_locales = new db.$config.pgp.helpers.ColumnSet(['geoname_id', 'locale_code', 'continent_name', 'country_name', 'subdivision_1_name', 'subdivision_2_name', 'city_name'], {
    table: 'geolite2_city_locations_locales_new',
  });

  const p = [];
  db.none(`DROP TABLE IF EXISTS geolite2_city_locations_new;
  CREATE TABLE geolite2_city_locations_new (geoname_id int NOT NULL, continent_code VARCHAR(3), country_iso_code VARCHAR(3), subdivision_1_iso_code VARCHAR(4), subdivision_2_iso_code VARCHAR(4), metro_code INT, time_zone VARCHAR(42));
  CREATE UNIQUE INDEX gl2_loc_gid_index_new ON geolite2_city_locations_new (geoname_id);
  DROP TABLE IF EXISTS geolite2_city_locations_locales_new;
  CREATE TABLE geolite2_city_locations_locales_new (geoname_id int NOT NULL, locale_code VARCHAR(10) NOT NULL, continent_name TEXT, country_name TEXT, subdivision_1_name TEXT, subdivision_2_name TEXT, city_name TEXT);
  CREATE UNIQUE INDEX gl2_loc_gid_loc_index_new ON geolite2_city_locations_locales_new (geoname_id, locale_code);`)
    .then(() => {
      for (let path_i = 0; path_i < path_locs.length; path_i++) {
        let en = false;
        if (path_locs[path_i].includes('GeoLite2-City-Locations-en.csv')) en = true;
        p.push(parse_file(path_locs[path_i], db, en, cs_locations, cs_locales));
      }
      Promise.all(p)
        .then(() => {
          db.none(`DROP TABLE IF EXISTS geolite2_city_locations;
          ALTER TABLE geolite2_city_locations_new RENAME TO geolite2_city_locations;
          ALTER INDEX gl2_loc_gid_index_new RENAME TO gl2_loc_gid_index;
          DROP TABLE IF EXISTS geolite2_city_locations_locales;
          ALTER TABLE geolite2_city_locations_locales_new RENAME TO geolite2_city_locations_locales;
          ALTER INDEX gl2_loc_gid_loc_index_new RENAME TO gl2_loc_gid_loc_index;`)
            .then(resolve)
            .catch(reject);
        })
        .catch(reject);
    })
    .catch(reject);
});