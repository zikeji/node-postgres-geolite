'use strict';

const assert = require('assert');
const geolite = require('../index.js');

describe('Initialization', function () {

  it('Connect to database & initialize tables with GeoLite Legacy & GeoLite2 data if necessary', function (done) {
    this.timeout(60000);

    geolite.init({
      database: {
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        database: 'geolite',
      },
      downloads: {
        location: './tmp',
        geolite2_city: 'http://geolite.maxmind.com/download/geoip/database/GeoLite2-City-CSV.zip',
        geolite_asn: 'http://download.maxmind.com/download/geoip/database/asnum/GeoIPASNum2.zip',
        geolite_asn_ipv6: 'http://download.maxmind.com/download/geoip/database/asnum/GeoIPASNum2v6.zip',
      },
    }).then((geoliteDB => {
      done();
      describe('Test Module API', function () {
        it('placeholder', function () {
          assert(true);
        });
      });
      /*
      describe('Update', function() {
        this.timeout(60000);
        it('Run update (reinitialize data from MaxMind)', function(done) {
          geoliteDB.update().then(() => done()).catch(done);
        });
      });
      */
    })).catch((done));
  });

});