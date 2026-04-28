import { initServer } from "@ts-rest/express";
import * as passport from "passport";
import { moderationApiContracts } from "@mlc/lib/api";
import { toErrorDetails } from "src/server/utils";
import { prisma } from "src/prisma/client";
import { BadPostingBehaviourSchema } from "@mlc/lib/api/contracts/moderation/reputation";

import {
  //badPostingBehavior
  incrementUserBadPostStats,
  incrementUserFlagStats,
  getAuthorFromIdea,
  resetUserBadPostStats,
  evaluateAndApplyUserBan,
  getIdsFromBehaviorTable,
  syncAllUsersToThreshold,
  //falseFlaggingBehavior
  processFalseFlaggingBans,
  fetchFalseFlaggingIds,
} from "./service";

const s = initServer();

// ============================================================================
//  badPostingBehavior
// ============================================================================
const incrementPostFlagCount = s.route(
  moderationApiContracts.reputation.badPostingBehavior.incrementPostFlagCount,
  {
    middleware: [passport.authenticate("jwt", { session: false })],
    handler: async ({ params }) => {
      const result = await getAuthorFromIdea(params.ideaId);
      if ("error" in result) return result.error;

      try {
        await incrementUserFlagStats(result.authorId);
        return { status: 200, body: { message: "Post flag count updated" } };
      } catch (error) {
        return {
          status: 400,
          body: {
            message: error instanceof Error ? error.message : String(error),
            details: toErrorDetails(error),
          },
        };
      }
    },
  },
);
const incrementBadPostCount = s.route(
  moderationApiContracts.reputation.badPostingBehavior.incrementBadPostCount,
  {
    middleware: [passport.authenticate("jwt", { session: false })],
    handler: async ({ params }) => {
      const result = await getAuthorFromIdea(params.ideaId);
      if ("error" in result) return result.error;

      try {
        await incrementUserBadPostStats(result.authorId);
        return { status: 200, body: { message: "Bad post count updated" } };
      } catch (error) {
        return {
          status: 400,
          body: { message: "Update failed", details: toErrorDetails(error) },
        };
      }
    },
  },
);
const resetBadPostCount = s.route(
  moderationApiContracts.reputation.badPostingBehavior.resetBadPostCount,
  {
    middleware: [passport.authenticate("jwt", { session: false })],
    handler: async ({ params }) => {
      const result = await getAuthorFromIdea(params.ideaId);
      if ("error" in result) return result.error;

      try {
        await resetUserBadPostStats(result.authorId);

        return {
          status: 200,
          body: { message: "Bad post count and post flag count reset" },
        };
      } catch (error) {
        return {
          status: 400,
          body: {
            message: "Bad post count and post flag count not reset",
            details: toErrorDetails(error),
          },
        };
      }
    },
  },
);
const checkUser = s.route(
  moderationApiContracts.reputation.badPostingBehavior.checkUser,
  {
    middleware: [passport.authenticate("jwt", { session: false })],
    handler: async ({ params }) => {
      try {
        const isBanned = await evaluateAndApplyUserBan(params.userId);

        return {
          status: 200,
          body: {
            message: isBanned ? "User banned" : "User not banned",
          },
        };
      } catch (error) {
        return {
          status: 400,
          body: {
            message:
              "User has too many bad/flagged posts. Post was NOT submittted.",
            details: toErrorDetails(error),
          },
        };
      }
    },
  },
);
//TODO: in the legacy version, this returns the entire Bad_Posting_Behavior table
const getAllBadPosting = s.route(
  moderationApiContracts.reputation.badPostingBehavior.getAll,
  {
    middleware: [passport.authenticate("jwt", { session: false })],
    handler: async () => {
      try {
        const users = await getIdsFromBehaviorTable();

        return {
          status: 200,
          body: users,
        };
      } catch (error) {
        return {
          status: 400,
          body: {
            message: "Users not found",
            details: toErrorDetails(error),
          },
        };
      }
    },
  },
);
const getBadPostingBehavior = s.route(
  moderationApiContracts.reputation.badPostingBehavior.getBadPostingBehavior,
  {
    middleware: [passport.authenticate("jwt", { session: false })],
    handler: async ({ req }) => {
      try {
        // 1. Cast the passport user
        const user = req.user as { id: string };

        // 2. Fetch from DB
        const behavior = await prisma.bad_Posting_Behavior.findFirst({
          where: { userId: user.id },
        });

        /**
         * 3. Apply Defaults
         * If 'behavior' is null, .parse(undefined) triggers the schema-level .default().
         * This ensures the frontend always gets an object, never null.
         */
        const safeBody = BadPostingBehaviourSchema.parse(behavior ?? undefined);

        return {
          status: 200,
          body: safeBody,
        };
      } catch (error) {
        return {
          status: 400,
          body: {
            message: "User behavior record could not be retrieved",
            details: toErrorDetails(error),
          },
        };
      }
    },
  },
);
const checkThreshold = s.route(
  moderationApiContracts.reputation.badPostingBehavior.checkThreshold,
  {
    // No auth in legacy, but adding it
    middleware: [passport.authenticate("jwt", { session: false })],
    handler: async () => {
      try {
        const bannedCount = await syncAllUsersToThreshold();

        return {
          status: 200,
          body: {
            message: `Threshold check complete. ${bannedCount} users updated.`,
          },
        };
      } catch (error) {
        return {
          status: 400,
          body: {
            message: "checkBadPostingThreshhold failed",
            details: toErrorDetails(error),
          },
        };
      }
    },
  },
);
// ============================================================================
// falseFlaggingBehavior
// ============================================================================
const checkFalseFlaggingBehavior = s.route(
  moderationApiContracts.reputation.falseFlaggingBehavior
    .checkFalseFlaggingBehavior,
  {
    middleware: [passport.authenticate("jwt", { session: false })],
    handler: async () => {
      try {
        await processFalseFlaggingBans();

        return {
          status: 200,
          body: {
            message: "checkFalseFlaggingBehavior complete",
          },
        };
      } catch (error) {
        return {
          status: 400,
          body: {
            message:
              "An error occurred while trying to check false flagging behavior",
            details: toErrorDetails(error),
          },
        };
      }
    },
  },
);
const getAllFalseFlagging = s.route(
  moderationApiContracts.reputation.falseFlaggingBehavior.getAll,
  {
    middleware: [passport.authenticate("jwt", { session: false })],
    handler: async () => {
      try {
        const records = await fetchFalseFlaggingIds();

        return {
          status: 200,
          body: records.map((record) => ({
            id: record.userId,
          })),
        };
      } catch (error) {
        return {
          status: 400,
          body: {
            message:
              "An error occurred while fetching false flagging behavior records",
            details: toErrorDetails(error),
          },
        };
      }
    },
  },
);
export const reputationRouter = s.router(moderationApiContracts.reputation, {
  badPostingBehavior: {
    incrementPostFlagCount,
    incrementBadPostCount,
    resetBadPostCount,
    checkUser,
    getAll: getAllBadPosting,
    getBadPostingBehavior,
    checkThreshold,
  },
  falseFlaggingBehavior: {
    checkFalseFlaggingBehavior,
    getAll: getAllFalseFlagging,
  },
});
