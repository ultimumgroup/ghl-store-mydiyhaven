// Browser-only compact cart persistence. Values are untrusted; GHL reprices them.
const RETENTION_SECONDS = 60 * 60 * 24 * 30;
export function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const entry = document.cookie.split("; ").find((v) => v.startsWith(name + "="));
  try {
    return entry ? decodeURIComponent(entry.slice(name.length + 1)) : undefined;
  } catch {
    return undefined;
  }
}
export function writeCookie(name: string, value: string, maxAgeSeconds = RETENTION_SECONDS): void {
  if (typeof document === "undefined") return;
  const encoded = encodeURIComponent(value);
  if (encoded.length > 3500) throw new Error("This cart is too large to save.");
  document.cookie = `${name}=${encoded}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
  if (readCookie(name) !== value)
    throw new Error("Browser cookies are disabled. Enable cookies to save your cart.");
}
export function deleteCookie(name: string): void {
  if (typeof document !== "undefined")
    document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
}
export function readJSONCookie<T>(name: string): T | undefined {
  try {
    const raw = readCookie(name);
    return raw ? (JSON.parse(raw) as T) : undefined;
  } catch {
    return undefined;
  }
}
export function writeJSONCookie(
  name: string,
  value: unknown,
  maxAgeSeconds = RETENTION_SECONDS,
): void {
  writeCookie(name, JSON.stringify(value), maxAgeSeconds);
}
