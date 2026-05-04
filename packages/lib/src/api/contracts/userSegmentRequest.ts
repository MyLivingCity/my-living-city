import { initContract } from "@ts-rest/core";
import z from "zod";
import { DateTimeString, ErrorResponseSchema } from "../common";

const c = initContract();

export const SegmentRequestSchema = z.object({
  id: z.number(),
  createAt: DateTimeString,
  userId: z.string(),
  country: z.string(),
  province: z.string(),
  segmentName: z.string(),
  subSegmentName: z.string().nullable(),
});

const ForbiddenResponseSchema = z.object({ message: z.string() });
const NotFoundResponseSchema = z.object({ message: z.string() });

export const userSegmentRequestApiContracts = c.router(
  {
    create: {
      method: "POST",
      path: "/create",
      body: z.object({
        country: z.string(),
        province: z.string(),
        segmentName: z.string(),
        subSegmentName: z.string().optional(),
      }),
      responses: {
        200: SegmentRequestSchema,
        400: ErrorResponseSchema,
      },
      summary: "Create a new segment request",
    },
    getAll: {
      method: "GET",
      path: "/getAll",
      responses: {
        200: z.array(SegmentRequestSchema),
        400: ErrorResponseSchema,
        403: ForbiddenResponseSchema,
      },
      summary: "Get all segment requests (admin only)",
    },
    getMine: {
      method: "GET",
      path: "/getMine",
      responses: {
        200: z.array(SegmentRequestSchema),
        400: ErrorResponseSchema,
        404: NotFoundResponseSchema,
      },
      summary: "Get current user's segment requests",
    },
    deleteById: {
      method: "DELETE",
      path: "/deleteById/:deleteId",
      body: z.undefined(),
      responses: {
        204: z.undefined(),
        400: ErrorResponseSchema,
        403: ForbiddenResponseSchema,
        404: NotFoundResponseSchema,
      },
      summary: "Delete a segment request by ID (admin or owner)",
    },
    deleteByUser: {
      method: "DELETE",
      path: "/deleteByUser/:userId",
      body: z.undefined(),
      responses: {
        204: z.undefined(),
        400: ErrorResponseSchema,
        403: ForbiddenResponseSchema,
        404: NotFoundResponseSchema,
      },
      summary: "Delete all segment requests for a user (admin only)",
    },
  },
  {
    pathPrefix: "/userSegmentRequest",
  },
);
