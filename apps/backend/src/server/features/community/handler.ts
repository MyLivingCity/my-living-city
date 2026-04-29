import { initServer } from "@ts-rest/express";
import { Handlers } from "src/server";
import { prisma } from "src/prisma/client";
import {
  imagePathsToS3Url,
  serializeForContract,
  toErrorDetails,
  compareCommentsBasedOnLikesAndDislikes,
} from "src/server/utils";
import { UserType } from "#prisma/client";
import * as passport from "passport";
import { checkIfUserIsLoggedIn } from "src/server/middleware/auth";
import { deleteImage, makeUpload } from "src/server/utils/image";
import { checkSimilar, funnelCommentApi } from "src/server/utils/comments";
import { communityApiContracts } from "@mlc/lib/api";

const s = initServer();
const upload = makeUpload("advertisement").single("imagePath");

const isBodyEmpty = (value: unknown) =>
  value == null ||
  (typeof value === "object" &&
    !Array.isArray(value) &&
    Object.keys(value as Record<string, unknown>).length === 0);

const parseIntegerParam = (value: string) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) ? parsed : null;
};

const getRequestUser = (req: { user?: Express.User | null | undefined }) =>
  (req.user ?? null) as
  | (Express.User & {
    id?: string;
    email?: string;
    userType?: UserType;
  })
  | null;

const normalizeUploadImagePath = (
  file: { key?: string; path?: string } | undefined,
) => {
  if (!file) {
    return null;
  }

  const source = file.key ?? file.path ?? null;
  if (!source) {
    return null;
  }

  const slashIndex = source.indexOf("/");
  return slashIndex >= 0 ? source.slice(slashIndex + 1) : source;
};

const toSerialized = <T>(value: T) => serializeForContract(value);

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

const getAdvertisementOwnerType = async (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { userType: true },
  });
};

const canManageAdvertisement = (userType: UserType | null | undefined) =>
  userType === "SUPER_ADMIN" ||
  userType === "ADMIN" ||
  userType === "BUSINESS" ||
  userType === "COMMUNITY";

const commentRoot = s.route(communityApiContracts.commentRoot, {
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

const commentGetAll = s.route(communityApiContracts.commentGetAll, {
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

const commentGetAllByIdeaId = s.route(
  communityApiContracts.commentGetAllByIdeaId,
  {
    middleware: [checkIfUserIsLoggedIn],
    handler: async ({ params, req }) => {
      try {
        const loggedInUser = getRequestUser(req);
        const parsedIdeaId = parseIntegerParam(params.ideaId);

        if (!parsedIdeaId) {
          return {
            status: 400,
            body: {
              message:
                "A valid ideaId must be specified in the route paramater.",
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
  },
);

const commentCreate = s.route(communityApiContracts.commentCreate, {
  middleware: [passport.authenticate("jwt", { session: false })],
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

const commentSimilarComments = s.route(
  communityApiContracts.commentSimilarComments,
  {
    middleware: [
      checkIfUserIsLoggedIn,
      passport.authenticate("jwt", { session: false }),
    ],
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
  },
);

const commentUpdateState = s.route(communityApiContracts.commentUpdateState, {
  middleware: [passport.authenticate("jwt", { session: false })],
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
  communityApiContracts.commentUpdateNotificationState,
  {
    middleware: [passport.authenticate("jwt", { session: false })],
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

const commentUpdate = s.route(communityApiContracts.commentUpdate, {
  middleware: [passport.authenticate("jwt", { session: false })],
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

const commentDelete = s.route(communityApiContracts.commentDelete, {
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

const commentAggregate = s.route(communityApiContracts.commentAggregate, {
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

const commentByUser = s.route(communityApiContracts.commentByUser, {
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

const commentInteractTest = s.route(communityApiContracts.commentInteractTest, {
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

const commentInteractLikeGetAll = s.route(
  communityApiContracts.commentInteractLikeGetAll,
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

const commentInteractDislikeGetAll = s.route(
  communityApiContracts.commentInteractDislikeGetAll,
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

const commentInteractLike = s.route(communityApiContracts.commentInteractLike, {
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

const commentInteractDislike = s.route(
  communityApiContracts.commentInteractDislike,
  {
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
  },
);

const communityCreateCollaborator = s.route(
  communityApiContracts.communityCreateCollaborator,
  {
    middleware: [passport.authenticate("jwt", { session: false })],
    handler: async ({ req, body }) => {
      try {
        const user = getRequestUser(req);
        const parsedProposalId = parseIntegerParam(
          String((body as any).proposalId),
        );

        if (!parsedProposalId) {
          return {
            status: 400,
            body: {
              message:
                "A valid ideaId must be specified in the route paramater.",
            },
          };
        }

        const foundProposal = await prisma.proposal.findUnique({
          where: { id: parsedProposalId },
        });

        if (!foundProposal) {
          return {
            status: 400,
            body: {
              message: `The idea with that listed ID (${parsedProposalId}) does not exist.`,
            },
          };
        }

        const createdCollaborator = await prisma.collaborator.upsert({
          where: {
            collaborator_unique: {
              proposalId: parsedProposalId,
              authorId: user?.id ?? "",
            },
          },
          update: {
            experience: (body as any).experience,
            role: (body as any).role,
            time: (body as any).time,
            contactInfo: (body as any).contactInfo,
          },
          create: {
            authorId: user?.id ?? "",
            proposalId: parsedProposalId,
            experience: (body as any).experience,
            role: (body as any).role,
            time: (body as any).time,
            contactInfo: (body as any).contactInfo,
          },
        });

        return {
          status: 200,
          body: toSerialized(createdCollaborator),
        };
      } catch (error) {
        return {
          status: 400,
          body: {
            message: `Error creating collaborator: ${error}`,
            details: toErrorDetails(error),
          },
        };
      }
    },
  },
);

const communityGetCollaborators = s.route(
  communityApiContracts.communityGetCollaborators,
  {
    handler: async ({ params }) => {
      try {
        const parsedProposalId = parseIntegerParam(params.proposalId);
        const collaborators = await prisma.collaborator.findMany(
          parsedProposalId
            ? {
              where: {
                proposalId: parsedProposalId,
              },
            }
            : undefined,
        );

        return {
          status: 200,
          body: toSerialized(collaborators),
        };
      } catch (error) {
        return {
          status: 400,
          body: {
            message: "Cannot get collaborators.",
            details: toErrorDetails(error),
          },
        };
      }
    },
  },
);

const communityCreateVolunteer = s.route(
  communityApiContracts.communityCreateVolunteer,
  {
    middleware: [passport.authenticate("jwt", { session: false })],
    handler: async ({ req, body }) => {
      try {
        const user = getRequestUser(req);
        const parsedProposalId = parseIntegerParam(
          String((body as any).proposalId),
        );

        if (!parsedProposalId) {
          return {
            status: 400,
            body: {
              message:
                "A valid ideaId must be specified in the route paramater.",
            },
          };
        }

        const foundProposal = await prisma.proposal.findUnique({
          where: { id: parsedProposalId },
        });

        if (!foundProposal) {
          return {
            status: 400,
            body: {
              message: `The idea with that listed ID (${parsedProposalId}) does not exist.`,
            },
          };
        }

        const createdVolunteer = await prisma.volunteer.upsert({
          where: {
            volunteer_unique: {
              proposalId: parsedProposalId,
              authorId: user?.id ?? "",
            },
          },
          update: {
            experience: (body as any).experience,
            task: (body as any).task,
            time: (body as any).time,
            contactInfo: (body as any).contactInfo,
          },
          create: {
            authorId: user?.id ?? "",
            proposalId: parsedProposalId,
            experience: (body as any).experience,
            task: (body as any).task,
            time: (body as any).time,
            contactInfo: (body as any).contactInfo,
          },
        });

        return {
          status: 200,
          body: toSerialized(createdVolunteer),
        };
      } catch (error) {
        return {
          status: 400,
          body: {
            message: `Error creating volunteer: ${error}`,
            details: toErrorDetails(error),
          },
        };
      }
    },
  },
);

const communityGetVolunteers = s.route(
  communityApiContracts.communityGetVolunteers,
  {
    handler: async ({ params }) => {
      try {
        const parsedProposalId = parseIntegerParam(params.proposalId);
        const volunteers = await prisma.volunteer.findMany(
          parsedProposalId
            ? {
              where: {
                proposalId: parsedProposalId,
              },
            }
            : undefined,
        );

        return {
          status: 200,
          body: toSerialized(volunteers),
        };
      } catch (error) {
        return {
          status: 400,
          body: {
            message: "Cannot get volunteers.",
            details: toErrorDetails(error),
          },
        };
      }
    },
  },
);

const communityCreateDonor = s.route(
  communityApiContracts.communityCreateDonor,
  {
    middleware: [passport.authenticate("jwt", { session: false })],
    handler: async ({ req, body }) => {
      try {
        const user = getRequestUser(req);
        const parsedProposalId = parseIntegerParam(
          String((body as any).proposalId),
        );

        if (!parsedProposalId) {
          return {
            status: 400,
            body: {
              message:
                "A valid ideaId must be specified in the route paramater.",
            },
          };
        }

        const foundProposal = await prisma.proposal.findUnique({
          where: { id: parsedProposalId },
        });

        if (!foundProposal) {
          return {
            status: 400,
            body: {
              message: `The idea with that listed ID (${parsedProposalId}) does not exist.`,
            },
          };
        }

        const createdDonor = await prisma.donor.upsert({
          where: {
            donor_unique: {
              proposalId: parsedProposalId,
              authorId: user?.id ?? "",
            },
          },
          update: {
            donations: (body as any).donations,
            contactInfo: (body as any).contactInfo,
          },
          create: {
            authorId: user?.id ?? "",
            proposalId: parsedProposalId,
            donations: (body as any).donations,
            contactInfo: (body as any).contactInfo,
          },
        });

        return {
          status: 200,
          body: toSerialized(createdDonor),
        };
      } catch (error) {
        return {
          status: 400,
          body: {
            message: `Error creating donor: ${error}`,
            details: toErrorDetails(error),
          },
        };
      }
    },
  },
);

const communityGetDonors = s.route(communityApiContracts.communityGetDonors, {
  handler: async ({ params }) => {
    try {
      const parsedProposalId = parseIntegerParam(params.proposalId);
      const donors = await prisma.donor.findMany(
        parsedProposalId
          ? {
            where: {
              proposalId: parsedProposalId,
            },
          }
          : undefined,
      );

      return {
        status: 200,
        body: toSerialized(donors),
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "Cannot get donors.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const blogRoot = s.route(communityApiContracts.blogRoot, {
  handler: async () => {
    try {
      return {
        status: 200,
        body: {
          route: "welcome to blog Router",
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

const categoryRoot = s.route(communityApiContracts.categoryRoot, {
  handler: async () => {
    try {
      return {
        status: 200,
        body: {
          route: "welcome to Category Router",
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

const categoryGetAll = s.route(communityApiContracts.categoryGetAll, {
  handler: async () => {
    try {
      const allIdeas = await prisma.category.findMany();

      return {
        status: 200,
        body: toSerialized(allIdeas),
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "An error occured while trying to fetch all categories",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const categoryGetById = s.route(communityApiContracts.categoryGetById, {
  handler: async ({ params }) => {
    try {
      const parsedCatId = parseIntegerParam(params.categoryId);

      if (!parsedCatId) {
        return {
          status: 400,
          body: {
            message:
              "A valid categoryId must be specified in the route parameter",
          },
        };
      }

      const foundCategory = await prisma.category.findUnique({
        where: { id: parsedCatId },
      });

      if (!foundCategory) {
        return {
          status: 400,
          body: {
            message: `The category with listed ID (${parsedCatId}) does not exist.`,
          },
        };
      }

      return {
        status: 200,
        body: toSerialized(foundCategory),
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "An error occured while trying to fetch all categories",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const advertisementCreate = s.route(communityApiContracts.advertisementCreate, {
  middleware: [passport.authenticate("jwt", { session: false }), upload],
  handler: async ({ req, body }) => {
    let error = "";
    let errorMessage = "";
    let errorStack = "";

    try {
      const user = getRequestUser(req);
      if (!user?.id || !user.email) {
        return {
          status: 403,
          body: {
            message: "You don't have the right to add an advertisement!",
            details: {
              errorMessage:
                "In order to create an advertisement, you must be an admin or business user.",
              errorStack: "user must be authenticated and authorized",
            },
          },
        };
      }

      const imagePath = normalizeUploadImagePath((req as any).file);
      const theUser = await getAdvertisementOwnerType(user.id);

      if (!canManageAdvertisement(theUser?.userType)) {
        return {
          status: 403,
          body: {
            message: "You don't have the right to add an advertisement!",
            details: {
              errorMessage:
                "In order to create an advertisement, you must be an admin or business user.",
              errorStack:
                "user must be an admin or business if they want to create an advertisement",
            },
          },
        };
      }

      if (isBodyEmpty(body)) {
        return {
          status: 400,
          body: {
            message: "The objects in the request body are missing",
            details: {
              errorMessage:
                "Creating an advertisement must supply necessary fields explicitly.",
              errorStack:
                "necessary fields must be provided in the body with a valid id found in the database.",
            },
          },
        };
      }

      const {
        adType,
        adTitle,
        adDuration,
        adPosition,
        externalLink,
        published,
      } = body as any;

      if (
        adType === "COMPLIMENTARY" &&
        theUser?.userType !== "SUPER_ADMIN" &&
        theUser?.userType !== "ADMIN"
      ) {
        const complimentaryAd = await prisma.advertisements.findFirst({
          where: { ownerId: user.id, adType: "COMPLIMENTARY" },
        });

        if (complimentaryAd) {
          if (imagePath) {
            await deleteImage("advertisement", imagePath);
          }

          return {
            status: 400,
            body: {
              message:
                'You already created a complimentary advertisement, if you want to create more, please select type "PAID"; you can edit or delete the current complimentary advertisement.',
            },
          };
        }
      }

      if (!adType) {
        error += "An advertisement must has a type. ";
        errorMessage +=
          'Creating an advertisement must explicitly be supplied with a "adType" field. ';
        errorStack +=
          "adType must be defined in the body with a predefined value. ";
      }

      if (adType && adType !== "PAID" && adType !== "COMPLIMENTARY") {
        error += "adType is invalid. ";
        errorMessage += "adType must be predefined value. ";
        errorStack += "adType must be assigned with predfined value. ";
      }

      if (!adTitle) {
        error += "An advertisement needs a title. ";
        errorMessage +=
          "Creating an advertisement must explicitly supply a adTitle field. ";
        errorStack +=
          "adTitle must be defined in the body with a valid length. ";
      }

      if (adTitle && (adTitle.length <= 2 || adTitle.length >= 40)) {
        error += "adTitle size is invalid. ";
        errorMessage +=
          "adTitle length must be longer than 2 and shorter than 40. ";
        errorStack += "adTitle content size must be valid ";
      }

      if (!published) {
        error += "An published filed must be provided. ";
        errorMessage +=
          "Creating an advertisement must explicitly supply a published field. ";
        errorStack +=
          "Published must be defined in the body with a valid value. ";
      }

      let thePublished = false;
      if (published && (published === "false" || published === "true")) {
        thePublished = published === "true";
      } else {
        error += "published must be predefined values. ";
        errorMessage +=
          "Creating an advertisement must explicitly supply a valid published value. ";
        errorStack +=
          "Published must be provided in the body with a valid value. ";
      }

      if (
        (!adDuration && adType === "PAID") ||
        (Number.parseInt(adDuration, 10) <= 0 && adType === "PAID")
      ) {
        error += "adDuration must be provided. ";
        errorMessage +=
          "adDuration must be provided in the body with a valid length. ";
        errorStack +=
          "adDuration must be provided in the body with a valid length. ";
      }

      if (!adPosition) {
        error += "adPosition is missing. ";
        errorMessage +=
          "Creating an advertisement must explicitly be supply a adPosition field. ";
        errorStack +=
          '"adPosition" must be provided in the body with a valid position found in the database. ';
      }

      if (!externalLink) {
        error += "externalLink is missing. ";
        errorMessage +=
          "Creating an advertisement must explicitly be supply a externalLink field. ";
        errorStack +=
          '"externalLink" must be provided in the body with a valid position found in the database. ';
      }

      if (error && errorMessage && errorStack) {
        if (imagePath) {
          await deleteImage("advertisement", imagePath);
        }

        return {
          status: 400,
          body: {
            message: error,
            details: {
              errorMessage,
              errorStack,
            },
          },
        };
      }

      let createAnAdvertisement;
      if (adType === "PAID") {
        const theDate = new Date();
        const endDate = new Date();
        endDate.setDate(
          theDate.getDate() + Number.parseInt(adDuration, 10) * 7,
        );

        createAnAdvertisement = await prisma.advertisements.create({
          data: {
            ownerId: user.id,
            ownerEmail: user.email,
            adTitle,
            duration: endDate,
            adType,
            adPosition,
            imagePath: imagePath ?? "",
            externalLink,
            published: thePublished,
          },
        });
      } else {
        createAnAdvertisement = await prisma.advertisements.create({
          data: {
            ownerId: user.id,
            ownerEmail: user.email,
            adTitle,
            adType,
            adPosition,
            imagePath: imagePath ?? "",
            externalLink,
            published: thePublished,
          },
        });
      }

      return {
        status: 200,
        body: toSerialized(createAnAdvertisement),
      };
    } catch (caughtError) {
      return {
        status: 400,
        body: {
          message: "An error occured while trying to create an Advertisement.",
          details: toErrorDetails(caughtError),
        },
      };
    }
  },
});

const advertisementGetAll = s.route(communityApiContracts.advertisementGetAll, {
  handler: async () => {
    try {
      const allAd = await prisma.advertisements.findMany({});
      await imagePathsToS3Url(allAd, "advertisement");

      if (allAd) {
        return {
          status: 200,
          body: toSerialized(allAd),
        };
      }

      return {
        status: 404,
        body: "there's no advertisement belongs to you!",
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "An error occured while trying to get advertisements.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const advertisementGetAllPublished = s.route(
  communityApiContracts.advertisementGetAllPublished,
  {
    handler: async () => {
      try {
        const allAd = await prisma.advertisements.findMany({
          where: {
            OR: [
              {
                adType: "COMPLIMENTARY",
              },
              {
                published: true,
              },
            ],
          },
        });

        if (allAd) {
          await imagePathsToS3Url(allAd, "advertisement");
          return {
            status: 200,
            body: toSerialized(allAd),
          };
        }

        return {
          status: 404,
          body: "there's no advertisement belongs to you!",
        };
      } catch (error) {
        return {
          status: 400,
          body: {
            message: "An error occured while trying to get advertisements.",
            details: toErrorDetails(error),
          },
        };
      }
    },
  },
);

const advertisementGetAllUser = s.route(
  communityApiContracts.advertisementGetAllUser,
  {
    handler: async ({ params }) => {
      try {
        const result = await prisma.advertisements.findMany({
          where: { ownerId: params.userId },
        });

        if (!result) {
          return {
            status: 204,
            body: "adsId not found!",
          };
        }

        await imagePathsToS3Url(result, "advertisement");

        return {
          status: 200,
          body: toSerialized(result),
        };
      } catch (error) {
        return {
          status: 400,
          body: {
            message: "An error occured while trying to retrieve the adsId.",
            details: toErrorDetails(error),
          },
        };
      }
    },
  },
);

const advertisementGetById = s.route(
  communityApiContracts.advertisementGetById,
  {
    handler: async ({ params }) => {
      try {
        const adsId = parseIntegerParam(params.adsId);
        const result = adsId
          ? await prisma.advertisements.findFirst({
            where: { id: adsId },
          })
          : null;

        if (!result) {
          return {
            status: 204,
            body: "adsId not found!",
          };
        }

        await imagePathsToS3Url([result], "advertisement");

        return {
          status: 200,
          body: toSerialized(result),
        };
      } catch (error) {
        return {
          status: 400,
          body: {
            message: "An error occured while trying to retrieve the adsId.",
            details: toErrorDetails(error),
          },
        };
      }
    },
  },
);

const advertisementGetAdsByOwner = s.route(
  communityApiContracts.advertisementGetAdsByOwner,
  {
    handler: async ({ params }) => {
      try {
        const result = await prisma.advertisements.findMany({
          where: { ownerId: params.ownerId },
        });
        await imagePathsToS3Url(result, "advertisement");

        return {
          status: 200,
          body: toSerialized(result),
        };
      } catch (error) {
        return {
          status: 400,
          body: {
            message: "An error occured while trying to retrieve the adsId.",
            details: toErrorDetails(error),
          },
        };
      }
    },
  },
);

const advertisementUpdate = s.route(communityApiContracts.advertisementUpdate, {
  middleware: [passport.authenticate("jwt", { session: false }), upload],
  handler: async ({ params, req, body }) => {
    let error = "";
    let errorMessage = "";
    let errorStack = "";

    try {
      const user = getRequestUser(req);
      if (!user?.id || !user.email) {
        return {
          status: 403,
          body: {
            message: "You don't have the right to update an advertisement!",
            details: {
              errorMessage:
                "In order to update an advertisement, you must be an admin or business user.",
              errorStack: "user must be authenticated and authorized",
            },
          },
        };
      }

      const theUser = await getAdvertisementOwnerType(user.id);
      const { adType, adTitle, adDuration, externalLink, published } =
        body as any;
      const parsedAdvertisementId = parseIntegerParam(params.advertisementId);

      if (!canManageAdvertisement(theUser?.userType)) {
        return {
          status: 403,
          body: {
            message: "You don't have the right to update an advertisement!",
            details: {
              errorMessage:
                "In order to update an advertisement, you must be an admin or business user.",
              errorStack:
                "user must be an admin or business if they want to update an advertisement",
            },
          },
        };
      }

      if (!params.advertisementId || !parsedAdvertisementId) {
        return {
          status: 400,
          body: {
            message:
              "A valid advertisementId must be specified in the route paramater.",
          },
        };
      }

      const theAdvertisement = await prisma.advertisements.findUnique({
        where: { id: parsedAdvertisementId },
      });

      if (!theAdvertisement) {
        return {
          status: 400,
          body: {
            message: `The advertisement with that listed ID (${params.advertisementId}) does not exist.`,
          },
        };
      }

      if (theAdvertisement.ownerId !== user.id) {
        return {
          status: 401,
          body: {
            message: `The user ${user.email} is not the owner or an admin and therefore cannot edit this advertisement.`,
          },
        };
      }

      let endDate: Date | undefined;
      let thePublished: boolean | undefined;

      if (adType && adType !== "COMPLIMENTARY" && adType !== "PAID") {
        error += "adType is invalid. ";
        errorMessage += "adType must be predefined value. ";
        errorStack += "adType must be assigned with predfined value. ";
      }

      if (adTitle && (adTitle.length < 2 || adTitle.length > 40)) {
        error += "adTitle size is invalid. ";
        errorMessage +=
          "adTitle length must be longer than 2 and shorter than 40. ";
        errorStack += "adTitle content size must be valid ";
      }

      if (
        theAdvertisement.duration == null &&
        !adDuration &&
        adType === "PAID"
      ) {
        error += "adDuration must be provided. ";
        errorMessage +=
          "adDuration must be provided in the body with a valid length if there's no exisintg duration. ";
        errorStack +=
          "adDuration must be provided in the body with a valid lenght. ";
      }

      if (adDuration && theAdvertisement.adType === "PAID") {
        if (Number.parseInt(adDuration, 10) <= 0) {
          error += "adDuration must be provided. ";
          errorMessage +=
            "adDuration must be provided in the body with a valid length. ";
          errorStack +=
            "adDuration must be provided in the body with a valid lenght. ";
        } else {
          const theDate = new Date();
          endDate = new Date();
          endDate.setDate(theDate.getDate() + Number.parseInt(adDuration, 10));
        }
      }

      if (published) {
        if (published === "false" || published === "true") {
          thePublished = published === "true";
        } else {
          error += "published must be predefined values. ";
          errorMessage +=
            "Updating an advertisement must explicitly supply a valid published value. ";
          errorStack +=
            "Published must be provided in the body with a valid value.";
        }
      }

      if (error && errorMessage && errorStack) {
        const newUploadPath = normalizeUploadImagePath((req as any).file);
        if (newUploadPath) {
          await deleteImage("advertisement", newUploadPath);
        }

        return {
          status: 400,
          body: {
            message: error,
            details: {
              errorMessage,
              errorStack,
            },
            reqBody: {
              adType,
              adTitle,
              adDuration,
              externalLink,
              published,
            },
          },
        };
      }

      let newImagePath: string | null | undefined;
      if ((req as any).file) {
        if (theAdvertisement.imagePath) {
          await deleteImage("advertisement", theAdvertisement.imagePath);
        }
        newImagePath = normalizeUploadImagePath((req as any).file);
      }

      const updatedAdvertisement = await prisma.advertisements.update({
        where: { id: parsedAdvertisementId },
        data: {
          ...(adType !== undefined ? { adType } : {}),
          ...(adTitle !== undefined ? { adTitle } : {}),
          ...(adType === "COMPLIMENTARY" ? { duration: null } : {}),
          ...(endDate !== undefined ? { duration: endDate } : {}),
          ...(newImagePath !== null && newImagePath !== undefined
            ? { imagePath: newImagePath }
            : {}),
          ...(externalLink !== undefined ? { externalLink } : {}),
          ...(thePublished !== undefined ? { published: thePublished } : {}),
        },
      });

      return {
        status: 200,
        body: toSerialized(updatedAdvertisement),
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "An error occured while trying to update an Advertisement.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const advertisementDelete = s.route(communityApiContracts.advertisementDelete, {
  middleware: [passport.authenticate("jwt", { session: false })],
  handler: async ({ params, req }) => {
    try {
      const user = getRequestUser(req);
      const parsedAdvertisementId = parseIntegerParam(params.advertisementId);

      if (!parsedAdvertisementId) {
        return {
          status: 400,
          body: {
            message:
              "A valid advertisementId must be specified in the route paramater.",
          },
        };
      }

      const theUser = user?.id
        ? await prisma.user.findUnique({
          where: { id: user.id },
          select: { userType: true },
        })
        : null;

      if (
        theUser?.userType !== "SUPER_ADMIN" &&
        theUser?.userType !== "ADMIN" &&
        theUser?.userType !== "BUSINESS"
      ) {
        return {
          status: 403,
          body: {
            message: "You don't have the right to add an advertisement!",
            details: {
              errorMessage:
                "In order to delete an advertisement, you must be an admin or business user.",
              errorStack:
                "user must be an admin or business if they want to delete an advertisement",
            },
          },
        };
      }

      const theAdvertisement = await prisma.advertisements.findUnique({
        where: { id: parsedAdvertisementId },
      });

      if (!theAdvertisement) {
        return {
          status: 404,
          body: "Advertisement which needs to be deleted not found!",
        };
      }

      if (theAdvertisement.ownerId !== user?.id) {
        return {
          status: 401,
          body: {
            message: `The user ${user?.email} is not the author or an admin and therefore cannot delete this advertisement.`,
          },
        };
      }

      if (theAdvertisement.imagePath) {
        await deleteImage("advertisement", theAdvertisement.imagePath);
      }

      const deletedAd = await prisma.advertisements.delete({
        where: {
          id: parsedAdvertisementId,
        },
      });

      return {
        status: 200,
        body: {
          message: "Advertisement succesfully deleted",
          deletedAd: toSerialized(deletedAd),
        },
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "An error occured while trying to delete advertisement.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const advertisementGetPrices = s.route(
  communityApiContracts.advertisementGetPrices,
  {
    handler: async () => {
      try {
        const result = await prisma.adPrice.findMany({
          orderBy: {
            lengthWeeks: "asc",
          },
        });

        return {
          status: 200,
          body: toSerialized(result),
        };
      } catch (error) {
        return {
          status: 400,
          body: {
            message: "An error occurred while trying to retrieve ad pricing.",
            details: toErrorDetails(error),
          },
        };
      }
    },
  },
);

const advertisementAddPrice = s.route(
  communityApiContracts.advertisementAddPrice,
  {
    handler: async ({ body }) => {
      try {
        const { lengthWeeks, priceCadDollars } = body as any;

        if (!lengthWeeks || !priceCadDollars) {
          return {
            status: 400,
            body: {
              message: "Missing required fields",
            },
          };
        }

        const newPrice = await prisma.adPrice.create({
          data: {
            lengthWeeks,
            priceCadDollars,
          },
        });

        return {
          status: 201,
          body: toSerialized(newPrice),
        };
      } catch (error) {
        return {
          status: 400,
          body: {
            message: "Failed to create ad price",
            details: error instanceof Error ? error.message : String(error),
          },
        };
      }
    },
  },
);

const advertisementUpdatePrice = s.route(
  communityApiContracts.advertisementUpdatePrice,
  {
    handler: async ({ params, body }) => {
      try {
        const id = Number(params.id);
        const { lengthWeeks, priceCadDollars } = body as any;

        if (Number.isNaN(id)) {
          return {
            status: 400,
            body: {
              message: "Invalid ID",
            },
          };
        }

        const updatedPrice = await prisma.adPrice.update({
          where: { id },
          data: {
            lengthWeeks,
            priceCadDollars,
          },
        });

        return {
          status: 200,
          body: toSerialized(updatedPrice),
        };
      } catch (error) {
        return {
          status: 400,
          body: {
            message: "Failed to update ad price",
            details: error instanceof Error ? error.message : String(error),
          },
        };
      }
    },
  },
);

const advertisementDeletePrice = s.route(
  communityApiContracts.advertisementDeletePrice,
  {
    handler: async ({ params }) => {
      try {
        const id = Number(params.id);

        if (Number.isNaN(id)) {
          return {
            status: 400,
            body: {
              message: "Invalid ID",
            },
          };
        }

        await prisma.adPrice.delete({
          where: { id },
        });

        return {
          status: 204,
          body: undefined,
        };
      } catch (error) {
        return {
          status: 400,
          body: {
            message: "Failed to delete ad price",
            details: error instanceof Error ? error.message : String(error),
          },
        };
      }
    },
  },
);

const advertisementPricing = s.route(
  communityApiContracts.advertisementPricing,
  {
    middleware: [passport.authenticate("jwt", { session: false })],
    handler: async () => {
      try {
        const segmentUserCounts = await (prisma as any).userSegments.groupBy({
          by: ["homeSegmentId"],
          _count: {
            userId: true,
          },
          orderBy: {
            homeSegmentId: "asc",
          },
        });

        const segments = await prisma.segments.findMany({
          distinct: ["segId"],
          orderBy: {
            segId: "asc",
          },
        });

        const mapped = segmentUserCounts.map((segmentUserCount: any) => ({
          name: segments[segmentUserCount.homeSegmentId - 1]?.name ?? "",
          segId: segments[segmentUserCount.homeSegmentId - 1]?.segId ?? null,
          count: segmentUserCount._count.userId,
        }));

        return {
          status: 200,
          body: toSerialized(mapped),
        };
      } catch (error) {
        return {
          status: 400,
          body: {
            message: error instanceof Error ? error.message : String(error),
          },
        };
      }
    },
  },
);

const advertisementGetSegmentPrices = s.route(
  communityApiContracts.advertisementGetSegmentPrices,
  {
    handler: async () => {
      try {
        const segments = await prisma.segments.findMany({
          orderBy: { segId: "asc" },
          include: {
            segmentAdPrice: true,
          },
        });

        const mapped = segments.map((segment) => ({
          id: segment.segmentAdPrice?.id ?? null,
          segmentId: segment.segId,
          segmentName: segment.name,
          weeklyPrice: segment.segmentAdPrice?.weeklyPrice?.toString() ?? null,
        }));

        return {
          status: 200,
          body: mapped,
        };
      } catch (error) {
        return {
          status: 400,
          body: {
            message: "An error occurred while retrieving segment ad prices.",
            details: toErrorDetails(error),
          },
        };
      }
    },
  },
);

const advertisementUpdateSegmentPrice = s.route(
  communityApiContracts.advertisementUpdateSegmentPrice,
  {
    middleware: [passport.authenticate("jwt", { session: false })],
    handler: async ({ params, req, body }) => {
      try {
        const segmentId = Number(params.segmentId);
        const { weeklyPrice } = body as any;

        if (Number.isNaN(segmentId)) {
          return {
            status: 400,
            body: {
              message: "Invalid segment ID",
            },
          };
        }

        const user = getRequestUser(req);
        const theUser = user?.id
          ? await prisma.user.findUnique({
            where: { id: user.id },
            select: { userType: true },
          })
          : null;

        if (
          theUser?.userType !== "SUPER_ADMIN" &&
          theUser?.userType !== "ADMIN"
        ) {
          return {
            status: 403,
            body: {
              message: "You don't have the right to update ad pricing!",
            },
          };
        }

        const updated = await prisma.segmentAdPrice.upsert({
          where: { segmentId },
          update: { weeklyPrice },
          create: { segmentId, weeklyPrice },
          include: { segment: { select: { name: true } } },
        });

        return {
          status: 200,
          body: {
            id: updated.id,
            segmentId: updated.segmentId,
            segmentName: updated.segment.name,
            weeklyPrice: updated.weeklyPrice.toString(),
          },
        };
      } catch (error) {
        return {
          status: 400,
          body: {
            message: "Failed to update segment ad price",
            details: toErrorDetails(error),
          },
        };
      }
    },
  },
);

const advertisementDeleteSegmentPrice = s.route(
  communityApiContracts.advertisementDeleteSegmentPrice,
  {
    middleware: [passport.authenticate("jwt", { session: false })],
    handler: async ({ params, req }) => {
      try {
        const segmentId = Number(params.segmentId);

        if (Number.isNaN(segmentId)) {
          return {
            status: 400,
            body: {
              message: "Invalid segment ID",
            },
          };
        }

        const user = getRequestUser(req);
        const theUser = user?.id
          ? await prisma.user.findUnique({
            where: { id: user.id },
            select: { userType: true },
          })
          : null;

        if (
          theUser?.userType !== "SUPER_ADMIN" &&
          theUser?.userType !== "ADMIN"
        ) {
          return {
            status: 403,
            body: {
              message: "You don't have the right to update ad pricing!",
            },
          };
        }

        await prisma.segmentAdPrice.deleteMany({
          where: { segmentId },
        });

        return {
          status: 200,
          body: {
            message: "Segment price reset to default",
          },
        };
      } catch (error) {
        return {
          status: 400,
          body: {
            message: "Failed to reset segment ad price",
            details: toErrorDetails(error),
          },
        };
      }
    },
  },
);

export { communityApiContracts };

export default {
  schema: communityApiContracts,
  router: {
    advertisementAddPrice,
    advertisementCreate,
    advertisementDelete,
    advertisementDeletePrice,
    advertisementDeleteSegmentPrice,
    advertisementGetAdsByOwner,
    advertisementGetAll,
    advertisementGetAllPublished,
    advertisementGetAllUser,
    advertisementGetById,
    advertisementGetPrices,
    advertisementGetSegmentPrices,
    advertisementPricing,
    advertisementUpdate,
    advertisementUpdatePrice,
    advertisementUpdateSegmentPrice,
    blogRoot,
    categoryGetAll,
    categoryGetById,
    categoryRoot,
    commentAggregate,
    commentByUser,
    commentCreate,
    commentDelete,
    commentGetAll,
    commentGetAllByIdeaId,
    commentInteractDislike,
    commentInteractDislikeGetAll,
    commentInteractLike,
    commentInteractLikeGetAll,
    commentInteractTest,
    commentRoot,
    commentSimilarComments,
    commentUpdate,
    commentUpdateNotificationState,
    commentUpdateState,
    communityCreateCollaborator,
    communityCreateDonor,
    communityCreateVolunteer,
    communityGetCollaborators,
    communityGetDonors,
    communityGetVolunteers,
  },
} as unknown as Handlers;
