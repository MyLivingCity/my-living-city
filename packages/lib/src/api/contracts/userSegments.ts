import { initContract } from "@ts-rest/core";
import z from "zod";
import {
  DateTimeString,
  DecimalLikeSchema,
  ErrorResponseSchema,
} from "../common";

const c = initContract();

const SegmentTypeSchema = z.enum(["segment", "superSegment", "subSegment"]);
const UserSegmentRelationshipSchema = z.enum(["HOME", "WORK", "SCHOOL"]);

const SegmentSummarySchema = z
  .object({
    country: z.string().nullable(),
    createdAt: DateTimeString,
    lat: DecimalLikeSchema.nullable(),
    lon: DecimalLikeSchema.nullable(),
    name: z.string(),
    parentId: z.number().nullable(),
    province: z.string().nullable(),
    radius: DecimalLikeSchema.nullable(),
    segId: z.number(),
    segmentType: SegmentTypeSchema,
    updatedAt: DateTimeString.nullable(),
  })
  .passthrough();

const LegacySubSegmentSchema = z
  .object({
    createdAt: DateTimeString,
    id: z.number(),
    lat: DecimalLikeSchema.nullable().optional(),
    lon: DecimalLikeSchema.nullable().optional(),
    name: z.string(),
    radius: DecimalLikeSchema.nullable().optional(),
    segId: z.number(),
    updatedAt: DateTimeString.nullable().optional(),
  })
  .passthrough();

const NormalizedUserSegmentSchema = z
  .object({
    id: z.number(),
    segmentId: z.number(),
    userId: z.string(),
    userSegmentRelationship: UserSegmentRelationshipSchema,
    segment: SegmentSummarySchema.optional(),
  })
  .passthrough();

const DenormalizedUserSegmentSchema = z
  .object({
    id: z.number(),
    userId: z.string(),
    homeSuperSegId: z.number().nullable().optional(),
    homeSuperSegName: z.string().nullable().optional(),
    workSuperSegId: z.number().nullable().optional(),
    workSuperSegName: z.string().nullable().optional(),
    schoolSuperSegId: z.number().nullable().optional(),
    schoolSuperSegName: z.string().nullable().optional(),
    homeSegmentId: z.number().nullable().optional(),
    homeSegmentName: z.string().nullable().optional(),
    workSegmentId: z.number().nullable().optional(),
    workSegmentName: z.string().nullable().optional(),
    schoolSegmentId: z.number().nullable().optional(),
    schoolSegmentName: z.string().nullable().optional(),
    homeSubSegmentId: z.number().nullable().optional(),
    homeSubSegmentName: z.string().nullable().optional(),
    workSubSegmentId: z.number().nullable().optional(),
    workSubSegmentName: z.string().nullable().optional(),
    schoolSubSegmentId: z.number().nullable().optional(),
    schoolSubSegmentName: z.string().nullable().optional(),
    homeSegHandle: z.string().nullable().optional(),
    workSegHandle: z.string().nullable().optional(),
    schoolSegHandle: z.string().nullable().optional(),
  })
  .passthrough();

const UserSegmentMutationBodySchema = z.object({
  homeSegmentId: z.number().optional(),
  workSegmentId: z.number().optional(),
  schoolSegmentId: z.number().optional(),
  homeSubSegmentId: z.number().optional(),
  workSubSegmentId: z.number().optional(),
  schoolSubSegmentId: z.number().optional(),
});

const PatchUserSegmentResponseSchema = z.object({
  message: z.string(),
  userSegement: z.unknown(),
});

const PatchValidationErrorSchema = z.object({
  message: z.string(),
});

export const userSegmentsApiContracts = c.router(
  {
    getAllForAuthenticatedUser: {
      method: "GET",
      path: "/",
      responses: {
        200: z.object({
          success: z.literal(true),
          data: z.array(NormalizedUserSegmentSchema),
        }),
        400: z.object({
          success: z.literal(false),
          message: z.string(),
        }),
        500: z.object({
          success: z.literal(false),
          message: z.string(),
          error: z.string().optional(),
        }),
      },
      summary: "Get all segments for the authenticated user",
    },
    create: {
      method: "POST",
      path: "/create",
      body: UserSegmentMutationBodySchema,
      responses: {
        200: DenormalizedUserSegmentSchema,
        400: ErrorResponseSchema,
        409: z.string(),
      },
      summary: "Create a user segment record",
    },
    getMine: {
      method: "GET",
      path: "/getMySegment",
      responses: {
        200: DenormalizedUserSegmentSchema,
        400: ErrorResponseSchema,
        404: z.string(),
      },
      summary: "Get the authenticated user's user segment record",
    },
    getByUserId: {
      method: "GET",
      path: "/getUserSegment/:userId",
      pathParams: z.object({
        userId: z.string(),
      }),
      responses: {
        200: z.array(NormalizedUserSegmentSchema),
        204: z.string(),
        400: ErrorResponseSchema,
      },
      summary: "Get user segments for a specific user",
    },
    deleteMine: {
      method: "DELETE",
      path: "/delete",
      responses: {
        204: z.unknown(),
        400: z.union([z.string(), ErrorResponseSchema]),
      },
      summary: "Delete the authenticated user's user segment record",
    },
    upsertMine: {
      method: "PUT",
      path: "/update",
      body: UserSegmentMutationBodySchema,
      responses: {
        200: DenormalizedUserSegmentSchema,
        400: ErrorResponseSchema,
      },
      summary: "Update or create the authenticated user's user segment record",
    },
    updateByUserId: {
      method: "PUT",
      path: "/update/:id",
      pathParams: z.object({
        id: z.string(),
      }),
      body: UserSegmentMutationBodySchema,
      responses: {
        200: DenormalizedUserSegmentSchema,
        400: ErrorResponseSchema,
      },
      summary: "Update a user's user segment record by user id",
    },
    getHomeSegment: {
      method: "GET",
      path: "/homeSegment",
      responses: {
        200: SegmentSummarySchema,
        204: z.unknown(),
        400: ErrorResponseSchema,
        404: z.string(),
      },
      summary: "Get the authenticated user's home segment",
    },
    getWorkSegment: {
      method: "GET",
      path: "/workSegment",
      responses: {
        200: SegmentSummarySchema,
        204: z.unknown(),
        400: ErrorResponseSchema,
        404: z.string(),
      },
      summary: "Get the authenticated user's work segment",
    },
    getSchoolSegment: {
      method: "GET",
      path: "/schoolSegment",
      responses: {
        200: SegmentSummarySchema,
        204: z.unknown(),
        400: ErrorResponseSchema,
        404: z.string(),
      },
      summary: "Get the authenticated user's school segment",
    },
    getHomeSubSegment: {
      method: "GET",
      path: "/homeSubSegment",
      responses: {
        200: LegacySubSegmentSchema,
        204: z.unknown(),
        400: ErrorResponseSchema,
        404: z.string(),
      },
      summary: "Get the authenticated user's home sub-segment",
    },
    getWorkSubSegment: {
      method: "GET",
      path: "/workSubSegment",
      responses: {
        200: LegacySubSegmentSchema,
        204: z.unknown(),
        400: ErrorResponseSchema,
        404: z.string(),
      },
      summary: "Get the authenticated user's work sub-segment",
    },
    getSchoolSubSegment: {
      method: "GET",
      path: "/schoolSubSegment",
      responses: {
        200: LegacySubSegmentSchema,
        204: z.unknown(),
        400: ErrorResponseSchema,
        404: z.string(),
      },
      summary: "Get the authenticated user's school sub-segment",
    },
    getSegmentByName: {
      method: "GET",
      path: "/getSegmentByName/:name",
      pathParams: z.object({
        name: z.string(),
      }),
      responses: {
        200: SegmentSummarySchema,
        400: ErrorResponseSchema,
        404: z.string(),
      },
      summary: "Get a segment by name",
    },
    patchByUserId: {
      method: "PATCH",
      path: "/:userId/patch",
      pathParams: z.object({
        userId: z.string(),
      }),
      body: z.record(z.unknown()),
      responses: {
        200: PatchUserSegmentResponseSchema,
        400: z.union([PatchValidationErrorSchema, ErrorResponseSchema]),
      },
      summary: "Patch a user segment record by user id",
    },
  },
  {
    pathPrefix: "/userSegment",
  },
);
