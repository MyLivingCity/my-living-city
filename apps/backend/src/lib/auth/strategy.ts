import { ExtractJwt, Strategy as JWTStrategy } from "passport-jwt";
import { prisma } from "src/prisma/client";
import { env } from "../env";
import { Strategy as LocalStrategy } from "passport-local";
import { argon2ConfirmHash } from "../helpers";
import passport from "passport";
import {
  UserExistsError,
  validateUserData,
  ValidationError,
  verifyUserExists,
} from "./validations";
import {
  createUser,
  processAdminAccount,
  processBusinessAccount,
  processResidentialAccount,
  processUserSegments,
} from "./utils";

export function initStrategies() {
  passport.use(
    "local",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true,
        session: false,
      },
      async (_req, email, password, done) => {
        try {
          const foundUser = await prisma.user.findFirst({
            where: {
              email: email.toLowerCase(),
            },
            // TODO: May cause unnecessary queries to database
            include: {
              geo: true,
              address: true,
              //userRole: true,
            },
          });

          if (!foundUser) {
            console.log("User not found");
            return done(null, false, {
              message: `User with email ${email} could not be found!`,
            });
          }

          const validPassword = await argon2ConfirmHash(
            password,
            foundUser.password,
          );
          if (!validPassword) {
            return done(null, false, {
              message: "Invalid password. Please try again.",
            });
          }

          const parsedUser = {
            ...foundUser,
            password: null,
          };

          // TODO
          // if (parsedUser.verified === false) {
          //   await sendEmailVerification(parsedUser)
          //     .then((result) => console.log("Email sent...", result))
          //     .catch((error) => console.log(error.message));
          //   return done(null, false, {
          //     message:
          //       "User is not verified. Please check your email for verification link.",
          //   });
          // }

          if (parsedUser.status === false) {
            return done(null, false, {
              message:
                "Account is deactivated. Please contact Admin for assitance",
            });
          }

          return done(null, parsedUser, { message: "Logged in succesfully" });
        } catch (error) {
          console.log("Error is thrown", error);
          return done(error);
        } finally {
          await prisma.$disconnect();
        }
      },
    ),
  );

  passport.use(
    "jwt",
    new JWTStrategy(
      {
        secretOrKey: env.JWT_SECRET,
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
    ),
  );

  passport.use(
    "signup",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true,
      },
      async (req, email, password, done) => {
        try {
          // Validate basic user data
          const validatedData = await validateUserData(
            email,
            password,
            req.body.confirmPassword,
          );

          // Check if user exists
          await verifyUserExists(validatedData.email);

          // Process account based on type
          let userData = {
            ...req.body,
            ...validatedData,
          };

          // Process different account types
          userData = await processAdminAccount(userData);
          userData = await processBusinessAccount(userData);
          userData = processResidentialAccount(userData);
          userData = processUserSegments(userData);

          // Create user in database
          const createdUser = await createUser(userData);

          // TODO
          // if (!createdUser.verified) {
          //   await sendEmailVerification(createdUser);
          // }

          return done(null, createdUser);
        } catch (error) {
          if (
            error instanceof ValidationError ||
            error instanceof UserExistsError
          ) {
            return done(null, false, { message: error.message });
          }
          console.error("Signup error:", error);
          return done(error);
        } finally {
          await prisma.$disconnect();
        }
      },
    ),
  );

  return passport;
}
