// Cookie helpers that work in both browser and server (Cloudflare Worker) runtimes.
// Uses document.cookie on the client and getWebRequest cookies on the server.
// All values are URL-encoded JSON. Cookies are SameSite=Lax, path=/, 1-year expiry.

const YEAR_SECONDS = 60 * 60 * 24 * 365;

function isBrowser(): boolean {
  return typeof document !== "undefined" && typeof document.cookie !== "undefined";
}

/** Read a cookie value by name (browser only). Returns undefined if missing. */
export function readCookie(name: string): string | undefined {
  if (!isBrowser()) return undefined;
  const match = document.cookie.match(
    new RegExp("(?:^|; )" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "=([^;]*)"),
  );
  if (!match) return undefined;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return undefined;
  }
}

/** Write a cookie value (browser only). */
export function writeCookie(name: string, value: string, maxAgeSeconds = YEAR_SECONDS): void {
  if (!isBrowser()) return;
  const encoded = encodeURIComponent(value);
  document.cookie = `${name}=${encoded}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
}

/** Delete a cookie (browser only). */
export function deleteCookie(name: string): void {
  if (!isBrowser()) return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

/** Read + JSON-parse a cookie. Returns undefined on any failure. */
export function readJSONCookie<T>(name: string): T | undefined {
  const raw = readCookie(name);
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

/** JSON-stringify + write a cookie. */
export function writeJSONCookie(name: string, value: unknown, maxAgeSeconds = YEAR_SECONDS): void {
  writeCookie(name, JSON.stringify(value), maxAgeSeconds);
}
