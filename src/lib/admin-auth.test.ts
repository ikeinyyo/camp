import { describe, expect, it } from "vitest";
import {
  createAdminSessionToken,
  getRequestUrl,
  isSecureRequest,
  isValidAdminPassword,
  isValidAdminSession,
} from "./admin-auth";

describe("admin auth", () => {
  it("valida la contraseña configurada", async () => {
    await expect(isValidAdminPassword("secreta", "secreta")).resolves.toBe(
      true,
    );
    await expect(isValidAdminPassword("incorrecta", "secreta")).resolves.toBe(
      false,
    );
  });

  it("detecta HTTPS directo o reenviado por el proxy de Azure", () => {
    expect(isSecureRequest(new Request("https://example.com/admin"))).toBe(true);
    expect(
      isSecureRequest(
        new Request("http://container/admin", {
          headers: { "x-forwarded-proto": "https" },
        }),
      ),
    ).toBe(true);
    expect(isSecureRequest(new Request("http://localhost/admin"))).toBe(false);
  });

  it("construye redirects con el host público reenviado", () => {
    const request = new Request("http://container:3000/admin", {
      headers: {
        host: "container:3000",
        "x-forwarded-host": "camp.example.com",
        "x-forwarded-proto": "https",
      },
    });

    expect(getRequestUrl(request, "/admin/login").toString()).toBe(
      "https://camp.example.com/admin/login",
    );
  });

  it("acepta únicamente una sesión creada con la contraseña actual", async () => {
    const token = await createAdminSessionToken("secreta");

    await expect(isValidAdminSession(token, "secreta")).resolves.toBe(true);
    await expect(isValidAdminSession(token, "nueva-secreta")).resolves.toBe(
      false,
    );
    await expect(isValidAdminSession(undefined, "secreta")).resolves.toBe(
      false,
    );
  });
});
