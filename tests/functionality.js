const geolite = require('../index.js');

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
  
})).catch(console.error);