import { commentApiContracts } from "@mlc/lib/api";
import { initServer } from "@ts-rest/express";
import { prisma } from "src/prisma/client";
import { createHandlers } from "src/server";
import {
  compareCommentsBasedOnLikesAndDislikes,
  toErrorDetails,
} from "src/server/utils";
import { getRequestUser, parseIntegerParam, toSerialized } from "./utils";
import {
  checkIfUserIsLoggedIn,
  authenticateJwt,
} from "src/server/middleware/auth";
import { checkSimilar, funnelCommentApi } from "src/server/utils/comments";

const s = initServer();

const commentRoot = s.route(commentApiContracts.get, {
  handler: async () => {
    try {
      return {
        status: 200,
        body: {
          route: "welcome to comment Router",
        },
      };
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
});

const commentGetAll = s.route(commentApiContracts.getAll, {
  handler: async () => {
    try {
      const allIdeaComments = await prisma.ideaComment.findMany();

      return {
        status: 200,
        body: toSerialized(allIdeaComments),
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "An error occured while trying to fetch all Idea Comments.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const commentGetAllByIdeaId = s.route(commentApiContracts.getAllByIdeaId, {
  middleware: [checkIfUserIsLoggedIn],
  handler: async ({ params, req }) => {
    try {
      const loggedInUser = getRequestUser(req);
      const parsedIdeaId = parseIntegerParam(params.ideaId);

      if (!parsedIdeaId) {
        return {
          status: 400,
          body: {
            message: "A valid ideaId must be specified in the route paramater.",
          },
        };
      }

      const prismaLikesAndDislikesQuery = {
        likes: {
          where: {
            authorId: loggedInUser?.id,
          },
        },
        dislikes: {
          where: {
            authorId: loggedInUser?.id,
          },
        },
      };

      const comments = await (prisma as any).ideaComment.findMany({
        where: { ideaId: parsedIdeaId },
        include: {
          _count: {
            select: {
              likes: true,
              dislikes: true,
            },
          },
          author: {
            select: {
              id: true,
              email: true,
              fname: true,
              lname: true,
              organizationName: true,
              userType: true,
              userSegment: {
                select: {
                  id: true,
                },
              },
              address: {
                select: {
                  streetAddress: true,
                  postalCode: true,
                },
              },
            },
          },
          idea: {
            select: {
              id: true,
              title: true,
              description: true,
              segments: {
                select: {
                  segId: true,
                  name: true,
                  segmentType: true,
                },
              },
            },
          },
          ...(loggedInUser ? prismaLikesAndDislikesQuery : {}),
        },
        orderBy: [
          {
            likes: {
              _count: "desc",
            },
          },
          {
            updatedAt: "desc",
          },
        ],
      });

      const result = comments.map((comment: any) => ({
        ...comment,
        likes: comment.likes ?? [],
        dislikes: comment.dislikes ?? [],
      }));

      result.sort(compareCommentsBasedOnLikesAndDislikes);

      const municipalComments = result.filter(
        (comment: any) => comment.author.userType === "MUNICIPAL",
      );
      const moderatorComments = result.filter(
        (comment: any) => comment.author.userType === "MOD",
      );
      const otherComments = result.filter(
        (comment: any) =>
          comment.author.userType !== "MOD" &&
          comment.author.userType !== "MUNICIPAL",
      );

      return {
        status: 200,
        body: toSerialized([
          ...municipalComments,
          ...moderatorComments,
          ...otherComments,
        ]),
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: `An error occured while trying to fetch all comments under idea ${params.ideaId}.`,
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const commentCreate = s.route(commentApiContracts.create, {
  middleware: [authenticateJwt],
  handler: async ({ params, req, body }) => {
    try {
      const user = getRequestUser(req);
      const loggedInUserId = user?.id;

      if (!loggedInUserId) {
        return {
          status: 403,
          body: {
            message: "Authentication required.",
          },
        };
      }

      const quarantinedUser = await prisma.bad_Posting_Behavior.findFirst({
        where: {
          userId: loggedInUserId,
          post_comment_ban: true,
        },
      });

      if (quarantinedUser) {
        return {
          status: 400,
          body: {
            message: "User is in quarantine",
          },
        };
      }

      const thresholdUser = await prisma.bad_Posting_Behavior.findFirst({
        where: {
          userId: loggedInUserId,
          OR: [
            {
              bad_post_count: {
                gte: 3,
              },
            },
            {
              post_flag_count: {
                gte: 3,
              },
            },
          ],
        },
      });

      if (thresholdUser) {
        await prisma.bad_Posting_Behavior.updateMany({
          where: {
            userId: loggedInUserId,
          },
          data: {
            post_comment_ban: true,
          },
        });

        return {
          status: 400,
          body: {
            message:
              "You have too many bad posts / post flagged. Post was NOT submitted.",
          },
        };
      }

      const content = (body as { content?: string }).content;
      const parsedIdeaId = parseIntegerParam(params.ideaId);
      const theUserSegment = await (prisma as any).userSegments.findFirst({
        where: { userId: loggedInUserId },
      });

      if (!theUserSegment) {
        return {
          status: 400,
          body: {
            message: "user segment information not found.",
          },
        };
      }

      if (!parsedIdeaId) {
        return {
          status: 400,
          body: {
            message: "A valid ideaId must be specified in the route paramater.",
          },
        };
      }

      let theSuperSegmentId: number | null = null;
      let theSegmentId: number | null = null;
      let theSubSegmentId: number | null = null;

      const foundIdea = await (prisma as any).idea.findUnique({
        where: { id: parsedIdeaId },
      });

      if (!foundIdea) {
        return {
          status: 400,
          body: {
            message: `The idea with that listed ID (${parsedIdeaId}) does not exist.`,
          },
        };
      }

      let match = false;
      const userSegments = await (prisma as any).userSegments.findFirst({
        where: { userId: loggedInUserId },
      });

      if (foundIdea.subSegmentId) {
        if (userSegments.homeSubSegmentId === foundIdea.subSegmentId) {
          match = true;
          theSubSegmentId = foundIdea.subSegmentId;
        } else if (userSegments.workSubSegmentId === foundIdea.subSegmentId) {
          match = true;
          theSubSegmentId = foundIdea.subSegmentId;
        } else if (userSegments.schoolSubSegmentId === foundIdea.subSegmentId) {
          match = true;
          theSubSegmentId = foundIdea.subSegmentId;
        }
      } else if (foundIdea.segmentId) {
        if (userSegments.homeSegmentId === foundIdea.segmentId) {
          match = true;
          theSegmentId = foundIdea.segmentId;
        } else if (userSegments.workSegmentId === foundIdea.segmentId) {
          match = true;
          theSegmentId = foundIdea.segmentId;
        } else if (userSegments.schoolSegmentId === foundIdea.segmentId) {
          match = true;
          theSegmentId = foundIdea.segmentId;
        }
      } else if (foundIdea.superSegmentId) {
        if (userSegments.homeSuperSegId === foundIdea.superSegmentId) {
          match = true;
          theSuperSegmentId = foundIdea.superSegmentId;
        } else if (userSegments.workSuperSegId === foundIdea.superSegmentId) {
          match = true;
          theSuperSegmentId = foundIdea.superSegmentId;
        } else if (userSegments.schoolSuperSegId === foundIdea.superSegmentId) {
          match = true;
          theSuperSegmentId = foundIdea.superSegmentId;
        }
      }

      if (!match) {
        return {
          status: 403,
          body: {
            message: "You do not belong to the idea's segment or subsegment!",
          },
        };
      }

      const keywordsObject = await funnelCommentApi(content);
      const createdComment = await (prisma as any).ideaComment.create({
        data: {
          content,
          authorId: loggedInUserId,
          ideaId: parsedIdeaId,
          userSegId: theUserSegment.id,
          superSegmentId: theSuperSegmentId,
          segmentId: theSegmentId,
          subSegmentId: theSubSegmentId,
          tone: keywordsObject.tone,
          attitude: keywordsObject.attitude,
          keywords: keywordsObject.keywords,
        },
        include: {
          author: {
            select: {
              email: true,
              fname: true,
              lname: true,
            },
          },
        },
      });

      return {
        status: 200,
        body: toSerialized(createdComment),
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: `An error occured while trying to create a comment for idea ${params.ideaId}.`,
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const commentSimilarComments = s.route(commentApiContracts.similarComments, {
  middleware: [checkIfUserIsLoggedIn, authenticateJwt],
  handler: async ({ params, req, body }) => {
    try {
      const content = (body as { content?: string }).content;
      const parsedIdeaId = parseIntegerParam(params.ideaId);
      const loggedInUser = getRequestUser(req);
      const keywordsObject = await funnelCommentApi(content);

      if (keywordsObject && Object.keys(keywordsObject.keywords).length > 0) {
        const similarComments = await checkSimilar(
          keywordsObject,
          parsedIdeaId,
          loggedInUser,
        );

        if (similarComments?.[0]) {
          return {
            status: 200,
            body: {
              message: "similar comments found",
              similarComments: toSerialized(similarComments),
            },
          };
        }
      }

      return {
        status: 200,
        body: {
          message: "No similar comments found.",
          similarComments: [],
        },
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message:
            "An error occured while trying to check for similar comments.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const commentUpdateState = s.route(commentApiContracts.updateState, {
  middleware: [authenticateJwt],
  handler: async ({ params, body }) => {
    try {
      const parsedCommentId = parseIntegerParam(params.commentId);

      if (!params.commentId || !parsedCommentId) {
        return {
          status: 400,
          body: {
            message: "A valid ideaId must be specified in the route paramater.",
          },
        };
      }

      const foundComment = await prisma.ideaComment.findUnique({
        where: { id: parsedCommentId },
      });

      if (!foundComment) {
        return {
          status: 400,
          body: {
            message: `The idea with that listed ID (${params.commentId}) does not exist.`,
          },
        };
      }

      const updateComment = await prisma.ideaComment.update({
        where: {
          id: parsedCommentId,
        },
        data: {
          reviewed: (body as any).reviewed,
          active: (body as any).active,
          bannedComment: (body as any).banned,
          quarantined_at: (body as any).quarantined_at,
        },
      });

      return {
        status: 200,
        body: {
          message: "Idea succesfully updated",
          idea: toSerialized(updateComment),
        },
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "An error occured while to update an Idea",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const commentUpdateNotificationState = s.route(
  commentApiContracts.updateNotificationState,
  {
    middleware: [authenticateJwt],
    handler: async ({ params, body }) => {
      try {
        const parsedCommentId = parseIntegerParam(params.commentId);

        if (!params.commentId || !parsedCommentId) {
          return {
            status: 400,
            body: {
              message:
                "A valid ideaId must be specified in the route paramater.",
            },
          };
        }

        const foundComment = await prisma.ideaComment.findUnique({
          where: { id: parsedCommentId },
        });

        if (!foundComment) {
          return {
            status: 400,
            body: {
              message: `The idea with that listed ID (${params.commentId}) does not exist.`,
            },
          };
        }

        const updateComment = await prisma.ideaComment.update({
          where: {
            id: parsedCommentId,
          },
          data: {
            notification_dismissed: (body as any).notification_dismissed,
          },
        });

        return {
          status: 200,
          body: {
            message: "Idea succesfully updated",
            idea: toSerialized(updateComment),
          },
        };
      } catch (error) {
        return {
          status: 400,
          body: {
            message: "An error occured while to update an Idea",
            details: toErrorDetails(error),
          },
        };
      }
    },
  },
);

const commentUpdate = s.route(commentApiContracts.update, {
  middleware: [authenticateJwt],
  handler: async ({ params, req, body }) => {
    try {
      const user = getRequestUser(req);
      const parsedCommentId = parseIntegerParam(params.commentId);

      if (!parsedCommentId) {
        return {
          status: 400,
          body: {
            message:
              "A valid commentId must be specified in the route paramater.",
          },
        };
      }

      const foundComment = await prisma.ideaComment.findUnique({
        where: { id: parsedCommentId },
      });

      if (!foundComment) {
        return {
          status: 400,
          body: {
            message: `The comment with the listed ID (${params.commentId}) does not exist.`,
          },
        };
      }

      if (foundComment.authorId !== user?.id) {
        return {
          status: 401,
          body: {
            message: `The user ${user?.email} is not the author or an admin and therefore cannot edit this comment.`,
          },
        };
      }

      const content = (body as { content?: string }).content;
      const updatedComment = await prisma.ideaComment.update({
        where: { id: parsedCommentId },
        data: {
          ...(content ? { content } : {}),
        },
      });

      return {
        status: 200,
        body: {
          message: "Comment succesfully updated",
          comment: toSerialized(updatedComment),
        },
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: `An error occured while trying to edit comment ${params.commentId}.`,
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const commentDelete = s.route(commentApiContracts.delete, {
  middleware: [authenticateJwt],
  handler: async ({ params, req }) => {
    try {
      const user = getRequestUser(req);
      const parsedCommentId = parseIntegerParam(params.commentId);

      if (!parsedCommentId) {
        return {
          status: 400,
          body: {
            message:
              "A valid commentId must be specified in the route paramater.",
          },
        };
      }

      const foundComment = await prisma.ideaComment.findUnique({
        where: { id: parsedCommentId },
      });

      if (!foundComment) {
        return {
          status: 400,
          body: {
            message: `The comment with the listed ID (${params.commentId}) does not exist.`,
          },
        };
      }

      if (foundComment.authorId !== user?.id) {
        return {
          status: 401,
          body: {
            message: `The user ${user?.email} is not the author or an admin and therefore cannot delete this comment.`,
          },
        };
      }

      const deletedComment = await prisma.ideaComment.delete({
        where: { id: parsedCommentId },
      });

      return {
        status: 200,
        body: {
          message: "Comment succesfully deleted",
          deletedComment: toSerialized(deletedComment),
        },
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: `An error occured while trying to delete comment ${params.commentId}.`,
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const commentAggregate = s.route(commentApiContracts.getAggregate, {
  handler: async ({ params }) => {
    try {
      const parsedIdeaId = parseIntegerParam(params.ideaId);
      const aggregations = await prisma.ideaComment.aggregate({
        where: parsedIdeaId ? { ideaId: parsedIdeaId } : {},
        _count: {
          _all: true,
        },
      });

      return {
        status: 200,
        body: {
          count:
            (aggregations._count as { _all?: number } | undefined)?._all ?? 0,
        },
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: `An error occured while trying to check the comments of idea #${params.ideaId}.`,
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const commentByUser = s.route(commentApiContracts.getByUser, {
  handler: async ({ params }) => {
    try {
      const userComments = await (prisma as any).ideaComment.findMany({
        where: { authorId: params.userId },
        include: {
          idea: {
            select: {
              id: true,
              title: true,
              description: true,
              segmentId: true,
              subSegmentId: true,
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      });

      return {
        status: 200,
        body: toSerialized(userComments),
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: `An error occured while trying to fetch all comments by user #${params.userId}.`,
          details: toErrorDetails(error),
        },
      };
    }
  },
});

export const commentApiHandlers = createHandlers({
  schema: commentApiContracts,
  router: {
    getAggregate: commentAggregate,
    getByUser: commentByUser,
    create: commentCreate,
    delete: commentDelete,
    getAll: commentGetAll,
    getAllByIdeaId: commentGetAllByIdeaId,
    get: commentRoot,
    similarComments: commentSimilarComments,
    update: commentUpdate,
    updateNotificationState: commentUpdateNotificationState,
    updateState: commentUpdateState,
  },
});
