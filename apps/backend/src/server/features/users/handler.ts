// =============================================================================
// features/users/handler.ts
// =============================================================================
// Source controllers to refactor into this file:
//
// controllers/user.js            → apiRouter.use('/user', userRouter)   (~1700+ lines)
//   - POST /signup                 register new user
//   - POST /login                  local login (returns JWT)
//   - GET  /                       get all users (admin)
//   - GET  /:userId                get user by ID
//   - GET  /me                     get current user (from token)
//   - PUT  /:userId                update user profile
//   - PUT  /:userId/ban            ban user (admin/mod)
//   - PATCH /:userId/patchHandle   update handle
//   - PATCH /:userId/...           various partial profile updates
//   - DELETE /:userId              delete user (admin)
//   - (+ segment/reach sub-routes currently inline)
//
// controllers/role.js            → apiRouter.use('/role', roleRouter)
//   - GET  /                       list all roles
//   - POST /                       create role
//   - PUT  /:roleId                update role
//   - DELETE /:roleId              delete role
//
// controllers/publicProfile.js   → apiRouter.use('/publicProfile', ...)
//   - GET  /all                    list public profiles
//   - GET  /:userId                get public profile by user
//
// controllers/avatar.js          → apiRouter.use('/avatar', avatarRouter)
//   - POST /upload                 upload avatar image (multer)
//   - GET  /:userId                get avatar for user
//   - DELETE /                     remove avatar
//
// controllers/userReach.js       → apiRouter.use('/reach', userReachRouter)
//   - GET  /:userId                get reach stats for user
//   - POST /update                 recalculate reach
//
// controllers/schoolDetails.js   → apiRouter.use('/schoolDetails', ...)
//   - POST /                       create/update school details for user
//   - GET  /:userId                get school details
//   - DELETE /:userId              remove school details
//
// controllers/workDetails.js     → apiRouter.use('/workDetails', ...)
//   - POST /                       create/update work details for user
//   - GET  /:userId                get work details
//   - DELETE /:userId              remove work details
//
// controllers/enhancedMember.js  → apiRouter.use('/enhanced-member', ...)
//   - POST /                       grant enhanced-member status
//   - GET  /:userId                check enhanced-member status
//   - DELETE /:userId              revoke enhanced-member status
// =============================================================================

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
