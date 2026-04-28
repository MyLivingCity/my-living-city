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
import { BanTypeSchema } from "@mlc/lib/api/contracts/moderation/bans";

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
// TODO: determine if further fields should be SELECTed
// keeping it lean to start to minimize database load
const fetchFalseFlaggingIds = async () => {
  return await prisma.false_Flagging_Behavior.findMany({
    select: {
      userId: true,
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
  const createdAt = new Date();

  // We use a transaction to ensure both logs are created or neither are
  return await prisma.$transaction(async (tx) => {
    const createdBan = await tx.commentBan.create({
      data: {
        commentId: data.commentId,
        authorId: data.authorId,
        banReason: data.banReason,
        banMessage: data.banMessage,
        bannedBy: data.moderatorId,
        createdAt: createdAt,
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
        createdAt: createdAt,
      },
    });

    return createdBan;
  });
};
// ----------------------------------------------------------------------------
const updateNotificationStatus = async (banCommentId: number) => {
  return await prisma.commentBan.update({
    where: { id: banCommentId },
    data: { notificationDismissed: true },
  });
};
// ----------------------------------------------------------------------------

const fetchCommentBanByCommentId = async (commentId: number) => {
  return await prisma.commentBan.findFirst({
    where: { commentId },
  });
};
// ----------------------------------------------------------------------------
const fetchUndismissedBans = async (authorId: string) => {
  return await prisma.commentBan.findMany({
    where: {
      notificationDismissed: false,
      authorId: authorId,
    },
    include: {
      comment: true, // Includes the related IdeaComment
    },
  });
};
// ----------------------------------------------------------------------------
const deleteCommentBanByCommentId = async (commentId: number) => {
  const foundBan = await prisma.commentBan.findFirst({
    where: { commentId },
  });

  if (!foundBan) return null;

  return await prisma.commentBan.delete({
    where: { id: foundBan.id },
  });
};
// ----------------------------------------------------------------------------
//  ROUTES
// ----------------------------------------------------------------------------
// controllers/banComment.js                      → apiRouter.use('/banComment', banCommentRouter)
//x	POST  /create	                                create a comment ban
//x	GET   /getUndismissedNotification/:userId	    get undismissed ban notifications for a user
//x	GET	  /getByCommentId/:banCommentId	          get ban record by comment id
//x	POST  /dismissNotification/:banCommentId	    dismiss a comment-ban notification
//x	DEL   /delete/:banCommentId	                  delete a comment ban by comment id
// ----------------------------------------------------------------------------
const createCommentBan = s.route(
  moderationApiContracts.bans.banComment.create,
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
const dismissCommentBanNotification = s.route(
  moderationApiContracts.bans.banComment.dismissNotification,
  {
    middleware: [passport.authenticate("jwt", { session: false })],
    handler: async ({ params }) => {
      const { commentBanId } = params;

      try {
        // 1. Check if the ban exists
        const foundBan = await prisma.commentBan.findUnique({
          where: { id: commentBanId },
        });

        if (!foundBan) {
          return {
            status: 400,
            body: {
              message: `The ban (${commentBanId}) does not exist.`,
              details: toErrorDetails(new Error("Resource not found")),
            },
          };
        }

        // 2. Perform update
        await updateNotificationStatus(commentBanId);

        return {
          status: 200,
          body: {
            message: `Successfully dismissed notification for comment ban: ${commentBanId}`,
          },
        };
      } catch (error) {
        return {
          status: 400,
          body: {
            message:
              "Error occurred when trying to dismiss comment notification",
            details: toErrorDetails(error),
          },
        };
      }
    },
  },
);
const getCommentBanById = s.route(
  moderationApiContracts.bans.banComment.getById,
  {
    middleware: [passport.authenticate("jwt", { session: false })],
    handler: async ({ params }) => {
      const { commentBanId } = params;

      try {
        const foundBan = await fetchCommentBanByCommentId(commentBanId);

        if (!foundBan) {
          return {
            status: 400,
            body: {
              message: `The ban for comment (${commentBanId}) does not exist.`,
              details: toErrorDetails(new Error("Record not found")),
            },
          };
        }

        return {
          status: 200,
          body: {
            type: "COMMENT",
            id: foundBan.id,
            commentId: foundBan.commentId,
            banMessage: foundBan.banMessage ?? "",
            bannedBy: foundBan.bannedBy,
            createdAt: foundBan.createdAt,
            notificationDismissed: foundBan.notificationDismissed,
            authorId: foundBan.authorId,
            banReason: foundBan.banReason,
          },
        };
      } catch (error) {
        return {
          status: 400,
          body: {
            message: "Error occurred when trying to get banned comment",
            details: toErrorDetails(error),
          },
        };
      }
    },
  },
);
const getUndismissedCommentBanNotifications = s.route(
  moderationApiContracts.bans.banComment.getUndismissedNotifications,
  {
    middleware: [passport.authenticate("jwt", { session: false })],
    handler: async ({ params }) => {
      const { userId } = params;

      try {
        const bans = await fetchUndismissedBans(userId);

        /**
         * Mapping to CommentBanRaw:
         * 1. Injects the 'type' discriminator.
         * 2. Maps the related comment's authorId.
         * 3. Ensures 'banMessage' has a default to avoid Zod issues if null in DB.
         */
        const formattedBans = bans.map((ban) => ({
          ...ban,
          type: BanTypeSchema.enum.COMMENT,
          banMessage: ban.banMessage ?? "",
          authorId: ban.comment.authorId,
          commentId: ban.commentId,
          createdAt: ban.createdAt,
        }));

        return {
          status: 200,
          body: formattedBans,
        };
      } catch (error) {
        return {
          status: 400,
          body: {
            message:
              "Error occurred when trying to get undismissed comment notifications",
            details: toErrorDetails(error),
          },
        };
      }
    },
  },
);
const deleteCommentBan = s.route(
  moderationApiContracts.bans.banComment.deleteById,
  {
    middleware: [passport.authenticate("jwt", { session: false })],
    handler: async ({ params }) => {
      const { commentBanId } = params;

      try {
        const deletedRecord = await deleteCommentBanByCommentId(commentBanId);

        if (!deletedRecord) {
          return {
            status: 400,
            body: {
              message: `The ban (${commentBanId}) does not exist.`,
              details: toErrorDetails(new Error("Resource not found")),
            },
          };
        }

        return {
          status: 200,
          body: {
            message: `Successfully deleted comment ban: ${commentBanId}`,
          },
        };
      } catch (error) {
        return {
          status: 400,
          body: {
            message: "Error occurred when trying to delete comment ban",
            details: toErrorDetails(error),
          },
        };
      }
    },
  },
);
// ============================================================================
// banPost
// ============================================================================
// ----------------------------------------------------------------------------
//  SERVICES
// ----------------------------------------------------------------------------
const fetchPostBanByPostId = async (postId: number) => {
  return await prisma.postBan.findFirst({
    where: { postId },
  });
};
// ----------------------------------------------------------------------------

const fetchUndismissedPostBans = async (authorId: string) => {
  return await prisma.postBan.findMany({
    where: {
      notificationDismissed: false,
      authorId: authorId,
    },
    include: {
      post: true,
    },
  });
};
// ----------------------------------------------------------------------------
const executePostBan = async (data: {
  postId: number;
  authorId: string;
  banReason: string;
  banMessage: string;
  moderatorId: string;
}) => {
  const createdAt = new Date(); // Internal timestamping

  return await prisma.$transaction(async (tx) => {
    const createdBan = await tx.postBan.create({
      data: {
        postId: data.postId,
        authorId: data.authorId,
        banReason: data.banReason,
        banMessage: data.banMessage,
        bannedBy: data.moderatorId,
        createdAt,
      },
    });

    await tx.ban_History.create({
      data: {
        userId: data.authorId,
        type: "IDEA", // Mapping BanType.IDEA per legacy ctrl
        reason: data.banReason,
        ideaId: data.postId,
        modId: data.moderatorId,
        message: data.banMessage,
        createdAt,
      },
    });

    return createdBan;
  });
};
// ----------------------------------------------------------------------------
const updatePostNotificationStatus = async (postBanId: number) => {
  return await prisma.postBan.update({
    where: { id: postBanId },
    data: { notificationDismissed: true },
  });
};
// ----------------------------------------------------------------------------
const removePostBanByPostId = async (postId: number) => {
  const foundBan = await prisma.postBan.findFirst({
    where: { postId },
  });

  if (!foundBan) return null;

  return await prisma.postBan.delete({
    where: { id: foundBan.id },
  });
};
// ----------------------------------------------------------------------------
//  ROUTES
// ----------------------------------------------------------------------------
const createPostBan = s.route(moderationApiContracts.bans.banPost.create, {
  middleware: [passport.authenticate("jwt", { session: false })],
  handler: async ({ body, req }) => {
    try {
      const moderatorId = (req.user as User).id;
      const { postId, authorId } = body;

      const banReason = body.banReason ?? "No reason provided";
      const banMessage = body.banMessage ?? "";

      // 1. Check if post exists
      const foundPost = await prisma.idea.findUnique({
        where: { id: postId },
      });

      if (!foundPost) {
        return {
          status: 400,
          body: {
            message: `The post (${postId}) does not exist.`,
            details: toErrorDetails(new Error("No post found")),
          },
        };
      }

      // 2. Check if already banned
      const alreadyBanned = await prisma.postBan.findFirst({
        where: { postId },
      });

      if (alreadyBanned) {
        return {
          status: 400,
          body: {
            message: "This post is already banned.",
            details: toErrorDetails(
              new Error("A post can only be banned once."),
            ),
          },
        };
      }

      // 3. Execute Transaction
      await executePostBan({
        postId,
        authorId,
        banReason,
        banMessage,
        moderatorId,
      });

      return {
        status: 201,
        body: {
          message: `Successfully banned post: ${postId}`,
        },
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: `Error occurred when trying to ban post: ${body.postId}`,
          details: toErrorDetails(error),
        },
      };
    }
  },
});
const dismissPostNotification = s.route(
  moderationApiContracts.bans.banPost.dismissNotification,
  {
    middleware: [passport.authenticate("jwt", { session: false })],
    handler: async ({ params }) => {
      const { postBanId } = params;

      try {
        // 1. Verify the ban exists
        const foundBan = await prisma.postBan.findUnique({
          where: { id: postBanId },
        });

        if (!foundBan) {
          return {
            status: 400,
            body: {
              message: `The ban (${postBanId}) does not exist.`,
              details: toErrorDetails(new Error("Record not found")),
            },
          };
        }

        // 2. Perform the update
        await updatePostNotificationStatus(postBanId);

        return {
          status: 200,
          body: {
            message: `Successfully dismissed notification for ban: ${postBanId}`,
          },
        };
      } catch (error) {
        return {
          status: 400,
          body: {
            message: "Error occurred when trying to dismiss notification",
            details: toErrorDetails(error),
          },
        };
      }
    },
  },
);
const getPostBanById = s.route(
  moderationApiContracts.bans.banPost.getByPostId,
  {
    // No auth in legacy ctrl
    handler: async ({ params }) => {
      const { postBanId } = params;

      try {
        const foundBan = await fetchPostBanByPostId(postBanId);

        if (!foundBan) {
          return {
            status: 400,
            body: {
              message: `The ban (${postBanId}) does not exist.`,
              details: toErrorDetails(new Error("Record not found")),
            },
          };
        }

        return {
          status: 200,
          body: {
            ...foundBan,
            type: BanTypeSchema.enum.IDEA,
            banMessage: foundBan.banMessage ?? "",
            createdAt: foundBan.createdAt.toISOString(),
          },
        };
      } catch (error) {
        return {
          status: 400,
          body: {
            message: "Error occurred when trying to get banned post",
            details: toErrorDetails(error),
          },
        };
      }
    },
  },
);
const getUndismissedPostNotifications = s.route(
  moderationApiContracts.bans.banPost.getUndismissedNotifications,
  {
    middleware: [passport.authenticate("jwt", { session: false })],
    handler: async ({ params }) => {
      const { userId } = params;

      try {
        const bans = await fetchUndismissedPostBans(userId);

        const formattedBans = bans.map((ban) => ({
          ...ban,
          type: BanTypeSchema.enum.IDEA,
          postId: ban.post.id,
          banMessage: ban.banMessage ?? "",
        }));

        return {
          status: 200,
          body: formattedBans,
        };
      } catch (error) {
        return {
          status: 400,
          body: {
            message:
              "Error occurred when trying to get undismissed notifications",
            details: toErrorDetails(error),
          },
        };
      }
    },
  },
);
const deletePostBan = s.route(moderationApiContracts.bans.banPost.delete, {
  middleware: [passport.authenticate("jwt", { session: false })],
  handler: async ({ params }) => {
    const { postBanId } = params;

    try {
      const deletedRecord = await removePostBanByPostId(postBanId);

      if (!deletedRecord) {
        return {
          status: 400,
          body: {
            message: `The ban (${postBanId}) does not exist.`,
            details: toErrorDetails(new Error("Record not found")),
          },
        };
      }

      return {
        status: 200,
        body: {
          message: `Successfully deleted ban: ${postBanId}`,
        },
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "Error occurred when trying to delete ban",
          details: toErrorDetails(error),
        },
      };
    }
  },
});
// ============================================================================
// banUser
// ============================================================================
// ----------------------------------------------------------------------------
//  SERVICES
// ----------------------------------------------------------------------------
const executeUserBan = async (data: {
  userId: string;
  banType: BanUserType;
  banDurationDays: number;
  banReason: string;
  banMessage: string;
  moderatorId: string;
}) => {
  const createdAt = new Date();
  // Equivalent to legacy logic: duration in days -> ms
  const banUntil = new Date(
    createdAt.getTime() + data.banDurationDays * 24 * 60 * 60 * 1000,
  );

  return await prisma.$transaction(async (tx) => {
    // 1. Create the active ban record
    const createdBan = await tx.userBan.create({
      data: {
        userId: data.userId,
        banType: data.banType,
        banReason: data.banReason,
        banMessage: data.banMessage,
        bannedBy: data.moderatorId,
        banDuration: data.banDurationDays,
        banUntil: banUntil,
        createdAt: createdAt,
      },
    });

    // 2. Log to ban history (using "USER" type for the audit trail)
    await tx.ban_History.create({
      data: {
        userId: data.userId,
        type: BanTypeSchema.enum.USER,
        reason: data.banReason,
        userBanType: data.banType,
        userBannedUntil: banUntil,
        modId: data.moderatorId,
        message: data.banMessage,
        createdAt: createdAt,
      },
    });

    // 3. Update the User model status
    await tx.user.update({
      where: { id: data.userId },
      data: { banned: true },
    });

    return createdBan;
  });
};
// ----------------------------------------------------------------------------
const fetchAllUserBans = async () => {
  return await prisma.userBan.findMany();
};
// ----------------------------------------------------------------------------
const fetchUserBanHistory = async (userId: string) => {
  return await prisma.userBan.findMany({
    where: { userId },
    orderBy: { id: "desc" },
  });
};
// ----------------------------------------------------------------------------
const fetchMostRecentUserBan = async (userId: string) => {
  return await prisma.userBan.findFirst({
    where: { userId },
    orderBy: { id: "desc" },
  });
};
// ----------------------------------------------------------------------------
const fetchSelfBanRecord = async (userId: string) => {
  return await prisma.userBan.findFirst({
    where: { userId },
    orderBy: { id: "desc" },
  });
};
// ----------------------------------------------------------------------------
const updateLatestUserBan = async (
  userId: string,
  data: Partial<Prisma.UserBanUpdateInput>,
) => {
  const latestBan = await prisma.userBan.findFirst({
    where: { userId },
    orderBy: { id: "desc" },
  });

  if (!latestBan) return null;

  return await prisma.userBan.update({
    where: { id: latestBan.id },
    data,
  });
};
// ----------------------------------------------------------------------------
const executeUserUnban = async (userId: string) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Remove all records from the userBan table for this user
    const deleteResult = await tx.userBan.deleteMany({
      where: { userId },
    });

    // 2. Update the main user record to lift the ban flag
    await tx.user.update({
      where: { id: userId },
      data: { banned: false },
    });

    return deleteResult.count;
  });
};
// ----------------------------------------------------------------------------
const fetchExpiredUserBans = async () => {
  // 1. Get IDs of all users currently flagged as 'banned'
  const bannedUsers = await prisma.user.findMany({
    where: { banned: true },
    select: { id: true },
  });

  if (bannedUsers.length === 0) return [];

  const bannedUserIds = bannedUsers.map((u) => u.id);

  // 2. Find the single most recent ban for each of those users
  const latestBans = await prisma.userBan.findMany({
    where: {
      userId: { in: bannedUserIds },
    },
    orderBy: { id: "desc" },
    distinct: ["userId"],
  });

  // 3. Filter the set down to those that have actually passed their expiry date
  const now = new Date();
  return latestBans.filter(
    (ban) => ban.banUntil !== null && ban.banUntil <= now,
  );
};
// ----------------------------------------------------------------------------
/**
 * Service to batch-remove expired bans and restore user access.
 * Handles the table cleanup and ensures the User 'banned' flag is reset.
 */
const cleanupExpiredBans = async () => {
  const now = new Date();

  return await prisma.$transaction(async (tx) => {
    // 1. Identify which users are about to be unbanned (for the User table update)
    const expiredBans = await tx.userBan.findMany({
      where: { banUntil: { lte: now } },
      select: { userId: true },
    });

    const userIdsToRestore = expiredBans.map((b) => b.userId);

    // 2. Remove the expired records from UserBan
    const deleteResult = await tx.userBan.deleteMany({
      where: { banUntil: { lte: now } },
    });

    // 3. Set 'banned' to false for those users in the main User table
    if (userIdsToRestore.length > 0) {
      await tx.user.updateMany({
        where: { id: { in: userIdsToRestore } },
        data: { banned: false },
      });
    }

    return deleteResult.count;
  });
};

// ----------------------------------------------------------------------------
//  ROUTES
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// controllers/banUser.js         → apiRouter.use('/banUser', banUserRouter)
//x	POST	/create	                  create a user ban
//x	GET	  /getAll	                  get all user bans
//x	GET	  /get/:userId	            get all bans for a specific user
//x	GET	  /getMostRecent/:userId	  get most recent ban for a specific user
//x	GET	  /getMostRecentWithToken	  get most recent ban for authenticated user
//x	PUT	  /update/:userId	          update the most recent ban for a specific user
//	GET	  /getAllPassedDate	        get banned users whose ban date has passed
//	DEL   /deletePassedBanDate	    delete bans with passed ban date
//x DEL   /delete/:userId           remove a userId from UserBan (commented code is wrong)
// ----------------------------------------------------------------------------
const createUserBan = s.route(moderationApiContracts.bans.banUser.create, {
  middleware: [passport.authenticate("jwt", { session: false })],
  handler: async ({ body, req }) => {
    try {
      const moderatorId = (req.user as User).id;
      const { userId, banType, banDuration } = body;

      // Legacy body allowed reason/message but contract pick() may vary
      const banReason = body.banReason ?? "Terms of Service Violation";
      const banMessage = body.banMessage ?? "";

      // 1. Validate user existence
      const foundUser = await prisma.user.findUnique({ where: { id: userId } });
      if (!foundUser) {
        return {
          status: 400,
          body: {
            message: "User not found",
            details: toErrorDetails(
              new Error(
                `The user with that listed ID (${userId}) does not exist.`,
              ),
            ),
          },
        };
      }

      // 2. Prevent duplicate active bans
      if (foundUser.banned) {
        return {
          status: 400,
          body: {
            message: "This user is already banned.",
            details: toErrorDetails(
              new Error("A user can only be banned once."),
            ),
          },
        };
      }

      // 3. Execute Transaction
      await executeUserBan({
        userId,
        banType,
        banDurationDays: banDuration,
        banReason,
        banMessage,
        moderatorId,
      });

      return {
        status: 201,
        body: {
          message: `Successfully banned user ${userId}`,
        },
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: `Error occurred when trying to ban user ${body.userId}`,
          details: toErrorDetails(error),
        },
      };
    }
  },
});
const getAllUserBans = s.route(moderationApiContracts.bans.banUser.getAll, {
  middleware: [passport.authenticate("jwt", { session: false })],
  handler: async () => {
    try {
      const bans = await fetchAllUserBans();

      /**
       * Mapping to UserBanRaw:
       * 1. Injects 'type' for the discriminated union.
       * 2. Relies on schema coercion/pipes for Date -> ISO string conversion.
       * 3. ensures banMessage matches the schema default.
       */
      const formattedBans = bans.map((ban) => ({
        ...ban,
        type: BanTypeSchema.enum.USER,
        banMessage: ban.banMessage ?? "",
        // Note: banUntil and createdAt will be auto-formatted by the schema pipe
      }));

      return {
        status: 200,
        body: formattedBans,
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "Error occurred when trying to get all banned users",
          details: toErrorDetails(error),
        },
      };
    }
  },
});
const getUserBanById = s.route(moderationApiContracts.bans.banUser.getById, {
  middleware: [passport.authenticate("jwt", { session: false })],
  handler: async ({ params }) => {
    const { userId } = params;

    try {
      const bans = await fetchUserBanHistory(userId);

      // Note: Legacy used an 'if(userBan)' check on a findMany,
      // which is always truthy ([]). We'll check length to match the intent.
      if (bans.length === 0) {
        return {
          status: 400,
          body: {
            message: `The user with that listed ID (${userId}) has never been banned.`,
            details: toErrorDetails(new Error("No records found")),
          },
        };
      }

      /**
       * Mapping to UserBanRaw:
       * 1. Injects 'USER' type for the union.
       * 2. Handles null coalescing for the message.
       * 3. Relies on your safeDateFormat pipe in the schema for dates.
       */
      const formattedBans = bans.map((ban) => ({
        ...ban,
        type: BanTypeSchema.enum.USER,
        banMessage: ban.banMessage ?? "",
      }));

      return {
        status: 200,
        body: formattedBans,
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: `Error occurred when trying to get banned user ${userId}`,
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const getMostRecent = s.route(
  moderationApiContracts.bans.banUser.getMostRecent,
  {
    middleware: [passport.authenticate("jwt", { session: false })],
    handler: async ({ params }) => {
      const { userId } = params;

      try {
        const ban = await fetchMostRecentUserBan(userId);

        /**
         * Note: Legacy returned a 200 with a message if no ban was found.
         * However, your contract expects a UserBanSchema (object) for 200.
         * To avoid Zod validation errors, we return a 400 if the record is missing.
         */
        if (!ban) {
          return {
            status: 400,
            body: {
              message: `The user with ID (${userId}) has never been banned.`,
              details: toErrorDetails(new Error("No ban history found")),
            },
          };
        }

        return {
          status: 200,
          body: {
            ...ban,
            type: BanTypeSchema.enum.USER,
            banMessage: ban.banMessage ?? "",
          },
        };
      } catch (error) {
        return {
          status: 400,
          body: {
            message: `Error occurred when trying to get most recent ban for ${userId}`,
            details: toErrorDetails(error),
          },
        };
      }
    },
  },
);
const getMostRecentWithToken = s.route(
  moderationApiContracts.bans.banUser.getMostRecentWithToken,
  {
    middleware: [passport.authenticate("jwt", { session: false })],
    handler: async ({ req }) => {
      const userId = (req.user as User).id;

      try {
        const ban = await fetchSelfBanRecord(userId);

        // HAPPY PATH: No ban record found.
        // 204 No Content tells the frontend "You're good to go."
        if (!ban) {
          return {
            status: 204,
            body: undefined,
          };
        }

        // SAD PATH: User has a ban history.
        // 200 returns the record so the frontend can show why/for how long.
        return {
          status: 200,
          body: {
            ...ban,
            type: BanTypeSchema.enum.USER,
            banMessage: ban.banMessage ?? "",
          },
        };
      } catch (error) {
        return {
          status: 400,
          body: {
            message: "Error checking session ban status",
            details: toErrorDetails(error),
          },
        };
      }
    },
  },
);
const updateUserBan = s.route(
  moderationApiContracts.bans.banUser.updateUserBan,
  {
    middleware: [passport.authenticate("jwt", { session: false })],
    handler: async ({ params, body }) => {
      const { userId } = params;

      try {
        /**
         * We extract the data fields from the body.
         * Note: 'id', 'type', and 'createdAt' are usually immutable;
         * we only pass through business-logic fields.
         */
        const { banReason, banMessage, banUntil, banType } = body;

        const updated = await updateLatestUserBan(userId, {
          banReason,
          banMessage,
          banUntil: banUntil ? new Date(banUntil) : undefined,
          banType,
        });

        if (!updated) {
          return {
            status: 400,
            body: {
              message: `${userId} has no record of being banned.`,
              details: toErrorDetails(new Error("Record not found")),
            },
          };
        }

        return {
          status: 200,
          body: {
            message: `Successfully updated the most recent ban for user ${userId}`,
          },
        };
      } catch (error) {
        return {
          status: 400,
          body: {
            message: "Error occurred when trying to update ban.",
            details: toErrorDetails(error),
          },
        };
      }
    },
  },
);
const deleteUserBan = s.route(moderationApiContracts.bans.banUser.delete, {
  middleware: [passport.authenticate("jwt", { session: false })],
  handler: async ({ params }) => {
    const { userId } = params;

    try {
      // Legacy note: The commented-out code used 'delete', which fails if
      // no record exists. Using 'executeUserUnban' with a check.
      const deletedCount = await executeUserUnban(userId);

      if (deletedCount === 0) {
        return {
          status: 400,
          body: {
            message: `User ${userId} has no active ban records to remove.`,
            details: toErrorDetails(new Error("No records found")),
          },
        };
      }

      return {
        status: 200,
        body: {
          message: `User ${userId} successfully removed from ban table`,
        },
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: `Error occurred when trying to unban user ${userId}`,
          details: toErrorDetails(error),
        },
      };
    }
  },
});
const getAllPassedDate = s.route(
  moderationApiContracts.bans.banUser.getAllPassedDate,
  {
    middleware: [passport.authenticate("jwt", { session: false })],
    handler: async () => {
      try {
        const expiredBans = await fetchExpiredUserBans();

        /**
         * Note: The legacy controller returned only an array of userIds (strings).
         * However, the contract specifies z.array(UserBanSchema).
         * We must return the full objects to avoid Zod validation errors.
         */
        const body = expiredBans.map((ban) => ({
          ...ban,
          type: BanTypeSchema.enum.USER,
          banMessage: ban.banMessage ?? "",
          // Dates are auto-formatted by the schema's safeDateFormat pipe
        }));

        return {
          status: 200,
          body,
        };
      } catch (error) {
        return {
          status: 400,
          body: {
            message: "Error occurred when trying to get unban users",
            details: toErrorDetails(error),
          },
        };
      }
    },
  },
);
const deletePassedBanDate = s.route(
  moderationApiContracts.bans.banUser.deletePassedBanDate,
  {
    middleware: [passport.authenticate("jwt", { session: false })],
    handler: async () => {
      try {
        // Calls the service that handles both table cleanup and User flag reset
        const count = await cleanupExpiredBans();

        return {
          status: 200,
          body: {
            message: `Cleanup complete. ${count} users successfully restored.`,
          },
        };
      } catch (error) {
        return {
          status: 400,
          body: {
            message: "Error occurred when trying to cleanup expired bans",
            details: toErrorDetails(error),
          },
        };
      }
    },
  },
);
// ============================================================================
// Flags
// ============================================================================
// ============================================================================
// commentFlag
// ============================================================================
// ----------------------------------------------------------------------------
//  SERVICES
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
//  ROUTES
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// controllers/commentFlag.js     → apiRouter.use('/commentFlag', commentFlagRouter)
//	POST	/create/:commentId	          create a flag for a specific comment
//	GET	  /getAll	                      get all comment flags
//	PUT	  /falseFlagMany/:commentId	    mark many flags on a comment as false and update false-flag behavior
//	GET	  /getFlags/:commentId	        get flag count for a specific comment
// ----------------------------------------------------------------------------
// ============================================================================
// flag
// ============================================================================
// ----------------------------------------------------------------------------
//  SERVICES
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
//  ROUTES
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// controllers/flag.js                  Idea flagging
//	POST	/create/:ideaId	              create a flag for a specific idea
//	GET	  /getAll	                      get all idea flags
//	PUT	  /falseFlagMany/:ideaId	      mark many flags on an idea as false and update false-flag behavior
//	GET	  /getFlags/:ideaID	            get flag count for a specific idea
//	GET	  /checkFlagBan/:userID	        check if user has a flag ban
// ----------------------------------------------------------------------------
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
      dismissNotification: dismissCommentBanNotification,
      getById: getCommentBanById,
      getUndismissedNotifications: getUndismissedCommentBanNotifications,
      delete: deleteCommentBan,
    },
    banPost: {
      create: createPostBan,
      dismissNotification: dismissPostNotification,
      getById: getPostBanById,
      getUndismissedNotifications: getUndismissedPostNotifications,
      delete: deletePostBan,
    },
    banUser: {
      create: createUserBan,
      getAll: getAllUserBans,
      getById: getUserBanById,
      getMostRecent,
      getMostRecentWithToken,
      update: updateUserBan,
      delete: deleteUserBan,
      getAllPassedDate,
      deletePassedBanDate,
    },
    //flags
  },
} as unknown as Handlers;
