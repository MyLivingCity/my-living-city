const prisma = require("../../lib/prismaClient");
const { argon2Hash } = require("../../lib/utilityFunctions");
const ValidationError = require("../../types/ValidationError");
const UserExistsError = require("../../types/UserExistsError");

const  validateUserData = async (email, password, confirmPassword) => {
    try {
        if (!email) {
            throw new ValidationError("You must supply an email.");
        }

        if (!password) {
            throw new ValidationError("You must supply a password.");
        }

        if (password !== confirmPassword) {
            throw new ValidationError(
                "Both password and password confirmation must be the same."
            );
        }

        const hashedPassword = await argon2Hash(password);

        return {
            hashedPassword,
            email: email.toLowerCase(),
        };

    } catch (error) {
        throw error;
    }
}

// userVerification.js
const verifyUserExists = async (email) => {
  try {
    const userExists = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (userExists) {
      if (userExists.verified) {
        throw new UserExistsError("User already exists.");
      } else {
        throw new UserExistsError("An account with this email already exists but is not verified. Please check your email.");
      }
    }

    return false;
  } catch (error) {
    throw error;
  }
};

module.exports = {verifyUserExists, validateUserData}