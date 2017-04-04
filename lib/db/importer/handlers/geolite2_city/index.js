'use strict';

module.exports = (db, config, files) => new Promise((resolve, reject) => {
  const path_ips = [];
  const path_locs = [];
  for (let file_i = 0; file_i < files.length; file_i++) {
    if (files[file_i].path.includes('GeoLite2-City-Blocks-IPv4')) {
      path_ips.push(`${config.downloads.location}/${files[file_i].path}`);
    } else if (files[file_i].path.includes('GeoLite2-City-Blocks-IPv4')) {
      path_ips.push(`${config.downloads.location}/${files[file_i].path}`);
    } else if (files[file_i].path.includes('GeoLite2-City-Blocks-IPv4')) {
      path_locs.push(`${config.downloads.location}/${files[file_i].path}`);
    }
  }
  const p = [];
  p.push(require('./ips.js')(db, config, path_ips));
  p.push(require('./locs.js')(db, config, path_locs));

  Promise.all(p)
    .then(resolve)
    .catch(reject);
  resolve();
});