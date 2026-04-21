import { ExtractJwt, Strategy as JWTStrategy } from "passport-jwt";
import { prisma } from "src/prisma/client";

export const strategyJwt = new JWTStrategy(
  {
    secretOrKey: process.env["JWT_SECRET"],
    jwtFromRequest: ExtractJwt.fromExtractors([
      ExtractJwt.fromUrlQueryParameter("x-auth-token"),
      ExtractJwt.fromHeader("x-auth-token"),
      ExtractJwt.fromAuthHeaderAsBearerToken(),
      ExtractJwt.fromAuthHeaderWithScheme("jwt"),
    ]),
  },
  async (token, done) => {
    try {
      if (!token?.user || !token?.user.id) {
        return done(null, false, {
          message: "Invalid token: User ID is not present.",
        });
      }

      const foundUser = await prisma.user.findUnique({
        where: { id: token.user.id },
      });

      if (!foundUser) {
        return done(null, false, {
          message: "User could not be found in Database.",
        });
      }

      return done(null, foundUser);
    } catch (error) {
      done(error);
    } finally {
      await prisma.$disconnect();
    }
  },
);
