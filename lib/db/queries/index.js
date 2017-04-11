'use strict';

const getIP = require('./getip');
const pretty = require('./pretty');

const InvalidIPError = require('./invalidiperror');
const IPNotFoundError = require('./ipnotfounderror');

module.exports = (db) => {
  const ip = require('./ip');
  const geonames = require('./geonames');

  const queries = {
    get: (ipaddrin) => new Promise((resolve, reject) => {
      const ipaddr = getIP(ipaddrin);
      if (ipaddr) {
        if (ipaddr.v4) {
          ip.getv4(db, ipaddr.address)
            .then(iploc => {
              db.task(t => {
                const ops = [ip.getASNv4(t, ipaddr.address), geonames.get(t, iploc.geoname_id), geonames.getLocales(t, iploc.geoname_id)];
                if (iploc.registered_country_geoname_id !== null) {
                  ops.push(geonames.getCountry(t, iploc.registered_country_geoname_id));
                  ops.push(geonames.getCountryLocales(t, iploc.registered_country_geoname_id));
                }
                if (iploc.represented_country_geoname_id !== null) {
                  ops.push(geonames.getCountry(t, iploc.represented_country_geoname_id));
                  ops.push(geonames.getCountryLocales(t, iploc.represented_country_geoname_id));
                }
                return t.batch(ops);
              })
              .then(data => {
                resolve(pretty(iploc, data));
              })
              .catch(reject);
            })
            .catch(() => {
              reject(new IPNotFoundError('not found', ipaddr.address));
            });
        } else {
          ip.getv6(db, ipaddr.address)
            .then(iploc => {
              db.task(t => {
                const ops = [ip.getASNv6(t, ipaddr.address), geonames.get(t, iploc.geoname_id), geonames.getLocales(t, iploc.geoname_id)];
                if (iploc.registered_country_geoname_id !== null) {
                  ops.push(geonames.getCountry(t, iploc.registered_country_geoname_id));
                  ops.push(geonames.getCountryLocales(t, iploc.registered_country_geoname_id));
                }
                if (iploc.represented_country_geoname_id !== null) {
                  ops.push(geonames.getCountry(t, iploc.represented_country_geoname_id));
                  ops.push(geonames.getCountryLocales(t, iploc.represented_country_geoname_id));
                }
                return t.batch(ops);
              })
              .then(data => {
                resolve(pretty(iploc, data));
              })
              .catch(reject);
            })
            .catch(() => {
              reject(new IPNotFoundError('not found', ipaddr.address));
            });
        }
      } else {
        reject(new InvalidIPError('invalid ip', ipaddrin));
      }
    }),
  };

  return queries;
};