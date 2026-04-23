import { userApiContracts, UserSchema } from "@mlc/lib/api";
import { initServer } from "@ts-rest/express";
import { NextFunction, Request, Response } from "express";
import { prisma } from "src/prisma/client";
import * as passport from "passport";
import * as jwt from "jsonwebtoken";
import { Handlers } from "src/server";
import { env } from "src/lib/env";
import z from "zod";

const s = initServer();

const localLoginMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  return passport.authenticate(
    "local",
    { session: false },
    (err: unknown, user: Express.User | false, info?: { message?: string }) => {
      if (err) {
        return res.status(400).json({
          message:
            err instanceof Error
              ? err.message
              : "An error occurred during login.",
        });
      }

      if (!user) {
        return res.status(400).json({
          message: info?.message || "Invalid credentials.",
        });
      }

      req.user = user;
      return next();
    },
  )(req, res, next);
};

const getSelf = s.route(userApiContracts.getSelf, {
  middleware: [passport.authenticate("jwt", { session: false })],
  handler: async ({ req }) => {
    const { id } = req.user as { id?: string };

    if (!id) {
      return {
        status: 404,
        body: {
          message: "User could not be found or does not exist in the database.",
        },
      };
    }

    const foundUser = await prisma.user.findFirst({
      where: { id },
      omit: { password: true },
    });

    if (!foundUser) {
      return {
        status: 404,
        body: {
          message: "User could not be found or does not exist in the database.",
        },
      };
    }

    return {
      status: 200,
      body: {
        ...foundUser,

        // TODO: fetch values for below
        avatar: "",
        city: "",
        longitude: 0,
        latitude: 0,
        postalCode: "",
        streetAddress: "",
        userReach: [],
        userSegment: [],
      },
    };
  },
});

const login = s.route(userApiContracts.login, {
  middleware: [localLoginMiddleware],
  handler: async ({ req }) => {
    const user = req.user as z.infer<typeof UserSchema>;

    if (!user?.id || !user?.email) {
      return {
        status: 400,
        body: {
          message: "Could not find authenticated user after login.",
        },
      };
    }

    const token = jwt.sign(
      { user: { id: user.id, email: user.email } },
      env.JWT_SECRET,
      {
        expiresIn: env.JWT_EXPIRY as NonNullable<jwt.SignOptions["expiresIn"]>,
      },
    );

    return {
      status: 200,
      body: {
        user,
        token,
      },
    };
  },
});

const tryUnbanSelf = s.route(userApiContracts.tryUnbanSelf, {
  middleware: [passport.authenticate("jwt", { session: false })],
  handler: async ({ req }) => {
    try {
      const { id } = (req.user ?? {}) as z.infer<typeof UserSchema>;

      if (!id) {
        return {
          status: 400,
          body: {
            message: "No user",
          },
        };
      }

      const theUser = await prisma.user.findFirst({ where: { id: id } });

      if (!theUser) {
        return {
          status: 400,
          body: {
            message: "No user",
          },
        };
      }

      if (!theUser.banned) {
        return {
          status: 200,
          body: {
            message: "You are not banned",
          },
        };
      }

      const ban = await prisma.userBan.findMany({
        where: { userId: id },
        orderBy: { id: "desc" },
        distinct: ["userId"],
      });

      if (!ban) {
        return {
          status: 200,
          body: {
            message: "You are not banned",
          },
        };
      }

      const isExpired = ban.every((b) => b.banUntil <= new Date(Date.now()));
      if (isExpired) {
        await prisma.user.update({
          where: { id: id },
          data: {
            banned: false,
          },
        });
        await prisma.userBan.deleteMany({
          where: { userId: theUser.id },
        });

        return {
          status: 200,
          body: {
            message: "You are succesfully unbanned",
          },
        };
      }

      return {
        status: 200,
        body: {
          message: "Your ban is still ongoing",
        },
      };
    } catch (error) {
      console.log(error);
      return {
        status: 500,
        body: {
          message: `An Error occured while trying to unban.`,
          details: {
            errorMessage: error.message,
            errorStack: error.stack,
          },
        },
      };
    }
  },
});

export default {
  schema: userApiContracts,
  router: {
    getSelf,
    login,
    tryUnbanSelf,
  },
} as Handlers;
