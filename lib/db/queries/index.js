'use strict';

const getIP = require('./getip');
const pretty = require('./pretty');

module.exports = (db) => {
  const ip = require('./ip');
  const geonames = require('./geonames');

  const queries = {
    get: (ipaddr) => new Promise((resolve, reject) => {
      ipaddr = getIP(ipaddr);
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
            .catch(reject);
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
            .catch(reject);
        }
      } else {
        reject({
          error: 'invalid_ip',
        });
      }
    }),
  };

  return queries;
};