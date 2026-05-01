import { prisma } from "src/prisma/client";
import * as jwt from "jsonwebtoken";
import { env } from "src/lib/env";
import passport from "passport";

export const authenticateJwt = passport.authenticate("jwt", { session: false });

/**
 * Middleware to check if user is logged in and parses database to check if user
 * actually exists in database.
 */
export const checkIfUserIsLoggedIn = async (req, res, next) => {
  try {
    const token = req.header("x-auth-token");
    console.log(token);
    if (!token) {
      req.user = null;
      return;
    }

    // Decode token
    const { user } = jwt.verify(token, env.JWT_SECRET);

    // Check if user is valid in database
    const foundUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!foundUser) {
      req.user = null;
      return;
    }

    req.user = user;
    return;
  } catch {
    req.user = null;
  } finally {
    await prisma.$disconnect();
    next();
  }
};
