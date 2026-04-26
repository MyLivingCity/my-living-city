// =============================================================================
// features/moderation/handler.ts
// =============================================================================
// ----------------------------------------------------------------------------
// Source controllers to refactor into this file:
//
// controllers/badPostingBehavior.js        → apiRouter.use('/badPostingBehavior', ...)
//
//  GET   /:userId                          get bad behavior history for user
//  POST  /incrementPostFlagCount/:ideaId   +1 flag to Idea
//  POST  /resetBadPostCount/:ideaId        resets both badPost and postFlag(?)
//  GET   /checkUser/:userId                this is a manual ban-eligible check - refactor
//  GET   /getAll(users)                    from badPostingBehaviour
//  GET   /getBadPostingBehavior/:userId
//  GET   /checkThreshhold                  same as GET /checkUser/:userId
// ----------------------------------------------------------------------------
// controllers/banComment.js                      → apiRouter.use('/banComment', banCommentRouter)
//	POST  /create	                                create a comment ban
//	GET   /getUndismissedNotification/:userId	    get undismissed ban notifications for a user
//	GET	  /getByCommentId/:banCommentId	          get ban record by comment id
//	PUT	  /dismissNotification/:banCommentId	    dismiss a comment-ban notification
//	DEL   /delete/:banCommentId	                  delete a comment ban by comment id
// ----------------------------------------------------------------------------
// controllers/banPost.js         → apiRouter.use('/banPost', banPostRouter)
//	POST	/create	                              create a post ban
//	GET	  /getUndismissedNotification/:userId	  get undismissed post-ban notifications for a user
//	GET	  /getByPostId/:banPostId	              get ban record by post id
//	PUT	  /dismissNotification/:banPostId	      dismiss a post-ban notification
//	DEL	  /delete/:banPostId	                  delete a post ban by post id
// ----------------------------------------------------------------------------
// controllers/banUser.js         → apiRouter.use('/banUser', banUserRouter)
//	POST	/create	                  create a user ban
//	GET	  /getAll	                  get all user bans
//	GET	  /get/:userId	            get all bans for a specific user
//	GET	  /getMostRecent/:userId	  get most recent ban for a specific user
//	GET	  /getMostRecentWithToken	  get most recent ban for authenticated user
//	PUT	  /update/:userId	          update the most recent ban for a specific user
//	GET	  /getAllPassedDate	        get banned users whose ban date has passed
//	DEL   /deletePassedBanDate	    delete bans with passed ban date
//  DEL   /delete/:userId           remove a userId from UserBan (commented code is wrong)
// ----------------------------------------------------------------------------
// controllers/commentFlag.js     → apiRouter.use('/commentFlag', commentFlagRouter)
//	POST	/create/:commentId	          create a flag for a specific comment
//	GET	  /getAll	                      get all comment flags
//	PUT	  /falseFlagMany/:commentId	    mark many flags on a comment as false and update false-flag behavior
//	GET	  /getFlags/:commentId	        get flag count for a specific comment
// ----------------------------------------------------------------------------
// controllers/falseFlaggingBehavior.js → apiRouter.use('/falseFlaggingBehavior', ...)
//   NOTE: verify whether any routes are actually implemented before migrating
//	GET	  /getAll	                      get all users in false-flagging behavior table
//  GET   /getById/:userId              get user false-flagging behavior
//	GET	  /checkFalseFlaggingBehavior	  apply false-flag threshold checks and set flag bans
// ----------------------------------------------------------------------------
// controllers/flag.js                  Idea flagging
//	POST	/create/:ideaId	              create a flag for a specific idea
//	GET	  /getAll	                      get all idea flags
//	PUT	  /falseFlagMany/:ideaId	      mark many flags on an idea as false and update false-flag behavior
//	GET	  /getFlags/:ideaID	            get flag count for a specific idea
//	GET	  /checkFlagBan/:userID	        check if user has a flag ban
// ----------------------------------------------------------------------------
// =============================================================================
import { initServer } from "@ts-rest/express";
import * as passport from "passport";
import { moderationApiContracts } from "@mlc/lib/api";
import { toErrorDetails } from "src/server/utils";
import { z } from "zod";
import { prisma } from "src/prisma/client";
import { BadPostingBehaviourSchema } from "@mlc/lib/api/contracts/moderation/reputation";
import { UserSchema } from "@mlc/lib/api";
import { Handlers } from "src/server";

type User = z.infer<typeof UserSchema>;

const s = initServer();
// ============================================================================
// REPUTATION
// ============================================================================
// ============================================================================
//  badPostingBehavior
// ============================================================================
// ----------------------------------------------------------------------------
//  SERVICES
// ----------------------------------------------------------------------------
const incrementUserBadPostStats = async (authorId: string) => {
  const behaviorRecord = await prisma.bad_Posting_Behavior.findFirst({
    where: { userId: authorId },
  });

  if (behaviorRecord) {
    return await prisma.bad_Posting_Behavior.update({
      where: { id: behaviorRecord.id },
      data: { bad_post_count: { increment: 1 } },
    });
  }

  return await prisma.bad_Posting_Behavior.create({
    data: {
      userId: authorId,
      bad_post_count: 1,
    },
  });
};
// ----------------------------------------------------------------------------
const incrementUserFlagStats = async (authorId: string) => {
  const record = await prisma.bad_Posting_Behavior.findFirst({
    where: { userId: authorId },
  });

  if (record) {
    return await prisma.bad_Posting_Behavior.update({
      where: { id: record.id },
      data: { post_flag_count: { increment: 1 } },
    });
  }

  return await prisma.bad_Posting_Behavior.create({
    data: {
      userId: authorId,
      post_flag_count: 1,
    },
  });
};
// ----------------------------------------------------------------------------
const getAuthorFromIdea = async (ideaId: number) => {
  const idea = await prisma.idea.findUnique({
    where: { id: ideaId },
    select: { authorId: true },
  });

  if (!idea) {
    return {
      error: {
        status: 400 as const,
        body: {
          message: "Idea not found",
          details: { errorMessage: "Idea not found", errorStack: "" },
        },
      },
    };
  }
  return { authorId: idea.authorId };
};
// ----------------------------------------------------------------------------
const resetUserBadPostStats = async (userId: string) => {
  return await prisma.bad_Posting_Behavior.updateMany({
    where: { userId },
    data: {
      bad_post_count: 0,
      post_flag_count: 0,
    },
  });
};
// ----------------------------------------------------------------------------
const evaluateAndApplyUserBan = async (userId: string): Promise<boolean> => {
  const behavior = await prisma.bad_Posting_Behavior.findFirst({
    where: { userId },
  });

  // 1. Check if record exists and if either threshold is hit
  if (
    behavior &&
    (behavior.bad_post_count >= 3 || behavior.post_flag_count >= 3)
  ) {
    // 2. Update the specific record found using its unique ID
    await prisma.bad_Posting_Behavior.update({
      where: { id: behavior.id },
      data: { post_comment_ban: true },
    });

    return true; // Successfully applied ban
  }

  return false; // Criteria not met or user record not found
};
// ----------------------------------------------------------------------------
const getIdsFromBehaviorTable = async (): Promise<string[]> => {
  const records = await prisma.bad_Posting_Behavior.findMany({
    select: { userId: true },
  });

  // Extract the flat list of string IDs from the objects
  return records.map((record) => record.userId);
};
// ----------------------------------------------------------------------------
// const getUserBehaviorRecord = async (userId: string) => {
//   return await prisma.bad_Posting_Behavior.findFirst({
//     where: { userId },
//   });
// };
// ----------------------------------------------------------------------------

const syncAllUsersToThreshold = async () => {
  // 1. Fetch the threshold (ID 3 per legacy requirements)
  const thresholdRecord = await prisma.threshhold.findUnique({
    where: { id: 3 },
  });

  if (!thresholdRecord) {
    throw new Error("Global threshold configuration (ID: 3) not found.");
  }

  /**
   * 2. Batch Update
   * We can't do math (A + B >= C) inside a standard Prisma updateMany easily
   * without raw SQL, so we fetch the IDs that need updating first.
   */
  const offenders = await prisma.bad_Posting_Behavior.findMany({
    where: {
      post_comment_ban: false, // Only check those not already banned
    },
  });

  const idsToBan = offenders
    .filter(
      (u) => u.bad_post_count + u.post_flag_count >= thresholdRecord.number,
    )
    .map((u) => u.userId);

  if (idsToBan.length > 0) {
    await prisma.bad_Posting_Behavior.updateMany({
      where: { userId: { in: idsToBan } },
      data: { post_comment_ban: true },
    });
  }

  return idsToBan.length;
};
// ----------------------------------------------------------------------------
//  ROUTES
// ----------------------------------------------------------------------------
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
        // The legacy code used findFirst then updateMany;
        // updateMany is safe even if the record doesn't exist yet.
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
// ----------------------------------------------------------------------------
//  SERVICES
// ----------------------------------------------------------------------------
const processFalseFlaggingBans = async () => {
  const thresholdRecord = await prisma.threshhold.findUnique({
    where: { id: 2 },
  });

  if (!thresholdRecord) {
    throw new Error(
      "False flagging threshold configuration (ID: 2) not found.",
    );
  }

  const behaviors = await prisma.false_Flagging_Behavior.findMany();

  const updates = behaviors
    .filter((user) => user.flag_count >= thresholdRecord.number)
    .map((user) =>
      prisma.false_Flagging_Behavior.update({
        where: { id: user.id },
        data: { flag_ban: true },
      }),
    );

  await Promise.all(updates);
  return updates.length;
};
// ----------------------------------------------------------------------------
const fetchAllFalseFlaggingWithUsers = async () => {
  return await prisma.false_Flagging_Behavior.findMany({
    include: {
      user: true, // This brings in the related User object
    },
  });
};
// ----------------------------------------------------------------------------
//  ROUTES
// ----------------------------------------------------------------------------
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
        const records = await fetchAllFalseFlaggingWithUsers();

        return {
          status: 200,
          body: records.map((record) => ({
            id: record.user.id,
            email: record.user.email,
            banned: record.flag_ban,
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
// ============================================================================
// BANS
// ============================================================================
// ============================================================================
// banComment
// ============================================================================
// ----------------------------------------------------------------------------
//  SERVICES
// ----------------------------------------------------------------------------
/**
 * Logic extracted for service.ts.
 * Handles the double-write to CommentBan and Ban_History.
 */
const executeCommentBan = async (data: {
  commentId: number;
  authorId: string;
  banReason: string;
  banMessage: string;
  moderatorId: string;
  ideaId: number;
}) => {
  // We use a transaction to ensure both logs are created or neither are
  return await prisma.$transaction(async (tx) => {
    const createdBan = await tx.commentBan.create({
      data: {
        commentId: data.commentId,
        authorId: data.authorId,
        banReason: data.banReason,
        banMessage: data.banMessage,
        bannedBy: data.moderatorId,
      },
    });

    await tx.ban_History.create({
      data: {
        userId: data.authorId,
        type: "COMMENT", // Assuming BanType.COMMENT string value
        reason: data.banReason,
        ideaId: data.ideaId,
        commentId: data.commentId,
        modId: data.moderatorId,
        message: data.banMessage,
      },
    });

    return createdBan;
  });
};
// ----------------------------------------------------------------------------
//  ROUTES
// ----------------------------------------------------------------------------
// controllers/banComment.js                      → apiRouter.use('/banComment', banCommentRouter)
//	POST  /create	                                create a comment ban
//	GET   /getUndismissedNotification/:userId	    get undismissed ban notifications for a user
//	GET	  /getByCommentId/:banCommentId	          get ban record by comment id
//	PUT	  /dismissNotification/:banCommentId	    dismiss a comment-ban notification
//	DEL   /delete/:banCommentId	                  delete a comment ban by comment id
// ----------------------------------------------------------------------------
const createCommentBan = s.route(
  moderationApiContracts.bans.commentBans.create,
  {
    middleware: [passport.authenticate("jwt", { session: false })],
    handler: async ({ body, req }) => {
      try {
        const moderatorId = (req.user as User).id;
        const { commentId, banReason, banMessage } = body;

        // 1. Check if comment exists & get ideaId for history
        const foundComment = await prisma.ideaComment.findUnique({
          where: { id: commentId },
        });

        if (!foundComment) {
          return {
            status: 400,
            body: {
              message: "Action Prohibited",
              details: toErrorDetails(
                new Error(`The comment (${commentId}) does not exist.`),
              ),
            },
          };
        }

        // 2. Check for existing ban
        const alreadyBanned = await prisma.commentBan.findFirst({
          where: { commentId },
        });

        if (alreadyBanned) {
          return {
            status: 400,
            body: {
              message: "Action Prohibited", // The high-level summary
              details: toErrorDetails(
                new Error("A comment can only be banned once."),
              ),
            },
          };
        }

        // 3. Execute ban and history log
        await executeCommentBan({
          commentId,
          authorId: foundComment.authorId, // Taking author from the found comment
          banReason,
          banMessage,
          moderatorId,
          ideaId: foundComment.ideaId,
        });

        return {
          status: 201,
          body: {
            message: `Successfully banned comment ${commentId}`,
          },
        };
      } catch (error) {
        return {
          status: 400,
          body: {
            message: `Error occurred when trying to ban comment ${body.commentId}`,
            details: toErrorDetails(error),
          },
        };
      }
    },
  },
);
// ----------------------------------------------------------------------------
//  EXPORTS
// ----------------------------------------------------------------------------
export default {
  schema: moderationApiContracts,
  router: {
    //reputation
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
    //bans
    banComment: {
      create: createCommentBan,
    },
    //flags
  },
} as unknown as Handlers;
// ============================================================================
// falseFlaggingBehavior
// ============================================================================
// ----------------------------------------------------------------------------
//  SERVICES
// ----------------------------------------------------------------------------
const processFalseFlaggingBans = async () => {
  const thresholdRecord = await prisma.threshhold.findUnique({
    where: { id: 2 },
  });

  if (!thresholdRecord) {
    throw new Error(
      "False flagging threshold configuration (ID: 2) not found.",
    );
  }

  const behaviors = await prisma.false_Flagging_Behavior.findMany();

  const updates = behaviors
    .filter((user) => user.flag_count >= thresholdRecord.number)
    .map((user) =>
      prisma.false_Flagging_Behavior.update({
        where: { id: user.id },
        data: { flag_ban: true },
      }),
    );

  await Promise.all(updates);
  return updates.length;
};
// ----------------------------------------------------------------------------
import { Prisma } from "../../../../node_modules/prisma";
// const fetchAllFalseFlaggingRecords = async () => {
//   return await prisma.false_Flagging_Behavior.findMany();
// };
const fetchAllFalseFlaggingRecords = async (): Promise<
  Prisma.false_Flagging_BehaviorGetPayload<{}>[]
> => {
  return await prisma.false_Flagging_Behavior.findMany();
};
// ----------------------------------------------------------------------------
//  ROUTES
// ----------------------------------------------------------------------------
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
        const users = await fetchAllFalseFlaggingRecords();

        return {
          status: 200,
          body: users.map((user) => ({
            id: user.id,
            email: user.email,
            banned: user.flag_ban, // Mapping flag_ban from legacy to banned in contract
          })),
        };
      } catch (error) {
        return {
          status: 400,
          body: {
            message:
              "An error occurred while trying to get all users from false flagging behavior table",
            details: toErrorDetails(error),
          },
        };
      }
    },
  },
);
// ----------------------------------------------------------------------------
//  EXPORTS
// ----------------------------------------------------------------------------
export default {
  schema: moderationApiContracts,
  router: {
    //reputation
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
    //bans

    //flags
  },
} as unknown as Handlers;
