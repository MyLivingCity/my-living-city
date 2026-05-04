import passport from "passport";
import { userReachApiContracts } from "@mlc/lib/api";
import { prisma } from "src/prisma/client";
import { initServer } from "@ts-rest/express";
import { createHandlers } from "src/server";
import { serializeForContract, toErrorDetails } from "src/server/utils";

const s = initServer();

const ALLOWED_USER_TYPES = ["BUSINESS", "COMMUNITY", "IN_PROGRESS"] as const;

const health = s.route(userReachApiContracts.health, {
  handler: async () => {
    try {
      return {
        status: 200,
        body: { route: "welcome to reach Router!" },
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "An error occurred.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const create = s.route(userReachApiContracts.create, {
  middleware: [passport.authenticate("jwt", { session: false })],
  handler: async ({ body }) => {
    try {
      const { userId, segId } = body;

      const theUser = await prisma.user.findUnique({ where: { id: userId } });
      if (!theUser) {
        return {
          status: 400,
          body: {
            message: `The user with id ${userId} cannot be found!`,
            details: { errorMessage: "User not found.", errorStack: "" },
          },
        };
      }

      if (!ALLOWED_USER_TYPES.includes(theUser.userType as never)) {
        return {
          status: 400,
          body: {
            message: "User is not allowed to have reach segments",
            details: {
              errorMessage: "Only Business or Community users may have reach segments!",
              errorStack: "",
            },
          },
        };
      }

      const theSegment = await prisma.segments.findUnique({ where: { segId } });
      if (!theSegment) {
        return {
          status: 400,
          body: {
            message: `The Segment with id ${segId} cannot be found!`,
            details: { errorMessage: "Segment not found.", errorStack: "" },
          },
        };
      }

      const newUserReach = await prisma.userReach.upsert({
        where: { user_reach_unique: { segId, userId } },
        create: { segId, userId },
        update: {},
      });

      return {
        status: 200,
        body: serializeForContract(newUserReach),
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "An error occurred when trying to create userReach.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const replaceReachSegments = s.route(userReachApiContracts.replaceReachSegments, {
  middleware: [passport.authenticate("jwt", { session: false })],
  handler: async ({ body }) => {
    try {
      const { userId, segIds } = body;

      const theUser = await prisma.user.findUnique({ where: { id: userId } });
      if (!theUser) {
        return {
          status: 400,
          body: {
            message: `The user with id ${userId} cannot be found!`,
            details: { errorMessage: "User not found.", errorStack: "" },
          },
        };
      }

      if (!ALLOWED_USER_TYPES.includes(theUser.userType as never)) {
        return {
          status: 400,
          body: {
            message: "User is not allowed to have reach segments",
            details: {
              errorMessage: "Only Business or Community users may have reach segments!",
              errorStack: "",
            },
          },
        };
      }

      const theSegments = await prisma.segments.findMany({
        where: { segId: { in: segIds } },
      });

      for (const segId of segIds) {
        if (!theSegments.some((seg) => seg.segId === segId)) {
          return {
            status: 400,
            body: {
              message: `The Segment with id ${segId} cannot be found!`,
              details: { errorMessage: "Segment not found.", errorStack: "" },
            },
          };
        }
      }

      await prisma.userReach.deleteMany({ where: { userId } });

      const newUserReach = await prisma.userReach.createMany({
        data: segIds.map((segId) => ({ segId, userId })),
      });

      return {
        status: 200,
        body: serializeForContract(newUserReach),
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "An error occurred when trying to replace reach segments.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const getUserSegments = s.route(userReachApiContracts.getUserSegments, {
  middleware: [passport.authenticate("jwt", { session: false })],
  handler: async ({ body }) => {
    try {
      const { userId } = body;

      const theUser = await prisma.user.findUnique({ where: { id: userId } });
      if (!theUser) {
        return {
          status: 400,
          body: {
            message: `The user with id ${userId} cannot be found!`,
            details: { errorMessage: "User not found.", errorStack: "" },
          },
        };
      }

      const userReaches = await prisma.userReach.findMany({ where: { userId } });
      const segments = await Promise.all(
        userReaches.map((reach) =>
          prisma.segments.findUnique({ where: { segId: reach.segId } }),
        ),
      );

      return {
        status: 200,
        body: serializeForContract(segments),
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "An error occurred when getting user reach segments.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

export default createHandlers({
  schema: userReachApiContracts,
  router: {
    health,
    create,
    replaceReachSegments,
    getUserSegments,
  },
});
