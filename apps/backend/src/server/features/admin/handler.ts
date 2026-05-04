import nodemailer from "nodemailer";
import { initServer } from "@ts-rest/express";
import { createHandlers } from "src/server";

import { toErrorDetails } from "src/server/utils";
import { adminApiContracts } from "@mlc/lib/api/contracts/admin";
import { prisma } from "src/prisma/client";
import { UserSchema } from "@mlc/lib/api/contracts/users";
import { z } from "zod";

import {
  authorizeUser,
  fetchUnseenNotifications,
  dismissQuarantineNotification,
  fetchAllReports,
  createNewReport,
  deleteReportById,
  fetchBanThreshold,
  updateBanThreshold,
  seedInitialThresholds,
  fetchFalseFlagThreshold,
  updateFalseFlagThresholdValue,
  fetchBadPostingThreshold,
  updateBadPostingThresholdValue,
} from "./service";
import { authenticateJwt } from "src/server/middleware/auth";

type User = z.infer<typeof UserSchema>;
const s = initServer();

// ============================================================================
// dashboard
// ============================================================================
const getAllNotifications = s.route(
  adminApiContracts.dashboard.getAllNotifications,
  {
    middleware: [authenticateJwt],
    handler: async () => {
      try {
        const notifications = await fetchUnseenNotifications();

        if (notifications.length === 0) {
          return {
            status: 200,
            body: { message: "No new notifications" },
          };
        }
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
    middleware: [authenticateJwt],
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
const getAll = s.route(adminApiContracts.report.getAll, {
  middleware: [authenticateJwt],
  handler: async ({ req }) => {
    try {
      const u = req.user as User;
      const isAuthorized = await authorizeUser(u.id);
      if (!isAuthorized) {
        return {
          status: 403,
          body: {
            message: "You must be an Administrator to view reports.",
            details: toErrorDetails("Unauthorized access attempt"),
          },
        };
      }
      const allReports = await fetchAllReports();

      return {
        status: 200,
        body: allReports,
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "An error occured while trying to fetch all reports",
          details: toErrorDetails(error),
        },
      };
    }
  },
});
const createReport = s.route(adminApiContracts.report.create, {
  middleware: [authenticateJwt],
  handler: async ({ body: { email, description } }) => {
    try {
      // Manual validation check from legacy controller
      if (!email || !description) {
        return {
          status: 400,
          body: {
            message: "You must supply an email and description of your report.",
            details: toErrorDetails("Missing required fields"),
          },
        };
      }

      await createNewReport({ email, description });

      return {
        status: 201,
        body: {
          message: `Report succesfully created under ${email}. Thank you!`,
        },
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "An error occured while trying to create a report.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});
const deleteReport = s.route(adminApiContracts.report.delete, {
  middleware: [authenticateJwt],
  handler: async ({ params: { reportId }, req }) => {
    try {
      const u = req.user as User;
      const isAuthorized = await authorizeUser(u.id);
      if (!isAuthorized) {
        return {
          status: 403,
          body: {
            message: "You must be an Administrator to delete reports.",
            details: toErrorDetails("Unauthorized delete attempt"),
          },
        };
      }

      if (!reportId) {
        return {
          status: 400,
          body: {
            message:
              "A valid reportId must be specified in the route parameter.",
            details: toErrorDetails(`Invalid ID: ${reportId}`),
          },
        };
      }

      await deleteReportById(reportId);

      return {
        status: 200,
        body: {
          message: "Report successfully deleted",
        },
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "An error occured while trying to delete a report.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});
// ============================================================================
// threshhold
// ============================================================================
//  threshhold(sic): int id, int number
//  id:
//  1: threshold - ban threshold
//  2: falseFlag - user has flagged a post unfairly
//  3: badPosting - user's post is unacceptable
//  number: the ban threshold
// ----------------------------------------------------------------------------
const getBanThreshold = s.route(adminApiContracts.threshhold.getBanThreshold, {
  middleware: [authenticateJwt],
  handler: async () => {
    try {
      const threshold = await fetchBanThreshold();

      if (!threshold) {
        return {
          status: 400,
          body: {
            message: "Ban threshold configuration not found.",
            details: toErrorDetails("No threshold record exists at ID 1"),
          },
        };
      }

      return {
        status: 200,
        body: threshold.number,
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "An error occured while trying to fetch threshhold.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});
const updateBanThresholdRoute = s.route(
  adminApiContracts.threshhold.updateBanThreshold,
  {
    middleware: [authenticateJwt],
    handler: async ({ params: { num } }) => {
      try {
        if (!num) {
          return {
            status: 400,
            body: {
              message:
                "A valid number must be specified in the route parameter.",
              details: toErrorDetails(`Value received: ${num}`),
            },
          };
        }

        const existing = fetchBanThreshold;
        if (!existing) {
          return {
            status: 400,
            body: {
              message:
                "A threshhold doesn't currently exist, please create one first",
              details: toErrorDetails("No record found with ID 1"),
            },
          };
        }

        const updated = await updateBanThreshold(num);

        return {
          status: 200,
          body: {
            message: "Threshhold successfuly updated",
            // Mapping updated.number to match the contract's expected number type
            updatedThresh: updated,
          },
        };
      } catch (error) {
        return {
          status: 400,
          body: {
            message: "An error occured while trying to update the threshhold",
            details: toErrorDetails(error),
          },
        };
      }
    },
  },
);
// TODO: replace magic numbers sprinkled throughout with an enum or associative array
//**  Threshhold table should be modified to not autoincrement **
const createThreshold = s.route(adminApiContracts.threshhold.createThreshold, {
  middleware: [authenticateJwt],
  handler: async ({ params: { num } }) => {
    try {
      if (!num) {
        return {
          status: 400,
          body: {
            message: "A valid number must be specified in the route parameter.",
            details: toErrorDetails(`Value received: ${num}`),
          },
        };
      }

      const count = await fetchBanThreshold();
      if (count) {
        return {
          status: 400,
          body: {
            message:
              "Thresholds already exist, please modify the current thresholds.",
            details: toErrorDetails("Table is not empty."),
          },
        };
      }

      // Seed all three
      await seedInitialThresholds(num);

      const newThreshold = await fetchBanThreshold();

      return {
        status: 201,
        body: {
          message: "All three thresholds successfully seeded.",
          newThresh: newThreshold!, // Non-null assertion as we just created it
        },
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "An error occured while trying to create thresholds.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});
const getFalseFlagThreshold = s.route(
  adminApiContracts.threshhold.getFalseFlagThreshold,
  {
    middleware: [authenticateJwt],
    handler: async () => {
      try {
        const threshold = await fetchFalseFlagThreshold();

        if (!threshold) {
          return {
            status: 400,
            body: {
              message: "False-flag threshold configuration not found.",
              details: toErrorDetails("No threshold record exists at ID 2"),
            },
          };
        }

        return {
          status: 200,
          body: threshold,
        };
      } catch (error) {
        return {
          status: 400,
          body: {
            message: "An error occured while trying to fetch threshhold.",
            details: toErrorDetails(error),
          },
        };
      }
    },
  },
);
const updateFalseFlagThreshold = s.route(
  adminApiContracts.threshhold.updateFalseFlagThreshold,
  {
    middleware: [authenticateJwt],
    handler: async ({ params: { num } }) => {
      try {
        if (!num && num !== 0) {
          return {
            status: 400,
            body: {
              message:
                "A valid number must be specified in the route parameter.",
              details: toErrorDetails(`Value received: ${num}`),
            },
          };
        }

        const existing = await fetchFalseFlagThreshold();

        if (!existing) {
          return {
            status: 400,
            body: {
              message:
                "A threshhold doesn't currently exist, please create one first",
              details: toErrorDetails("No record found with ID 2"),
            },
          };
        }

        const updatedThresh = await updateFalseFlagThresholdValue(num);

        return {
          status: 200,
          body: {
            message: "Threshhold successfuly updated",
            updatedThresh,
          },
        };
      } catch (error) {
        return {
          status: 400,
          body: {
            message: "An error occured while trying to update the threshhold",
            details: toErrorDetails(error),
          },
        };
      }
    },
  },
);
const getBadPostingThreshold = s.route(
  adminApiContracts.threshhold.getBadPostingThreshold,
  {
    middleware: [authenticateJwt],
    handler: async () => {
      try {
        const threshold = await fetchBadPostingThreshold();

        if (!threshold) {
          return {
            status: 400,
            body: {
              message: "Bad posting threshold configuration not found.",
              details: toErrorDetails("No threshold record exists at ID 3"),
            },
          };
        }

        return {
          status: 200,
          body: threshold,
        };
      } catch (error) {
        return {
          status: 400,
          body: {
            message: "An error occured while trying to fetch threshhold.",
            details: toErrorDetails(error),
          },
        };
      }
    },
  },
);
const updateBadPostingThreshold = s.route(
  adminApiContracts.threshhold.updateBadPostingThreshold,
  {
    middleware: [authenticateJwt],
    handler: async ({ params: { num } }) => {
      try {
        // Validation check similar to legacy (allowing 0 if applicable)
        if (!num && num !== 0) {
          return {
            status: 400,
            body: {
              message:
                "A valid number must be specified in the route parameter.",
              details: toErrorDetails(`Value received: ${num}`),
            },
          };
        }

        const existing = await fetchBadPostingThreshold();

        if (!existing) {
          return {
            status: 400,
            body: {
              message:
                "A threshhold doesn't currently exist, please create one first",
              details: toErrorDetails("No record found with ID 3"),
            },
          };
        }

        const updatedThresh = await updateBadPostingThresholdValue(num);

        return {
          status: 200,
          body: {
            message: "Threshhold successfuly updated",
            updatedThresh,
          },
        };
      } catch (error) {
        return {
          status: 400,
          body: {
            message: "An error occured while trying to update the threshhold",
            details: toErrorDetails(error),
          },
        };
      }
    },
  },
);
// ============================================================================
// sendEmailReset
// ============================================================================
const sendResetEmail = s.route(adminApiContracts.sendEmailReset.send, {
  handler: async ({ body }) => {
    try {
      const { email } = body;

      const foundUser = await prisma.user.findUnique({ where: { email } });

      if (!foundUser) {
        // Return success regardless to avoid user enumeration
        return {
          status: 200,
          body: {
            message:
              "If an account with that email exists, a reset email has been sent.",
          },
        };
      }

      const transporter = nodemailer.createTransport({
        host: "smtp-mail.outlook.com",
        port: 587,
        auth: {
          user: process.env["EMAIL"],
          pass: process.env["EMAIL_PASSWORD"],
        },
      });

      const mailOptions = {
        from: process.env["EMAIL"],
        to: email,
        subject: "MyLivingCity Password Reset",
        text: `${process.env["CORS_ORIGIN"]}/user/reset-password?passCode=${foundUser.passCode}`,
      };

      await transporter.sendMail(mailOptions);

      return {
        status: 200,
        body: { message: "Sent password reset email" },
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "An error occurred while sending the password reset email.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});
// ----------------------------------------------------------------------------
export default createHandlers({
  schema: adminApiContracts,
  router: {
    dashboard: {
      getAllNotifications,
      dismissNotification,
    },
    report: {
      getAll,
      create: createReport,
      delete: deleteReport,
    },
    sendEmailReset: {
      send: sendResetEmail,
    },
    threshhold: {
      getBanThreshold,
      updateBanThreshold: updateBanThresholdRoute,
      createThreshold,
      getFalseFlagThreshold,
      updateFalseFlagThreshold,
      getBadPostingThreshold,
      updateBadPostingThreshold,
    },
  },
});
