'use strict';

module.exports = (db, config, files) => new Promise((resolve, reject) => {
  const path_ips_v4 = [];
  const path_ips_v6 = [];
  const path_locs = [];
  for (let file_i = 0; file_i < files.length; file_i++) {
    if (files[file_i].path.includes('GeoLite2-City-Blocks-IPv4')) {
      path_ips_v4.push(`${config.downloads.location}/${files[file_i].path}`);
    } else if (files[file_i].path.includes('GeoLite2-City-Blocks-IPv6')) {
      path_ips_v6.push(`${config.downloads.location}/${files[file_i].path}`);
    } else if (files[file_i].path.includes('GeoLite2-City-Locations')) {
      path_locs.push(`${config.downloads.location}/${files[file_i].path}`);
    }
  }
  const p = [];
  p.push(require('./geolite2_city_x')(db, config, 'ipv4', path_ips_v4));
  p.push(require('./geolite2_city_x')(db, config, 'ipv6', path_ips_v6));
  p.push(require('./geolite2_city_locations')(db, config, path_locs));

  Promise.all(p)
    .then(resolve)
    .catch(reject);
});