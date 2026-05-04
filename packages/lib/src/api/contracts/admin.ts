import { initContract } from "@ts-rest/core";
import z from "zod";
import { ErrorResponseSchema, SimpleMessageResponseSchema } from "../common";

export const ThresholdType = {
  BAN: 1,
  FALSE_FLAG: 2,
  BAD_POST: 3,
} as const;

export const ThresholdIdSchema = z.coerce.number().int().positive();

//Quarantine_Notifications table
const QNotificationSchema = z.object({
  id: z.number(),
  userId: z.string().cuid(),
  ideaId: z.number(),
  ideaTitle: z.string(),
  createdAt: z.date().default(new Date(0)),
  seen: z.boolean(),
});

const ThresholdSchema = z.object({
  id: ThresholdIdSchema,
  number: z.number().int().nonnegative(), // the actual threshold field
});

const ReportSchema = z.object({
  id: z.number(),
  email: z.string(),
  description: z.string(),
  createdAt: z.date().default(new Date(0)),
  updatedAt: z.date().default(new Date(0)),
});
// ----------------------------------------------------------------------------
// Routes
// ----------------------------------------------------------------------------
const c = initContract();

export const adminApiContracts = c.router({
  dashboard: c.router(
    {
      getAllNotifications: {
        method: "GET",
        path: "/getAllNotifications",
        responses: {
          200: z.array(QNotificationSchema).or(SimpleMessageResponseSchema),
          400: ErrorResponseSchema,
        },
        summary: "Get all unseen notifications",
      },
      dismissNotification: {
        method: "PUT",
        path: "/dismiss/:notificationId",
        pathParams: z.object({
          notificationId: z.coerce.number(),
        }),
        body: z.object({}),
        responses: {
          200: SimpleMessageResponseSchema,
          400: ErrorResponseSchema,
        },
      },
    },
    { pathPrefix: "/dashboard" },
  ),
  threshhold: c.router(
    {
      getBanThreshold: {
        method: "GET",
        path: "/get",
        responses: {
          200: z.number(),
          400: ErrorResponseSchema,
        },
        summary: "Get existing ban threshold",
      },
      updateBanThreshold: {
        method: "PUT",
        path: "/update/:num",
        pathParams: z.object({
          num: z.coerce.number(),
        }),
        body: z.object({}),
        responses: {
          200: z.object({
            message: z.string(),
            updatedThresh: ThresholdSchema,
          }),
          400: ErrorResponseSchema,
        },
        summary: "Set existing ban threshold",
      },
      createThreshold: {
        method: "POST",
        path: "/create/:num",
        pathParams: z.object({ num: z.coerce.number() }),
        body: z.object({}),
        responses: {
          201: z.object({ message: z.string(), newThresh: ThresholdSchema }),
          400: ErrorResponseSchema,
        },
        summary: "Create a new ban threshold",
      },
      getFalseFlagThreshold: {
        method: "GET",
        path: "/getFalseFlag",
        responses: {
          200: ThresholdSchema,
          400: ErrorResponseSchema,
        },
        summary: "Get existing false-flag threshold",
      },
      updateFalseFlagThreshold: {
        method: "PUT",
        path: "/updateFalseFlag/:num",
        pathParams: z.object({
          num: z.coerce.number(),
        }),
        body: z.object({}),
        responses: {
          200: z.object({
            message: z.string(),
            updatedThresh: ThresholdSchema,
          }),
          400: ErrorResponseSchema,
        },
        summary: "Set existing false-flag ban threshold",
      },
      getBadPostingThreshold: {
        method: "GET",
        path: "/getBadPosting",
        responses: {
          200: ThresholdSchema,
          400: ErrorResponseSchema,
        },
        summary: "Get existing bad posting ban threshold",
      },
      updateBadPostingThreshold: {
        method: "PUT",
        path: "/updateBadPosting/:num",
        pathParams: z.object({
          num: z.coerce.number(),
        }),
        body: z.object({}),
        responses: {
          200: z.object({
            message: z.string(),
            updatedThresh: ThresholdSchema,
          }),
          400: ErrorResponseSchema,
        },
        summary: "Set existing bad posting ban threshold",
      },
    },
    { pathPrefix: "/threshhold" },
  ),
  report: c.router(
    {
      getAll: {
        method: "GET",
        path: "/getAll",
        responses: {
          200: z.array(ReportSchema),
          400: ErrorResponseSchema,
          403: ErrorResponseSchema,
        },
        summary: "Get all reports",
      },
      create: {
        method: "POST",
        path: "/create",
        body: z.object({ email: z.string(), description: z.string() }),
        responses: {
          201: SimpleMessageResponseSchema,
          400: ErrorResponseSchema,
        },
        summary: "Create a report",
      },
      delete: {
        method: "DELETE",
        path: "/delete/:reportId",
        pathParams: z.object({ reportId: z.coerce.number() }),
        responses: {
          200: SimpleMessageResponseSchema,
          403: ErrorResponseSchema,
        },
        summary: "Delete a report by id",
      },
    },
    { pathPrefix: "/report" },
  ),
  sendEmailReset: c.router(
    {
      send: {
        method: "POST",
        path: "/",
        body: z.object({ email: z.string().email() }),
        responses: {
          200: SimpleMessageResponseSchema,
          400: ErrorResponseSchema,
        },
        summary: "Send a password reset email",
      },
    },
    { pathPrefix: "/send-email-reset" },
  ),
  sendEmail: c.router(
    {
      create: {
        method: "POST",
        path: "/",
        body: z.object({ email: z.string(), description: z.string() }),
        responses: {
          200: SimpleMessageResponseSchema,
          400: ErrorResponseSchema,
        },
        summary: "Create a report",
      },
    },
    { pathPrefix: "/sendEmail" },
  ),
  emailVerification: c.router(
    {
      create: {
        method: "POST",
        path: "/checkVerificationCode/:userId/:verificationCode",
        pathParams: z.object({
          userId: z.string(),
          verificationCode: z.string(),
        }),
        body: z.object({}),
        responses: {
          200: SimpleMessageResponseSchema,
          400: ErrorResponseSchema,
        },
        summary: "Create a report",
      },
    },
    { pathPrefix: "/emailVerification" },
  ),
});
