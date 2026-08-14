export const ADMIN_COOKIE_NAME = "gallardo-camp-admin";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 7;

const encoder = new TextEncoder();

export function isSecureRequest(request: Request) {
  const forwardedProtocol = request.headers.get("x-forwarded-proto")?.split(",")[0];

  return forwardedProtocol === "https" || new URL(request.url).protocol === "https:";
}

export function getRequestUrl(request: Request, path: string) {
  const requestUrl = new URL(request.url);
  const protocol =
    request.headers.get("x-forwarded-proto")?.split(",")[0] ??
    requestUrl.protocol.replace(":", "");
  const host =
    request.headers.get("x-forwarded-host")?.split(",")[0] ??
    request.headers.get("host");

  return new URL(path, host ? `${protocol}://${host}` : requestUrl.origin);
}

async function digest(value: string) {
  const hash = await crypto.subtle.digest("SHA-256", encoder.encode(value));

  return Array.from(new Uint8Array(hash), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

function safeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;

  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return difference === 0;
}

export async function createAdminSessionToken(adminPassword: string) {
  return digest(`gallardo-camp:admin-session:${adminPassword}`);
}

export async function isValidAdminSession(
  token: string | undefined,
  adminPassword: string | undefined,
) {
  if (!token || !adminPassword) return false;

  return safeEqual(token, await createAdminSessionToken(adminPassword));
}

export async function isValidAdminPassword(
  password: string,
  adminPassword: string,
) {
  const [passwordHash, adminPasswordHash] = await Promise.all([
    digest(password),
    digest(adminPassword),
  ]);

  return safeEqual(passwordHash, adminPasswordHash);
}
