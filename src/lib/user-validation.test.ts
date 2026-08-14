import { describe, expect, it } from "vitest";
import { validateUserInput } from "./user-validation";

describe("user validation", () => {
  it("acepta paco con la contraseña paco123", () => {
    expect(() => validateUserInput("paco", "paco", "paco123")).not.toThrow();
  });

  it("identifica el campo que no es válido", () => {
    expect(() => validateUserInput("pa", "Paco", "paco123")).toThrow(
      expect.objectContaining({ code: "username" }),
    );
    expect(() => validateUserInput("paco", "Paco", "123")).toThrow(
      expect.objectContaining({ code: "password" }),
    );
  });
});
