import { prisma } from "src/prisma/client";
import * as jwt from "jsonwebtoken";
import { env } from "src/lib/env";
import passport from "passport";
import { ExpressMiddleware } from "./types";

export const authenticateJwt: ExpressMiddleware = async (req, res, next) => {
  // Set Content-Type to text/plain by default to avoid implicit XML parsing in the old frontend
  res.setHeader("Content-Type", "text/plain");
  return passport.authenticate("jwt", { session: false })(req, res, next);
};

/**
 * Middleware to check if user is logged in and parses database to check if user
 * actually exists in database.
 */
export const checkIfUserIsLoggedIn: ExpressMiddleware = async (
  req,
  res,
  next,
) => {
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
