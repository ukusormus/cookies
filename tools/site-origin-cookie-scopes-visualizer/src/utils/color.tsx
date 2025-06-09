import { URLComponents } from "./psl";

type Color = string;

export type ColoredComponents = {
  schemes: Record<"http" | "https", Color>;
  hosts: Record<string, Color>;
  registrableDomains: Partial<Record<string, Color>>;
  ports: Partial<Record<string, Color>>;
};

export default function toColoredComponents(
  components1: URLComponents,
  components2: URLComponents,
): ColoredComponents {
  // return an object that can be used to map a URL component to color,
  // so that the same color can be displayed for the same type of components
  // (but scheme "http" and host "http" shall have different colors)

  const schemes: Record<string, Color> = {};
  const hosts: Record<string, Color> = {};
  const registrableDomains: Record<string, Color> = {};
  const ports: Record<string, Color> = {};

  const httpColor = "bg-orange-100";
  const httpsColor = "bg-cyan-100";
  const host1Color = "bg-green-100";
  const host2Color = "bg-neutral-200";
  const registrableDomain1Color = "bg-violet-100";
  const registrableDomain2Color = "bg-lime-100";
  const port1Color = "bg-rose-100";
  const port2Color = "bg-yellow-100";

  if ("http" === components1.scheme || "http" == components2.scheme) {
    schemes["http"] = httpColor;
  }
  if ("https" === components1.scheme || "https" == components2.scheme) {
    schemes["https"] = httpsColor;
  }

  hosts[components1.host] = host1Color;
  if (components1.host !== components2.host) {
    hosts[components2.host] = host2Color;
  }

  if (components1.registrableDomain) {
    registrableDomains[components1.registrableDomain] = registrableDomain1Color;
  }
  if (
    components2.registrableDomain &&
    components1.registrableDomain !== components2.registrableDomain
  ) {
    registrableDomains[components2.registrableDomain] = registrableDomain2Color;
  }

  if (components1.port) {
    ports[components1.port] = port1Color;
  }
  if (components2.port && components1.port !== components2.port) {
    ports[components2.port] = port2Color;
  }

  return {
    schemes: schemes,
    hosts: hosts,
    registrableDomains: registrableDomains,
    ports: ports,
  };
}

/* Reusable JSX snippets */

const missingComponentColor = "bg-gray-200"; // if this gets shown to user, something went wrong

export function getColoredWildcardHost(
  components: URLComponents,
  coloredComponents: ColoredComponents,
) {
  const registrableDomainColor = components.registrableDomain
    ? coloredComponents.registrableDomains[components.registrableDomain]
    : missingComponentColor;
  const hostColor = coloredComponents.hosts[components.host];

  return (
    <>
      {components.registrableDomain ? (
        <>
          **.
          <span className={registrableDomainColor}>
            {components.registrableDomain}
          </span>
        </>
      ) : (
        <span className={hostColor}>{components.host}</span>
      )}
    </>
  );
}

export function getColoredSchemelessSameSite(
  components: URLComponents,
  coloredComponents: ColoredComponents,
) {
  const wildcardHost = getColoredWildcardHost(components, coloredComponents);
  return <>*://{wildcardHost}:*/**</>;
}

export function getColoredSchemefulSameSite(
  components: URLComponents,
  coloredComponents: ColoredComponents,
) {
  const wildcardHost = getColoredWildcardHost(components, coloredComponents);
  const schemeColor = coloredComponents.schemes[components.scheme];

  return (
    <>
      <span className={schemeColor}>{components.scheme}</span>://
      {wildcardHost}
      :*/**
    </>
  );
}

export function getColoredSameOrigin(
  components: URLComponents,
  coloredComponents: ColoredComponents,
) {
  const schemeColor = coloredComponents.schemes[components.scheme];
  const hostColor = coloredComponents.hosts[components.host];
  const portColor = components.port
    ? coloredComponents.ports[components.port]
    : missingComponentColor;

  return (
    <>
      <span className={schemeColor}>{components.scheme}</span>://
      <span className={hostColor}>{components.host}</span>
      {components.port && (
        <>
          :<span className={portColor}>{components.port}</span>
        </>
      )}
      /**
    </>
  );
}
