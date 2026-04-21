import { initContract } from "@ts-rest/core";
import z from "zod";
import { IdeaSchema } from "./ideas";
import { UserSchema } from "./users";

const c = initContract();

export const SegmentType = z.enum(["segment", "superSegment", "subSegment"]);

const SegmentSchemaBase = z.object({
  country: z.string().nullable(),
  createdAt: z.date(),
  ideas: z.array(IdeaSchema.shape.id),
  lat: z.number().nullable(),
  lon: z.number().nullable(),
  name: z.string(),
  parentId: z.number().nullable(),
  province: z.string().nullable(),
  radius: z.number().nullable(),
  regionSubGroups: z.array(z.unknown()), // TODO
  segId: z.number(),
  segmentAdPrice: z.unknown().nullable(), // TODO
  segmentSubGroups: z.array(z.unknown()), // TODO
  segmentType: SegmentType,
  subSegmentSubGroups: z.array(z.unknown()), // TODO
  updatedAt: z.date().nullable(),
  userReach: z.array(z.unknown()), // TODO
  userSegment: z.array(z.unknown()), // TODO
});

export const SegmentSchema = z.union([
  SegmentSchemaBase,
  z.object({
    get children() {
      return z.array(SegmentSchemaBase);
    },
    get parentSegment() {
      return SegmentSchemaBase;
    },
  }),
]);

export const UserSegmentRelationshipType = z.enum(["HOME", "WORK", "SCHOOL"]);

export const UserSegmentSchema = z.object({
  id: z.number(),
  userId: z.string(),
  userSegmentRelationship: UserSegmentRelationshipType,
  segmentId: z.number(),
  IdeaComment: z.array(z.unknown()), // TODO
});

export const segmentApiContracts = c.router(
  {
    create: {
      method: "POST",
      path: "/create",
      body: SegmentSchema,
      responses: {
        200: SegmentSchema,
      },
      summary: "Create a segment",
    },
    getAll: {
      method: "GET",
      path: "/getAll",
      responses: {
        200: z.array(SegmentSchema),
      },
      summary: "Get all segments",
    },
    getById: {
      method: "GET",
      path: "/getBySegmentId/:segmentId",
      responses: {
        200: SegmentSchema,
      },
      summary: "Get segment by id",
    },
    getByType: {
      method: "GET",
      path: "/getByType/:type",
      responses: {
        200: z.array(SegmentSchema),
      },
      summary: "Get all segments by type",
    },
    getChildrenOfParent: {
      method: "GET",
      path: "/getChildren/:parentId",
      responses: {
        200: z.array(SegmentSchema),
      },
      summary: "Get all child segments of parent",
    },
  },
  {
    pathPrefix: "/segment",
  },
);
