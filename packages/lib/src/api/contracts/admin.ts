import { initContract } from "@ts-rest/core";
import z from "zod";

export const ThresholdType = {
  BAN: 1,
  FALSE_FLAG: 2,
  BAD_POST: 3,
} as const;

export const ThresholdIdSchema = z.coerce.number().int().positive();

//Quarantine_Notifications table
const QNotificationSchema = z.object({
  id: z.number(),
  userId: z.number(),
  ideaId: z.number(),
  createdAt: z.date(),
  seen: z.boolean(),
});

const ThresholdSchema = z.object({
  id: ThresholdIdSchema,
  count: z.number().int().nonnegative(), // the actual threshold field
});

// ----------------------------------------------------------------------------
// Router
// ----------------------------------------------------------------------------
const c = initContract();

export const adminApiContracts = c.router({
  dashboard: c.router(
    {
      getAllNotifications: {
        method: "GET",
        path: "/getAllNotifications",
        responses: {
          200: z.array(QNotificationSchema),
        },
        summary: "Get all unseen notifications",
      },
      dismissNotification: {
        method: "PUT",
        path: "/dismiss/:notificationId",
        pathParams: z.object({
          id: z.coerce.number(),
        }),
        body: z.object({}),
        responses: {
          200: QNotificationSchema,
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
          200: ThresholdSchema,
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
        },
        summary: "Create a new ban threshold",
      },
      getFalseFlagThreshold: {
        method: "GET",
        path: "/getFalseFlag",
        responses: {
          200: ThresholdSchema,
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
        },
        summary: "Set existing false-flag ban threshold",
      },
      getBadPostingThreshold: {
        method: "GET",
        path: "/getBadPosting",
        responses: {
          200: ThresholdSchema,
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
        },
        summary: "Set existing bad posting ban threshold",
      },
    },
    { pathPrefix: "/threshhold" },
  ),
});
