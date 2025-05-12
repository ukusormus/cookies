import { URLComponents } from "../utils/psl.ts";
import { ColoredComponents } from "../utils/color.ts";

function Container({ children }: { children: React.ReactNode }) {
  return <div className="inline-flex flex-col justify-center">{children}</div>;
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono relative leading-8 whitespace-nowrap">
      {children}
    </div>
  );
}

function Component({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <span className={className}>{children}</span>;
}

function Label({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={`bg-linear-to-t from-white to-transparent ${className}`}>
      {children}
    </span>
  );
}

function Spacer({ children }: { children: React.ReactNode }) {
  return <span className="invisible">{children}</span>;
}

function VerticalLine({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`absolute top-7 w-0.5 h-20 bg-black brightness-[86%] ${className}`}
      style={style}
    ></div>
  );
}

function getSpacerText(maybeLonger: string, suffix: string) {
  // example: getSpacerText("app.example.co.uk", "co.uk") -> "app.example."
  return maybeLonger.substring(0, maybeLonger.length - suffix.length);
}

function VisualURLComponents({
  coloredComponents,
  components,
  title,
}: {
  coloredComponents: ColoredComponents;
  components: URLComponents;
  title: string;
}) {
  let spacerHostRegistrableDomain = "";
  if (components.registrableDomain != null) {
    spacerHostRegistrableDomain = getSpacerText(
      components.host,
      components.registrableDomain,
    );
  }
  let spacerRegistrableDomainPublicSuffix = "";
  if (components.publicSuffix != null) {
    if (components.registrableDomain != null) {
      spacerRegistrableDomainPublicSuffix = getSpacerText(
        components.host,
        components.publicSuffix,
      );
    } else {
      spacerRegistrableDomainPublicSuffix = getSpacerText(
        components.host,
        components.publicSuffix,
      );
    }
  }
  const spacerScheme = components.scheme + "://";

  const fallbackColor = "bg-gray-200"; // should never be used
  const schemeColor = coloredComponents.schemes[components.scheme];
  const hostColor = coloredComponents.hosts[components.host];
  const registrableDomainColor = components.registrableDomain
    ? coloredComponents.registrableDomains[components.registrableDomain]
    : fallbackColor;
  const portColor = components.port
    ? coloredComponents.ports[components.port]
    : fallbackColor;

  return (
    <Container>
      <p className="text-center font-bold mb-2">{title}</p>
      <Row>
        <Component className={schemeColor}>{components.scheme}</Component>://
        <Component className={hostColor}>{components.host}</Component>
        {components.port && (
          <>
            :<Component className={portColor}>{components.port}</Component>
          </>
        )}
        {/*scheme*/}
        <VerticalLine className={`left-[0.5ch] ${schemeColor}`} />
        {/*host*/}
        <VerticalLine
          className={
            (components.scheme === "https" ? `left-[8.5ch]` : `left-[7.5ch]`) +
            " " +
            hostColor
          }
        />
        {/*eTLD+1*/}
        {components.registrableDomain && (
          <VerticalLine
            className={`top-15 ${registrableDomainColor}`}
            style={{
              left:
                spacerScheme.length +
                spacerHostRegistrableDomain.length +
                0.5 +
                (components.host === components.registrableDomain ? 1 : 0) +
                "ch",
            }}
          />
        )}
        {/*eTLD*/}
        {components.publicSuffix && (
          <VerticalLine
            className="top-23 bg-transparent border-l border-dashed border-black"
            style={{
              left:
                spacerScheme.length +
                spacerRegistrableDomainPublicSuffix.length +
                0.5 +
                (!components.registrableDomain && components.host.length > 1
                  ? 1
                  : 0) +
                "ch",
            }}
          />
        )}
        {/*port*/}
        {components.port && (
          <VerticalLine
            className={portColor}
            style={{
              left: spacerScheme.length + components.host.length + 1.5 + "ch",
            }}
          />
        )}
      </Row>
      <Row>
        <Spacer>
          {spacerScheme}
          {spacerHostRegistrableDomain}
        </Spacer>
        <Component className={registrableDomainColor}>
          {components.registrableDomain}
        </Component>
      </Row>
      <Row>
        <Spacer>
          {spacerScheme}
          {spacerRegistrableDomainPublicSuffix}
        </Spacer>
        {components.publicSuffix && (
          <Component className="bg-white border-dashed border-1">
            {components.publicSuffix}
          </Component>
        )}
      </Row>
      <Row>
        <Label>scheme</Label>
        <Spacer>:{components.scheme === "https" ? "/" : ""}</Spacer>
        <Label>host</Label>
        <Spacer>
          {(spacerScheme + components.host).substring(
            ("scheme:" + "host").length +
              (components.scheme === "https" ? "/" : "").length,
          )}
          {components.port ? ":" : ""}
        </Spacer>
        {components.port ? <Label>port</Label> : ""}
      </Row>
      <Row>
        <Spacer>
          {spacerScheme}
          {spacerHostRegistrableDomain}
          {components.host === components.registrableDomain && "X"}
        </Spacer>
        <Label className={components.registrableDomain || "text-gray-200"}>
          {components.registrableDomain ? "eTLD+1" : " eTLD+1 = null"}
        </Label>
      </Row>
      <Row>
        <Spacer>
          {spacerScheme}
          {spacerRegistrableDomainPublicSuffix}
          {!components.registrableDomain && components.host.length > 1 && "X"}
        </Spacer>
        <Label className={components.publicSuffix || "text-gray-200"}>
          {components.publicSuffix ? "eTLD" : "eTLD = null"}
        </Label>
      </Row>
    </Container>
  );
}

export default function OutputVisualURLsComponentsArea({
  coloredComponents,
  victimComponents,
  attackerComponents,
}: {
  coloredComponents: ColoredComponents;
  victimComponents: URLComponents;
  attackerComponents: URLComponents;
}) {
  return (
    <div className="flex flex-col w-max">
      <div className="flex space-x-8 mt-4">
        <span className="w-0 m-0 ml-4"></span>
        <VisualURLComponents
          coloredComponents={coloredComponents}
          components={victimComponents}
          title="Target"
        />

        <div className="w-0.25 bg-gray-200"></div>

        <VisualURLComponents
          coloredComponents={coloredComponents}
          components={attackerComponents}
          title="Attacker"
        />
      </div>

      <div className="w-16 mb-1 h-[1px] bg-gray-200"></div>
      <details className="flex flex-col text-sm text-gray-400">
        <p>
          eTLD (effective top-level domain) ={" "}
          <a
            href="https://url.spec.whatwg.org/#host-public-suffix"
            className="underline"
            target="_blank"
          >
            public suffix
          </a>
        </p>
        <p>
          eTLD+1 ={" "}
          <a
            href="https://url.spec.whatwg.org/#host-registrable-domain"
            className="underline"
            target="_blank"
          >
            registrable domain
          </a>
        </p>
        <p className="mt-2 mb-4">
          Using the latest{" "}
          <a
            href="https://github.com/publicsuffix/list/blob/main/public_suffix_list.dat"
            className="underline"
            target="_blank"
          >
            Public Suffix List
          </a>
          .
        </p>
      </details>
    </div>
  );
}
