// =============================================================================
// features/moderation/handler.ts
// =============================================================================
// Source controllers to refactor into this file:
//
// controllers/badPostingBehavior.js → apiRouter.use('/badPostingBehavior', ...)
//
//  POST  /                                 record a bad-posting-behavior event
//  GET   /:userId                          get bad behavior history for user
//  POST  /incrementPostFlagCount/:ideaId   +1 flag to Idea
//  POST  /resetBadPostCount/:ideaId        resets both badPost and postFlag(?)
//  GET   /checkUser/:userId                this is a manual ban-eligible check - refactor
//  GET   /getAll(users)                    from badPostingBehaviour
//  GET   /getBadPostingBehavior/:userId
//  GET   /checkThreshhold                  same as GET /checkUser/:userId

// controllers/banComment.js      → apiRouter.use('/banComment', banCommentRouter)
//   - POST /                       ban/hide a comment
//   - GET  /                       list banned comments (admin)
//   - DELETE /:banId               unban a comment
//
// controllers/banPost.js         → apiRouter.use('/banPost', banPostRouter)
//   - POST /                       ban/hide a post (idea)
//   - GET  /                       list banned posts (admin)
//   - DELETE /:banId               unban a post
//
// controllers/banUser.js         → apiRouter.use('/banUser', banUserRouter)
//   - POST /                       ban a user
//   - GET  /                       list active bans (admin)
//   - GET  /:userId                get bans for specific user
//   - DELETE /:banId               lift a ban
//
// controllers/commentFlag.js     → apiRouter.use('/commentFlag', commentFlagRouter)
//   - POST /                       flag a comment
//   - GET  /                       get all comment flags (admin)
//   - GET  /:commentId             flags on a specific comment
//   - PUT  /:flagId                resolve a comment flag
//
// controllers/falseFlaggingBehavior.js → apiRouter.use('/falseFlaggingBehavior', ...)
//   - POST /                       record a false-flagging event
//   - GET  /:userId                get false-flagging history for user
//   NOTE: verify whether any routes are actually implemented before migrating
//
// controllers/report.js          → apiRouter.use('/report', reportRouter)
//   - POST /                       submit a report against a user/post/comment
//   - GET  /                       list reports (admin/mod)
//   - PUT  /:reportId              resolve/dismiss a report
// =============================================================================

import { initServer } from "@ts-rest/express";
import { moderationApiContracts } from "@mlc/lib/api/contracts/moderation";
import { prisma } from "../../../prisma/client";

const s = initServer();

export const moderationRouter = s.router(moderationApiContracts, {
  incrementBadPostCount: async ({ params }) => {
    const foundIdea = await prisma.idea.findUnique({
      where: { id: params.ideaId },
    });

    if (!foundIdea) {
      return { status: 404, body: { message: "Idea not found" } };
    }

    await prisma.bad_Posting_Behavior.upsert({
      where: { userId: foundIdea.authorId },
      update: {
        bad_post_count: { increment: 1 },
      },
      create: {
        userId: foundIdea.authorId,
        bad_post_count: 1,
      },
    });
    return {
      status: 200,
      body: { message: "Bad post count updated" },
    };
  },
});
