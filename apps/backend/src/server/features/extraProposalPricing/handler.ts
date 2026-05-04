import passport from "passport";
import { extraProposalPricingApiContracts } from "@mlc/lib/api";
import { prisma } from "src/prisma/client";
import { initServer } from "@ts-rest/express";
import { createHandlers } from "src/server";
import { serializeForContract, toErrorDetails } from "src/server/utils";

const s = initServer();

const ACCOUNT_TYPE_SELECT = {
  id: true,
  accountType: true,
  extraProposalCost: true,
  updatedBy: true,
  lastUpdated: true,
} as const;

const getAll = s.route(extraProposalPricingApiContracts.getAll, {
  handler: async () => {
    try {
      const items = await prisma.accountType.findMany({
        select: ACCOUNT_TYPE_SELECT,
        orderBy: { accountType: "asc" },
      });
      return {
        status: 200,
        body: serializeForContract({ items }),
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "An error occurred while fetching extra proposal pricing.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const upsertAll = s.route(extraProposalPricingApiContracts.upsertAll, {
  middleware: [passport.authenticate("jwt", { session: false })],
  handler: async ({ body, req }) => {
    try {
      const { id: userId, userType } = req.user as {
        id: string;
        userType: string;
      };

      if (userType !== "SUPER_ADMIN" && userType !== "ADMIN") {
        return {
          status: 403,
          body: { message: "Forbidden" },
        };
      }

      const today = new Date();

      await prisma.$transaction(async (tx) => {
        for (const item of body.items) {
          const existing = await tx.accountType.findFirst({
            where: { accountType: item.accountType },
          });

          if (!existing) {
            await tx.accountType.create({
              data: {
                accountType: item.accountType,
                extraProposalCost: item.extraProposalCost,
                updatedBy: userId,
                lastUpdated: today,
              },
            });
          } else {
            await tx.accountType.update({
              where: { id: existing.id },
              data: {
                extraProposalCost: item.extraProposalCost,
                updatedBy: userId,
                lastUpdated: today,
              },
            });
          }
        }
      });

      const updated = await prisma.accountType.findMany({
        select: ACCOUNT_TYPE_SELECT,
        orderBy: { accountType: "asc" },
      });

      return {
        status: 200,
        body: serializeForContract({ items: updated }),
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "An error occurred while updating extra proposal pricing.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

export default createHandlers({
  schema: extraProposalPricingApiContracts,
  router: {
    getAll,
    upsertAll,
  },
});
