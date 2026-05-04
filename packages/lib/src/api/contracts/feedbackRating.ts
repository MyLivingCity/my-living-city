import { initContract } from "@ts-rest/core";
import z from "zod";
import { DateTimeString, ErrorResponseSchema } from "../common";

const c = initContract();

export const FeedbackRatingSchema = z.object({
  id: z.number(),
  proposalId: z.number(),
  feedbackId: z.number(),
  authorId: z.string(),
  rating: z.number(),
  ratingExplanation: z.string().nullable(),
  createdAt: DateTimeString,
  updatedAt: DateTimeString,
});

const YesNoSummarySchema = z.object({
  yesRatings: z.number(),
  noRatings: z.number(),
});

const RatingSummarySchema = z.object({
  averageRating: z.number().nullable(),
});

const AggregateResponseSchema = z.object({
  ratings: z.array(FeedbackRatingSchema),
  summary: z.union([YesNoSummarySchema, RatingSummarySchema, z.object({})]),
});

const CreateFeedbackRatingResponseSchema = z.object({
  message: z.string(),
  rating: FeedbackRatingSchema,
});

export const feedbackRatingApiContracts = c.router(
  {
    create: {
      method: "POST",
      path: "/create/:feedbackId/:proposalId",
      body: z.object({
        rating: z.number(),
        ratingExplanation: z.string().optional(),
      }),
      responses: {
        200: CreateFeedbackRatingResponseSchema,
        400: ErrorResponseSchema,
        404: z.object({ message: z.string() }),
      },
      summary: "Create a feedback rating",
    },
    getAll: {
      method: "GET",
      path: "/getall/:proposalId/:feedbackId",
      responses: {
        200: z.array(FeedbackRatingSchema),
        400: ErrorResponseSchema,
      },
      summary: "Get all ratings for a feedback on a proposal",
    },
    getAggregate: {
      method: "GET",
      path: "/getall/:proposalId/:feedbackId/:type/aggregate",
      responses: {
        200: AggregateResponseSchema,
        400: ErrorResponseSchema,
      },
      summary: "Get aggregated ratings for a feedback (YESNO or RATING type)",
    },
  },
  {
    pathPrefix: "/feedbackRating",
  },
);
