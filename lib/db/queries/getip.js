'use strict';

const ip = require('ip-address');

const invalid_v4 = [
  new ip.Address4('0.0.0.0/8'),
  new ip.Address4('10.0.0.0/8'),
  new ip.Address4('100.64.0.0/10'),
  new ip.Address4('127.0.0.0/8'),
  new ip.Address4('127.0.53.53'),
  new ip.Address4('169.254.0.0/16'),
  new ip.Address4('172.16.0.0/12'),
  new ip.Address4('192.0.0.0/24'),
  new ip.Address4('192.0.2.0/24'),
  new ip.Address4('192.168.0.0/16'),
  new ip.Address4('198.18.0.0/15'),
  new ip.Address4('198.51.100.0/24'),
  new ip.Address4('203.0.113.0/24'),
  new ip.Address4('224.0.0.0/4'),
  new ip.Address4('240.0.0.0/4'),
  new ip.Address4('255.255.255.255/32'),
];

const invalid_v6 = [
  new ip.Address6('::/128'),
  new ip.Address6('::1/128'),
  new ip.Address6('::ffff:0:0/96'),
  new ip.Address6('::/96'),
  new ip.Address6('100::/64'),
  new ip.Address6('2001:10::/28'),
  new ip.Address6('2001:db8::/32'),
  new ip.Address6('fc00::/7'),
  new ip.Address6('fe80::/10'),
  new ip.Address6('fec0::/10'),
  new ip.Address6('2002::/24'),
  new ip.Address6('2002:a00::/24'),
  new ip.Address6('2002:7f00::/24'),
  new ip.Address6('2002:a9fe::/32'),
  new ip.Address6('2002:ac10::/28'),
  new ip.Address6('2002:c000::/40'),
  new ip.Address6('2002:c000:200::/40'),
  new ip.Address6('2002:c0a8::/32'),
  new ip.Address6('2002:c612::/31'),
  new ip.Address6('2002:c633:6400::/40'),
  new ip.Address6('2002:cb00:7100::/40'),
  new ip.Address6('2002:e000::/20'),
  new ip.Address6('2002:f000::/20'),
  new ip.Address6('2002:ffff:ffff::/48'),
  new ip.Address6('2001::/40'),
  new ip.Address6('2001:0:a00::/40'),
  new ip.Address6('2001:0:7f00::/40'),
  new ip.Address6('2001:0:a9fe::/48'),
  new ip.Address6('2001:0:ac10::/44'),
  new ip.Address6('2001:0:c000::/56'),
  new ip.Address6('2001:0:c000:200::/56'),
  new ip.Address6('2001:0:c0a8::/48'),
  new ip.Address6('2001:0:c612::/47'),
  new ip.Address6('2001:0:c633:6400::/56'),
  new ip.Address6('2001:0:cb00:7100::/56'),
  new ip.Address6('2001:0:e000::/36'),
  new ip.Address6('2001:0:f000::/36'),
  new ip.Address6('2001:0:ffff:ffff::/64'),
];

module.exports = (ipaddr) => {
  const ipv4 = new ip.Address4(ipaddr);
  const ipv6 = new ip.Address6(ipaddr);
  if (ipv4.isValid()) {
    if (invalid_v4.every((subnet) => !ipv4.isInSubnet(subnet))) {
      return ipv4;
    }
  } else if (ipv6.isValid()) {
    if (invalid_v6.every((subnet) => !ipv6.isInSubnet(subnet))) {
      return ipv6;
    }
  }
  return false;
};