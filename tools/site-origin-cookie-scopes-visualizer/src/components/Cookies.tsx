import { URLComponents } from "../utils/psl.ts";
import { useEffect, useState } from "react";
import { ColoredComponents } from "../utils/color.ts";
import * as React from "react";
import {
  CookieSettings,
  updateName,
  updateDomain,
  updateIsSecure,
  updatePath,
} from "../utils/cookie.ts";

function InputCookieSettings({
  victimComponents,
  cookieSettings,
  onNameChange,
  onIsSecureChange,
  onDomainChange,
  onPathChange,
}: {
  victimComponents: URLComponents;
  cookieSettings: CookieSettings;
  onNameChange: (newName: string) => void;
  onIsSecureChange: (newIsSecure: boolean) => void;
  onDomainChange: (newDomain: string | null) => void;
  onPathChange: (newPath: string) => void;
}) {
  const currentCookieName =
    (cookieSettings.prefix ?? "") + cookieSettings.baseName;
  const cookieNameWithSecurePrefix = `__Secure-${cookieSettings.baseName}`;
  const cookieNameWithHostPrefix = `__Host-${cookieSettings.baseName}`;

  const domainNotSetString = "(not set)";
  const domainValue = cookieSettings.domain ?? domainNotSetString;
  const domainOptions: string[] = [];
  if (victimComponents.registrableDomain) {
    // example: if registrableDomain = "1.app.example.co.uk",
    // then domainOptions = ["1.app.example.co.uk", "app.example.co.uk", "example.co.uk"]
    const subdomainParts = victimComponents.host
      .substring(
        0,
        victimComponents.host.length -
          victimComponents.registrableDomain.length -
          1,
      )
      .split(".")
      .filter((x) => x !== "");

    const subdomains = subdomainParts.map(
      (_, i) =>
        subdomainParts.slice(i).join(".") +
        "." +
        victimComponents.registrableDomain,
    );

    domainOptions.push(victimComponents.registrableDomain);
    domainOptions.push(...subdomains.reverse());
  }
  const isDomainSelectDisabled =
    cookieSettings.prefix === "__Host-" || !victimComponents.registrableDomain;

  const isPathSelectDisabled = cookieSettings.prefix === "__Host-";

  const isSecureDisabled =
    victimComponents.scheme === "http" || cookieSettings.prefix !== null;

  const setterStringValue = `${currentCookieName}=value; Path=${cookieSettings.path}${cookieSettings.isSecure ? "; Secure" : ""}${cookieSettings.domain ? "; Domain=" + cookieSettings.domain : ""}`;

  return (
    <div className="mt-2 text-sm">
      <p className="text-sm">For a cookie with the following properties:</p>
      <div className="mt-1 border border-gray-200 rounded-md p-2 mb-2 flex-col flex space-y-4">
        <div>
          <label className="block mb-1 b-1 font-medium">Cookie name</label>
          <select
            value={currentCookieName}
            onChange={(e) => onNameChange(e.target.value)}
            className="px-2 py-1 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>{cookieSettings.baseName}</option>
            <option disabled={victimComponents.scheme === "http"}>
              {cookieNameWithSecurePrefix}
            </option>
            <option disabled={victimComponents.scheme === "http"}>
              {cookieNameWithHostPrefix}
            </option>
          </select>
          {victimComponents.scheme === "http" && (
            <span className="ml-1 text-gray-400">
              (prefixes disabled, target URL scheme is http)
            </span>
          )}
          <details className="text-gray-400 mt-1">
            <summary>Special prefixes</summary>
            <div>
              <p>
                <code>__Secure-</code> 🠢 <code>Secure</code> attribute must be
                used
              </p>
              <p>
                <code>__Host-</code> 🠢 <code>Secure</code> attribute must be
                used, <code>Domain</code> attribute must{" "}
                <span className="font-bold">NOT</span> be used,{" "}
                <code>Path</code> attribute must be <code>/</code>
              </p>
            </div>
          </details>
        </div>
        <div>
          <div className="font-medium mb-1">Attributes</div>

          <div className="flex flex-col space-y-2 ml-2">
            <div className="flex items-center">
              <label className="mr-1">Secure</label>
              <input
                checked={cookieSettings.isSecure}
                onChange={(e) => onIsSecureChange(e.target.checked)}
                type="checkbox"
                className="mr-2"
                disabled={isSecureDisabled}
              />
              {victimComponents.scheme === "http" && (
                <span className="ml-1 text-gray-400">
                  (disabled, target URL scheme is http)
                </span>
              )}
            </div>

            <div className="flex items-center">
              <label className="mr-1">Domain</label>
              <select
                value={domainValue}
                onChange={(e) => onDomainChange(e.target.value)}
                disabled={isDomainSelectDisabled}
                className={`px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDomainSelectDisabled ? "bg-gray-100" : ""}`}
              >
                <option value="">{domainNotSetString}</option>
                {domainOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
              {!victimComponents.registrableDomain && (
                <span className="ml-1 text-gray-400">
                  (disabled, target URL eTLD+1 is null)
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center">
                <label className="mr-1">Path</label>
                <select
                  value={cookieSettings.path}
                  onChange={(e) => onPathChange(e.target.value)}
                  disabled={isPathSelectDisabled}
                  className={`px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${isPathSelectDisabled ? "bg-gray-100" : ""}`}
                >
                  <option>/</option>
                  <option>/foo</option>
                  <option>/bar</option>
                  <option>/bar/baz</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="w-16 mb-1 h-[1px] bg-gray-200"></div>

        <div>
          <div className="font-medium mb-1">
            Setter string{" "}
            <span className="font-normal ">
              (for <code>Set-Cookie</code> or <code>document.cookie</code>)
            </span>
          </div>
          <input
            value={setterStringValue}
            type="text"
            disabled
            className="min-w-sm font-mono p-1 bg-gray-100 border border-gray-300 rounded-md"
            style={{ width: setterStringValue.length + 2 + "ch" }}
          />
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return <h3 className="text-lg mt-8 mb-2">{children}</h3>;
}

function Table({ children }: { children: React.ReactNode }) {
  return (
    <table className="mr-2 border w-[90vw] xl:max-w-7xl xl:justify-self-center">
      {children}
    </table>
  );
}

function TableHeader({
  th1 = "Action scope",
  th2 = "Action",
  th3 = "Note",
}: {
  th1?: string;
  th2?: string;
  th3?: string;
}) {
  return (
    <thead className="border">
      <tr>
        <th className="border">{th1}</th>
        <th className="border">{th2}</th>
        <th className="border">{th3}</th>
      </tr>
    </thead>
  );
}

function TableBody({
  children,
  id,
}: {
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <tbody className="border" id={id}>
      {children}
    </tbody>
  );
}

function TableRow({
  children,
  id,
}: {
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <tr className="border" id={id}>
      {children}
    </tr>
  );
}

function TableCellReadMore({
  children,
  rowSpan = 1,
}: {
  children: React.ReactNode;
  rowSpan?: number;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <TableCell rowSpan={rowSpan}>
      <div
        className={`relative ${isExpanded ? "" : "max-h-24 overflow-hidden"}`}
      >
        {children}
        {!isExpanded && (
          <div
            className="h-10 absolute bottom-0 left-0 w-full bg-gradient-to-b from-transparent to-white cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
          ></div>
        )}
      </div>

      <a
        className="text-gray-400 hover:text-gray-600 text-sm block text-center"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? "🞁" : "🞃"}
      </a>
    </TableCell>
  );
}

function TableCell({
  children,
  rowSpan = 1,
}: {
  children: React.ReactNode;
  rowSpan?: number;
}) {
  return (
    <td
      className="border p-2 first:text-nowrap nth-[2]:max-w-70 nth-[2]:min-w-70"
      rowSpan={rowSpan}
    >
      <ul className="list-disc list-inside">{children}</ul>
    </td>
  );
}

function LinkToRow({
  targetId,
  children,
}: {
  targetId: string;
  children: string;
}) {
  return (
    <a
      title="Go to action"
      onClick={(e) => {
        e.preventDefault();
        const el = document.querySelector(`#${targetId}`);
        if (!el) {
          console.error(`No element with id ${targetId} to go to`);
          return;
        }
        el.scrollIntoView({ behavior: "smooth", block: "center" });

        el.classList.add("bg-blue-200");
        setTimeout(() => {
          el.classList.add("transition-colors");
          el.classList.add("duration-500");
          el.classList.add("ease-in");
          el.classList.remove("bg-blue-200");
        }, 400);
      }}
      className="decoration-dotted"
    >
      {children}
    </a>
  );
}

function OutputCookieScopes({
  coloredComponents,
  victimComponents,
  cookieSettings,
}: {
  coloredComponents: ColoredComponents;
  victimComponents: URLComponents;
  cookieSettings: CookieSettings;
}) {
  const isSecure = cookieSettings.isSecure;
  const path = cookieSettings.path;
  const domain = cookieSettings.domain;
  const isCookieNamePrefixSecure = cookieSettings.prefix === "__Secure-";
  const isCookieNamePrefixHost = cookieSettings.prefix === "__Host-";
  const cookieName = (cookieSettings.prefix ?? "") + cookieSettings.baseName;

  // (dev note: should be DRY-ed out, repeating patterns in OutputSiteOriginScopesTable)
  const missingComponentColor = "bg-gray-200"; // if this gets shown, something went wrong
  const victimSchemeColor = coloredComponents.schemes[victimComponents.scheme];
  const victimHostColor = coloredComponents.hosts[victimComponents.host];
  const victimRegistrableDomainColor = victimComponents.registrableDomain
    ? coloredComponents.registrableDomains[victimComponents.registrableDomain]
    : missingComponentColor;
  const victimPortColor = victimComponents.port
    ? coloredComponents.ports[victimComponents.port]
    : missingComponentColor;

  const victimSchemelesslySameSiteScope = (
    <>
      *://
      {victimComponents.registrableDomain ? "**." : ""}
      {victimComponents.registrableDomain ? (
        <span className={victimRegistrableDomainColor}>
          {victimComponents.registrableDomain}
        </span>
      ) : (
        <span className={victimHostColor}>{victimComponents.host}</span>
      )}
      :*/**
    </>
  );

  const victimSchemefullySameSiteScope = (
    <>
      <span className={victimSchemeColor}>{victimComponents.scheme}</span>://
      {victimComponents.registrableDomain && "**."}
      {victimComponents.registrableDomain ? (
        <span className={victimRegistrableDomainColor}>
          {victimComponents.registrableDomain}
        </span>
      ) : (
        <span className={victimHostColor}>{victimComponents.host}</span>
      )}
      :*/**
    </>
  );

  const victimSameOriginScope = (
    <>
      <span className={victimSchemeColor}>{victimComponents.scheme}</span>://
      <span className={victimHostColor}>{victimComponents.host}</span>
      {victimComponents.port && (
        <>
          :<span className={victimPortColor}>{victimComponents.port}</span>
        </>
      )}
      /**
    </>
  );

  const purgeCookiesFromWholeSchemelessSiteScope = (
    <>
      https://
      {victimComponents.registrableDomain ? (
        <>
          **.
          <span className={victimRegistrableDomainColor}>
            {victimComponents.registrableDomain}
          </span>
        </>
      ) : (
        <span className={victimHostColor}>{victimComponents.host}</span>
      )}
      :*/**
    </>
  );

  // Only diff between readCookieScope and directModificationScope (overwrite/delete)
  // is path
  const readCookieScope = (
    <>
      {isSecure ? "https://" : "*://"}
      {!domain ? (
        <span className={victimHostColor}>{victimComponents.host}</span>
      ) : (
        victimComponents.registrableDomain && (
          <>
            **.
            {domain.substring(
              0,
              domain.length - victimComponents.registrableDomain.length,
            )}
            <span className={victimRegistrableDomainColor}>
              {victimComponents.registrableDomain}
            </span>
          </>
        )
      )}
      :*{path}
      {path === "/" ? "" : "/"}**
    </>
  );

  const directModificationScope = (
    <>
      {isSecure ? "https://" : "*://"}
      {!domain ? (
        <span className={victimHostColor}>{victimComponents.host}</span>
      ) : (
        victimComponents.registrableDomain && (
          <>
            **.
            {domain.substring(
              0,
              domain.length - victimComponents.registrableDomain.length,
            )}
            <span className={victimRegistrableDomainColor}>
              {victimComponents.registrableDomain}
            </span>
          </>
        )
      )}
      :*/**
    </>
  );

  const completelyNewCookieScope = (
    <>
      {isCookieNamePrefixSecure || isCookieNamePrefixHost ? "https://" : "*://"}
      {isCookieNamePrefixHost ? (
        <span className={victimHostColor}>{victimComponents.host}</span>
      ) : victimComponents.registrableDomain ? (
        <>
          **.
          <span className={victimRegistrableDomainColor}>
            {victimComponents.registrableDomain}
          </span>
        </>
      ) : (
        <span className={victimHostColor}>{victimComponents.host}</span>
      )}
      :*/**
    </>
  );
  const shadowingCookieScope = completelyNewCookieScope;
  const evictingCookieScope = (
    <>
      {isSecure ? "https://" : "*://"}
      {isCookieNamePrefixHost ? (
        <span className={victimHostColor}>{victimComponents.host}</span>
      ) : victimComponents.registrableDomain ? (
        <>
          **.
          <span className={victimRegistrableDomainColor}>
            {victimComponents.registrableDomain}
          </span>
        </>
      ) : (
        <span className={victimHostColor}>{victimComponents.host}</span>
      )}
      :*/**
    </>
  );

  return (
    <>
      <p className="text-sm mt-4">
        ... the following actions can be taken from shown scopes:
      </p>

      <div className="grid xl:justify-center">
        <SectionHeader>
          Directly interact with an already existing cookie{" "}
          <code>{cookieName}</code> set on target
        </SectionHeader>
        <Table>
          <TableHeader />
          <TableBody>
            <TableRow id="read">
              <TableCell>{readCookieScope}</TableCell>
              <TableCell>Read the cookie's value</TableCell>
              <TableCellReadMore>
                <li>
                  If cookie has the <code>HttpOnly</code> attribute set,
                  attacker must have control of a server in scope to read the{" "}
                  <code>Cookie</code> header from an HTTP request
                </li>
                <li>
                  <code>Path</code>{" "}
                  <a
                    href="https://html.spec.whatwg.org/#:~:text=the%20path%20restrictions%20on%20cookies"
                    target="_blank"
                  >
                    is not considered a security feature
                  </a>
                  : for server-side control, just make an HTTP request with the
                  needed path; for non-<code>HttpOnly</code> cookies, JavaScript
                  can be used to gain a window reference to the needed path
                  (e.g., via <code>iframe</code> or <code>window.open</code>) to
                  access <code>window.document.cookie</code> or{" "}
                  <code>window.cookieStore</code>. For anti-framing
                  restrictions, error pages may prove useful
                </li>
              </TableCellReadMore>
            </TableRow>
            <TableRow>
              <TableCell rowSpan={2}>{directModificationScope}</TableCell>
              <TableCell>Delete the cookie</TableCell>
              <TableCellReadMore rowSpan={2}>
                <li>
                  If cookie has <code>HttpOnly</code> attribute set, attacker
                  must have control of a server in scope to return{" "}
                  <code>Set-Cookie</code> header in HTTP response
                </li>
                <li>
                  It is still possible to indirectly delete an{" "}
                  <code>HttpOnly</code> cookie from JS by triggering{" "}
                  <LinkToRow targetId="evict">cookie eviction</LinkToRow>, and
                  then overwrite it
                </li>
                <li>
                  It is still possible to shadow an <code>HttpOnly</code> cookie
                  from JS with a{" "}
                  <LinkToRow targetId="shadow">competing cookie</LinkToRow>{" "}
                  (which is often equivalent to overwriting from target server's
                  perspective)
                </li>
              </TableCellReadMore>
            </TableRow>
            <TableRow>
              <TableCell>Overwrite the cookie's value</TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <SectionHeader>Create a new cookie that affects target</SectionHeader>
        <Table>
          <TableHeader />
          <TableBody>
            <TableRow>
              <TableCell>{completelyNewCookieScope}</TableCell>
              <TableCell>
                Create completely new cookie with name <code>{cookieName}</code>{" "}
                (does not exist in target's cookie store)
              </TableCell>
              <TableCell>
                <li>
                  The scope for cookie bombing is always as wide as just setting
                  a cookie with name <code>X</code> (no prefixes or{" "}
                  <code>Secure</code> attribute needed)
                </li>
                <li>
                  Without <code>__Secure-</code> or <code>__Host-</code> prefix,
                  the server has no way of telling if the cookie was set with
                  the <code>Secure</code> attribute
                </li>
              </TableCell>
            </TableRow>
            <TableRow id="shadow">
              <TableCell>{shadowingCookieScope}</TableCell>
              <TableCell>
                Create a competing a.k.a. shadowing cookie (exact name{" "}
                <code>{cookieName}</code> already exists)
              </TableCell>
              <TableCellReadMore>
                <li>
                  Successful result is two cookies with the exact same name, but
                  (possibly) different values
                </li>
                <li>
                  Something in the key of the new cookie must be different from
                  the original (<code>Path</code>, <code>Domain</code> or{" "}
                  <code>Partitioned</code> attribute)
                  <ul
                    className="list-inside ml-4"
                    style={{ listStyleType: "circle" }}
                  >
                    <li>
                      The same{" "}
                      <a
                        href="https://datatracker.ietf.org/doc/html/draft-ietf-httpbis-rfc6265bis-20#section-5.7-3.23.1"
                        target="_blank"
                      >
                        applies
                      </a>{" "}
                      to shadowing a <code>HttpOnly</code> cookie with non-
                      <code>HttpOnly</code> cookie
                    </li>
                  </ul>
                </li>

                <li>
                  If <code>Secure</code> is used for original cookie and its{" "}
                  <code>Path</code> is not <code>/</code> (but e.g.,{" "}
                  <code>/login</code>) and the attacker is from an insecure
                  connection, an alternative cookie can be created, but{" "}
                  <a
                    href="https://datatracker.ietf.org/doc/html/draft-ietf-httpbis-rfc6265bis-20#section-5.7-3.16.1"
                    target="_blank"
                  >
                    without a matching path
                  </a>{" "}
                  (e.g., <code>/</code> or <code>/foo</code> could be set, but
                  not <code>/login</code> or <code>/login/en</code>)
                </li>
                <li>
                  Currently, there's a{" "}
                  <a
                    href="https://bugzilla.mozilla.org/show_bug.cgi?id=1779993#c13:~:text=For%20example%2C%20normally%20an%20attacker%20can%27t%20overwrite%20an%20HttpOnly%20cookie%20from%20a%20non%2DHTTP%20context%20(e.g.%20document.cookie)%2C%20and%20we%20don%27t%20let%20a%20non%2Dsecure%20cookie%20overwrite%20a%20secure%20cookie.%20This%20trick%20doesn%27t%20literally%20overwrite%20them%2C%20but%20it%20can%20create%20spoofing%20copies."
                    target="_blank"
                  >
                    bug
                  </a>{" "}
                  in the specification where nameless cookies (e.g.,{" "}
                  <code>=name=value</code>) without prefixes can be used to
                  impersonate both
                  <ol className="list-decimal list-inside ml-4">
                    <li>
                      <code>HttpOnly</code> cookies from JS
                    </li>
                    <li>
                      <code>Secure</code> cookies from insecure origins
                    </li>
                  </ol>
                  without changing anything in the key of the cookie
                </li>
              </TableCellReadMore>
            </TableRow>
            <TableRow id="evict">
              <TableCell>{evictingCookieScope}</TableCell>
              <TableCell>
                Create new cookies to evict the existing cookie{" "}
                <code>{cookieName}</code> (which has
                {!isSecure ? " not got " : " "}the <code>Secure</code>{" "}
                attribute); a.k.a. cookie jar overflow
              </TableCell>
              <TableCell>
                <li>
                  Even <code>HttpOnly</code> cookies can be evicted from JS
                </li>
                <li>
                  The{" "}
                  <a
                    href="https://datatracker.ietf.org/doc/html/draft-ietf-httpbis-rfc6265bis-20#section-5.7-8"
                    target="_blank"
                  >
                    order of cookie eviction
                  </a>{" "}
                  defines that non-secure cookies are evicted before{" "}
                  <code>Secure</code> cookies
                </li>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <SectionHeader>
          Purge cookies from the whole schemeless site{" "}
          {victimSchemelesslySameSiteScope}
        </SectionHeader>
        <Table>
          <TableHeader />
          <TableBody>
            <TableRow>
              <TableCell>{purgeCookiesFromWholeSchemelessSiteScope}</TableCell>
              <TableCell>
                Delete all cookies for the whole schemeless site
              </TableCell>
              <TableCell>
                <li>
                  Attacker must have control of a server in scope to add{" "}
                  <a
                    href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Clear-Site-Data"
                    target="_blank"
                  >
                    <code>Clear-Site-Data</code>
                  </a>{" "}
                  header to HTTP response
                </li>
                <li>HTTPS is always required</li>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <SectionHeader>
          Target's cookie is attached to{" "}
          <a
            href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS#simple_requests"
            target="_blank"
          >
            simple
          </a>{" "}
          (non-preflighted) HTTP request to target URL (matching target cookie's{" "}
          <LinkToRow targetId="read">read&nbsp;scope</LinkToRow>) from attacker
          in {"<scope>"}
          <p className="text-sm text-gray-400">
            Basis for "CSRF" (or OSRF, On-Site Request Forgery) and XSSI attacks
          </p>
        </SectionHeader>

        <Table>
          <TableHeader th1={"<scope>"} th2="Policy applied" />
          <TableBody id="same-site">
            <TableRow>
              <TableCell>{victimSchemefullySameSiteScope}</TableCell>
              <TableCell>
                <i>Schemeful</i> same-site (Chrome)
              </TableCell>
              <TableCell rowSpan={2}>
                <li>
                  Always attached (the <code>SameSite</code> attribute has no
                  effect on same-site requests!)
                </li>
                <li>
                  Browsers like Firefox are expected to follow suit including
                  scheme in site definition{" "}
                  <a
                    href="https://bugzilla.mozilla.org/show_bug.cgi?id=1651119"
                    target="_blank"
                  >
                    at some point
                  </a>
                </li>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{victimSchemelesslySameSiteScope}</TableCell>
              <TableCell>
                <i>Schemeless</i> same-site (Firefox)
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <span>(doesn't match same-site)</span>
              </TableCell>
              <TableCell>Cross-site (depends on definition of site)</TableCell>
              <TableCell>
                <li>
                  A cookie may or may not be attached - depends if the{" "}
                  <code>SameSite</code> attribute is set, its value (e.g.,{" "}
                  <code>Lax</code> = only top-level GET requests allowed),
                  victim's browser and its settings (e.g.,{" "}
                  <a
                    href="https://developer.mozilla.org/en-US/docs/Web/Privacy/Guides/Third-party_cookies#how_do_browsers_handle_third-party_cookies"
                    target="_blank"
                  >
                    3rd-party cookie blocking
                  </a>
                  , separation per top-level site), etc.
                </li>
                <li>
                  <a
                    href="https://portswigger.net/web-security/csrf/bypassing-samesite-restrictions#bypassing-samesite-lax-restrictions-using-get-requests"
                    target="_blank"
                  >
                    Ideas
                  </a>{" "}
                  for bypassing restrictions
                </li>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <SectionHeader>
          Target's cookie is attached to non-
          <a
            href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS#simple_requests"
            target="_blank"
          >
            simple
          </a>{" "}
          HTTP request to target URL (matching target cookie's{" "}
          <LinkToRow targetId="read">read&nbsp;scope</LinkToRow>) from attacker
          in {"<scope>"}
        </SectionHeader>
        <Table>
          <TableHeader th1={"<scope>"} th2="Policy applied" />
          <TableBody>
            <TableRow>
              <TableCell>{victimSameOriginScope}</TableCell>
              <TableCell>Same-origin policy (SOP)</TableCell>
              <TableCell>
                <li>
                  <a
                    href="https://fetch.spec.whatwg.org/#credentials"
                    target="_blank"
                  >
                    Credentials
                  </a>{" "}
                  (including cookies) are included in same-origin requests{" "}
                  <a
                    href="https://fetch.spec.whatwg.org/#concept-request-credentials-mode"
                    target="_blank"
                  >
                    by default
                  </a>
                </li>
                <li>
                  Credentials can be explicitly omitted, e.g., in some HTML
                  elements via the <code>crossorigin</code>{" "}
                  <a
                    href="https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/crossorigin"
                    target="_blank"
                  >
                    {" "}
                    attribute
                  </a>{" "}
                  or in JS, Fetch API's <code>credentials</code>{" "}
                  <a
                    href="https://developer.mozilla.org/en-US/docs/Web/API/RequestInit#credentials"
                    target="_blank"
                  >
                    option
                  </a>{" "}
                  or XMLHttpRequest API's <code>withCredentials</code>{" "}
                  <a
                    href="https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials"
                    target="_blank"
                  >
                    property
                  </a>
                </li>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>(doesn't match same-origin)</TableCell>
              <TableCell>Cross-origin</TableCell>
              <TableCellReadMore>
                <li>
                  Cross-origin non-simple requests are preflighted. Note that a
                  CORS-preflight request itself{" "}
                  <a
                    href="https://fetch.spec.whatwg.org/#http-access-control-allow-credentials"
                    target="_blank"
                  >
                    never includes credentials
                  </a>{" "}
                  (TLS client certificates are currently included in Chromium, a{" "}
                  <a
                    href="https://issues.chromium.org/issues/40089326"
                    target="_blank"
                  >
                    bug
                  </a>
                  )
                </li>
                <li>
                  The response to the preflight request can indicate credentials
                  are allowed in the preflight<i>ed</i> request, minimally by
                  returning the{" "}
                  <code>Access-Control-Allow-Credentials: true</code> and{" "}
                  <code>
                    Access-Control-Allow-Origin: {"<requestor origin>"}
                  </code>{" "}
                  response headers
                </li>
                <li>
                  <LinkToRow targetId="same-site">SameSite</LinkToRow>{" "}
                  restrictions still apply to cookies
                </li>
                <li>
                  <a
                    href="https://portswigger.net/research/exploiting-cors-misconfigurations-for-bitcoins-and-bounties"
                    target="_blank"
                  >
                    CORS misconfigurations
                  </a>{" "}
                  like reflecting arbitrary origin may become handy
                </li>
              </TableCellReadMore>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </>
  );
}

function getValueFromHash(
  label: string,
  isBoolean: boolean,
): boolean | string | null {
  const params = new URLSearchParams(window.location.hash.substring(1));
  const value = params.get(label);
  if (!value) {
    return null;
  }
  if (isBoolean) {
    if (value === "true") {
      return true;
    }
    if (value === "false") {
      return false;
    }
  } else {
    return value;
  }
  return null;
}

export default function Cookies({
  coloredComponents,
  victimComponents,
}: {
  coloredComponents: ColoredComponents;
  victimComponents: URLComponents;
}) {
  const [cookieSettings, setCookieSettings] = useState<CookieSettings>(() => {
    // On the first load, try to take settings from URL hash
    let defaultCookieSettings: CookieSettings = {
      baseName: "X",
      prefix: null,
      isSecure: false,
      domain: null,
      path: "/",
    };

    // note: currently not dealing with invalid settings, e.g.
    // "Domain" attribute that doesn't match with target URL
    const maybePath = getValueFromHash("path", false);
    if (maybePath && typeof maybePath === "string") {
      defaultCookieSettings = updatePath(defaultCookieSettings, maybePath);
    }

    const maybeDomain = getValueFromHash("domain", false);
    if (maybeDomain && typeof maybeDomain === "string") {
      defaultCookieSettings = updateDomain(defaultCookieSettings, maybeDomain);
    }

    const maybeSecure = getValueFromHash("secure", true);
    if (maybeSecure && typeof maybeSecure === "boolean") {
      defaultCookieSettings = updateIsSecure(
        defaultCookieSettings,
        maybeSecure,
      );
    }

    const maybeName = getValueFromHash("name", false);
    if (maybeName && typeof maybeName === "string") {
      defaultCookieSettings = updateName(defaultCookieSettings, maybeName);
    }

    return defaultCookieSettings;
  });

  useEffect(() => {
    // don't persist Domain attribute if input URL host changes
    setCookieSettings((prevSettings) => updateDomain(prevSettings, null));
  }, [victimComponents.host]);

  useEffect(() => {
    // remove Secure (& related prefixes) if input URL scheme changes to HTTP
    if (victimComponents.scheme === "http") {
      setCookieSettings((prevSettings) => updateIsSecure(prevSettings, false));
    }
  }, [victimComponents.scheme]);

  useEffect(() => {
    // update URL hash on cookie settings change
    const params = new URLSearchParams(window.location.hash.substring(1));
    params.set("path", cookieSettings.path);
    params.set("secure", cookieSettings.isSecure.toString());
    if (cookieSettings.domain) {
      params.set("domain", cookieSettings.domain);
    } else {
      params.delete("domain");
    }
    params.set("name", (cookieSettings.prefix ?? "") + cookieSettings.baseName);

    const newHash = "#" + params.toString();
    if (newHash !== window.location.hash) {
      history.replaceState(null, "", newHash);
    }
  }, [cookieSettings, victimComponents.scheme, victimComponents.host]);

  function handleNameChange(newName: string) {
    setCookieSettings((prevSettings) => updateName(prevSettings, newName));
  }

  function handleIsSecureChange(isSecure: boolean) {
    setCookieSettings((prevSettings) => updateIsSecure(prevSettings, isSecure));
  }

  function handleDomainChange(newDomain: string | null) {
    if (newDomain === "") {
      newDomain = null;
    }
    setCookieSettings((prevSettings) => updateDomain(prevSettings, newDomain));
  }

  function handlePathChange(newPath: string) {
    setCookieSettings((prevSettings) => updatePath(prevSettings, newPath));
  }

  return (
    <div>
      <InputCookieSettings
        victimComponents={victimComponents}
        cookieSettings={cookieSettings}
        onNameChange={handleNameChange}
        onIsSecureChange={handleIsSecureChange}
        onDomainChange={handleDomainChange}
        onPathChange={handlePathChange}
      />
      <OutputCookieScopes
        coloredComponents={coloredComponents}
        victimComponents={victimComponents}
        cookieSettings={cookieSettings}
      />
      <div className="text-sm text-gray-400 mt-8 mb-4">
        The information represented in tables above is based on author's
        interpretation of{" "}
        <a
          href="https://datatracker.ietf.org/doc/html/draft-ietf-httpbis-rfc6265bis-20"
          target="_blank"
        >
          RFC6265bis version 20
        </a>{" "}
        and (mostly&nbsp;manual) testing of Firefox and Chromium as of May 2025.
        Models are always imperfect.
      </div>
    </div>
  );
}
