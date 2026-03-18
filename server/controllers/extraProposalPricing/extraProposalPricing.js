const express = require("express");
const extraProposalPricingRouter = express.Router();
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

// Scope C2-007 route
// GET /extra-proposal-pricing
extraProposalPricingRouter.get("/", async (req, res) => {
  try {
    const items = await prisma.accountType.findMany({
      select: {
        id: true,
        accountType: true,
        extraProposalCost: true,
        updatedBy: true,
        lastUpdated: true,
      },
      orderBy: { accountType: "asc" },
    });

    return res.json({ items });
  } catch (err) {
    console.error("GET extra proposal pricing error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Scope C2-007 route
// PUT /extra-proposal-pricing
extraProposalPricingRouter.put(
  "/",
  passport.authenticate("jwt", { session: false }),
  requireAdmin,
  async (req, res) => {
    try {
      const { items } = req.body || {};

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          message: "items must be a non-empty array",
        });
      }

      for (const it of items) {
        if (!it?.accountType || typeof it.accountType !== "string") {
          return res.status(400).json({
            message: "Each item must have accountType (string)",
          });
        }

        if (
          !Number.isInteger(it.extraProposalCost) ||
          it.extraProposalCost < 0
        ) {
          return res.status(400).json({
            message:
              "Each item must have extraProposalCost (non-negative integer)",
          });
        }
      }

      const userId = req.user.id;
      const today = new Date();

      await prisma.$transaction(async (tx) => {
        for (const it of items) {
          const existing = await tx.accountType.findFirst({
            where: { accountType: it.accountType },
          });

          if (!existing) {
            await tx.accountType.create({
              data: {
                accountType: it.accountType,
                extraProposalCost: it.extraProposalCost,
                updatedBy: userId,
                lastUpdated: today,
              },
            });
          } else {
            await tx.accountType.update({
              where: { id: existing.id },
              data: {
                extraProposalCost: it.extraProposalCost,
                updatedBy: userId,
                lastUpdated: today,
              },
            });
          }
        }
      });

      const updated = await prisma.accountType.findMany({
        select: {
          id: true,
          accountType: true,
          extraProposalCost: true,
          updatedBy: true,
          lastUpdated: true,
        },
        orderBy: { accountType: "asc" },
      });

      return res.json({ items: updated });
    } catch (err) {
      console.error("PUT extra proposal pricing error:", err);
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }
);

module.exports = extraProposalPricingRouter;