import { createHmac, timingSafeEqual } from "node:crypto";

export const USER_COOKIE_NAME = "gallardo-camp-user";
export const USER_SESSION_MAX_AGE = 60 * 60 * 24 * 30;

export type UserSession = {
  userIds: string[];
  activeUserId: string;
};

function getSecret() {
  const secret = process.env.USER_SESSION_SECRET;
  if (!secret) throw new Error("Falta configurar USER_SESSION_SECRET.");
  return secret;
}

function sign(payload: string) {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

export function createUserSessionToken(session: UserSession) {
  const payload = Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function readUserSessionToken(token: string | undefined) {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = Buffer.from(sign(payload));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;

  try {
    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as UserSession | { userId: string };
    if ("userId" in parsed) {
      return { userIds: [parsed.userId], activeUserId: parsed.userId };
    }
    if (
      !Array.isArray(parsed.userIds) ||
      parsed.userIds.length === 0 ||
      !parsed.userIds.includes(parsed.activeUserId)
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function addUserToSession(session: UserSession | null, userId: string) {
  return {
    userIds: [...new Set([...(session?.userIds ?? []), userId])],
    activeUserId: userId,
  };
}

export function removeUserFromSession(
  session: UserSession,
  userId: string,
): UserSession | null {
  const userIds = session.userIds.filter((id) => id !== userId);
  if (userIds.length === 0) return null;

  return {
    userIds,
    activeUserId:
      session.activeUserId === userId ? userIds[0] : session.activeUserId,
  };
}

export function getSafeSessionReturnPath(
  value: FormDataEntryValue | null,
  fallback = "/perfil",
) {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  ) {
    return fallback;
  }
  return value;
}
