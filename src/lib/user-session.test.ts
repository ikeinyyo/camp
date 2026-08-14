import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  addUserToSession,
  createUserSessionToken,
  readUserSessionToken,
  removeUserFromSession,
} from "./user-session";

describe("user session", () => {
  const previousSecret = process.env.USER_SESSION_SECRET;

  beforeEach(() => {
    process.env.USER_SESSION_SECRET = "test-session-secret";
  });

  afterEach(() => {
    process.env.USER_SESSION_SECRET = previousSecret;
  });

  it("firma y recupera varios usuarios activos", () => {
    const session = addUserToSession(
      addUserToSession(null, "user-1"),
      "user-2",
    );
    const token = createUserSessionToken(session);

    expect(readUserSessionToken(token)).toEqual({
      userIds: ["user-1", "user-2"],
      activeUserId: "user-2",
    });
  });

  it("rechaza una cookie manipulada", () => {
    const token = createUserSessionToken({
      userIds: ["user-1"],
      activeUserId: "user-1",
    });

    expect(readUserSessionToken(`${token}alterado`)).toBeNull();
  });

  it("elimina un usuario y activa otro cuando es necesario", () => {
    expect(
      removeUserFromSession(
        { userIds: ["user-1", "user-2"], activeUserId: "user-2" },
        "user-2",
      ),
    ).toEqual({ userIds: ["user-1"], activeUserId: "user-1" });
  });

  it("vacía la sesión cuando se elimina el último usuario", () => {
    expect(
      removeUserFromSession(
        { userIds: ["user-1"], activeUserId: "user-1" },
        "user-1",
      ),
    ).toBeNull();
  });
});
