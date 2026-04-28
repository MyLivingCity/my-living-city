import { z } from "zod";
import { initContract } from "@ts-rest/core";
import { ErrorResponseSchema, SimpleMessageResponseSchema } from "../../common";

const baseFlagShape = {
  id: z.number(),
  flaggerId: z.string().cuid(),
  falseFlag: z.boolean(),
  flagReason: z.string().nullable(),
  //createdAt: SafeDateFormat,  for some reason these aren't timestamped
};

export const CommentFlagSchema = z.object({
  ...baseFlagShape,
  commentId: z.number(),
});

export const IdeaFlagSchema = z.object({
  ...baseFlagShape,
  ideaId: z.number(),
});
// ----------------------------------------------------------------------------
//  Routers
// ----------------------------------------------------------------------------
const c = initContract();

export const flagsContract = c.router(
  {
    // ----------------------------------------------------------------------------
    // flag.js                              Idea flagging
    //x	POST	/create/:ideaId	              create a flag for a specific idea
    //x	GET	  /getAll	                      get all idea flags
    //x	PUT	  /falseFlagMany/:ideaId	      mark all flags as false and update false-flag behavior
    //x	GET	  /getFlags/:ideaID	            get flag count for a specific idea
    // ----------------------------------------------------------------------------
    ideas: c.router(
      {
        getAll: {
          method: "GET",
          path: "/getAll",
          responses: {
            200: z.array(IdeaFlagSchema),
            400: ErrorResponseSchema,
          },
          summary: "Get all Idea flags",
        },
        getFlagsById: {
          method: "GET",
          path: "getFlags/:ideaId",
          pathParams: z.object({ ideaId: z.coerce.number() }),
          responses: {
            200: IdeaFlagSchema,
            400: ErrorResponseSchema,
          },
          summary: "Get flags for ideaId",
        },
        createFlag: {
          method: "POST",
          path: "/create/:ideaId",
          pathParams: z.object({ ideaId: z.coerce.number() }),
          body: IdeaFlagSchema.pick({ flagReason: true }),
          responses: {
            201: IdeaFlagSchema,
            400: ErrorResponseSchema,
          },
          summary: "Flag an Idea",
        },
        falseFlagMany: {
          method: "PUT",
          path: "/falseFlagMany/:ideaId",
          pathParams: z.object({ ideaId: z.coerce.number() }),
          body: z.object({ isFalse: z.boolean() }),
          responses: {
            200: SimpleMessageResponseSchema,
            400: ErrorResponseSchema,
          },
          summary: "Set all flags as false for ideaId",
        },
        checkFlagBan: {
          method: "GET",
          path: "checkFlagBan/:userId",
          pathParams: z.object({ userId: z.coerce.number() }),
          responses: {
            200: z.array(IdeaFlagSchema),
            400: ErrorResponseSchema,
          },
          summary: "Get idea flags for userId",
        },
      },
      { pathPrefix: "/flag" },
      //{ pathPrefix: "/ideas" },
    ),
    // ----------------------------------------------------------------------------
    // commentFlag.js
    //x	POST	/create/:commentId	          create a flag for a specific comment
    //x	GET	  /getAll	                      get all comment flags
    //x	PUT	  /falseFlagMany/:commentId	    mark all flags as false and update false-flag behavior
    //x	GET	  /getFlags/:commentId	        get flag count for a specific comment
    // ----------------------------------------------------------------------------
    //comments: c.router(
    commentFlag: c.router(
      {
        getAll: {
          method: "GET",
          path: "/getAll",
          responses: { 200: z.array(CommentFlagSchema) },
          summary: "Get all comment flags",
        },
        getById: {
          method: "GET",
          path: "getFlags/:commentId",
          pathParams: z.object({ commentId: z.coerce.number() }),
          responses: {
            200: z.number(),
            400: ErrorResponseSchema,
          },
          summary: "Get flag count for comment id",
        },
        createFlag: {
          method: "POST",
          path: "/create/:commentId",
          pathParams: z.object({ commentId: z.coerce.number() }),
          body: CommentFlagSchema.pick({ flagReason: true }),
          responses: {
            201: SimpleMessageResponseSchema,
            400: ErrorResponseSchema,
          },
          summary: "Flag a comment",
        },
        falseFlagMany: {
          method: "PUT",
          path: "/falseFlagMany/:commentId",
          pathParams: z.object({ commentId: z.coerce.number() }),
          body: z.object({ isFalse: z.boolean() }),
          responses: {
            200: SimpleMessageResponseSchema,
            400: ErrorResponseSchema,
          },
          summary: "Set all flags as false for :commentId",
        },
      },
      //{ pathPrefix: "/comments" },
      { pathPrefix: "/commentFlag" },
    ),
  },
  // {
  //   pathPrefix: "/flags",
  // },
);
