import { URLComponents } from "../utils/psl.ts";
import { ColoredComponents } from "../utils/color.tsx";
import {
  getColoredSameOrigin,
  getColoredSchemefulSameSite,
  getColoredSchemelessSameSite,
} from "../utils/color.tsx";

function Row({
  isEqual,
  cell1,
  cell2,
  scopeTitle,
  scopeNotes,
}: {
  isEqual: boolean;
  cell1: React.ReactNode;
  cell2: React.ReactNode;
  scopeTitle: string;
  scopeNotes?: React.ReactNode;
}) {
  const symbolScopeMatch = (
    <span className="before:content-['✓'] before:text-green-700 before:mr-1"></span>
  );
  const symbolScopeMismatch = (
    <span className="before:content-['✗'] before:text-red-700 before:mr-1"></span>
  );

  return (
    <tr className="text-nowrap border">
      {isEqual ? (
        <td colSpan={2} className="text-center font-mono p-2 border">
          {cell1}
        </td>
      ) : (
        <>
          <td className="font-mono p-2 border">{cell1}</td>
          <td className="font-mono p-2 border">{cell2}</td>
        </>
      )}
      <td
        className={`p-2 text-nowrap ${isEqual ? "bg-green-50" : "bg-red-50"}`}
      >
        {isEqual ? symbolScopeMatch : symbolScopeMismatch}
        <span
          className={`font-bold ${isEqual ? "text-green-700" : "text-red-700"}`}
        >
          {scopeTitle}
        </span>
        {scopeNotes && <div className="text-gray-400">{scopeNotes}</div>}
      </td>
    </tr>
  );
}

export default function OutputSiteOriginScopesTable({
  coloredComponents,
  victimComponents,
  attackerComponents,
}: {
  coloredComponents: ColoredComponents;
  victimComponents: URLComponents;
  attackerComponents: URLComponents;
}) {
  const victimSchemelesslySameSite =
    victimComponents.registrableDomain || victimComponents.host;
  const attackerSchemelesslySameSite =
    attackerComponents.registrableDomain || attackerComponents.host;
  const isSchemelesslySameSite =
    victimSchemelesslySameSite === attackerSchemelesslySameSite;
  const isSchemefullySameSite =
    isSchemelesslySameSite &&
    victimComponents.scheme === attackerComponents.scheme;
  const isSameOrigin =
    victimComponents.scheme === attackerComponents.scheme &&
    victimComponents.host === attackerComponents.host &&
    victimComponents.port === attackerComponents.port;

  const noteMark1 = (
    <sup className="before:content-['1'] before:text-gray-400"></sup>
  );
  const noteMark2 = (
    <sup className="before:content-['2'] before:text-gray-400"></sup>
  );

  const victimSchemelesslySameSiteScope = getColoredSchemelessSameSite(
    victimComponents,
    coloredComponents,
  );
  const attackerSchemelesslySameSiteScope = getColoredSchemelessSameSite(
    attackerComponents,
    coloredComponents,
  );
  const victimSchemefullySameSiteScope = getColoredSchemefulSameSite(
    victimComponents,
    coloredComponents,
  );
  const attackerSchemefullySameSiteScope = getColoredSchemelessSameSite(
    attackerComponents,
    coloredComponents,
  );
  const victimSameOriginScope = getColoredSameOrigin(
    victimComponents,
    coloredComponents,
  );
  const attackerSameOriginScope = getColoredSameOrigin(
    attackerComponents,
    coloredComponents,
  );

  return (
    <div className="mt-4 w-fit pr-8">
      <table className="border-collapse">
        <thead>
          <tr>
            <th className="border-r">Target</th>
            <th className="border-r">Attacker</th>
            <th>Scope</th>
          </tr>
        </thead>
        <tbody className="border-collapse border">
          <Row
            isEqual={isSchemelesslySameSite}
            cell1={victimSchemelesslySameSiteScope}
            cell2={attackerSchemelesslySameSiteScope}
            scopeTitle="schemelessly same-site"
            scopeNotes={<>(eTLD+1) must match{noteMark1}</>}
          />

          <Row
            isEqual={isSchemefullySameSite}
            cell1={victimSchemefullySameSiteScope}
            cell2={attackerSchemefullySameSiteScope}
            scopeTitle="schemefully same-site"
            scopeNotes={<>(scheme, eTLD+1) must match{noteMark1}</>}
          />

          <Row
            isEqual={isSameOrigin}
            cell1={victimSameOriginScope}
            cell2={attackerSameOriginScope}
            scopeTitle="same-origin"
            scopeNotes={<>(scheme, host, port) must match{noteMark2}</>}
          />
        </tbody>
      </table>

      <details className="flex flex-col text-sm text-gray-400 mt-2">
        <summary>Details</summary>
        <div>
          {noteMark1} if eTLD+1 is null, then exact host match is needed (no
          subdomains); eTLD+1 can be null in several situations, including when
          host is an IP address or host itself is a public suffix (e.g.,{" "}
          <code>uk.com</code>, without a subdomain)
        </div>
        <div className="mb-4">
          {noteMark2}{" "}
          <span>
            same-origin scope for DOM (Document Object Model) access across
            frames/windows can be relaxed with <code>document.domain</code>{" "}
            setter if <i>both</i> parties use it; this is{" "}
            <a
              className="underline"
              href="https://developer.chrome.com/blog/document-domain-setter-deprecation#browser-compatibility"
              target="_blank"
            >
              being phased out
            </a>
            ;
          </span>{" "}
          <span>
            the scope for reading HTTP responses can be relaxed with CORS
            (Cross-Origin Resource Sharing) headers
          </span>
        </div>
      </details>
    </div>
  );
}
