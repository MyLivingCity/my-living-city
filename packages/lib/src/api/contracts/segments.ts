import { initContract } from "@ts-rest/core";
import z from "zod";
import {
  DateTimeString,
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
  createdAt: DateTimeString,
  lat: DecimalLikeSchema.nullable(),
  lon: DecimalLikeSchema.nullable(),
  name: z.string(),
  parentId: z.number().nullable(),
  province: z.string().nullable(),
  radius: DecimalLikeSchema.nullable(),
  segId: z.number(),
  segmentType: SegmentType,
  updatedAt: DateTimeString.nullable(),
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
      responses: {
        200: SegmentSchema,
        400: z.union([SimpleMessageResponseSchema, ErrorResponseSchema]),
      },
      summary: "Get segment by id",
    },
    getBySuperSegId: {
      method: "GET",
      path: "/getBySuperSegId/:superSegId",
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
);
