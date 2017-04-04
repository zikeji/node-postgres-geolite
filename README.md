# node-postgres-geolite [![npm version](https://badge.fury.io/js/postgres-geolite.svg)](https://badge.fury.io/js/postgres-geolite) [![Build Status](https://travis-ci.org/zikeji/node-postgres-geolite.svg?branch=master)](https://travis-ci.org/zikeji/node-postgres-geolite)

MaxMind Geolite PostgreSQL importer & interface to provide lookups for country, city, timezone, area code, ISP, etc.

This Node.js module will allow you to import the GeoIP2 and Geolite Legacy ASN information into a PostgreSQL Database and then query it in your application using the provided interface.

## NOTICE

This module is in pre-pre-pre alpha and is not ready for use!

## Requirements

- PostgreSQL >= 9.4

## Install
```
$ npm install --save postgres-geolite
```

## Performance

### Initializing & updating the database

**System:** Intel Core i5 6600K running Windows 10 with the PostgreSQL DB on a SATA 6Gbps SSD
**Result:** ~11 second build times (once full testing is done I'll be getting a larger sample for build times and possible a second system)

Building gets done on secondary tables, and when complete the original table gets dropped and replaced with the new one. This is what I considered the best approach for minimizing potential downtime during an update.

You can also refer to the tests on Travis-CI for performance.

### Queries

Thanks to the built in operator class GiST [inet_ops](https://www.postgresql.org/docs/current/static/gist-builtin-opclasses.html), queries take ~30ms on my test system. The test cases ran on Travis-CI can also give you an idea of expected performance on systems with their infrastructure.

## Usage

GeoLite2 City: https://dev.maxmind.com/geoip/geoip2/geolite2/
GeoLite ASN IPv4 + IPv6: https://dev.maxmind.com/geoip/legacy/geolite/

set config

geolite.init = geoliteDB
if the DB has not be initialized, it will download the CSVs and import them as well as create the relevant tables, otherwise no operation will be performed

geoliteDB.update
downloads the CSVs and updates the database with any new information, should be run once a month or so

## API

## License

MIT © [Caleb Blankemeyer](https://github.com/zikeji)

While I'm not technically including the data, I'm including the licensing disclaimers as per [GeoLite Documentation](https://dev.maxmind.com/geoip/legacy/geolite/) & [GeoLite 2 Documentation](https://dev.maxmind.com/geoip/geoip2/geolite2/)

>This product includes GeoLite2 data created by MaxMind, available from [http://www.maxmind.com](http://www.maxmind.com).

>This product includes GeoLite data created by MaxMind, available from [http://www.maxmind.com](http://www.maxmind.com).