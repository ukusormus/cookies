export default {
  Scheme: ["http://example.com/", "https://example.com/"],
  Subdomain: ["http://www.example.com/", "http://sub.www.example.com/"],
  Port: ["http://example.com:80/", "http://example.com:8080/"],
  // Path: ["http://example.com/a/", "http://example.com/a/b/"],
  // "6LD public suffix": ["https://sub.s3.dualstack.cn-north-1.amazonaws.com.cn"],
  "2LD public suffix": [
    "https://sub.github.io/",
    "https://uk.com/",
    "https://sub.uk.com/",
  ],
  FQDN: ["https://example.com./"],
  "Plain hostname (single label)": ["https://example/"],
  IPv4: ["http://192.0.2.1/"],
  IPv6: ["http://[2001:db8::]/"],
  "Unicode & Punycode": ["http://example.إختبار/"],
  "PSL wildcard & exception": [
    "http://x.any.wc.psl.hrsn.dev/",
    "http://x.thing.wc.psl.hrsn.dev/",
    "http://x.ignored.wc.psl.hrsn.dev/",
  ],
};
