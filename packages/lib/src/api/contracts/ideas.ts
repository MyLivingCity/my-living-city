import { initContract } from "@ts-rest/core";
import z from "zod";
import { UserSchema, UserTypeSchema } from "./users";
import {
  DateTimeString,
  DecimalLikeSchema,
  ErrorResponseSchema,
} from "../common";

const c = initContract();

export const IdeaState = z.enum(["IDEA", "PROPOSAL", "PROJECT"]);

const SegmentTypeSchema = z.enum(["segment", "superSegment", "subSegment"]);

const IdeaAddressSchema = z.object({
  city: z.string().nullable(),
  country: z.string().nullable(),
  createdAt: DateTimeString,
  id: z.number(),
  ideaId: z.number().nullable(),
  postalCode: z.string().nullable(),
  proposalId: z.number().nullable(),
  streetAddress: z.string().nullable(),
  streetAddress2: z.string().nullable(),
  updatedAt: DateTimeString,
});

const IdeaGeoSchema = z.object({
  createdAt: DateTimeString,
  id: z.number(),
  ideaId: z.number().nullable(),
  lat: DecimalLikeSchema.nullable(),
  lon: DecimalLikeSchema.nullable(),
  proposalId: z.number().nullable(),
  updatedAt: DateTimeString,
});

const CategorySchema = z.object({
  createdAt: DateTimeString,
  description: z.string().nullable(),
  id: z.number(),
  title: z.string(),
  updatedAt: DateTimeString,
});

const SegmentSummarySchema = z.object({
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
});

const UserSegmentWithSegmentSchema = z.object({
  id: z.number(),
  segment: SegmentSummarySchema,
  segmentId: z.number(),
  userId: z.string(),
  userSegmentRelationship: z.enum(["HOME", "WORK", "SCHOOL"]),
});

const UserHandleSchema = z.object({
  handle: z.string(),
  id: z.number(),
  userId: z.string(),
  userSegmentRelationship: z.enum(["HOME", "WORK", "SCHOOL"]),
});

const UserAddressSchema = z.object({
  postalCode: z.string().nullable(),
  streetAddress: z.string().nullable(),
});

const IdeaUserSchema = UserSchema.extend({
  address: z
    .array(UserAddressSchema)
    .or(UserAddressSchema)
    .nullable()
    .optional(),
  userHandles: z.array(UserHandleSchema).optional(),
  userSegment: z.array(UserSegmentWithSegmentSchema).optional(),
});

export const IdeaSchema = z.object({
  active: z.boolean(),
  address: z.unknown().nullable().optional(),
  artsImpact: z.string().nullable(),
  authorId: UserSchema.shape.id,
  banned: z.boolean(),
  categoryId: z.number(),
  championId: z.string().nullable(),
  comments: z.array(z.unknown()).optional(),
  communityImpact: z.string().nullable(),
  createdAt: DateTimeString,
  description: z.string(),
  energyImpact: z.string().nullable(),
  flags: z.array(z.unknown()).optional(),
  geo: z.unknown().nullable().optional(),
  id: z.number(),
  imagePath: z.string().nullable(),
  manufacturingImpact: z.string().nullable(),
  natureImpact: z.string().nullable(),
  notification_dismissed: z.boolean(),
  PostBan: z.array(z.unknown()).optional(),
  projectInfo: z.unknown().nullable().optional(),
  proposal_benefits: z.string(),
  proposal_role: z.string(),
  Quarantine_Notifications: z.array(z.unknown()).optional(),
  quarantined_at: DateTimeString,
  ratings: z.array(z.unknown()).optional(),
  requirements: z.string(),
  reviewed: z.boolean(),
  state: IdeaState,
  supportingProposalId: z.number().nullable(),
  title: z.string(),
  updatedAt: DateTimeString,
  userIdeaEndorse: z.array(z.unknown()).optional(),
  userIdeaFollow: z.array(z.unknown()).optional(),
  userType: UserTypeSchema.or(z.string()),
});

const AggregatedIdeaSchema = z.object({
  active: z.boolean(),
  artsImpact: z.string().nullable(),
  authorId: z.string(),
  banned: z.boolean(),
  categoryId: z.number(),
  commentCount: z.union([z.number(), z.string()]),
  communityImpact: z.string().nullable(),
  createdAt: DateTimeString,
  description: z.string(),
  engagements: z.union([z.number(), z.string()]),
  energyImpact: z.string().nullable(),
  firstName: z.string(),
  id: z.number(),
  manufacturingImpact: z.string().nullable(),
  natureImpact: z.string().nullable(),
  negRatings: z.union([z.number(), z.string()]),
  notification_dismissed: z.boolean(),
  posRatings: z.union([z.number(), z.string()]),
  proposal_benefits: z.string(),
  proposal_role: z.string(),
  quarantined_at: DateTimeString,
  ratingAvg: z.union([z.number(), z.string()]),
  ratingCount: z.union([z.number(), z.string()]),
  requirements: z.string(),
  reviewed: z.boolean(),
  segId: z.number().nullable(),
  segmentName: z.string().nullable().optional(),
  state: IdeaState,
  streetAddress: z.string(),
  subSegId: z.number().nullable(),
  subSegmentName: z.string().nullable().optional(),
  superSegId: z.number().nullable(),
  title: z.string(),
  updatedAt: DateTimeString,
});

const IdeaDetailSchema = IdeaSchema.extend({
  address: IdeaAddressSchema.nullable(),
  author: IdeaUserSchema.extend({
    address: z
      .array(UserAddressSchema)
      .or(UserAddressSchema)
      .nullable()
      .optional(),
    userHandles: z.array(UserHandleSchema),
    userSegment: z.array(UserSegmentWithSegmentSchema),
  }),
  category: CategorySchema,
  champion: IdeaUserSchema.extend({
    address: z
      .array(UserAddressSchema)
      .or(UserAddressSchema)
      .nullable()
      .optional(),
  }).nullable(),
  geo: IdeaGeoSchema.nullable(),
  isChampionable: z.boolean(),
  projectInfo: z.unknown().nullable(),
  proposalInfo: z.object({ id: z.number() }).nullable(),
  segments: z.array(SegmentSummarySchema),
});

export const ideaApiContracts = c.router(
  {
    getAll: {
      method: "GET",
      path: "/getall",
      responses: {
        200: z.array(IdeaSchema),
        400: ErrorResponseSchema,
      },
      summary: "Get all ideas",
    },
    getAllWithAggregations: {
      method: "POST",
      path: "/getall/aggregations",
      body: z
        .object({
          take: z.number(),
        })
        .partial(),
      responses: {
        200: z.array(AggregatedIdeaSchema),
        400: ErrorResponseSchema,
      },
      summary: "Get all ideas with aggregations",
    },
    getAllWithSort: {
      method: "POST",
      path: "/getall/with-sort",
      body: z.record(z.unknown()),
      responses: {
        200: z.array(IdeaSchema),
        400: ErrorResponseSchema,
      },
      summary: "Get all ideas with Prisma findMany options",
    },
    getAllByUserId: {
      method: "GET",
      path: "/getall/:userId",
      responses: {
        200: z.array(AggregatedIdeaSchema),
        400: ErrorResponseSchema,
      },
      summary: "Get all ideas by user",
    },
    getById: {
      method: "GET",
      path: "/get/:ideaId",
      responses: {
        200: IdeaDetailSchema,
        400: ErrorResponseSchema,
      },
      summary: "Get idea by id",
    },
  },
  {
    pathPrefix: "/idea",
  },
);
