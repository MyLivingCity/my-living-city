import { z } from "zod";

export const BadPostingBehaviourSchema = z.object({
  bad_post_count: z.number(),
  bannedAt: z.date(),
  bannedUntil: z.date(),
  id: z.number(),
  postCommentBan: z.boolean(),
  postFlagCount: z.number(),
  userId: z.number(),
});

export const FalseFlagSchema = z.object({
  bannedAt: z.boolean(),
  bannedUntil: z.date(), //banUntil elsewhere
  flagBan: z.boolean(),
  flagCount: z.number(),
  id: z.number(),
  userId: z.number(),
});

// ==========================================
// ROUTER
// ==========================================

import { initContract } from "@ts-rest/core";
import { UserSchema } from "../users";

const c = initContract();

export const reputationContract = c.router(
  {
    badPosts: c.router(
      {
        //=============================================================================
        //badPostingBehaviour
        //=============================================================================
        //	PUT	/incrementBadPostCount/:ideaId			increment banned post count for idea author
        //	PUT	/incrementPostFlagCount/:ideaId			increment post flag count for idea author
        //	PUT	/resetBadPostCount/:ideaId				  reset bad post and post flag counts to 0
        //                        ^this is being refactored from ideaId to userId
        //	PUT	/checkUser/:userId					        check thresholds and post-ban user if exceeded
        //  ^=> all to POST - no data being sent
        //	GET	/getAll						                  get all users from bad posting behavior table
        //	GET	/getBadPostingBehavior/:userId			get bad posting behavior for authenticated user
        //	PUT	/checkThreshhold				            apply threshold checks and set post_comment_ban

        incrementBadPostCount: {
          method: "POST",
          path: "/add/:ideaId",
          pathParams: z.object({
            ideaId: z.coerce.number(),
          }),
          body: z.object({}),
          responses: {
            200: z.object({ message: z.string() }),
            404: z.object({ message: z.string() }),
          },
          summary:
            //when post is removed by admin:
            "Increments the bad(banned/deleted) post counter for an idea author",
        },
        incrementPostFlagCount: {
          method: "POST",
          path: "/:ideaId",
          pathParams: z.object({
            ideaId: z.coerce.number(),
          }),
          body: z.object({}),
          responses: {
            200: z.object({ message: z.string() }),
            404: z.object({ message: z.string() }),
          },
          //when another user flags author's post:
          summary: "Increments the post flag counter for an idea author",
        },
        resetBadPostCount: {
          method: "POST",
          path: "/:userId/reset",
          pathParams: z.object({ userId: z.coerce.number() }),
          body: z.object({}),
          responses: {
            200: z.object({ message: z.string() }),
            404: z.object({ message: z.string() }),
          },
          summary: "Reset user's bad post and post flag counts",
        },
        checkUser: {
          method: "POST",
          path: "/:userId/check",
          pathParams: z.object({ userId: z.coerce.number() }),
          body: z.object({}),
          responses: {
            200: z.object({ message: z.string() }),
            404: z.object({ message: z.string() }),
          },
          summary: "Check thresholds and post-ban user if exceeded",
        },
        getAll: {
          method: "GET",
          path: "/",
          responses: {
            200: z.array(
              UserSchema.pick({
                id: true,
                email: true,
                banned: true,
              }),
            ),
            404: z.object({ message: z.string() }),
          },
          summary: "Get all users from bad posting behavior table",
        },
        getById: {
          method: "GET",
          path: "/:userId",
          responses: {
            200: UserSchema,
            404: z.object({ message: z.string() }),
          },
          summary: "Get bad posting behavior for authenticated user",
        },
        checkThreshold: {
          method: "POST",
          path: "/users/check",
          body: z.object({}),
          responses: {
            200: z.object({ message: z.string() }),
            404: z.object({ message: z.string() }),
          },
          summary: "Check thresholds and post-ban users who exceeded",
        },
      },
      { pathPrefix: "bad-posts" },
    ),

    falseFlag: c.router(
      {
        //=============================================================================
        //falseFlaggingBehaviour
        //=============================================================================
        // controllers/falseFlaggingBehavior.js → apiRouter.use('/falseFlaggingBehavior', ...)

        //   NOTE: verify whether any routes are actually implemented before migrating

        //	GET	  /getAll	                      get all users in false-flagging behavior table
        //  GET   /getById/:userId              get user false-flagging behavior
        //	GET	  /checkFalseFlaggingBehavior	  apply false-flag threshold checks and set flag bans
        //=============================================================================
        //  taken from flag.js:
        //x	GET	  /checkFlagBan/:userID	        check if user has a flag ban
        // ----------------------------------------------------------------------------
        checkFlagBan: {
          method: "GET",
          path: "/user/:userId/check-ban",
          pathParams: z.object({ userId: z.coerce.number() }),
          responses: { 200: z.object({ banned: z.boolean() }) },
          summary: "Check if user has a flag ban",
        },
      },
      { pathPrefix: "/false-flag" },
    ),
  },
  { pathPrefix: "/reputation" },
);
