import { initContract } from "@ts-rest/core";
import z from "zod";
import {
  DecimalLikeSchema,
  ErrorResponseSchema,
  SimpleMessageResponseSchema,
} from "../common";

const c = initContract();

export const SegmentType = z.enum(["segment", "superSegment", "subSegment"]);

const SegmentParentSchema = z.object({
  country: z.string().nullable(),
  name: z.string(),
  province: z.string().nullable(),
  segId: z.number(),
  segmentType: SegmentType,
});

const SegmentBaseSchema = z.object({
  country: z.string().nullable(),
  createdAt: z.coerce.date(),
  lat: DecimalLikeSchema.nullable(),
  lon: DecimalLikeSchema.nullable(),
  name: z.string(),
  parentId: z.number().nullable(),
  province: z.string().nullable(),
  radius: DecimalLikeSchema.nullable(),
  segId: z.number(),
  segmentType: SegmentType,
  updatedAt: z.coerce.date().nullable(),
});

export const SegmentSchema = SegmentBaseSchema.extend({
  children: z.array(SegmentBaseSchema).optional(),
  parentSegment: SegmentParentSchema.optional(),
});

const UserSegmentRelationshipType = z.enum(["HOME", "WORK", "SCHOOL"]);

export const UserSegmentSchema = z.object({
  id: z.number(),
  segmentId: z.number(),
  userId: z.string(),
  userSegmentRelationship: UserSegmentRelationshipType,
  IdeaComment: z.array(z.unknown()).optional(),
});

const CreateSegmentBodySchema = z.object({
  country: z.string(),
  name: z.string(),
  parentSuperSegId: z.union([z.number(), z.string()]).optional(),
  province: z.string(),
  superSegId: z.union([z.number(), z.string()]).optional(),
});

export const segmentApiContracts = c.router(
  {
    segment: c.router(
      {
        create: {
          method: "POST",
          path: "/create",
          body: CreateSegmentBodySchema,
          responses: {
            200: SegmentSchema,
            400: ErrorResponseSchema,
            403: ErrorResponseSchema,
          },
          summary: "Create a segment",
        },
        getAll: {
          method: "GET",
          path: "/getAll",
          responses: {
            200: z.array(SegmentSchema),
            400: ErrorResponseSchema,
          },
          summary: "Get all segments",
        },
        getById: {
          method: "GET",
          path: "/getBySegmentId/:segmentId",
          pathParams: z.object({ segmentId: z.coerce.number() }),
          responses: {
            200: SegmentSchema,
            400: z.union([SimpleMessageResponseSchema, ErrorResponseSchema]),
          },
          summary: "Get segment by id",
        },
        getBySuperSegId: {
          method: "GET",
          path: "/getBySuperSegId/:superSegId",
          pathParams: z.object({ superSegId: z.coerce.number() }),
          responses: {
            200: z.array(SegmentSchema),
            400: z.union([z.string(), ErrorResponseSchema]),
            404: z.string(),
          },
          summary: "Get segments by super segment id",
        },
        getByType: {
          method: "GET",
          path: "/getByType/:type",
          pathParams: z.object({ type: SegmentType }),
          responses: {
            200: z.array(SegmentSchema),
            400: z.union([
              z.object({
                message: z.string(),
                validTypes: z.array(SegmentType),
              }),
              ErrorResponseSchema,
            ]),
          },
          summary: "Get all segments by type",
        },
        getChildrenOfParent: {
          method: "GET",
          path: "/getChildren/:parentId",
          pathParams: z.object({ parentId: z.coerce.number() }),
          responses: {
            200: z.array(SegmentSchema),
            400: ErrorResponseSchema.or(SimpleMessageResponseSchema),
            404: SimpleMessageResponseSchema,
          },
          summary: "Get all child segments of parent",
        },
      },
      {
        pathPrefix: "/segment",
      },
    ),
    subSegment: c.router(
      {
        create: {
          method: "POST",
          path: "/create",
          body: SegmentSchema.pick({
            segId: true,
            name: true,
            lat: true,
            lon: true,
            radius: true,
          }),
          responses: {
            200: SimpleMessageResponseSchema, //should be 201, semantically - matching existing
            400: ErrorResponseSchema,
            403: ErrorResponseSchema,
          },
          summary: "Create a new subsegment",
        },
        delete: {
          method: "DELETE",
          path: "/delete/:subSegmentId",
          pathParams: z.object({ subSegmentId: z.coerce.number() }),
          responses: {
            204: z.undefined(),
            400: ErrorResponseSchema,
            403: ErrorResponseSchema,
            404: ErrorResponseSchema,
          },
          summary: "Delete a subsegment by segId",
        },
        /**
         * This will require a findMany where parentId !== null,
         * as subSegments is not a real table
         */
        getAll: {
          method: "GET",
          path: "/getAll",
          responses: {
            200: z.array(SegmentSchema),
            400: ErrorResponseSchema,
          },
          summary: "Get all subsegments",
        },
        getBySubSegmentId: {
          method: "GET",
          path: "/getBySubSegmentId/:subSegmentId",
          pathParams: z.object({ subSegmentId: z.coerce.number() }),
          responses: {
            200: SegmentSchema,
            400: ErrorResponseSchema,
          },
          summary: "Get a subsegment by its segId",
        },
        /**
         * This will require a findMany where parentId === :segmentId,
         * as subSegments is not a real table
         */
        getBySegmentId: {
          method: "GET",
          path: "/getBySegmentId/:segmentId",
          pathParams: z.object({ segmentId: z.coerce.number() }),
          responses: {
            200: z.array(SegmentSchema),
            400: ErrorResponseSchema,
            404: ErrorResponseSchema,
          },
          summary: "Get all subsegments with parentId :segmentId",
        },
      },
      {
        pathPrefix: "/subSegment",
      },
    ),
    superSegment: c.router(
      {
        create: {
          method: "POST",
          path: "/create",
          body: SegmentSchema.pick({
            name: true,
            country: true,
            province: true,
          }),
          responses: {
            200: SimpleMessageResponseSchema, //should be 201, semantically - matching existing
            400: ErrorResponseSchema,
            403: ErrorResponseSchema,
          },
          summary: "Create a new superSegment",
        },
        getAll: {
          method: "GET",
          path: "/getAll",
          responses: {
            200: z.array(SegmentSchema),
            400: ErrorResponseSchema,
          },
          summary: "Get all superSegments",
        },
        getByCountryProvince: {
          method: "GET",
          path: "/getByCountryProvince",
          query: z.object({
            country: z.string(),
            province: z.string(),
          }),
          responses: {
            200: z.object({
              superSegId: z.string(),
              name: z.string(),
              country: z.string(),
              province: z.string(),
              createdAt: z.date(),
              updatedAt: z.date(),
            }),
            400: ErrorResponseSchema,
          },
          summary:
            "Get all superSegments matching both country and province queries",
        },
        getBySuperSegmentId: {
          method: "GET",
          path: "/getBySubSegmentId/:superSegmentId",
          pathParams: z.object({ subSegmentId: z.coerce.number() }),
          responses: {
            200: z.array(SegmentSchema),
            400: ErrorResponseSchema,
          },
          summary: "Get a subsegment by its segId",
        },
        /**
         * the legacy version of this doesn't differ from DELETE
         * of a standard segment, other than checking that it's
         * a superSegment - should be removing relations, too
         */
        delete: {
          method: "DELETE",
          path: "/delete/:deleteId",
          pathParams: z.object({ deleteId: z.coerce.number() }),
          responses: {
            204: z.undefined(),
            400: ErrorResponseSchema,
            403: ErrorResponseSchema,
            404: ErrorResponseSchema,
          },
          summary: "Delete a superSegment by segId",
        },
        update: {
          method: "PATCH",
          path: "/update/:superSegId",
          pathParams: z.object({ superSegId: z.coerce.number() }),
          body: z.object({
            superSegId: z.string(),
            name: z.string(),
            country: z.string(),
            province: z.string(),
            createdAt: z.date(),
            updatedAt: z.date(),
          }),
          responses: {
            200: z.undefined(),
            400: ErrorResponseSchema,
            403: ErrorResponseSchema,
            404: ErrorResponseSchema,
          },
          summary: "Update a superSegment by segId",
        },
      },
      {
        pathPrefix: "/superSegment",
      },
    ),
  },
  {
    pathPrefix: "/segments",
  },
);
