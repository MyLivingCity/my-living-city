import passport from "passport";
import { ratingApiContracts } from "@mlc/lib/api";
import { prisma } from "src/prisma/client";
import { initServer } from "@ts-rest/express";
import { createHandlers } from "src/server";
import { serializeForContract, toErrorDetails } from "src/server/utils";
import { checkIdeaThresholds } from "src/server/features/ideas/utils";

const s = initServer();

const getAll = s.route(ratingApiContracts.getAll, {
  handler: async () => {
    try {
      const allRatings = await prisma.ideaRating.findMany();
      return {
        status: 200,
        body: serializeForContract(allRatings),
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "An error occurred while trying to fetch all idea ratings.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const getAllByIdeaId = s.route(ratingApiContracts.getAllByIdeaId, {
  handler: async ({ params }) => {
    try {
      const parsedIdeaId = parseInt(params.ideaId, 10);

      if (!parsedIdeaId) {
        return {
          status: 400,
          body: {
            message: "A valid ideaId must be specified in the route parameter.",
          },
        } as never;
      }

      const ratings = await prisma.ideaRating.findMany({
        where: { ideaId: parsedIdeaId },
      });

      return {
        status: 200,
        body: serializeForContract(ratings),
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: `An error occurred while trying to fetch all ratings under idea ${params.ideaId}.`,
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const getAllByIdeaIdWithAggregations = s.route(
  ratingApiContracts.getAllByIdeaIdWithAggregations,
  {
    handler: async ({ params }) => {
      try {
        const parsedIdeaId = parseInt(params.ideaId, 10);

        if (!parsedIdeaId) {
          return {
            status: 400,
            body: {
              message:
                "A valid ideaId must be specified in the route parameter.",
            },
          } as never;
        }

        const ratings = await prisma.ideaRating.findMany({
          where: { ideaId: parsedIdeaId },
        });
        const posRatings = await prisma.ideaRating.aggregate({
          where: { ideaId: parsedIdeaId, rating: { gt: 0 } },
          _count: true,
        });
        const negRatings = await prisma.ideaRating.aggregate({
          where: { ideaId: parsedIdeaId, rating: { lt: 0 } },
          _count: true,
        });
        const aggregates = await prisma.ideaRating.aggregate({
          where: { ideaId: parsedIdeaId },
          _avg: { rating: true },
          _count: true,
        });

        const summary = {
          ratingAvg: aggregates._avg.rating,
          ratingCount: aggregates._count,
          posRatings: posRatings._count,
          negRatings: negRatings._count,
        };

        return {
          status: 200,
          body: serializeForContract({ ratings, summary }),
        };
      } catch (error) {
        return {
          status: 400,
          body: {
            message: `An error occurred while trying to fetch ratings with aggregations for idea ${params.ideaId}.`,
            details: toErrorDetails(error),
          },
        };
      }
    },
  },
);

const getAggregate = s.route(ratingApiContracts.getAggregate, {
  handler: async ({ params }) => {
    try {
      const parsedIdeaId = parseInt(params.ideaId, 10);

      const foundIdea = await prisma.idea.findFirst({
        where: { id: parsedIdeaId },
      });
      if (!foundIdea) {
        return {
          status: 400,
          body: {
            message: `The idea with listed id ${parsedIdeaId} does not exist.`,
          },
        } as never;
      }

      const negativeRatings = await prisma.ideaRating.aggregate({
        where: { ideaId: parsedIdeaId, rating: { lt: 0 } },
        _count: true,
      });
      const positiveRatings = await prisma.ideaRating.aggregate({
        where: { ideaId: parsedIdeaId, rating: { gt: 0 } },
        _count: true,
      });
      const aggregations = await prisma.ideaRating.aggregate({
        where: { ideaId: parsedIdeaId },
        _avg: { rating: true },
        _count: true,
      });

      return {
        status: 200,
        body: {
          count: aggregations._count,
          avg: aggregations._avg.rating,
          negativeRatings: { count: negativeRatings._count },
          positiveRatings: { count: positiveRatings._count },
        },
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: `An error occurred while trying to fetch aggregated ratings for idea ${params.ideaId}.`,
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const create = s.route(ratingApiContracts.create, {
  middleware: [passport.authenticate("jwt", { session: false })],
  handler: async ({ params, body, req }) => {
    try {
      const { id: loggedInUserId } = req.user as { id: string; email: string };
      const { rating, ratingExplanation } = body;
      const parsedIdeaId = parseInt(params.ideaId, 10);

      if (!parsedIdeaId) {
        return {
          status: 400,
          body: {
            message: "A valid ideaId must be specified in the route parameter.",
          },
        } as never;
      }

      const foundIdea = await prisma.idea.findUnique({
        where: { id: parsedIdeaId },
      });
      if (!foundIdea) {
        return {
          status: 400,
          body: {
            message: `The idea with that listed ID (${parsedIdeaId}) does not exist.`,
          },
        } as never;
      }

      const userAlreadyCreatedRating = await prisma.ideaRating.findFirst({
        where: { authorId: loggedInUserId, ideaId: parsedIdeaId },
      });
      if (userAlreadyCreatedRating) {
        return {
          status: 400,
          body: {
            message:
              "You have already rated this idea. You cannot rate an idea twice.",
            details: {
              errorMessage: "A rating can only be voted on once.",
              errorStack: "",
            },
          },
        };
      }

      const createdRating = await prisma.ideaRating.create({
        data: {
          rating,
          ratingExplanation: ratingExplanation ?? null,
          authorId: loggedInUserId,
          ideaId: parsedIdeaId,
        },
      });

      const { triggerProposalAdvancement, triggerProjectAdvancement } =
        await checkIdeaThresholds(parsedIdeaId);

      let updatedIdea = null;
      if (triggerProposalAdvancement) {
        updatedIdea = await prisma.idea.update({
          where: { id: parsedIdeaId },
          data: { state: "PROPOSAL" },
        });
      }
      if (triggerProjectAdvancement) {
        updatedIdea = await prisma.idea.update({
          where: { id: parsedIdeaId },
          data: {
            state: "PROJECT",
            projectInfo: {
              create: { description: "Project has been initialized." },
            },
          },
        });
      }

      return {
        status: 200,
        body: serializeForContract({
          message: `Rating successfully created under Idea ${parsedIdeaId}`,
          rating: createdRating,
          updatedIdea,
        }),
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: `An error occurred while trying to create a rating for idea ${params.ideaId}.`,
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const update = s.route(ratingApiContracts.update, {
  middleware: [passport.authenticate("jwt", { session: false })],
  handler: async ({ params, body, req }) => {
    try {
      const { id: loggedInUserId, email } = req.user as {
        id: string;
        email: string;
      };
      const parsedRatingId = parseInt(params.ratingId, 10);

      if (!parsedRatingId) {
        return {
          status: 400,
          body: {
            message:
              "A valid ratingId must be specified in the route parameter.",
          },
        } as never;
      }

      const foundRating = await prisma.ideaRating.findUnique({
        where: { id: parsedRatingId },
      });
      if (!foundRating) {
        return {
          status: 400,
          body: {
            message: `The rating with the listed ID (${parsedRatingId}) does not exist.`,
          },
        } as never;
      }

      if (foundRating.authorId !== loggedInUserId) {
        return {
          status: 400,
          body: {
            message: `The user ${email} is not the author and therefore cannot edit this rating.`,
          },
        } as never;
      }

      // Build update object only for fields that were actually provided,
      // so a rating of 0 (falsy but valid) still gets saved.
      const updateData: Record<string, unknown> = {};
      if (body.rating !== undefined) updateData.rating = body.rating;
      if (body.ratingExplanation !== undefined)
        updateData.ratingExplanation = body.ratingExplanation;

      const updatedRating = await prisma.ideaRating.update({
        where: { id: parsedRatingId },
        data: updateData,
      });

      return {
        status: 200,
        body: serializeForContract({
          message: "Rating successfully updated",
          rating: updatedRating,
        }),
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: `An error occurred while trying to edit rating ${params.ratingId}.`,
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const deleteRating = s.route(ratingApiContracts.deleteRating, {
  middleware: [passport.authenticate("jwt", { session: false })],
  handler: async ({ params, req }) => {
    try {
      const { id: loggedInUserId, email } = req.user as {
        id: string;
        email: string;
      };
      const parsedRatingId = parseInt(params.ratingId, 10);

      if (!parsedRatingId) {
        return {
          status: 400,
          body: {
            message:
              "A valid ratingId must be specified in the route parameter.",
          },
        } as never;
      }

      const foundRating = await prisma.ideaRating.findUnique({
        where: { id: parsedRatingId },
      });
      if (!foundRating) {
        return {
          status: 400,
          body: {
            message: `The rating with the listed ID (${parsedRatingId}) does not exist.`,
          },
        } as never;
      }

      if (foundRating.authorId !== loggedInUserId) {
        return {
          status: 400,
          body: {
            message: `The user ${email} is not the author and therefore cannot delete this rating.`,
          },
        } as never;
      }

      const deletedRating = await prisma.ideaRating.delete({
        where: { id: parsedRatingId },
      });

      return {
        status: 200,
        body: serializeForContract({
          message: "Rating successfully deleted",
          deletedRating,
        }),
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: `An error occurred while trying to delete rating ${params.ratingId}.`,
          details: toErrorDetails(error),
        },
      };
    }
  },
});

export default createHandlers({
  schema: ratingApiContracts,
  router: {
    getAll,
    getAllByIdeaId,
    getAllByIdeaIdWithAggregations,
    getAggregate,
    create,
    update,
    deleteRating,
  },
});
