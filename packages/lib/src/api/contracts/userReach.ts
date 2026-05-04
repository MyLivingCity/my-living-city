import { initContract } from "@ts-rest/core";
import z from "zod";
import { ErrorResponseSchema } from "../common";

const c = initContract();

export const UserReachSchema = z.object({
  id: z.string(),
  userId: z.string(),
  segId: z.number(),
});

const CreateManyResponseSchema = z.object({
  count: z.number(),
});

export const userReachApiContracts = c.router(
  {
    health: {
      method: "GET",
      path: "/",
      responses: {
        200: z.object({ route: z.string() }),
        400: ErrorResponseSchema,
      },
      summary: "Reach router health check",
    },
    create: {
      method: "POST",
      path: "/create",
      body: z.object({
        userId: z.string(),
        segId: z.number(),
      }),
      responses: {
        200: UserReachSchema,
        400: ErrorResponseSchema,
      },
      summary: "Create or upsert a user reach segment",
    },
    replaceReachSegments: {
      method: "POST",
      path: "/replaceReachSegments",
      body: z.object({
        userId: z.string(),
        segIds: z.array(z.number()),
      }),
      responses: {
        200: CreateManyResponseSchema,
        400: ErrorResponseSchema,
      },
      summary: "Replace all reach segments for a user",
    },
    getUserSegments: {
      method: "POST",
      path: "/getUserSegments",
      body: z.object({
        userId: z.string(),
      }),
      responses: {
        200: z.array(z.unknown()),
        400: ErrorResponseSchema,
      },
      summary: "Get all reach segments for a user",
    },
  },
  {
    pathPrefix: "/userReach",
  },
);
