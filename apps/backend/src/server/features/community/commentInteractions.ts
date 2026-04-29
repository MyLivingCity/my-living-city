import { commentInteractionApiContracts } from "@mlc/lib/api";
import { initServer } from "@ts-rest/express";
import { toErrorDetails } from "src/server/utils";
import { getRequestUser, parseIntegerParam, toSerialized } from "./utils";
import { prisma } from "src/prisma/client";
import passport from "passport";
import { createHandlers, Handlers } from "src/server";

const s = initServer();

const likeCommentAndRemoveDislike = async (
  userId: string,
  commentId: number,
) => {
  const where = {
    authorId: userId,
    ideaCommentId: commentId,
  };

  const foundLike = await prisma.userCommentLikes.findFirst({ where });
  const foundDislike = await prisma.userCommentDislikes.findFirst({ where });

  if (foundDislike) {
    await prisma.userCommentDislikes.deleteMany({ where });
  }

  if (foundLike) {
    await prisma.userCommentLikes.delete({ where: { id: foundLike.id } });
    return null;
  }

  return prisma.userCommentLikes.create({
    data: {
      authorId: userId,
      ideaCommentId: commentId,
    },
  });
};

const dislikeCommentAndRemoveLike = async (
  userId: string,
  commentId: number,
) => {
  const where = {
    authorId: userId,
    ideaCommentId: commentId,
  };

  const foundLike = await prisma.userCommentLikes.findFirst({ where });
  const foundDislike = await prisma.userCommentDislikes.findFirst({ where });

  if (foundLike) {
    await prisma.userCommentLikes.deleteMany({ where });
  }

  if (foundDislike) {
    await prisma.userCommentDislikes.delete({ where: { id: foundDislike.id } });
    return null;
  }

  return prisma.userCommentDislikes.create({
    data: {
      authorId: userId,
      ideaCommentId: commentId,
    },
  });
};

const commentTest = s.route(commentInteractionApiContracts.commentTest, {
  handler: async () => {
    try {
      return {
        status: 200,
        body: "Interactions router working",
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

const commentLikeGetAll = s.route(
  commentInteractionApiContracts.commentLikeGetAll,
  {
    handler: async () => {
      try {
        const allLikes = await prisma.userCommentLikes.findMany();

        return {
          status: 200,
          body: toSerialized(allLikes),
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
  },
);

const commentDislikeGetAll = s.route(
  commentInteractionApiContracts.commentDislikeGetAll,
  {
    handler: async () => {
      try {
        const allDislikes = await prisma.userCommentDislikes.findMany();

        return {
          status: 200,
          body: toSerialized(allDislikes),
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
  },
);

const commentLike = s.route(commentInteractionApiContracts.commentLike, {
  middleware: [passport.authenticate("jwt", { session: false })],
  handler: async ({ params, req }) => {
    try {
      const user = getRequestUser(req);
      const parsedCommentId = parseIntegerParam(params.commentId);

      if (!parsedCommentId) {
        return {
          status: 400,
          body: {
            message:
              "A valid comment must be specified in the route paramater.",
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
            message: `The comment with that listed ID (${params.commentId}) does not exist.`,
          },
        };
      }

      const createdCommentLike = await likeCommentAndRemoveDislike(
        user?.id ?? "",
        parsedCommentId,
      );

      return {
        status: 201,
        body: toSerialized(createdCommentLike),
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

const commentDislike = s.route(commentInteractionApiContracts.commentDislike, {
  middleware: [passport.authenticate("jwt", { session: false })],
  handler: async ({ params, req }) => {
    try {
      const user = getRequestUser(req);
      const parsedCommentId = parseIntegerParam(params.commentId);

      if (!parsedCommentId) {
        return {
          status: 400,
          body: {
            message:
              "A valid comment must be specified in the route paramater.",
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
            message: `The comment with that listed ID (${params.commentId}) does not exist.`,
          },
        };
      }

      const createdDislike = await dislikeCommentAndRemoveLike(
        user?.id ?? "",
        parsedCommentId,
      );

      return {
        status: 201,
        body: toSerialized(createdDislike),
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

export const commentInteractionApiHandlers = createHandlers({
  schema: commentInteractionApiContracts,
  router: {
    commentTest,
    commentLike,
    commentDislike,
    commentLikeGetAll,
    commentDislikeGetAll,
  },
});
