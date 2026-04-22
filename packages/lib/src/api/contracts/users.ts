import { initContract } from "@ts-rest/core";
import z from "zod";

const c = initContract();

export const UserSchema = z.object({
  adminmodEmail: z.string().nullable(),
  banned: z.boolean(),
  city: z.string(),
  createdAt: z.date(),
  displayFName: z.string().nullable(),
  displayLName: z.string().nullable(),
  email: z.string(),
  fname: z.string().nullable(),
  hasFlagged: z.number(),
  id: z.string(),
  imagePath: z.string().nullable(),
  latitude: z.number(),
  lname: z.string().nullable(),
  longitude: z.number(),
  organizationName: z.string().nullable(),
  passCode: z.string().nullable(),
  postalCode: z.string(),
  proposalLimit: z.unknown().nullable(), // TODO
  reviewed: z.boolean(),
  status: z.boolean(),
  streetAddress: z.string(),
  totalFlagged: z.number(),
  updatedAt: z.date(),
  userReach: z.array(z.unknown()), // TODO
  userSegment: z.array(z.unknown()), // TODO
  userType: z.string(),
  verifiedToken: z.string().nullable(),
  verified: z.boolean(),
  // TODO
  // Role: string
});

const CreateUserSchema = z.object({
  // Pre-refactor: unfinished
  userType: z.string(),
  verified: z.boolean(),
});

const LoginUserSchema = z.union([
  UserSchema.pick({
    email: true,
  }),
  z.object({
    password: z.string(),
  }),
]);

const AuthenticatedUserSchema = UserSchema;

const AuthFlowResponseSchema = z.object({
  user: AuthenticatedUserSchema,
  token: z.string(),
});

export const userApiContracts = c.router(
  {
    getSelf: {
      method: "GET",
      path: "/me",
      responses: {
        200: UserSchema,
        404: z.object({
          message: z.string(),
        }),
      },
      summary: "Get auth user's self",
    },
    getSelfVerbose: {
      method: "GET",
      path: "/me-verbose",
      responses: {
        200: UserSchema,
      },
      summary: "Get auth user's self with more details",
    },
    getById: {
      method: "GET",
      path: "/get/:id",
      responses: {
        200: UserSchema.pick({
          email: true,
          fname: true,
          lname: true,
        }),
      },
      summary: "Get user by id",
    },
    getByEmail: {
      method: "GET",
      path: "/email/:email",
      responses: {
        200: z.object({
          foundUser: UserSchema.pick({
            adminmodEmail: true,
            banned: true,
            createdAt: true,
            displayFName: true,
            displayLName: true,
            email: true,
            fname: true,
            hasFlagged: true,
            id: true,
            imagePath: true,
            lname: true,
            organizationName: true,
            passCode: true,
            proposalLimit: true,
            reviewed: true,
            status: true,
            totalFlagged: true,
            updatedAt: true,
            userType: true,
            verified: true,
            verifiedToken: true,
          }),
        }),
      },
      summary: "Get user by email",
    },
    getAll: {
      method: "GET",
      path: "/getAll",
      responses: {
        200: z.array(UserSchema),
      },
      summary: "Get all users",
    },
    getAllRegularUsers: {
      method: "GET",
      path: "/getAllRegularUsers",
      responses: {
        200: z.array(UserSchema),
      },
      summary: "Get all users that are not administrators",
    },
    register: {
      method: "POST",
      path: "/signup",
      body: CreateUserSchema,
      responses: {
        200: AuthFlowResponseSchema,
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
        200: z.object({
          message: z.string(),
        }),
        400: z.object({
          message: z.string(),
        }),
        500: z.object({
          message: z.string(),
          details: z.object({
            errorMessage: z.string(),
            errorStack: z.string(),
          }),
        }),
      },
      summary:
        "Evaluate user's ban condition, unban if expired/other conditions met.",
    },
    deleteById: {
      method: "DELETE",
      path: "/:id",
      responses: {
        200: z.object({
          message: z.string(),
        }),
      },
      summary: "Delete user by id",
    },
  },
  {
    pathPrefix: "/user",
  },
);
