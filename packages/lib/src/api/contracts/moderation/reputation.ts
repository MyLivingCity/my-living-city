import { z } from "zod";
import { initContract } from "@ts-rest/core";
import { UserSchema } from "../users";
import { ErrorResponseSchema, SimpleMessageResponseSchema } from "../../common";

export const BadPostingBehaviourSchema = z
  .object({
    id: z.number().default(0),
    userId: z.string().cuid().default(""),
    bad_post_count: z.number().default(0),
    postFlagCount: z.number().default(0),
    postCommentBan: z.boolean().default(false),
    // For dates, we typically use a "Unix Epoch" or null-equivalent
    // depending on how your frontend handles empty states
    bannedAt: z.date().default(new Date(0)),
    bannedUntil: z.date().default(new Date(0)),
  })
  .default({
    id: 0,
    userId: "",
    bad_post_count: 0,
    postFlagCount: 0,
    postCommentBan: false,
    bannedAt: new Date(0),
    bannedUntil: new Date(0),
  });

export const FalseFlagSchema = z.object({
  bannedAt: z.boolean(),
  bannedUntil: z.date(), //banUntil elsewhere
  flagBan: z.boolean(),
  flagCount: z.number(),
  id: z.number(),
  userId: z.string().cuid(),
});
// ----------------------------------------------------------------------------
//  Routers
// ----------------------------------------------------------------------------
const c = initContract();

export const reputationContract = c.router(
  {
    // ----------------------------------------------------------------------------
    //badPostingBehaviour
    // ----------------------------------------------------------------------------
    //	POST	  /:ideaId/incrementBadPostCount			increment banned post count for idea author
    //	POST	  /:ideaId/incrementPostFlagCount			increment post flag count for idea author
    //	POST	  /:userId/resetBadPostCount				  reset bad post and post flag counts to 0
    //	POST    /:userId/checkUser					        check thresholds and post-ban user if exceeded
    //	GET	    /getAll						                  get all users from bad posting behavior table
    //	GET	    /:userId/getBadPostingBehavior			get bad posting behavior for authenticated user
    //	POST	  /checkThreshhold				            apply threshold checks and set post_comment_ban
    // ----------------------------------------------------------------------------
    badPostingBehavior: c.router(
      {
        incrementBadPostCount: {
          method: "POST",
          path: "/incrementBadPostCount/:ideaId",
          pathParams: z.object({
            ideaId: z.coerce.number(),
          }),
          body: z.object({}),
          responses: {
            200: SimpleMessageResponseSchema,
            400: ErrorResponseSchema,
          },
          summary:
            //when post is removed by admin:
            "Increments the bad(banned/deleted) post counter for an idea author",
        },
        incrementPostFlagCount: {
          method: "POST",
          path: "/incrementPostFlagCount/:ideaId",
          pathParams: z.object({
            ideaId: z.coerce.number(),
          }),
          body: z.object({}),
          responses: {
            200: SimpleMessageResponseSchema,
            400: ErrorResponseSchema,
          },
          //when another user flags author's post:
          summary: "Increments the post flag counter for an idea author",
        },
        resetBadPostCount: {
          method: "POST",
          path: "/resetBadPostCount/:ideaId",
          pathParams: z.object({ ideaId: z.coerce.number() }),
          body: z.object({}),
          responses: {
            200: SimpleMessageResponseSchema,
            400: ErrorResponseSchema,
          },
          summary: "Reset ideaId.author's bad post and post flag counts",
        },
        checkUser: {
          method: "POST",
          path: "/checkUser/:userId",
          pathParams: z.object({ userId: z.string().cuid() }),
          body: z.object({}),
          responses: {
            200: SimpleMessageResponseSchema,
            400: ErrorResponseSchema,
          },
          summary: "Check ban thresholds and post-ban user if exceeded",
        },
        getAll: {
          method: "GET",
          path: "/getAll",
          responses: {
            200: z.array(z.string().cuid()),
            400: z.object({ message: z.string() }),
          },
          summary: "Get all users from bad posting behavior table",
        },
        // getById: {
        //   method: "GET",
        //   path: "/checkUser/:userId",
        //   responses: {
        //     200: UserSchema,
        //     400: ErrorResponseSchema,
        //   },
        //   //note: this originally hits Bad_Posting_Behavior
        //   summary: "Get bad posting behavior for authenticated user",
        // },
        getBadPostingBehavior: {
          method: "GET",
          path: "/getBadPostingBehavior",
          responses: {
            200: BadPostingBehaviourSchema,
            400: ErrorResponseSchema,
          },
          //note: this originally hits Bad_Posting_Behavior
          summary: "Get bad posting behavior for current user",
        },
        checkThreshold: {
          method: "POST",
          //find the threshhold in threshhold table with the id of 3
          path: "/checkThreshold",
          body: z.object({}),
          responses: {
            200: SimpleMessageResponseSchema,
            400: ErrorResponseSchema,
          },
          summary: "Check thresholds and post-ban users who exceeded",
        },
      },
      { pathPrefix: "/badPostingBehavior" },
      //{ pathPrefix: "bad-posts" },
    ),
    // ----------------------------------------------------------------------------
    //falseFlaggingBehaviour
    // ----------------------------------------------------------------------------
    // controllers/falseFlaggingBehavior.js → apiRouter.use('/falseFlaggingBehavior', ...)
    //	GET	  /getAll	                      get all users in false-flagging behavior table
    //  GET   /getById/:userId              get user false-flagging behavior
    //	GET	  /checkFalseFlaggingBehavior	  apply false-flag threshold checks and set flag bans
    // ----------------------------------------------------------------------------
    //  taken from flag.js:
    //x	GET	  /checkFlagBan/:userID	        check if user has a flag ban
    // ----------------------------------------------------------------------------
    falseFlaggingBehavior: c.router(
      {
        checkFalseFlaggingBehavior: {
          method: "POST",
          path: "/checkFalseFlaggingBehavior",
          body: z.object({}),
          responses: { 200: z.object({ message: z.string() }) },
          summary:
            "Trigger a review of the false-flagging table and ban eligible users",
        },
        // put back into flags to satisfy existing routes
        // checkFlagBan: {
        //   method: "GET",
        //   path: "/:userId/check-ban",
        //   pathParams: z.object({ userId: z.coerce.number() }),
        //   responses: {
        //     200: z.object({ banned: z.boolean() }),
        //     404: ErrorResponseSchema,
        //   },
        //   summary: "Check if user has a flag ban",
        // },
        getAll: {
          method: "GET",
          path: "/getAll",
          responses: {
            200: z.array(
              UserSchema.pick({
                id: true,
                email: true,
                banned: true,
              }),
            ),
            400: ErrorResponseSchema,
          },
          summary: "Get all users from false-flagging behavior table",
        },
        // getById: {
        //   method: "GET",
        //   path: "/:userId",
        //   responses: {
        //     200: UserSchema.pick({
        //       id: true,
        //       email: true,
        //       banned: true,
        //     }),
        //     404: ErrorResponseSchema,
        //   },
        //   summary: "Get false-flagging behavior for authenticated user",
        // },
      },
      { pathPrefix: "/falseFlaggingBehavior" },
    ),
  },
  //{ pathPrefix: "/reputation" },
);
