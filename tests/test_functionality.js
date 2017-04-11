'use strict';

const assert = require('assert');
const geolite = require('../index.js');

describe('Initialization', function () {

  it('Connect to database & initialize tables with GeoLite Legacy & GeoLite2 data if necessary', function (done) {
    this.timeout(5 * 60 * 1000);

    geolite.init({
      database: {
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        database: 'geolite',
      },
      downloads: {
        location: './tmp',
        cleanup: true,
        local: false,
        resources: {
          geolite2_city: 'http://geolite.maxmind.com/download/geoip/database/GeoLite2-City-CSV.zip',
          geolite_asn: 'http://download.maxmind.com/download/geoip/database/asnum/GeoIPASNum2.zip',
          geolite_asn_ipv6: 'http://download.maxmind.com/download/geoip/database/asnum/GeoIPASNum2v6.zip',
        }
      },
    }).then(geoliteDB => {
      done();
      describe('Test Module API', function () {
        it('Query Invalid IP', function () {
          return geoliteDB.get('256.256.256.256')
            .then(function () {
              assert(false, 'should have failed but it didn\'t');
            })
            .catch(function(rejected) {
              assert.equal(rejected.error, 'invalid_ip');
            });
        });
        
        it('Query Private IPv4', function () {
          return geoliteDB.get('192.168.0.1')
            .then(function () {
              assert(false, 'should have failed but it didn\'t');
            })
            .catch(function(rejected) {
              assert.equal(rejected.error, 'invalid_ip');
            });
        });

        it('Query Private IPv6', function () {
          return geoliteDB.get('fd8d:81de:43c1:f14f::')
            .then(function () {
              assert(false, 'should have failed but it didn\'t');
            })
            .catch(function(rejected) {
              assert.equal(rejected.error, 'invalid_ip');
            });
        });

        it('Query 8.8.8.8', function () {
          return geoliteDB.get('8.8.8.8')
            .then(function (result) {
              assert.equal(result.isp.asn, 'AS15169');
            });
        });

        it('Query 2001:4860:4860::8888', function () {
          return geoliteDB.get('2001:4860:4860::8888')
            .then(function (result) {
              assert.equal(result.isp.asn, 'AS15169');
            });
        });
      });

      // describe('Update', function () {
      //   this.timeout(5 * 60 * 1000);
      //   it('Run update (reinitialize data from MaxMind)', function (done) {
      //     geoliteDB.update().then(() => done()).catch(done);
      //   });
      // });

    }).catch((done));
  });

});