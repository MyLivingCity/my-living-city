import { initContract } from "@ts-rest/core";
import z from "zod";
import { DateTimeString, ErrorResponseSchema } from "../common";

const c = initContract();

export const IdeaRatingSchema = z.object({
  id: z.number(),
  ideaId: z.number(),
  authorId: z.string(),
  rating: z.number(),
  ratingExplanation: z.string().nullable(),
  createdAt: DateTimeString,
  updatedAt: DateTimeString,
});

const RatingAggregationSummarySchema = z.object({
  ratingAvg: z.number().nullable(),
  ratingCount: z.number(),
  posRatings: z.number(),
  negRatings: z.number(),
});

const RatingAggregateSchema = z.object({
  count: z.number(),
  avg: z.number().nullable(),
  negativeRatings: z.object({ count: z.number() }),
  positiveRatings: z.object({ count: z.number() }),
});

const RatingsWithAggregationsSchema = z.object({
  ratings: z.array(IdeaRatingSchema),
  summary: RatingAggregationSummarySchema,
});

const CreateRatingResponseSchema = z.object({
  message: z.string(),
  rating: IdeaRatingSchema,
  updatedIdea: z.unknown().nullable(),
});

const MutateRatingResponseSchema = z.object({
  message: z.string(),
  rating: IdeaRatingSchema,
});

const DeleteRatingResponseSchema = z.object({
  message: z.string(),
  deletedRating: IdeaRatingSchema,
});

export const ratingApiContracts = c.router(
  {
    getAll: {
      method: "GET",
      path: "/getall",
      responses: {
        200: z.array(IdeaRatingSchema),
        400: ErrorResponseSchema,
      },
      summary: "Get all idea ratings",
    },
    getAllByIdeaId: {
      method: "GET",
      path: "/getall/:ideaId",
      responses: {
        200: z.array(IdeaRatingSchema),
        400: ErrorResponseSchema,
      },
      summary: "Get all ratings for a specific idea",
    },
    getAllByIdeaIdWithAggregations: {
      method: "GET",
      path: "/getall/:ideaId/aggregations",
      responses: {
        200: RatingsWithAggregationsSchema,
        400: ErrorResponseSchema,
      },
      summary: "Get all ratings for a specific idea with aggregations",
    },
    getAggregate: {
      method: "GET",
      path: "/aggregate/:ideaId",
      responses: {
        200: RatingAggregateSchema,
        400: ErrorResponseSchema,
      },
      summary: "Get aggregated rating stats for an idea",
    },
    create: {
      method: "POST",
      path: "/create/:ideaId",
      body: z.object({
        rating: z.number(),
        ratingExplanation: z.string().optional(),
      }),
      responses: {
        200: CreateRatingResponseSchema,
        400: ErrorResponseSchema,
      },
      summary: "Create a rating for an idea",
    },
    update: {
      method: "PUT",
      path: "/update/:ratingId",
      body: z.object({
        rating: z.number().optional(),
        ratingExplanation: z.string().optional(),
      }),
      responses: {
        200: MutateRatingResponseSchema,
        400: ErrorResponseSchema,
      },
      summary: "Update a rating",
    },
    deleteRating: {
      method: "DELETE",
      path: "/delete/:ratingId",
      body: z.undefined(),
      responses: {
        200: DeleteRatingResponseSchema,
        400: ErrorResponseSchema,
      },
      summary: "Delete a rating",
    },
  },
  {
    pathPrefix: "/rating",
  },
);
