import {
  //banComment
  executeCommentBan,
  updateNotificationStatus,
  fetchCommentBanByCommentId,
  fetchUndismissedBans,
  deleteCommentBanByCommentId,
  //banPost
  fetchPostBanByPostId,
  fetchUndismissedPostBans,
  executePostBan,
  updatePostNotificationStatus,
  removePostBanByPostId,
  //banUser
  executeUserBan,
  fetchAllUserBans,
  fetchUserBanHistory,
  fetchMostRecentUserBan,
  fetchSelfBanRecord,
  updateLatestUserBan,
  executeUserUnban,
  fetchExpiredUserBans,
  cleanupExpiredBans,
} from "./service";
import { initServer } from "@ts-rest/express";
import { moderationApiContracts } from "@mlc/lib/api";
import { toErrorDetails } from "src/server/utils";
import { z } from "zod";
import { prisma } from "src/prisma/client";
import { UserSchema } from "@mlc/lib/api";
import { BanTypeSchema } from "@mlc/lib/api/contracts/moderation/bans";
import { RouterImplementation } from "@ts-rest/express/src/lib/types";
import { authenticateJwt } from "src/server/middleware/auth";

type User = z.infer<typeof UserSchema>;

const s = initServer();
// ============================================================================
// banComment
// ============================================================================
const createCommentBan = s.route(
  moderationApiContracts.bans.banComment.create,
  {
    middleware: [authenticateJwt],
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
    middleware: [authenticateJwt],
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
    middleware: [authenticateJwt],
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
    middleware: [authenticateJwt],
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
  moderationApiContracts.bans.banComment.delete,
  {
    middleware: [authenticateJwt],
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
const createPostBan = s.route(moderationApiContracts.bans.banPost.create, {
  middleware: [authenticateJwt],
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
    middleware: [authenticateJwt],
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
    middleware: [authenticateJwt],
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
  middleware: [authenticateJwt],
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
const createUserBan = s.route(moderationApiContracts.bans.banUser.create, {
  middleware: [authenticateJwt],
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
  middleware: [authenticateJwt],
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
  middleware: [authenticateJwt],
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
    middleware: [authenticateJwt],
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
    middleware: [authenticateJwt],
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
const updateUserBan = s.route(moderationApiContracts.bans.banUser.update, {
  middleware: [authenticateJwt],
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
        banUntil: banUntil,
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
});
const deleteUserBan = s.route(moderationApiContracts.bans.banUser.delete, {
  middleware: [authenticateJwt],
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
    middleware: [authenticateJwt],
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
    middleware: [authenticateJwt],
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

export const bansRouter: RouterImplementation<
  typeof moderationApiContracts.bans
> = s.router(moderationApiContracts.bans, {
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
    getByPostId: getPostBanById,
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
});
