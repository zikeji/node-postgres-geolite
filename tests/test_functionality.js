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
            .catch(function(error) {
              assert.equal(error.name, 'InvalidIPError');
            });
        });
        
        it('Query Private IPv4', function () {
          return geoliteDB.get('192.168.0.1')
            .then(function () {
              assert(false, 'should have failed but it didn\'t');
            })
            .catch(function(error) {
              assert.equal(error.name, 'InvalidIPError');
            });
        });

        it('Query Private IPv6', function () {
          return geoliteDB.get('fd8d:81de:43c1:f14f::')
            .then(function () {
              assert(false, 'should have failed but it didn\'t');
            })
            .catch(function(error) {
              assert.equal(error.name, 'InvalidIPError');
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

        const invalid_v4 = [0, 10, 100, 127, 169, 172, 192, 198, 203, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239, 240, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250, 251, 252, 253, 254, 255];
        const randIPv4 = () => {
          const s = Math.floor(Math.random() * 255) + 1;
          if (!invalid_v4.includes(s)) {
              return `${s}.${Math.floor(Math.random() * 255) + 1}.${Math.floor(Math.random() * 255) + 1}.${Math.floor(Math.random() * 255) + 1}`;
          }
          return randIPv4();
        };

        for (let i =0; i < 100; i++) {
          const iter_test = randIPv4();
          it(`Query ${iter_test}`, function () {
            return geoliteDB.get(iter_test)
              .then().catch((error) => assert.equal(error.name, 'IPNotFoundError'));
          });
        }
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