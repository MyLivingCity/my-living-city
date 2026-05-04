import passport from "passport";
import { feedbackRatingApiContracts } from "@mlc/lib/api";
import { prisma } from "src/prisma/client";
import { initServer } from "@ts-rest/express";
import { createHandlers } from "src/server";
import { serializeForContract, toErrorDetails } from "src/server/utils";

const s = initServer();

const create = s.route(feedbackRatingApiContracts.create, {
  middleware: [passport.authenticate("jwt", { session: false })],
  handler: async ({ params, body, req }) => {
    try {
      const { id: userId } = req.user as { id: string };
      const { rating, ratingExplanation } = body;
      const parsedProposalId = parseInt(params.proposalId, 10);
      const parsedFeedbackId = parseInt(params.feedbackId, 10);

      if (!parsedProposalId || !parsedFeedbackId) {
        return {
          status: 400,
          body: {
            message: "A valid proposalId and feedbackId must be specified in the route parameters.",
            details: { errorMessage: "Invalid route parameters.", errorStack: "" },
          },
        };
      }

      const foundProposal = await prisma.proposal.findUnique({
        where: { id: parsedProposalId },
      });
      if (!foundProposal) {
        return {
          status: 404,
          body: {
            message: `The proposal with that listed ID (${parsedProposalId}) does not exist.`,
          },
        } as never;
      }

      const existingRating = await prisma.feedbackRating.findFirst({
        where: {
          authorId: userId,
          proposalId: parsedProposalId,
          feedbackId: parsedFeedbackId,
        },
      });
      if (existingRating) {
        return {
          status: 400,
          body: {
            message: "You have already rated this feedback. You cannot rate a feedback twice.",
            details: {
              errorMessage: "A rating can only be voted on once.",
              errorStack: "",
            },
          },
        };
      }

      const createdRating = await prisma.feedbackRating.create({
        data: {
          rating,
          ratingExplanation: ratingExplanation ?? null,
          authorId: userId,
          proposalId: parsedProposalId,
          feedbackId: parsedFeedbackId,
        },
      });

      return {
        status: 200,
        body: serializeForContract({
          message: `Rating successfully created under proposal ${parsedProposalId}`,
          rating: createdRating,
        }),
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: `An error occurred while trying to create a rating for feedback ${params.feedbackId} for proposal ${params.proposalId}.`,
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const getAll = s.route(feedbackRatingApiContracts.getAll, {
  handler: async ({ params }) => {
    try {
      const parsedProposalId = parseInt(params.proposalId, 10);
      const parsedFeedbackId = parseInt(params.feedbackId, 10);

      if (!parsedProposalId || !parsedFeedbackId) {
        return {
          status: 400,
          body: {
            message: "A valid proposalId and feedbackId must be specified in the route parameters.",
            details: { errorMessage: "Invalid route parameters.", errorStack: "" },
          },
        };
      }

      const ratings = await prisma.feedbackRating.findMany({
        where: {
          proposalId: parsedProposalId,
          feedbackId: parsedFeedbackId,
        },
      });

      return {
        status: 200,
        body: serializeForContract(ratings),
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: `An error occurred while trying to get all ratings for feedback ${params.feedbackId} for proposal ${params.proposalId}.`,
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const getAggregate = s.route(feedbackRatingApiContracts.getAggregate, {
  handler: async ({ params }) => {
    try {
      const parsedProposalId = parseInt(params.proposalId, 10);
      const parsedFeedbackId = parseInt(params.feedbackId, 10);

      if (!parsedProposalId || !parsedFeedbackId) {
        return {
          status: 400,
          body: {
            message: "A valid proposalId and feedbackId must be specified in the route parameters.",
            details: { errorMessage: "Invalid route parameters.", errorStack: "" },
          },
        };
      }

      const ratings = await prisma.feedbackRating.findMany({
        where: {
          proposalId: parsedProposalId,
          feedbackId: parsedFeedbackId,
        },
      });

      let summary: Record<string, unknown> = {};

      if (params.type === "YESNO") {
        const yesRatings = await prisma.feedbackRating.aggregate({
          where: { proposalId: parsedProposalId, feedbackId: parsedFeedbackId, rating: 1 },
          _count: true,
        });
        const noRatings = await prisma.feedbackRating.aggregate({
          where: { proposalId: parsedProposalId, feedbackId: parsedFeedbackId, rating: 2 },
          _count: true,
        });
        summary = {
          yesRatings: yesRatings._count,
          noRatings: noRatings._count,
        };
      } else if (params.type === "RATING") {
        const aggregates = await prisma.feedbackRating.aggregate({
          where: { proposalId: parsedProposalId, feedbackId: parsedFeedbackId },
          _avg: { rating: true },
        });
        summary = {
          averageRating: aggregates._avg.rating,
        };
      }

      return {
        status: 200,
        body: serializeForContract({ ratings, summary }),
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: `An error occurred while trying to get aggregated ratings for feedback ${params.feedbackId} for proposal ${params.proposalId}.`,
          details: toErrorDetails(error),
        },
      };
    }
  },
});

export default createHandlers({
  schema: feedbackRatingApiContracts,
  router: {
    create,
    getAll,
    getAggregate,
  },
});
