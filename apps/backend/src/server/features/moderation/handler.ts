// =============================================================================
// features/moderation/handler.ts
// =============================================================================
// Source controllers to refactor into this file:
//
// controllers/badPostingBehavior.js        → apiRouter.use('/badPostingBehavior', ...)
//
//  POST  /                                 record a bad-posting-behavior event
//  GET   /:userId                          get bad behavior history for user
//  POST  /incrementPostFlagCount/:ideaId   +1 flag to Idea
//  POST  /resetBadPostCount/:ideaId        resets both badPost and postFlag(?)
//  GET   /checkUser/:userId                this is a manual ban-eligible check - refactor
//  GET   /getAll(users)                    from badPostingBehaviour
//  GET   /getBadPostingBehavior/:userId
//  GET   /checkThreshhold                  same as GET /checkUser/:userId
// ----------------------------------------------------------------------------
// controllers/banComment.js                      → apiRouter.use('/banComment', banCommentRouter)
//	POST  /create	                                create a comment ban
//	GET   /getUndismissedNotification/:userId	    get undismissed ban notifications for a user
//	GET	  /getByCommentId/:banCommentId	          get ban record by comment id
//	PUT	  /dismissNotification/:banCommentId	    dismiss a comment-ban notification
//	DEL   /delete/:banCommentId	                  delete a comment ban by comment id

// ----------------------------------------------------------------------------
// controllers/banPost.js         → apiRouter.use('/banPost', banPostRouter)
//	POST	/create	                              create a post ban
//	GET	  /getUndismissedNotification/:userId	  get undismissed post-ban notifications for a user
//	GET	  /getByPostId/:banPostId	              get ban record by post id
//	PUT	  /dismissNotification/:banPostId	      dismiss a post-ban notification
//	DEL	  /delete/:banPostId	                  delete a post ban by post id

// ----------------------------------------------------------------------------
// controllers/banUser.js         → apiRouter.use('/banUser', banUserRouter)
//	POST	/create	                  create a user ban
//	GET	  /getAll	                  get all user bans
//	GET	  /get/:userId	            get all bans for a specific user
//	GET	  /getMostRecent/:userId	  get most recent ban for a specific user
//	GET	  /getMostRecentWithToken	  get most recent ban for authenticated user
//	PUT	  /update/:userId	          update the most recent ban for a specific user
//	GET	  /getAllPassedDate	        get banned users whose ban date has passed
//	DEL   /deletePassedBanDate	    delete bans with passed ban date
//  DEL   /delete/:userId           remove a userId from UserBan (commented code is wrong)

// ----------------------------------------------------------------------------
// controllers/commentFlag.js     → apiRouter.use('/commentFlag', commentFlagRouter)
//	POST	/create/:commentId	          create a flag for a specific comment
//	GET	  /getAll	                      get all comment flags
//	PUT	  /falseFlagMany/:commentId	    mark many flags on a comment as false and update false-flag behavior
//	GET	  /getFlags/:commentId	        get flag count for a specific comment

// ----------------------------------------------------------------------------
// controllers/falseFlaggingBehavior.js → apiRouter.use('/falseFlaggingBehavior', ...)

//   NOTE: verify whether any routes are actually implemented before migrating

//	GET	  /getAll	                      get all users in false-flagging behavior table
//  GET   /getById/:userId              get user false-flagging behavior
//	GET	  /checkFalseFlaggingBehavior	  apply false-flag threshold checks and set flag bans

// ----------------------------------------------------------------------------
// controllers/flag.js                  Idea flagging
//	POST	/create/:ideaId	              create a flag for a specific idea
//	GET	  /getAll	                      get all idea flags
//	PUT	  /falseFlagMany/:ideaId	      mark many flags on an idea as false and update false-flag behavior
//	GET	  /getFlags/:ideaID	            get flag count for a specific idea
//	GET	  /checkFlagBan/:userID	        check if user has a flag ban

// ----------------------------------------------------------------------------
// controllers/report.js          → apiRouter.use('/report', reportRouter)
//	GET	  /	                        welcome stub
//	GET	  /getall	                  get all reports (admin only)
//	POST	/create	                  create a report
//	DEL	  /delete/:reportId	        delete a report by id (admin only)

// =============================================================================

import { initServer } from "@ts-rest/express";
import { moderationApiContracts } from "@mlc/lib/api";

import { prisma } from "src/prisma/client";
import { Handlers } from "src/server";

const s = initServer();

const incrementBadPostCount = s.route(
  moderationApiContracts.reputation.badPosts.incrementBadPostCount,
  {
    handler: async () => {
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
  },
);

/* 
import { createServerResponse } from "@ts-rest/server"; // Optional helper
import { moderationContract } from "./contract"; // wherever your contract is
import { prisma } from "../../lib/prisma";

// ==========================================
// SERVICE LOGIC (The "Internal" work)
// ==========================================
const handleFalseFlagging = async (ideaId: number, isFalse: boolean, userId: number) => {
  const updateResult = await prisma.ideaFlag.updateMany({
    where: { ideaId },
    data: { falseFlag: isFalse },
  });

  await prisma.false_Flagging_Behavior.upsert({
    where: { userId }, 
    update: { flag_count: { increment: 1 } },
    create: { userId, flag_count: 1 },
  });

  const threshold = await prisma.threshhold.findUnique({ where: { id: 2 } });
  if (threshold) {
    await prisma.false_Flagging_Behavior.updateMany({
      where: { flag_count: { gte: threshold.number } },
      data: { flag_ban: true },
    });
  }

  return updateResult.count;
};

// ==========================================
// ROUTER IMPLEMENTATION
// ==========================================
export const moderationRouter = (s: any) => s.router(moderationContract, {
  falseFlagMany: async ({ params: { ideaId }, body: { isFalse }, req }) => {
    try {
      const { id: userId } = req.user;
      const count = await handleFalseFlagging(ideaId, isFalse, userId);

      return {
        status: 200,
        body: { 
          message: `False flags successfully updated under Idea ${ideaId}`, 
          count 
        },
      };
    } catch (error) {
      return {
        status: 400,
        body: { message: "An error occurred while updating flags" },
      };
    }
  },
  
  // Add other handlers here...
});
*/

export default {
  schema: moderationApiContracts,
  router: {
    reputation: {
      badPosts: {
        incrementBadPostCount,
      },
    },
  },
} as Handlers;
