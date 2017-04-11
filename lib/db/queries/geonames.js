'use strict';

module.exports = {
  get: (t, geoname_id) => t.oneOrNone('SELECT continent_code, country_iso_code, subdivision_1_iso_code, subdivision_2_iso_code, metro_code, time_zone FROM geolite2_city_locations WHERE geoname_id = $1', geoname_id),
  getCountry: (t, geoname_id) => t.oneOrNone('SELECT country_iso_code FROM geolite2_city_locations WHERE geoname_id = $1', geoname_id),
  getLocales: (t, geoname_id) => t.manyOrNone('SELECT locale_code, continent_name, country_name, subdivision_1_name, subdivision_2_name, city_name FROM geolite2_city_locations_locales WHERE geoname_id = $1 ORDER BY locale_code ASC', geoname_id),
  getCountryLocales: (t, geoname_id) => t.manyOrNone('SELECT locale_code, country_name FROM geolite2_city_locations_locales WHERE geoname_id = $1 ORDER BY locale_code ASC', geoname_id),
};