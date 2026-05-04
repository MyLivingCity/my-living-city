import passport from "passport";
import { accountPricingApiContracts } from "@mlc/lib/api";
import { prisma } from "src/prisma/client";
import { initServer } from "@ts-rest/express";
import { createHandlers } from "src/server";
import { serializeForContract, toErrorDetails } from "src/server/utils";

const s = initServer();

const PRICING_SELECT = {
  accountType: true,
  yearlyPriceCents: true,
  updatedAt: true,
  updatedByUserId: true,
} as const;

const PROPOSAL_LIMIT_SELECT = {
  accountType: true,
  yearlyProposalLimit: true,
} as const;

function isAdmin(userType: string) {
  return userType === "SUPER_ADMIN" || userType === "ADMIN";
}

const getPricing = s.route(accountPricingApiContracts.getPricing, {
  handler: async () => {
    try {
      const items = await prisma.accountPricing.findMany({
        select: PRICING_SELECT,
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
          message: "An error occurred while fetching account pricing.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const upsertPricing = s.route(accountPricingApiContracts.upsertPricing, {
  middleware: [passport.authenticate("jwt", { session: false })],
  handler: async ({ body, req }) => {
    try {
      const { id: userId, userType } = req.user as { id: string; userType: string };

      if (!isAdmin(userType)) {
        return { status: 403, body: { message: "Forbidden" } };
      }

      await prisma.$transaction(
        body.items.map((item) =>
          prisma.accountPricing.upsert({
            where: { accountType: item.accountType as never },
            update: { yearlyPriceCents: item.yearlyPriceCents, updatedByUserId: userId },
            create: {
              accountType: item.accountType as never,
              yearlyPriceCents: item.yearlyPriceCents,
              updatedByUserId: userId,
            },
          }),
        ),
      );

      const updated = await prisma.accountPricing.findMany({
        select: PRICING_SELECT,
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
          message: "An error occurred while updating account pricing.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const getProposalLimits = s.route(accountPricingApiContracts.getProposalLimits, {
  handler: async () => {
    try {
      const items = await prisma.accountType.findMany({
        select: PROPOSAL_LIMIT_SELECT,
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
          message: "An error occurred while fetching proposal limits.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const upsertProposalLimits = s.route(accountPricingApiContracts.upsertProposalLimits, {
  middleware: [passport.authenticate("jwt", { session: false })],
  handler: async ({ body, req }) => {
    try {
      const { id: userId, userType } = req.user as { id: string; userType: string };

      if (!isAdmin(userType)) {
        return { status: 403, body: { message: "Forbidden" } };
      }

      const updatedBy = userId.substring(0, 30);
      const today = new Date();

      for (const item of body.items) {
        const existing = await prisma.accountType.findFirst({
          where: { accountType: item.accountType },
        });
        if (existing) {
          await prisma.accountType.update({
            where: { id: existing.id },
            data: { yearlyProposalLimit: item.yearlyProposalLimit, lastUpdated: today, updatedBy },
          });
        } else {
          await prisma.accountType.create({
            data: {
              accountType: item.accountType,
              yearlyProposalLimit: item.yearlyProposalLimit,
              lastUpdated: today,
              updatedBy,
            },
          });
        }
      }

      const updated = await prisma.accountType.findMany({
        select: PROPOSAL_LIMIT_SELECT,
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
          message: "An error occurred while updating proposal limits.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const getUsers = s.route(accountPricingApiContracts.getUsers, {
  middleware: [passport.authenticate("jwt", { session: false })],
  handler: async ({ req }) => {
    try {
      const { userType } = req.user as { userType: string };

      if (!isAdmin(userType)) {
        return { status: 403, body: { message: "Forbidden" } };
      }

      const users = await prisma.user.findMany({
        where: { userType: { in: ["BUSINESS", "COMMUNITY", "MUNICIPAL"] } },
        select: {
          id: true,
          fname: true,
          lname: true,
          email: true,
          userType: true,
          proposalLimit: true,
          _count: {
            select: {
              ideas: { where: { state: { in: ["PROPOSAL", "PROJECT"] } } },
            },
          },
        },
        orderBy: { email: "asc" },
      });

      const items = users.map((u) => ({
        id: u.id,
        fname: u.fname,
        lname: u.lname,
        email: u.email,
        userType: u.userType,
        proposalLimit: u.proposalLimit,
        proposalCount: u._count.ideas,
      }));

      return {
        status: 200,
        body: serializeForContract({ items }),
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "An error occurred while fetching users.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const updateUserLimit = s.route(accountPricingApiContracts.updateUserLimit, {
  middleware: [passport.authenticate("jwt", { session: false })],
  handler: async ({ params, body, req }) => {
    try {
      const { userType } = req.user as { userType: string };

      if (!isAdmin(userType)) {
        return { status: 403, body: { message: "Forbidden" } };
      }

      const updated = await prisma.user.update({
        where: { id: params.userId },
        data: { proposalLimit: body.proposalLimit ?? null },
        select: { id: true, proposalLimit: true },
      });

      return {
        status: 200,
        body: serializeForContract(updated),
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: `An error occurred while updating proposal limit for user ${params.userId}.`,
          details: toErrorDetails(error),
        },
      };
    }
  },
});

export default createHandlers({
  schema: accountPricingApiContracts,
  router: {
    getPricing,
    upsertPricing,
    getProposalLimits,
    upsertProposalLimits,
    getUsers,
    updateUserLimit,
  },
});
