import { prisma } from "src/prisma/client";
import { argon2Hash } from "../helpers";

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class UserExistsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserExistsError";
  }
}

export const validateUserData = async (
  email: string,
  password: string,
  confirmPassword: string,
) => {
  if (!email) {
    throw new ValidationError("You must supply an email.");
  }

  if (!password) {
    throw new ValidationError("You must supply a password.");
  }

  if (password !== confirmPassword) {
    throw new ValidationError(
      "Both password and password confirmation must be the same.",
    );
  }

  const hashedPassword = await argon2Hash(password);

  return {
    hashedPassword,
    email: email.toLowerCase(),
  };
};

// userVerification.js
export const verifyUserExists = async (email: string) => {
  const userExists = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (userExists) {
    if (userExists.verified) {
      throw new UserExistsError("User already exists.");
    } else {
      throw new UserExistsError(
        "An account with this email already exists but is not verified. Please check your email.",
      );
    }
  }

  return false;
};
