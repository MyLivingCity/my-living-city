import { initContract } from "@ts-rest/core";
import z from "zod";
import {
  DateTimeString,
  DecimalLikeSchema,
  ErrorResponseSchema,
  SimpleMessageResponseSchema,
} from "../common";

const c = initContract();

export const UserTypeSchema = z.enum([
  "ADMIN",
  "MOD",
  "SEG_ADMIN",
  "SEG_MOD",
  "MUNICIPAL_SEG_ADMIN",
  "BUSINESS",
  "RESIDENTIAL",
  "MUNICIPAL",
  "WORKER",
  "ASSOCIATE",
  "DEVELOPER",
  "COMMUNITY",
  "IN_PROGRESS",
  "SUPER_ADMIN",
]);

export type User = z.infer<typeof UserSchema>;

export const UserSegmentRelationshipType = z.enum(["HOME", "WORK", "SCHOOL"]);

export const UserSchema = z.object({
  adminmodEmail: z.string().nullable(),
  avatar: z.string().optional(),
  banned: z.boolean(),
  city: z.string().optional(),
  createdAt: z.date(),
  displayFName: z.string().nullable(),
  displayLName: z.string().nullable(),
  email: z.string(),
  fname: z.string().nullable(),
  hasFlagged: z.number(),
  id: z.string(),
  imagePath: z.string().nullable(),
  latitude: DecimalLikeSchema.optional(),
  lname: z.string().nullable(),
  longitude: DecimalLikeSchema.optional(),
  organizationName: z.string().nullable(),
  passCode: z.string().nullable(),
  password: z.string().nullable().optional(),
  postalCode: z.string().optional(),
  proposalLimit: z.number().nullable(),
  reviewed: z.boolean(),
  status: z.boolean(),
  streetAddress: z.string().optional(),
  totalFlagged: z.number(),
  updatedAt: z.date(),
  userReach: z.array(z.unknown()).optional(),
  userSegment: z.array(z.unknown()).optional(),
  userType: UserTypeSchema,
  verified: z.boolean(),
  verifiedToken: z.string().nullable(),
});

const UserAddressSchema = z.object({
  city: z.string().nullable(),
  country: z.string().nullable(),
  createdAt: DateTimeString,
  id: z.number(),
  postalCode: z.string().nullable(),
  streetAddress: z.string().nullable(),
  streetAddress2: z.string().nullable(),
  updatedAt: DateTimeString,
  userId: z.string(),
});

const UserGeoSchema = z.object({
  createdAt: DateTimeString,
  id: z.number(),
  lat: DecimalLikeSchema.nullable(),
  lon: DecimalLikeSchema.nullable(),
  school_lat: DecimalLikeSchema.nullable(),
  school_lon: DecimalLikeSchema.nullable(),
  updatedAt: DateTimeString,
  userId: z.string(),
  work_lat: DecimalLikeSchema.nullable(),
  work_lon: DecimalLikeSchema.nullable(),
});

const UserHandleSchema = z.object({
  handle: z.string(),
  id: z.number(),
  userId: z.string(),
  userSegmentRelationship: UserSegmentRelationshipType,
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
  segmentType: z.enum(["segment", "superSegment", "subSegment"]),
  updatedAt: DateTimeString.nullable(),
});

const UserSegmentSchema = z.object({
  id: z.number(),
  segmentId: z.number(),
  userId: z.string(),
  userSegmentRelationship: UserSegmentRelationshipType,
});

const UserSegmentWithSegmentSchema = UserSegmentSchema.extend({
  segment: SegmentSummarySchema,
});

const UserWithReachSchema = UserSchema.extend({
  userReach: z.array(z.unknown()),
  userSegment: z.array(UserSegmentWithSegmentSchema),
});

const VerboseUserSchema = UserSchema.extend({
  address: UserAddressSchema.nullable(),
  geo: UserGeoSchema.nullable(),
  userHandles: z.array(UserHandleSchema),
  userSegments: z.array(UserSegmentWithSegmentSchema),
});

const CreateUserSchema = z
  .object({
    userType: UserTypeSchema,
    verified: z.boolean(),
  })
  .passthrough();

const LoginUserSchema = z.object({
  email: z.string(),
  password: z.string(),
});

const AuthFlowResponseSchema = z.object({
  token: z.string(),
  user: UserSchema,
});

const PublicUserLookupSchema = z.object({
  email: z.string(),
  fname: z.string().nullable(),
  lname: z.string().nullable(),
});

const GetByEmailResponseSchema = z.object({
  foundUser: UserSchema,
});

export const userApiContracts = c.router(
  {
    getSelf: {
      method: "GET",
      path: "/me",
      responses: {
        200: UserSchema,
        400: ErrorResponseSchema,
        404: SimpleMessageResponseSchema,
      },
      summary: "Get auth user's self",
    },
    getSelfVerbose: {
      method: "GET",
      path: "/me-verbose",
      responses: {
        200: VerboseUserSchema,
        400: ErrorResponseSchema,
      },
      summary: "Get auth user's self with more details",
    },
    getById: {
      method: "GET",
      path: "/get/:userId",
      responses: {
        200: PublicUserLookupSchema,
        400: ErrorResponseSchema,
      },
      summary: "Get user by id",
    },
    getByEmail: {
      method: "GET",
      path: "/email/:email",
      responses: {
        200: GetByEmailResponseSchema,
        201: SimpleMessageResponseSchema,
        400: ErrorResponseSchema,
      },
      summary: "Get user by email",
    },
    getAll: {
      method: "GET",
      path: "/getAll",
      responses: {
        200: z.array(UserWithReachSchema),
        400: ErrorResponseSchema,
        401: z.string(),
      },
      summary: "Get all users",
    },
    getAllRegularUsers: {
      method: "GET",
      path: "/getAllRegularUsers",
      responses: {
        200: z.array(
          UserSchema.extend({
            userSegment: z.array(UserSegmentWithSegmentSchema),
          }),
        ),
        400: ErrorResponseSchema,
        401: z.string(),
      },
      summary: "Get all users that are not administrators",
    },
    register: {
      method: "POST",
      path: "/signup",
      body: CreateUserSchema,
      responses: {
        201: AuthFlowResponseSchema,
        401: z.unknown(),
        500: z.object({
          error: z.string(),
        }),
      },
      summary: "Register user",
    },
    login: {
      method: "POST",
      path: "/login",
      body: LoginUserSchema,
      responses: {
        200: AuthFlowResponseSchema,
        400: z.object({
          error: z.unknown().optional(),
          message: z.string(),
        }),
      },
      summary: "Log-in user",
    },
    tryUnbanSelf: {
      method: "PATCH",
      path: "/unbanMe",
      body: z.undefined(),
      responses: {
        200: z.union([z.string(), SimpleMessageResponseSchema]),
        400: SimpleMessageResponseSchema,
        500: ErrorResponseSchema,
      },
      summary:
        "Evaluate user's ban condition, unban if expired/other conditions met.",
    },
    deleteById: {
      method: "DELETE",
      path: "/:userId",
      responses: {
        200: SimpleMessageResponseSchema,
        400: ErrorResponseSchema,
      },
      summary: "Delete user by id",
    },
    enhancedMember: c.router(
      {
        getStatus: {
          method: "GET",
          path: "/status/:userId",
          responses: {
            200: z.object({
              userId: z.string(),
              isEnhancedMember: z.boolean(),
            }),
            400: ErrorResponseSchema,
            500: ErrorResponseSchema,
          },
          summary: "Get enhanced member status for a user (JWT required)",
        },
        promote: {
          method: "POST",
          path: "/promote",
          body: z.object({ userId: z.string() }),
          responses: {
            200: z.object({
              message: z.string(),
              userId: z.string(),
              isEnhancedMember: z.boolean(),
            }),
            400: ErrorResponseSchema,
            403: SimpleMessageResponseSchema,
            404: SimpleMessageResponseSchema,
            500: ErrorResponseSchema,
          },
          summary:
            "Promote a user to enhanced member (self or admin, JWT required)",
        },
      },
      { pathPrefix: "/enhanced-member" },
    ),
  },
  {
    pathPrefix: "/user",
  },
);
