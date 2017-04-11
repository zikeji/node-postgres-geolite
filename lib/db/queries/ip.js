'use strict';

module.exports = {
  getv4: (t, ip) => t.one('SELECT geoname_id, registered_country_geoname_id, represented_country_geoname_id, postal_code, latitude, longitude, accuracy_radius FROM geolite2_city_ipv4 WHERE $1::inet <<= network', ip),
  getv6: (t, ip) => t.one('SELECT geoname_id, registered_country_geoname_id, represented_country_geoname_id, postal_code, latitude, longitude, accuracy_radius FROM geolite2_city_ipv6 WHERE $1::inet <<= network', ip),
  getASNv4: (t, ip) => t.one('SELECT asn, org FROM geolite_asn WHERE $1::inet BETWEEN ip_start AND ip_end', ip),
  getASNv6: (t, ip) => t.one('SELECT asn, org FROM geolite_asn_ipv6 WHERE $1::inet <<= network', ip),
};