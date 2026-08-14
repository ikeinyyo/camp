import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("password", () => {
  it("guarda un hash con salt y valida la contraseña", async () => {
    const hash = await hashPassword("mi-password");

    expect(hash).not.toContain("mi-password");
    await expect(verifyPassword("mi-password", hash)).resolves.toBe(true);
    await expect(verifyPassword("otra", hash)).resolves.toBe(false);
  });
});
