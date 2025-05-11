import publicSuffixList from "@gorhill/publicsuffixlist";

function domainToASCII(domain: string): string {
  // Do the necessary normalization for PSL parsing:
  // lowercasing, Unicode to Punycode, etc.
  return new URL("https://" + domain).hostname;
}

async function getLatestRawPSL(): Promise<string> {
  // NOTE: runtime external dependencies for this project
  // Prefer a minified PSL to save client bandwidth
  const pslURLs = [
    "https://psl.hrsn.dev/public_suffix_list.min.dat",
    "https://raw.githubusercontent.com/wdhdev/psl-formatted/refs/heads/main/list/public_suffix_list.min.dat",
    "https://publicsuffix.org/list/public_suffix_list.dat",
    "https://raw.githubusercontent.com/publicsuffix/list/refs/heads/main/public_suffix_list.dat",
  ];

  for (const url of pslURLs) {
    try {
      const res = await fetch(url);
      if (!res.ok || res.status !== 200) continue;
      return await res.text();
    } catch {
      /*continue*/
    }
  }

  throw new Error(
    "Failed to fetch the Public Suffix List (PSL) from any sources. Try to refresh the page and check your internet connection.",
  );
}

export async function loadPSL(): Promise<void> {
  const list = await getLatestRawPSL();
  publicSuffixList.parse(list, domainToASCII);
}

export interface URLComponents {
  scheme: "http" | "https";
  host: string;
  registrableDomain: string | null;
  publicSuffix: string | null;
  port: string | null; // null if default port for scheme
}

export function urlToComponents(url: URL): URLComponents {
  let publicSuffix = null; // a.k.a eTLD
  let registrableDomain = null; // a.k.a eTLD+1

  // @gorhill/publicsuffixlist doesn't handle FQDN;
  // must add the dot back later to both publicSuffix and registrableDomain
  const isTrailingDot = url.hostname.endsWith(".");
  const hostnameWithoutTrailingDot = isTrailingDot
    ? url.hostname.slice(0, -1)
    : url.hostname;

  // @gorhill/publicsuffixlist doesn't handle IP-addresses;
  // somewhat naive regex checks, but since input has gone through URL constructor
  // and hence validation & normalization, should be more than enough
  const isIPv6 = (hostname: string) => hostname.startsWith("[");
  const isIPv4 = (hostname: string) => /^\d+\.\d+\.\d+\.\d+$/.test(hostname);

  out: if (!(isIPv6(url.hostname) || isIPv4(url.hostname))) {
    publicSuffix = publicSuffixList.getPublicSuffix(hostnameWithoutTrailingDot);
    if (publicSuffix === "") {
      publicSuffix = null;
      // there won't be eTLD+1 if there's no eTLD
      registrableDomain = null;
      break out;
    }
    if (isTrailingDot) {
      publicSuffix += ".";
    }

    registrableDomain = publicSuffixList.getDomain(hostnameWithoutTrailingDot);
    if (registrableDomain === "") {
      registrableDomain = null;
      break out;
    }

    if (isTrailingDot) {
      registrableDomain += ".";
    }

    /*
    For wildcard rules like "*.user.fm" (without a rule "user.fm").
    At this point in code, registrable domain (eTLD+1) for input "user.fm" would be "user.fm" for input "user.fm",
    but shouldn't, since browsers treat "user.fm" as public suffix too in that case
    (and hence schemeless same-site scope should be "*://user.fm:*\/**", not "*://*.user.fm:*\/**")

    <https://github.com/publicsuffix/list/issues/2240>:
    """
    All browsers seem to implement the rule that a wildcard *.foo.com implies that foo.com is a public suffix as well
    """

    <https://github.com/publicsuffix/list/issues/2241>:
    """
    The documentation claims that cookies cannot be set on public suffixes but that is simply not true. [...]
    Domain cookies (with e.g. domain=example.com) automatically degrade to host cookies by having their domain string reset [...]
    """

    <https://datatracker.ietf.org/doc/html/draft-ietf-httpbis-rfc6265bis-20#section-5.7-3.9.1>:
    """
    If the user agent is configured to reject "public suffixes" and the domain-attribute is a public suffix:
    1. If the domain-attribute is identical to the canonicalized request-host:
      1. Let the domain-attribute be the empty string.
      Otherwise
      1. Abort these steps and ignore the cookie entirely.
    """

    ---

    Workaround: if "user.fm" is hostname, see if "_.user.fm" has a public suffix of
    "_.user.fm", which implies "user.fm" is a wildcard rule.
    Since it's a wildcard rule, "user.fm" is considered a public suffix and registrable domain null.
    
    Another testcase: "wc.psl.hrsn.dev" should yield public suffix "wc.psl.hrsn.dev" and registrable domain null.
     */

    // prefixLabel shall never appear in PSL, but be valid in URL syntax (ASCII, non-forbidden host code point)
    const prefixLabel = "_";
    const wildcardTestDomain = `${prefixLabel}.${hostnameWithoutTrailingDot}`; // e.g. "_.user.fm"
    const isHostnameWildcard =
      wildcardTestDomain ===
      publicSuffixList.getPublicSuffix(wildcardTestDomain);

    if (isHostnameWildcard) {
      publicSuffix = url.hostname;
      registrableDomain = null;
    }
  }

  const port = url.port === "" ? null : url.port;

  return {
    scheme: url.protocol.slice(0, -1) as "http" | "https",
    host: url.hostname,
    registrableDomain: registrableDomain,
    publicSuffix: publicSuffix,
    port: port,
  };
}
