'use strict';

const validator = require('./validator.js');

module.exports = (db) => new Promise((resolve, reject) => {
  const p = [];

  p.push(validator.validate(db, {
    table_name: 'geolite2_city_ipv4',
    columns: ['network', 'geoname_id', 'registered_country_geoname_id', 'represented_country_geoname_id', 'postal_code', 'latitude', 'longitude', 'accuracy_radius'],
    indexes: ['gl2_ipv4_coords_index', 'gl2_ipv4_postal_code_index', 'gl2_ipv4_represented_country_geoname_index', 'gl2_ipv4_registered_county_geoname_index', 'gl2_ipv4_geoname_index', 'gl2_ipv4_network_index'],
  }));
  p.push(validator.validate(db, {
    table_name: 'geolite2_city_ipv6',
    columns: ['network', 'geoname_id', 'registered_country_geoname_id', 'represented_country_geoname_id', 'postal_code', 'latitude', 'longitude', 'accuracy_radius'],
    indexes: ['gl2_ipv6_coords_index', 'gl2_ipv6_postal_code_index', 'gl2_ipv6_represented_country_geoname_index', 'gl2_ipv6_registered_county_geoname_index', 'gl2_ipv6_geoname_index', 'gl2_ipv6_network_index'],
  }));
  p.push(validator.validate(db, {
    table_name: 'geolite2_city_locations',
    columns: ['geoname_id', 'continent_code', 'country_iso_code', 'subdivision_1_iso_code', 'subdivision_2_iso_code', 'metro_code', 'time_zone'],
    indexes: ['gl2_loc_gid_index'],
  }));
  p.push(validator.validate(db, {
    table_name: 'geolite2_city_locations_locales',
    columns: ['geoname_id', 'locale_code', 'continent_name', 'country_name', 'subdivision_1_name', 'subdivision_2_name', 'city_name'],
    indexes: ['gl2_loc_gid_loc_index'],
  }));
  p.push(validator.validate(db, {
    table_name: 'geolite_asn',
    columns: ['ip_start', 'ip_end', 'asn', 'org'],
    indexes: ['gl_ip_index', 'gl_asn_index'],
  }));
  p.push(validator.validate(db, {
    table_name: 'geolite_asn_ipv6',
    columns: ['network', 'asn', 'org'],
    indexes: ['glv6_network_index', 'glv6_asn_index'],
  }));

  Promise.all(p)
    .then(resolve)
    .catch(reject);
});