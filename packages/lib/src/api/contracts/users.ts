import { initContract } from "@ts-rest/core";
import z from "zod";

const c = initContract();

export const UserSchema = z.object({
  adminmodEmail: z.string().nullable(),
  banned: z.boolean(),
  city: z.string(),
  createdAt: z.date(),
  displayFName: z.string(),
  displayLName: z.string(),
  email: z.string(),
  fname: z.string(),
  hasFlagged: z.number(),
  id: z.string(),
  imagePath: z.string().nullable(),
  latitude: z.number(),
  lname: z.string(),
  longitude: z.number(),
  organizationName: z.string(),
  passCode: z.string(),
  password: z.string(),
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
  verifiedToken: z.string(),
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
  UserSchema.pick({ email: true }),
  z.object({ password: z.string() }),
]);

const AuthFlowResponseSchema = z.object({
  user: UserSchema,
  token: z.string(),
});

export const userContracts = c.router(
  {
    getSelf: {
      method: "GET",
      path: "/me",
      responses: {
        200: UserSchema.omit({ password: true }),
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
            password: true,
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
      summary: "Get user by email",
    },
    login: {
      method: "POST",
      path: "/login",
      body: LoginUserSchema,
      responses: {
        200: AuthFlowResponseSchema,
      },
      summary: "Get user by email",
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
