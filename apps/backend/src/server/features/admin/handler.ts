import { initServer } from "@ts-rest/express";
import { adminApiContracts } from "@mlc/lib/api/contracts/admin";
import { prisma } from "src/prisma/client";
import { Handlers } from "src/server";
import { toErrorDetails } from "src/server/utils";
import passport from "passport";

const s = initServer();

// ----------------------------------------------------------------------------
//  SERVICES
// ----------------------------------------------------------------------------
// dashboard
export const fetchUnseenNotifications = async () => {
  return await prisma.quarantine_Notifications.findMany({
    where: {
      seen: false,
    },
  });
};
// ----------------------------------------------------------------------------
const dismissQuarantineNotification = async (id: number) => {
  return await prisma.quarantine_Notifications.update({
    where: { id },
    data: { seen: true },
  });
};
// report

// threshhold

// ============================================================================
// dashboard
// ============================================================================
// controllers/dashboard.js             → apiRouter.use('/dashboard', dashboardRouter)
//  GET     /getAllNotifications        return all unseen notifications from quarantine_Notifications
//  PATCH   /dismiss/:notificationId    set quarantine_Notifications[id].seen to true
// ----------------------------------------------------------------------------
const getAllNotifications = s.route(
  adminApiContracts.dashboard.getAllNotifications,
  {
    middleware: [passport.authenticate("jwt", { session: false })],
    handler: async () => {
      try {
        const notifications = await fetchUnseenNotifications();

        return {
          status: 200,
          body: notifications,
        };
      } catch (error) {
        return {
          status: 400,
          body: {
            message: "Failed to fetch notifications",
            details: toErrorDetails(error),
          },
        };
      }
    },
  },
);
const dismissNotification = s.route(
  adminApiContracts.dashboard.dismissNotification,
  {
    middleware: [passport.authenticate("jwt", { session: false })],
    handler: async ({ params: { notificationId } }) => {
      try {
        await dismissQuarantineNotification(notificationId);

        return {
          status: 200,
          body: { message: "Updated successfully" },
        };
      } catch (error) {
        return {
          status: 400,
          body: {
            message: "Error dismissing notification",
            details: toErrorDetails(error),
          },
        };
      }
    },
  },
);
// ============================================================================
// report
// ============================================================================
// controllers/report.js          → apiRouter.use('/report', reportRouter)
//	GET	  /getall	                  get all reports (admin only)
//	POST	/create	                  create a report
//	DEL	  /delete/:reportId	        delete a report by id (admin only)
// ----------------------------------------------------------------------------
// ============================================================================
// threshhold
// ============================================================================
// controllers/threshhold.js       → apiRouter.use('/threshhold', threshholdRouter)
//  threshhold(sic): int id, int number
//  id:
//              1: threshold - ban threshold
//              2: falseFlag - user has flagged a post unfairly
//              3: badPosting - user's post is unacceptable
//   - GET  /                        get current moderation thresholds
//   - PUT  /                        update thresholds (admin only)
//   - POST /reset                   reset thresholds to defaults
// ----------------------------------------------------------------------------

export default {
  schema: adminApiContracts,
  router: {
    dashboard: {
      getAllNotifications,
      dismiss: dismissNotification,
    },
  },
} as unknown as Handlers;
