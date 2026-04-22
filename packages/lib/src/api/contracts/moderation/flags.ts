import { z } from "zod";

const baseFlagShape = {
  id: z.number(),
  flaggerId: z.number(),
  reason: z.string(),
  createdAt: z.date(),
};

export const CommentFlagSchema = z.object({
  ...baseFlagShape,
  commentId: z.number(),
});

export const IdeaFlagSchema = z.object({
  ...baseFlagShape,
  ideaId: z.number(),
});

// ==========================================
// ROUTER
// ==========================================

import { initContract } from "@ts-rest/core";

const c = initContract();

export const flagsContract = c.router(
  {
    ideas: c.router(
      {
        // ============================================================================
        // flag.js
        // ============================================================================
        // ----------------------------------------------------------------------------
        // controllers/flag.js                  Idea flagging
        //x	POST	/create/:ideaId	              create a flag for a specific idea
        //x	GET	  /getAll	                      get all idea flags
        //x	PUT	  /falseFlagMany/:ideaId	      mark many flags on an idea as false and update false-flag behavior
        //x	GET	  /getFlags/:ideaID	            get flag count for a specific idea
        //x	GET	  /checkFlagBan/:userID	        check if user has a flag ban
        // ----------------------------------------------------------------------------
        getAll: {
          method: "GET",
          path: "/",
          responses: { 200: z.array(IdeaFlagSchema) },
          summary: "Get all Idea flags",
        },
        getById: {
          method: "GET",
          path: "/:ideaId",
          pathParams: z.object({ ideaId: z.coerce.number() }),
          responses: { 200: IdeaFlagSchema },
          summary: "Get flags for Idea id",
        },
        createFlag: {
          method: "POST",
          path: "/create/:ideaId",
          pathParams: z.object({ ideaId: z.coerce.number() }),
          body: IdeaFlagSchema,
          responses: { 200: z.array(IdeaFlagSchema) },
          summary: "Flag an Idea",
        },
        falseFlagMany: {
          method: "PUT",
          path: "/falseFlagMany/:ideaId",
          pathParams: z.object({ ideaId: z.coerce.number() }),
          body: z.object({ isFalse: z.boolean() }),
          responses: {
            200: z.object({ message: z.string(), count: z.number() }),
            400: z.object({ message: z.string() }),
          },
          summary: "Set all flags as false for Idea id",
        },
      },
      { pathPrefix: "/ideas" },
    ),
    // ============================================================================
    comments: c.router(
      {
        // ============================================================================
        // commentFlag.js
        // ============================================================================
        //	POST	/create/:commentId	          create a flag for a specific comment
        //	GET	  /getAll	                      get all comment flags
        //	PUT	  /falseFlagMany/:commentId	    mark many flags on a comment as false and update false-flag behavior
        //	GET	  /getFlags/:commentId	        get flag count for a specific comment
        // ----------------------------------------------------------------------------
        getAll: {
          method: "GET",
          path: "/",
          responses: { 200: z.array(CommentFlagSchema) },
          summary: "Get all comment flags",
        },
        getById: {
          method: "GET",
          path: "/:commentId",
          pathParams: z.object({ ideaId: z.coerce.number() }),
          responses: { 200: CommentFlagSchema },
          summary: "Get flags for comment id",
        },
        createFlag: {
          method: "POST",
          path: "/create/:commentId",
          pathParams: z.object({ ideaId: z.coerce.number() }),
          body: CommentFlagSchema,
          responses: { 200: z.array(CommentFlagSchema) },
          summary: "Flag a comment",
        },
        falseFlagMany: {
          method: "PUT",
          path: "/falseFlagMany/:commentId",
          pathParams: z.object({ ideaId: z.coerce.number() }),
          body: z.object({ isFalse: z.boolean() }),
          responses: {
            200: z.object({ message: z.string(), count: z.number() }),
            400: z.object({ message: z.string() }),
          },
          summary: "Set all flags as false for :commentId",
        },
      },
      { pathPrefix: "/comments" },
    ),

    // ----------------------------------------------------------------------------
    // USER
    // ----------------------------------------------------------------------------
    checkFlagBan: {
      method: "GET",
      path: "/users/:userId/check-ban",
      pathParams: z.object({ userId: z.coerce.number() }),
      responses: { 200: z.object({ banned: z.boolean() }) },
      summary: "Check if user has a flag ban",
    },
  },
  {
    pathPrefix: "/flags",
  },
);
