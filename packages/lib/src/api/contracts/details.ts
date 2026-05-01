import { z } from "zod";
import { initContract } from "@ts-rest/core";
import { SimpleMessageResponseSchema, ErrorResponseSchema } from "../common";
import { SegmentSchema /*, UserSegmentSchema */ } from "./segments";
//import { UserSchema } from "../users";

export const HybridErrorSchema = z.union([
  z.object({ error: z.string() }), // Legacy shape: { error: "message" }
  ErrorResponseSchema, // New project shape: { message: "...", details: { ... } }
]);

const BaseDetailsSchema = z.object({
  id: z.number(),
  streetAddress: z.string().nullable(),
  postalCode: z.string().nullable(),
  userId: z.string().cuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  displayFName: z.string().nullable(),
  displayLName: z.string().nullable(),
});

export const SchoolDetailsSchema = BaseDetailsSchema.extend({
  faculty: z.string().nullable(),
  programCompletionDate: z.date().nullable(),
});

export const WorkDetailsSchema = BaseDetailsSchema.extend({
  company: z.string().nullable(),
});

const c = initContract();

export const detailsApiContracts = c.router({
  schoolDetails: c.router(
    {
      create: {
        method: "POST",
        path: "/create",
        body: SchoolDetailsSchema.pick({
          streetAddress: true,
          postalCode: true,
          faculty: true,
          programCompletionDate: true,
          userId: true,
        }),
        responses: {
          200: SchoolDetailsSchema,
          400: HybridErrorSchema,
        },
        summary: "Create a school details entry",
      },
      delete: {
        method: "DELETE",
        path: "/delete/:id", //userId
        pathParams: z.object({
          id: z.string().cuid(), //userId
        }),
        responses: {
          204: z.undefined(), //legacy only sends 204 status(success, no redirect)
          400: HybridErrorSchema,
          500: HybridErrorSchema,
        },
        summary: "Delete school details as well as the school userSegments",
      },
      get: {
        method: "GET",
        path: "/get/:id",
        pathParams: z.object({
          id: z.number(),
        }),
        responses: {
          200: SchoolDetailsSchema,
          400: HybridErrorSchema,
        },
        summary: "Retrieve a school details entry",
      },
      /**
       * Legacy controller uses an upsert
       * @param id  userId
       */
      update: {
        method: "PATCH",
        path: "/update/:id", //userId
        pathParams: z.object({
          id: z.string().cuid(), //userId
        }),
        body: SchoolDetailsSchema.pick({
          streetAddress: true,
          postalCode: true,
          displayFName: true,
          displayLName: true,
        }),
        responses: {
          200: SchoolDetailsSchema,
          400: HybridErrorSchema,
        },
        summary: "Upsert a school details entry",
      },
      updateCityNeighbourhood: {
        method: "PATCH",
        path: "/updateCityNeighbourhood/:id", //userId
        pathParams: z.object({
          id: z.string().cuid(), //userId
        }),
        body: SegmentSchema.partial(),
        responses: {
          200: SimpleMessageResponseSchema,
          400: HybridErrorSchema,
        },
        summary: "Update a school details entry",
      },
    },
    {
      pathPrefix: "/schoolDetails",
    },
  ),
  workDetails: c.router(
    {
      create: {
        method: "POST",
        path: "/create",
        body: WorkDetailsSchema.pick({
          streetAddress: true,
          postalCode: true,
          company: true,
          userId: true,
        }),
        responses: {
          200: WorkDetailsSchema,
          400: HybridErrorSchema,
        },
        summary: "Create a work details entry",
      },
      delete: {
        method: "DELETE",
        path: "/delete/:id",
        pathParams: z.object({
          id: z.number(),
        }),
        responses: {
          204: z.undefined(), //legacy only sends 204 status(success, no redirect)
          400: HybridErrorSchema,
          500: HybridErrorSchema,
        },
        summary: "Delete work details as well as the work userSegments",
      },
      get: {
        method: "GET",
        path: "/get/:id",
        pathParams: z.object({
          id: z.number(),
        }),
        responses: {
          200: WorkDetailsSchema,
          400: HybridErrorSchema,
        },
        summary: "Retrieve a work details entry",
      },
      update: {
        method: "PATCH",
        path: "/update/:id", //userId
        pathParams: z.object({
          id: z.string().cuid(), //userId
        }),
        body: WorkDetailsSchema.partial(),
        responses: {
          200: WorkDetailsSchema,
          400: HybridErrorSchema,
        },
        summary: "Upsert a work details entry",
      },
      updateCityNeighbourhood: {
        method: "PATCH",
        path: "/updateCityNeighbourhood/:id", //userId
        pathParams: z.object({
          id: z.string().cuid(), //userId
        }),
        body: SegmentSchema.partial(),
        responses: {
          200: SimpleMessageResponseSchema,
          400: HybridErrorSchema,
        },
        summary: "Update a work details entry",
      },
    },
    {
      pathPrefix: "/workDetails",
    },
  ),
});
