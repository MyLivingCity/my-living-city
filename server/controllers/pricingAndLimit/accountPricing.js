const express = require("express");
const accountPricingRouter = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const passport = require("passport");


function requireAdmin(req, res, next) {
  const userType = req.user?.userType;
  if (userType !== "SUPER_ADMIN" && userType !== "ADMIN") {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
}

// Scope C2-004 route
// GET /pricing-and-limit/pricing
accountPricingRouter.get("/pricing", async (req, res) => {
  try {
    const items = await prisma.accountPricing.findMany({
      select: {
        accountType: true,
        yearlyPriceCents: true,
        updatedAt: true,
        updatedByUserId: true,
      },
      orderBy: { accountType: "asc" },
    });

    return res.json({ items });
  } catch (err) {
    console.error("GET pricing error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});


// Scope C2-004 route
// PUT /pricing-and-limit/pricing
accountPricingRouter.put(
  "/pricing",
  passport.authenticate("jwt", { session: false }),
  requireAdmin,
  async (req, res) => {
    try {
      const { items } = req.body || {};

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "items must be a non-empty array" });
      }

      // Basic validation
      for (const it of items) {
        if (!it?.accountType || typeof it.accountType !== "string") {
          return res.status(400).json({ message: "Each item must have accountType (string)" });
        }
        if (!Number.isInteger(it.yearlyPriceCents) || it.yearlyPriceCents < 0) {
          return res
            .status(400)
            .json({ message: "Each item must have yearlyPriceCents (non-negative integer)" });
        }
      }

      const userId = req.user.id;

      // Use upsert to insert or update in a transaction
      await prisma.$transaction(
        items.map((it) =>
          prisma.accountPricing.upsert({
            where: { accountType: it.accountType },
            update: {
              yearlyPriceCents: it.yearlyPriceCents,
              updatedByUserId: userId,
            },
            create: {
              accountType: it.accountType,
              yearlyPriceCents: it.yearlyPriceCents,
              updatedByUserId: userId,
            },
          })
        )
      );

      // return the updated list after update
      const updated = await prisma.accountPricing.findMany({
        select: {
          accountType: true,
          yearlyPriceCents: true,
          updatedAt: true,
          updatedByUserId: true,
        },
        orderBy: { accountType: "asc" },
      });

      return res.json({ items: updated });
    } catch (err) {
      console.error("PUT pricing error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

// GET /pricing-and-limit/proposal-limits
accountPricingRouter.get("/proposal-limits", async (_req, res) => {
  try {
    const items = await prisma.accountType.findMany({
      select: { accountType: true, yearlyProposalLimit: true },
      orderBy: { accountType: "asc" },
    });
    return res.json({ items });
  } catch (err) {
    console.error("GET proposal-limits error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// PUT /pricing-and-limit/proposal-limits
// Body: { items: [{ accountType: string, yearlyProposalLimit: number }] }
// Admin-only. Updates existing row or creates a new one per accountType.
accountPricingRouter.put(
  "/proposal-limits",
  passport.authenticate("jwt", { session: false }),
  requireAdmin,
  async (req, res) => {
    try {
      const { items } = req.body || {};

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "items must be a non-empty array" });
      }

      for (const it of items) {
        if (typeof it?.accountType !== "string" || !it.accountType) {
          return res.status(400).json({ message: "Each item must have accountType (string)" });
        }
        if (!Number.isInteger(it.yearlyProposalLimit) || it.yearlyProposalLimit < 0) {
          return res.status(400).json({ message: "Each item must have yearlyProposalLimit (non-negative integer)" });
        }
      }

      const updatedBy = req.user.id.substring(0, 30);
      const today = new Date();

      for (const item of items) {
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
            data: { accountType: item.accountType, yearlyProposalLimit: item.yearlyProposalLimit, lastUpdated: today, updatedBy },
          });
        }
      }

      const updated = await prisma.accountType.findMany({
        select: { accountType: true, yearlyProposalLimit: true },
        orderBy: { accountType: "asc" },
      });
      return res.json({ items: updated });
    } catch (err) {
      console.error("PUT proposal-limits error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

// GET /pricing-and-limit/users
// Returns users (non-admin types) with their proposal count and per-user limit.
accountPricingRouter.get(
  "/users",
  passport.authenticate("jwt", { session: false }),
  requireAdmin,
  async (_req, res) => {
    try {
      const users = await prisma.user.findMany({
        where: {
          userType: { in: ["BUSINESS", "COMMUNITY", "MUNICIPAL", "RESIDENTIAL"] },
        },
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

      return res.json({
        items: users.map((u) => ({
          id: u.id,
          fname: u.fname,
          lname: u.lname,
          email: u.email,
          userType: u.userType,
          proposalLimit: u.proposalLimit,
          proposalCount: u._count.ideas,
        })),
      });
    } catch (err) {
      console.error("GET users error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

// PUT /pricing-and-limit/users/:userId/limit
// Body: { proposalLimit: number | null }  — null resets to type default.
accountPricingRouter.put(
  "/users/:userId/limit",
  passport.authenticate("jwt", { session: false }),
  requireAdmin,
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { proposalLimit } = req.body;

      if (proposalLimit !== null && (!Number.isInteger(proposalLimit) || proposalLimit < 0)) {
        return res.status(400).json({ message: "proposalLimit must be a non-negative integer or null" });
      }

      const updated = await prisma.user.update({
        where: { id: userId },
        data: { proposalLimit: proposalLimit ?? null },
        select: { id: true, proposalLimit: true },
      });

      return res.json(updated);
    } catch (err) {
      console.error("PUT user limit error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

module.exports = accountPricingRouter;