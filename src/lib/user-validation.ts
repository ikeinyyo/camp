export type UserValidationCode = "username" | "displayName" | "password" | "points";

export class UserValidationError extends Error {
  constructor(
    public readonly code: UserValidationCode,
    message: string,
  ) {
    super(message);
    this.name = "UserValidationError";
  }
}

export function validateUserInput(
  username: string,
  displayName: string,
  password?: string,
) {
  if (!/^[a-zA-Z0-9._-]{3,32}$/.test(username)) {
    throw new UserValidationError(
      "username",
      "El usuario debe tener entre 3 y 32 caracteres: letras, números, punto, guion o guion bajo.",
    );
  }
  if (displayName.length < 2 || displayName.length > 80) {
    throw new UserValidationError(
      "displayName",
      "El nombre visible debe tener entre 2 y 80 caracteres.",
    );
  }
  if (password !== undefined && password.length < 6) {
    throw new UserValidationError(
      "password",
      "La contraseña debe tener al menos 6 caracteres.",
    );
  }
}
