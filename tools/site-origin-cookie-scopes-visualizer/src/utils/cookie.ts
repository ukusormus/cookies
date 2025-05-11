interface BaseCookieSettings {
  baseName: string;
  path: string;
  isSecure: boolean;
  domain: string | null;
}

export type CookieSettings =
  | (BaseCookieSettings & {
      prefix: "__Host-";
      isSecure: true;
      path: "/";
      domain: null;
    })
  | (BaseCookieSettings & {
      prefix: "__Secure-";
      isSecure: true;
    })
  | (BaseCookieSettings & {
      prefix: null;
    });

export function updateName(
  oldSettings: CookieSettings,
  newName: string,
): CookieSettings {
  // edge case: "__Secure-__Secure-name" will get a basename of "__Secure-name"
  if (newName.startsWith("__Secure-")) {
    return {
      ...oldSettings,
      prefix: "__Secure-",
      isSecure: true,
      baseName: newName.substring("__Secure-".length),
    };
  } else if (newName.startsWith("__Host-")) {
    return {
      ...oldSettings,
      prefix: "__Host-",
      isSecure: true,
      domain: null,
      path: "/",
      baseName: newName.substring("__Host-".length),
    };
  }
  return {
    ...oldSettings,
    baseName: newName,
    prefix: null,
  };
}

export function updateDomain(
  oldSettings: CookieSettings,
  newDomain: string | null,
): CookieSettings {
  if (oldSettings.prefix === "__Host-") {
    // "__Host-" prefix needs domain to be null
    if (newDomain !== null) {
      return {
        ...oldSettings,
        prefix: null,
        domain: newDomain,
      };
    }
    return {
      ...oldSettings,
      domain: null,
    };
  }
  return {
    ...oldSettings,
    domain: newDomain,
  };
}

export function updatePath(
  oldSettings: CookieSettings,
  newPath: string,
): CookieSettings {
  if (oldSettings.prefix === "__Host-") {
    if (newPath !== "/") {
      // setting path to non-"/" resets "__Host-" prefix
      return {
        ...oldSettings,
        prefix: null,
        domain: newPath,
      };
    }
    return {
      ...oldSettings,
      path: "/",
    };
  }

  return {
    ...oldSettings,
    path: newPath,
  };
}

export function updateIsSecure(
  oldSettings: CookieSettings,
  isSecure: boolean,
): CookieSettings {
  if (isSecure) {
    return {
      ...oldSettings,
      isSecure: true,
    };
  }

  // unsetting secure resets prefixes
  return {
    ...oldSettings,
    prefix: null,
    isSecure: false,
  };
}
