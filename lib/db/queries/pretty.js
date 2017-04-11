'use strict';

module.exports = (iploc, data) => {
  const isp = data[0];
  const geodata = data[1];
  const geodata_locales = data[2];

  const result = {};

  if (geodata) {
    result.city = {
      names: {},
    };
    result.continent = {
      code: geodata.continent_code.length > 0 ? geodata.continent_code : null,
      names: {},
    };
    result.country = {
      iso_code: geodata.country_iso_code.length > 0 ? geodata.country_iso_code : null,
      names: {},
    };
  }

  if (isp !== null && isp.asn.length > 0) {
    result.isp = {
      asn: isp.asn,
      org: isp.org.length > 0 ? isp.org : null,
    };
  }

  if (iploc.accuracy_radius && iploc.accuracy_radius.length > 0) {
    result.location = {
      accuracy_radius: iploc.accuracy_radius,
    };

    if (iploc.latitude && iploc.latitude.length > 0) result.location.latitude = iploc.latitude;
    if (iploc.longitude && iploc.longitude.length > 0) result.location.longitude = iploc.longitude;
    if (geodata.metro_code && geodata.metro_code.length > 0) result.location.metro_code = geodata.metro_code;
    if (geodata.time_zone && geodata.time_zone.length > 0) result.location.time_zone = geodata.time_zone;
  }

  if (iploc.postal_code && iploc.postal_code.length > 0) {
    result.postal = {
      code: iploc.postal_code,
    };
  }

  if (iploc.registered_country_geoname_id !== null) {
    const reg_country = data[3];
    const reg_country_locales = data[4];
    if (reg_country.country_iso_code.length > 0) {
      result.registered_country = {
        iso_code: reg_country.country_iso_code,
        names: {},
      };

      reg_country_locales.forEach(locale => {
        result.registered_country.names[locale.locale_code] = locale.country_name;
      });
    }
  }

  if (iploc.represented_country_geoname_id !== null) {
    let rep_country;
    let rep_country_locales;
    if (iploc.registered_country_geoname_id !== null) {
      rep_country = data[5];
      rep_country_locales = data[6];
    } else {
      rep_country = data[3];
      rep_country_locales = data[4];
    }

    if (rep_country.country_iso_code.length > 0) {
      result.represented_country = {
        iso_code: rep_country.country_iso_code,
        names: {},
      };

      rep_country_locales.forEach(locale => {
        if (locale.country_name.length > 0) result.represented_country.names[locale.locale_code] = locale.country_name;
      });
    }
  }

  if (geodata && (geodata.subdivision_1_iso_code.length > 0 || geodata.subdivision_2_iso_code.length > 0)) {
    result.subdivisions = [];
  }

  if (geodata && geodata.subdivision_1_iso_code.length > 0) {
    result.subdivisions[0] = {
      iso_code: geodata.subdivision_1_iso_code,
      names: {},
    };
  }

  if (geodata && geodata.subdivision_2_iso_code.length > 0) {
    result.subdivisions[1] = {
      iso_code: geodata.subdivision_2_iso_code,
      names: {},
    };
  }

  geodata_locales.forEach(locale => {
    if (locale.continent_name.length > 0) result.continent.names[locale.locale_code] = locale.continent_name;
    if (locale.country_name.length > 0) result.country.names[locale.locale_code] = locale.country_name;
    if (locale.subdivision_1_name.length > 0) result.subdivisions[0].names[locale.locale_code] = locale.subdivision_1_name;
    if (locale.subdivision_2_name.length > 0) result.subdivisions[1].names[locale.locale_code] = locale.subdivision_2_name;
    if (locale.city_name.length > 0) result.city.names[locale.locale_code] = locale.city_name;
  });

  return result;
};