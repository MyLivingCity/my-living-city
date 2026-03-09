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

module.exports = accountPricingRouter;