// =============================================================================
// This needs decisions on how we want to handle notifications
// =============================================================================

import { initContract } from "@ts-rest/core";
import z from "zod";

const c = initContract();
// ------------------------------------------------------------
//notifications are a little convoluted right now
//
//see backend/src/server/features/admin/notes.md
//
/* 
const QNotificationSchema = z.object({
  id: z.number(),
  userId: z.number(),
  ideaId: z.number(),
  createdAt: z.date(),
  seen: z.boolean(),
}); 
*/
// this area is also quarantined until we figure out this nonsense
// ------------------------------------------------------------

const ThresholdSchema = z.object({
  id: z.number(),
  number: z.number(),
});

export const apiContract = c.router({
  /*  dashboard: {
    getAllNotifications: {
      method: "GET",
      path: "/dashboard/notifications",
      responses: {
        200: z.array(QNotificationSchema),
      },
      summary: "Get all unseen notifications",
    },
    dismissNotification: {
      method: "PUT",
      path: "/dashboard/dismiss/:id",
      pathParams: z.object({
        id: z.coerce.number(), // Automatically turns string "123" into number 123
      }),
      body: z.object({}), // Empty body for a PUT
      responses: {
        200: QNotificationSchema,
      },
    },
  }, */
  admin: {
    getThreshold: {
      method: "GET",
      path: "/admin/threshold/:id", // Use :id to handle 1, 2, or 3 in one route
      pathParams: z.object({ id: z.coerce.number() }),
      responses: {
        200: ThresholdSchema,
      },
      summary: "Get existing ban threshold",
    },
    updateThreshold: {
      method: "PUT",
      path: "/admin/threshold/:id/:num",
      pathParams: z.object({
        id: z.coerce.number(),
        num: z.coerce.number(),
      }),
      body: z.object({}),
      responses: {
        200: z.object({ message: z.string(), updatedThresh: ThresholdSchema }),
      },
      summary: "Set existing ban threshold",
    },
    createThreshold: {
      method: "POST",
      path: "/admin/threshold/:num",
      pathParams: z.object({ num: z.coerce.number() }),
      body: z.object({}),
      responses: {
        201: z.object({ message: z.string(), newThresh: ThresholdSchema }),
      },
      summary: "Create a new ban threshold",
    },
  },
});
