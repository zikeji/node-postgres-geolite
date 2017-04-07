'use strict';

const fs = require('fs');
const csv = require('csv-streamify');

// since the amount of data is small compared to the blocks, we won't be streaming data directly to the database and instead processing all of it and then adding it to the database
const res = {};

const build_res = (line) => new Promise((resolve) => {
  if (!res[line.geoname_id]) {
    res[line.geoname_id] = {
      geoname_id: line.geoname_id,
      continent_code: line.continent_code,
      continent_names: {},
      country_iso_code: line.country_iso_code,
      country_names: {},
      subdivision_1_iso_code: line.subdivision_1_iso_code,
      subdivision_1_names: {},
      subdivision_2_iso_code: line.subdivision_1_iso_code,
      subdivision_2_names: {},
      city_names: {},
      metro_code: line.metro_code,
      time_zone: line.time_zone,
    };
  }
  res[line.geoname_id].continent_names[line.locale_code] = line.continent_name;
  res[line.geoname_id].country_names[line.locale_code] = line.country_name;
  res[line.geoname_id].subdivision_1_names[line.locale_code] = line.subdivision_1_name;
  res[line.geoname_id].subdivision_2_names[line.locale_code] = line.subdivision_2_name;
  res[line.geoname_id].city_names[line.locale_code] = line.city_name;
  resolve();
});

const parse_file = (path, db) => new Promise((resolve) => {
  const parser = csv({
    objectMode: true,
    columns: true,
  });

  const p = [];
  parser.on('data', (line) => {
    p.push(build_res(line));
  });

  parser.on('end', () => {
    Promise.all(p)
      .then(resolve);
  });

  fs.createReadStream(path, {
    encoding: 'utf-8',
  }).pipe(parser);
});

module.exports = (db, config, path_locs) => new Promise((resolve, reject) => {
  const p = [];
  for (let path_i = 0; path_i < path_locs.length; path_i++) {
    p.push(parse_file(path_locs[path_i], db));
  }
  Promise.all(p)
    .then(() => {
      resolve();
    })
    .catch(reject);
});