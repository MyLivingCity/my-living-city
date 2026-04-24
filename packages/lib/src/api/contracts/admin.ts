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

export const adminApiContracts = c.router(
  {
    dashboard: c.router(
      {
        getAllNotifications: {
          method: "GET",
          path: "/",
          responses: {
            200: z.array(QNotificationSchema),
          },
          summary: "Get all unseen notifications",
        },
        dismissNotification: {
          method: "PUT",
          path: "/:notificationId/dismiss",
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
    admin: c.router(
      {
        getThreshold: {
          method: "GET",
          path: "/:id", // Use :id to handle 1, 2, or 3 in one route
          pathParams: z.object({ id: z.coerce.number() }),
          responses: {
            200: ThresholdSchema,
          },
          summary: "Get existing ban threshold",
        },
        updateThreshold: {
          method: "PUT",
          path: "/:id/:num",
          pathParams: z.object({
            id: z.coerce.number(),
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
          path: "/:num",
          pathParams: z.object({ num: z.coerce.number() }),
          body: z.object({}),
          responses: {
            201: z.object({ message: z.string(), newThresh: ThresholdSchema }),
          },
          summary: "Create a new ban threshold",
        },
      },
      { pathPrefix: "/threshold" },
    ),
  },
  { pathPrefix: "/admin" },
);
