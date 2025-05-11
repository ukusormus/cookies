export default function validateURL(maybeUrl: string): string | null {
  // Validate user URL input
  // Return null if valid, error message string if invalid
  let url;
  try {
    url = new URL(maybeUrl);
  } catch {
    if (
      !maybeUrl.toLowerCase().startsWith("http:") &&
      !maybeUrl.toLowerCase().startsWith("https:")
    ) {
      return 'Only absolute URLs supported (starting with "http://" or "https://")';
    }
    return "URL constructor failed";
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    return `Only "http" and "https" schemes supported, current scheme "${url.protocol.slice(0, -1)}"`;
  }

  const isTrailingDot = url.hostname.endsWith(".");
  const hostnameWithoutTrailingDot = isTrailingDot
    ? url.hostname.slice(0, -1)
    : url.hostname;
  if (hostnameWithoutTrailingDot.split(".").includes("")) {
    return "URL hostname must not include empty labels";
  }

  return null;
}
