import {
  //commentFlag
  fetchAllCommentFlags,
  countCommentFlagsByCommentId,
  findIdeaCommentById,
  findExistingCommentFlag,
  createCommentFlag,
  updateManyCommentFlags,
  upsertFalseFlaggingBehavior,
  applyFalseFlaggingBans,
  //flag
  findIdeaById,
  findExistingIdeaFlag,
  createIdeaFlag,
  fetchAllIdeaFlags,
  updateManyIdeaFlags,
  countIdeaFlagsByIdeaId,
  findFalseFlaggingBehaviorByUserId,
} from "./service";

import { initServer } from "@ts-rest/express";
import { moderationApiContracts } from "@mlc/lib/api";
import { toErrorDetails } from "src/server/utils";
import { z } from "zod";
import { UserSchema } from "@mlc/lib/api";
import { RouterImplementation } from "@ts-rest/express/src/lib/types";
import { authenticateJwt } from "src/server/middleware/auth";

type User = z.infer<typeof UserSchema>;

const s = initServer();
// ============================================================================
// commentFlag
// ============================================================================
const createCommentFlagHandler = s.route(
  moderationApiContracts.flags.commentFlag.create,
  {
    middleware: [authenticateJwt],
    handler: async ({ params, body, req }) => {
      try {
        const loggedInUserId = (req.user as User).id;
        const { commentId } = params;

        // 1. Verify comment existence
        const foundIdeaComment = await findIdeaCommentById(commentId);
        if (!foundIdeaComment) {
          return {
            status: 400,
            body: {
              message: `The comment with that listed ID (${commentId}) does not exist.`,
              details: toErrorDetails(new Error("Comment does not exist")),
            },
          };
        }

        // 2. Check for duplicate flags
        const userAlreadyCreatedFlag = await findExistingCommentFlag(
          loggedInUserId,
          commentId,
        );
        if (userAlreadyCreatedFlag) {
          return {
            status: 400,
            body: {
              message:
                "You have already flagged this comment. You cannot flag a comment twice.",
              details: toErrorDetails(
                new Error("A idea can only be flagged once."),
              ),
            },
          };
        }

        // 3. Create flag
        await createCommentFlag({
          flaggerId: loggedInUserId,
          commentId: commentId,
          flagReason: body.flagReason ?? "No reason given",
        });

        return {
          status: 201,
          body: {
            message: `Flag succesfully created under Idea ${commentId}`,
          },
        };
      } catch (error) {
        return {
          status: 400,
          body: {
            message: `An error occured while trying to create a rating for idea ${params.commentId}.`,
            details: toErrorDetails(error),
          },
        };
      }
    },
  },
);
const getAllCommentFlags = s.route(
  moderationApiContracts.flags.commentFlag.getAll,
  {
    middleware: [authenticateJwt],
    handler: async () => {
      try {
        const allCommentFlags = await fetchAllCommentFlags();

        /**
         * Mapping Prisma output to CommentFlagSchema.
         * Note: Prisma dates are naturally Date objects, so they
         * satisfy the z.date() requirement in the schema.
         */
        const body = allCommentFlags.map((flag) => ({
          id: flag.id,
          flaggerId: flag.flaggerId,
          falseFlag: flag.falseFlag,
          flagReason: flag.flagReason,
          commentId: flag.commentId,
        }));

        return {
          status: 200,
          body: body,
        };
      } catch (error) {
        return {
          status: 400,
          body: {
            message: "An error occured while trying to fetch comment flags.",
            details: toErrorDetails(error),
          },
        };
      }
    },
  },
);
const falseFlagManyComments = s.route(
  moderationApiContracts.flags.commentFlag.falseFlagMany,
  {
    middleware: [authenticateJwt],
    handler: async ({ params, body, req }) => {
      try {
        const loggedInUserId = (req.user as User).id;
        const { commentId } = params;
        const { isFalse } = body;

        // 1. Verify comment existence
        const foundComment = await findIdeaCommentById(commentId);
        if (!foundComment) {
          return {
            status: 400,
            body: {
              message: "That comment id does not exist",
              details: toErrorDetails(
                new Error(`CommmentId: (${commentId}) does not exist.`),
              ),
            },
          };
        }
        // 2. Update all flags for this comment
        await updateManyCommentFlags(commentId, isFalse);
        // 3. Update behavior tracking for the moderator/user performing the action
        await upsertFalseFlaggingBehavior(loggedInUserId);
        // 4. Evaluate thresholds and apply bans
        await applyFalseFlaggingBans();

        return {
          status: 200,
          body: {
            message: `false flags succesfully updated under comment: ${commentId}`,
          },
        };
      } catch (error) {
        return {
          status: 400,
          body: {
            message:
              "An error occured while trying to update the commentFlags.",
            details: toErrorDetails(error),
          },
        };
      }
    },
  },
);
const getCommentFlagCount = s.route(
  moderationApiContracts.flags.commentFlag.getFlags,
  {
    middleware: [authenticateJwt],
    handler: async ({ params }) => {
      try {
        const count = await countCommentFlagsByCommentId(params.commentId);

        return {
          status: 200,
          body: count,
        };
      } catch (error) {
        return {
          status: 400,
          body: {
            message:
              "An error occured while trying to fetch the count of commentFlags.",
            details: toErrorDetails(error),
          },
        };
      }
    },
  },
);
// ============================================================================
// flag
// ============================================================================
const createIdeaFlagHandler = s.route(
  moderationApiContracts.flags.flag.create,
  {
    middleware: [authenticateJwt],
    handler: async ({ params, body, req }) => {
      try {
        const loggedInUserId = (req.user as User).id;
        const { ideaId } = params;

        // 1. Verify idea existence
        const foundIdea = await findIdeaById(ideaId);
        if (!foundIdea) {
          return {
            status: 400,
            body: {
              message: `The idea with that listed ID (${ideaId}) does not exist.`,
              details: toErrorDetails(
                new Error("A idea can only be flagged once."),
              ),
            },
          };
        }

        // 2. Check for duplicate flags
        const userAlreadyCreatedFlag = await findExistingIdeaFlag(
          loggedInUserId,
          ideaId,
        );

        if (userAlreadyCreatedFlag) {
          // Note: Legacy used 200 for this error, but contract
          // specifies 400 for ErrorResponseSchema.
          return {
            status: 400,
            body: {
              message:
                "You have already flagged this idea. You cannot flag an idea twice.",
              details: toErrorDetails(
                new Error("A idea can only be flagged once."),
              ),
            },
          };
        }

        // 3. Create flag
        const createdFlag = await createIdeaFlag({
          flaggerId: loggedInUserId,
          ideaId: ideaId,
          flagReason: body.flagReason ?? "No reason given",
          falseFlag: false,
        });

        return {
          status: 201,
          body: {
            id: createdFlag.id,
            flaggerId: createdFlag.flaggerId,
            flagReason: createdFlag.flagReason,
            ideaId: createdFlag.ideaId,
            falseFlag: createdFlag.falseFlag,
          },
        };
      } catch (error) {
        return {
          status: 400,
          body: {
            message: `An error occured while trying to create a rating for idea ${params.ideaId}.`,
            details: toErrorDetails(error),
          },
        };
      }
    },
  },
);
const getAllIdeaFlags = s.route(moderationApiContracts.flags.flag.getAll, {
  middleware: [authenticateJwt],
  handler: async () => {
    try {
      const allIdeaFlags = await fetchAllIdeaFlags();

      /**
       * Mapping Prisma output to IdeaFlagSchema.
       * Using flagReason as per the updated contract.
       */
      const body = allIdeaFlags.map((flag) => ({
        id: flag.id,
        flaggerId: flag.flaggerId,
        flagReason: flag.flagReason,
        ideaId: flag.ideaId,
        falseFlag: flag.falseFlag,
      }));

      return {
        status: 200,
        body: body,
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "An error occured while trying to fetch all the ideaFlags.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});
const falseFlagManyIdeas = s.route(
  moderationApiContracts.flags.flag.falseFlagMany,
  {
    middleware: [authenticateJwt],
    handler: async ({ params, body, req }) => {
      try {
        const loggedInUserId = (req.user as User).id;
        const { ideaId } = params;
        const { isFalse } = body;

        // 1. Verify idea existence
        const foundIdea = await findIdeaById(ideaId);
        if (!foundIdea) {
          return {
            status: 400,
            body: {
              message: "That idea id does not exist",
              details: toErrorDetails(
                `The idea with that listed ID (${ideaId}) does not exist.`,
              ),
            },
          };
        }

        // 2. Update all flags for this idea
        await updateManyIdeaFlags(ideaId, isFalse);

        // 3. Update behavior tracking for the moderator/user
        await upsertFalseFlaggingBehavior(loggedInUserId);

        // 4. Evaluate thresholds and apply bans
        await applyFalseFlaggingBans();

        return {
          status: 200,
          body: {
            message: `false flags succesfully updated under Idea ${ideaId}`,
          },
        };
      } catch (error) {
        return {
          status: 400,
          body: {
            message: "An error occured while trying to update the ideaFlags.",
            details: toErrorDetails(error),
          },
        };
      }
    },
  },
);
const getIdeaFlagCount = s.route(moderationApiContracts.flags.flag.getFlags, {
  middleware: [authenticateJwt],
  handler: async ({ params }) => {
    try {
      const count = await countIdeaFlagsByIdeaId(params.ideaId);

      return {
        status: 200,
        body: count as number,
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message:
            "An error occured while trying to fetch the count of ideaFlags.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});
const checkFlagBan = s.route(moderationApiContracts.flags.flag.checkFlagBan, {
  middleware: [authenticateJwt],
  handler: async ({ params }) => {
    try {
      const userFlagBan = await findFalseFlaggingBehaviorByUserId(
        params.userId,
      );

      if (!userFlagBan) {
        // If no record exists, the user hasn't flagged anything yet (no ban)
        // Adjust this return if your schema/frontend expects a 404 or a null object
        return {
          status: 404,
          body: {
            message: "No flagging behavior record found for this user.",
            details: toErrorDetails(
              new Error("User has not performed any flaggable actions."),
            ),
          },
        };
      }

      return {
        status: 200,
        body: {
          id: userFlagBan.id,
          userId: userFlagBan.userId,
          flag_count: userFlagBan.flag_count,
          flag_ban: userFlagBan.flag_ban,
          bannedAt: userFlagBan.bannedAt ?? new Date(0),
          bannedUntil: userFlagBan.bannedUntil ?? new Date(0),
        },
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message:
            "An error occured while trying to fetch the user flag ban status.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

export const flagsRouter: RouterImplementation<
  typeof moderationApiContracts.flags
> = s.router(moderationApiContracts.flags, {
  commentFlag: {
    create: createCommentFlagHandler,
    getAll: getAllCommentFlags,
    falseFlagMany: falseFlagManyComments,
    getFlags: getCommentFlagCount,
  },
  flag: {
    create: createIdeaFlagHandler,
    getAll: getAllIdeaFlags,
    falseFlagMany: falseFlagManyIdeas,
    getFlags: getIdeaFlagCount,
    checkFlagBan,
  },
});
