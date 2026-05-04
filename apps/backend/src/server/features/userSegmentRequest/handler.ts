import passport from "passport";
import { userSegmentRequestApiContracts } from "@mlc/lib/api";
import { prisma } from "src/prisma/client";
import { initServer } from "@ts-rest/express";
import { createHandlers } from "src/server";
import { serializeForContract, toErrorDetails } from "src/server/utils";

const s = initServer();

function isAdmin(userType: string) {
  return userType === "SUPER_ADMIN" || userType === "ADMIN";
}

const create = s.route(userSegmentRequestApiContracts.create, {
  middleware: [passport.authenticate("jwt", { session: false })],
  handler: async ({ body, req }) => {
    try {
      const { id: userId } = req.user as { id: string };
      const { country, province, segmentName, subSegmentName } = body;

      const result = await prisma.segmentRequest.create({
        data: {
          userId,
          country,
          province,
          segmentName,
          subSegmentName: subSegmentName ?? null,
        },
      });

      return {
        status: 200,
        body: serializeForContract(result),
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "An error occurred while creating the segment request.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const getAll = s.route(userSegmentRequestApiContracts.getAll, {
  middleware: [passport.authenticate("jwt", { session: false })],
  handler: async ({ req }) => {
    try {
      const { id: userId } = req.user as { id: string };

      const theUser = await prisma.user.findUnique({ where: { id: userId } });
      if (!theUser || !isAdmin(theUser.userType ?? "")) {
        return {
          status: 403,
          body: { message: "Only admin can get all segment requests!" },
        };
      }

      const result = await prisma.segmentRequest.findMany();
      return {
        status: 200,
        body: serializeForContract(result),
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "An error occurred while fetching all segment requests.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const getMine = s.route(userSegmentRequestApiContracts.getMine, {
  middleware: [passport.authenticate("jwt", { session: false })],
  handler: async ({ req }) => {
    try {
      const { id: userId } = req.user as { id: string };

      const result = await prisma.segmentRequest.findMany({
        where: { userId },
      });

      return {
        status: 200,
        body: serializeForContract(result),
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "An error occurred while fetching your segment requests.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const deleteById = s.route(userSegmentRequestApiContracts.deleteById, {
  middleware: [passport.authenticate("jwt", { session: false })],
  handler: async ({ params, req }) => {
    try {
      const { id: userId } = req.user as { id: string };
      const parsedDeleteId = parseInt(params.deleteId, 10);

      if (!parsedDeleteId) {
        return {
          status: 400,
          body: {
            message: "deleteId must be a valid integer.",
            details: { errorMessage: "Invalid deleteId.", errorStack: "" },
          },
        };
      }

      const theRequest = await prisma.segmentRequest.findUnique({
        where: { id: parsedDeleteId },
      });
      if (!theRequest) {
        return {
          status: 404,
          body: { message: "Segment request not found!" },
        } as never;
      }

      const theUser = await prisma.user.findUnique({ where: { id: userId } });
      const userIsAdmin = isAdmin(theUser?.userType ?? "");

      if (!userIsAdmin && theRequest.userId !== userId) {
        return {
          status: 403,
          body: {
            message: "You don't have the right to delete this segment request!",
          },
        } as never;
      }

      await prisma.segmentRequest.delete({ where: { id: parsedDeleteId } });

      return { status: 204, body: undefined };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: `An error occurred while deleting segment request ${params.deleteId}.`,
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const deleteByUser = s.route(userSegmentRequestApiContracts.deleteByUser, {
  middleware: [passport.authenticate("jwt", { session: false })],
  handler: async ({ params, req }) => {
    try {
      const { id: loggedInId } = req.user as { id: string };

      const theUser = await prisma.user.findUnique({
        where: { id: loggedInId },
      });
      if (!isAdmin(theUser?.userType ?? "")) {
        return {
          status: 403,
          body: { message: "Only admin can access this endpoint!" },
        } as never;
      }

      const targetUser = await prisma.user.findUnique({
        where: { id: params.userId },
      });
      if (!targetUser) {
        return {
          status: 404,
          body: { message: "User not found!" },
        } as never;
      }

      await prisma.segmentRequest.deleteMany({
        where: { userId: params.userId },
      });

      return { status: 204, body: undefined };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: `An error occurred while deleting segment requests for user ${params.userId}.`,
          details: toErrorDetails(error),
        },
      };
    }
  },
});

export default createHandlers({
  schema: userSegmentRequestApiContracts,
  router: {
    create,
    getAll,
    getMine,
    deleteById,
    deleteByUser,
  },
});
