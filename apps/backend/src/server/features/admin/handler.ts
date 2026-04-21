// =============================================================================
// features/admin/handler.ts
// =============================================================================
// Source controllers to refactor into this file:
//
// controllers/dashboard.js        → apiRouter.use('/dashboard', dashboardRouter)
//   - GET  /stats                   platform-wide aggregate stats
//   - GET  /users                   user counts / growth stats
//   - GET  /ideas                   idea counts / engagement stats
//   - GET  /moderation              moderation activity summary
//
// controllers/threshhold.js       → apiRouter.use('/threshhold', threshholdRouter)
//  threshhold(sic): int id, int number
//  id:
// 1: threshold - ban threshold
// 2: falseFlag - user has flagged a post unfairly
// 3: badPosting - user's post is unacceptable
//   - GET  /                        get current moderation thresholds
//   - PUT  /                        update thresholds (admin only)
//   - POST /reset                   reset thresholds to defaults
// =============================================================================
// This needs prisma connection
// =============================================================================
import { initServer } from "@ts-rest/express";
import { apiContract } from "@mlc/lib/api/contracts/admin";
//import prisma from "";

const s = initServer();

export const adminRouter = s.router(apiContract.admin, {
  getThreshold: async ({ params }) => {
    const threshold = await prisma.threshhold.findUnique({
      where: { id: params.id },
    });

    if (!threshold) {
      return { status: 404, body: { message: "Threshold not found" } };
    }

    return { status: 200, body: threshold };
  },

  updateThreshold: async ({ params }) => {
    const exists = await prisma.threshhold.findUnique({
      where: { id: params.id },
    });

    if (!exists) {
      return {
        status: 400,
        body: { message: "Threshold doesn't exist, create it first" },
      };
    }

    const updated = await prisma.threshhold.update({
      where: { id: params.id },
      data: { number: params.num },
    });

    return {
      status: 200,
      body: {
        message: "Threshold successfully updated",
        updatedThresh: updated,
      },
    };
  },

  createThreshold: async ({ params }) => {
    // Basic logic to prevent duplicates as seen in your JS
    const count = await prisma.threshhold.count();
    if (count > 0) {
      return { status: 400, body: { message: "A threshold already exists" } };
    }

    const newThresh = await prisma.threshhold.create({
      data: { number: params.num },
    });

    return {
      status: 201,
      body: { message: "Threshold successfully created", newThresh },
    };
  },
});
