import { z } from "zod";
import { initContract } from "@ts-rest/core";
import {
  SafeDateFormat,
  ErrorResponseSchema,
  SimpleMessageResponseSchema,
} from "../../common";

export const BanTypeSchema = z.enum(["USER", "IDEA", "COMMENT"]);
export type BanType = z.infer<typeof BanTypeSchema>;

export const BanUserTypeSchema = z.enum(["WARNING", "POST_BAN", "SYS_BAN"]);
export type BanUserType = z.infer<typeof BanUserTypeSchema>;

/**
 * baseBanShape: The core fields shared by all ban-related tables.
 * We keep this as a plain object so we can use spread ... syntax later.
 */
const baseBanShape = {
  id: z.number(),
  //'safe coercion' of Date => String
  createdAt: SafeDateFormat,
  bannedBy: z.string(),
  banReason: z.string(),
  banMessage: z.string().default(""),
  notificationDismissed: z.boolean(),
};
// ----------------------------------------------------------------------------
const UserBanRaw = z.object({
  ...baseBanShape,
  type: z.literal(BanTypeSchema.enum.USER),
  userId: z.string().cuid(),
  banDuration: z.number(),
  banType: BanUserTypeSchema,
  banUntil: SafeDateFormat,
});
const PostBanRaw = z.object({
  ...baseBanShape,
  type: z.literal(BanTypeSchema.enum.IDEA),
  postId: z.number(),
  authorId: z.string(),
});
const CommentBanRaw = z.object({
  ...baseBanShape,
  type: z.literal(BanTypeSchema.enum.COMMENT),
  commentId: z.number(),
  authorId: z.string(),
});
// ----------------------------------------------------------------------------
// Transform 'notificationDismissed' -> 'isRead'
// ----------------------------------------------------------------------------
const withNotificationFix = <T extends { notificationDismissed: boolean }>(
  data: T,
) => {
  const { notificationDismissed, ...rest } = data;
  return { ...rest, isRead: notificationDismissed };
};
// ----------------------------------------------------------------------------
//  Apply rename for exports
// ----------------------------------------------------------------------------
export const UserBanSchema = UserBanRaw.transform(withNotificationFix);
export const PostBanSchema = PostBanRaw.transform(withNotificationFix);
export const CommentBanSchema = CommentBanRaw.transform(withNotificationFix);
// ----------------------------------------------------------------------------
export const AnyBanRaw = z.discriminatedUnion("type", [
  UserBanRaw,
  PostBanRaw,
  CommentBanRaw,
]);

export const AnyBanSchema = AnyBanRaw.transform(withNotificationFix);
// ----------------------------------------------------------------------------
//  Routers
// ----------------------------------------------------------------------------
const c = initContract();

export const bansContract = c.router(
  {
    // ----------------------------------------------------------------------------
    // banCommentRouter.js
    //xPOST     /create                                 Create a new ban for a specific comment and log to history
    //xGET      /:userId/getUndismissedNotification     Retrieve all undismissed comment ban notifications for a user
    //xGET      /:commentBanId/getByCommentId           Fetch ban details for a specific comment ID
    //xPOST     /:commentBanId/dismissNotification      Mark a comment ban notification as dismissed
    //xDELETE   /:commentBanId/delete                   Remove a ban entry associated with a comment ID
    // ----------------------------------------------------------------------------
    banComment: c.router(
      //commentBans: c.router(
      {
        //DOESN'T EXIST IN LEGACY
        // getAll: {
        //   method: "GET",
        //   path: "/all",
        //   responses: {
        //     200: z.array(CommentBanSchema),
        //     400: ErrorResponseSchema,
        //     401: z.string(),
        //   },
        //   summary: "Get all banned comments",
        // },
        getById: {
          method: "GET",
          path: "/getByCommentId/:commentBanId",
          pathParams: z.object({ commentBanId: z.coerce.number() }),
          responses: {
            200: CommentBanSchema,
            400: ErrorResponseSchema,
          },
          summary: "Get banned comment by id",
        },
        getUndismissedNotifications: {
          method: "GET",
          path: "/getUndismissedNotification/:userId",
          pathParams: z.object({ userId: z.string().cuid() }),
          responses: {
            200: z.array(CommentBanSchema),
            400: ErrorResponseSchema,
          },
          summary:
            "Retrieve all undismissed comment ban notifications for a user",
        },
        create: {
          method: "POST",
          path: "/create",
          body: CommentBanRaw.pick({
            commentId: true,
            banReason: true,
            banMessage: true,
          }).extend({
            banDuration: z.number().positive(),
          }),
          responses: {
            201: SimpleMessageResponseSchema,
            400: ErrorResponseSchema,
          },
          summary: "Create a new ban for a specific comment and log to history",
        },
        dismissNotification: {
          method: "POST",
          path: "/dismissNotification/:commentBanId",
          pathParams: z.object({ commentBanId: z.coerce.number() }),
          body: z.object({}), // Explicitly empty
          responses: {
            200: SimpleMessageResponseSchema,
          },
          summary: "Dismiss a comment ban notification",
        },
        deleteById: {
          method: "DELETE",
          path: "/delete/:commentBanId",
          pathParams: z.object({ commentBanId: z.coerce.number() }),
          responses: {
            200: SimpleMessageResponseSchema,
            400: ErrorResponseSchema,
          },
          summary: "Delete comment ban by id",
        },
      },
      { pathPrefix: "/banComment" },
    ),
    // ----------------------------------------------------------------------------
    // banPostRouter.js
    //xPOST    /create                                 Create a new ban for a post and log it to ban history
    //xGET     /getUndismissedNotification/:userId     Retrieve all undismissed post ban notifications for a user
    //xGET     /getByPostId/:postBanId                 Fetch ban details for a specific post ID
    //xPOST     /dismissNotification/:banPostId         Mark a post ban notification as dismissed
    //xDELETE  /delete/:banPostId                      Remove a ban entry associated with a post ID
    // ----------------------------------------------------------------------------
    banPost: c.router(
      {
        // getAll: {
        //   method: "GET",
        //   path: "/all",
        //   responses: {
        //     200: z.array(PostBanSchema),
        //     400: ErrorResponseSchema,
        //     401: z.string(),
        //   },
        //   summary: "Get all banned posts",
        // },
        getByPostId: {
          method: "GET",
          path: "'/getByPostId/:postBanId",
          pathParams: z.object({ postBanId: z.coerce.number() }),
          responses: {
            200: PostBanSchema,
            400: ErrorResponseSchema,
          },
          summary: "Get banned post by id",
        },
        getUndismissedNotifications: {
          method: "GET",
          path: "/getUndismissedNotification/:userId",
          pathParams: z.object({ userId: z.string().cuid() }),
          responses: {
            200: z.array(PostBanSchema),
            400: ErrorResponseSchema,
          },
          summary: "Retrieve all undismissed post ban notifications for a user",
        },
        create: {
          method: "POST",
          path: "/create",
          body: PostBanRaw.pick({
            postId: true,
            authorId: true,
            banReason: true,
            banMessage: true,
          }).extend({
            banDuration: z.number().positive(),
          }),
          responses: {
            201: SimpleMessageResponseSchema,
            400: ErrorResponseSchema,
          },
          summary: "Create a new ban for a specific post and log to history",
        },
        dismissNotification: {
          method: "POST",
          path: "/dismissNotification/:postBanId",
          pathParams: z.object({ postBanId: z.coerce.number() }),
          body: z.object({}),
          responses: {
            200: SimpleMessageResponseSchema,
          },
          summary: "Dismiss a post ban notification",
        },
        delete: {
          method: "DELETE",
          path: "/delete/:postBanId",
          pathParams: z.object({ postBanId: z.coerce.number() }),
          responses: {
            200: SimpleMessageResponseSchema,
            400: ErrorResponseSchema,
          },
          summary: "Delete post ban by id",
        },
      },
      { pathPrefix: "/banPost" },
    ),
    // ----------------------------------------------------------------------------
    // banUserRouter.js
    //xPOST     /create                                 Ban a user, set duration, and log to ban history
    //xGET      /getAll                                 Retrieve all user ban records
    //xGET      /:userId/get                            Retrieve all ban records for a specific user ID
    //xGET      /:userId/getMostRecent                  Retrieve only the most recent ban record for a user
    //xGET      /getMostRecentWithToken                 Retrieve the most recent ban for the currently authenticated user
    //xPATCH    /:userId/update                         Update the most recent ban record for a specific user
    //xDELETE   /:userId/delete                         Remove a ban record for a specific user (commented-out)
    // ----------------------------------------------------------------------------
    banUser: c.router(
      {
        create: {
          method: "POST",
          path: "/create",
          body: UserBanRaw.pick({
            userId: true,
            banType: true,
            banReason: true,
            banMessage: true,
          }).extend({
            banDuration: z.number().positive(),
          }),
          responses: {
            201: SimpleMessageResponseSchema,
            400: ErrorResponseSchema,
          },
          summary: "Ban a user, set duration, and log to ban history",
        },
        getAll: {
          method: "GET",
          path: "/getAll",
          responses: {
            200: z.array(UserBanSchema),
            400: ErrorResponseSchema,
            //401: z.string(),
          },
          summary: "Get all user ban records",
        },
        getById: {
          method: "GET",
          path: "/get/:userId",
          pathParams: z.object({ userId: z.string().cuid() }),
          responses: {
            200: z.array(UserBanSchema),
            400: ErrorResponseSchema,
          },
          summary: "Get ban records by userId",
        },
        getMostRecent: {
          method: "GET",
          path: "/getMostRecent/:userId",
          pathParams: z.object({ userId: z.string().cuid() }),
          responses: {
            200: UserBanSchema,
            400: ErrorResponseSchema,
          },
          summary: "Get only the most recent ban record for a user",
        },
        getMostRecentWithToken: {
          method: "GET",
          path: "/getMostRecentWithToken",
          responses: {
            200: UserBanSchema,
            400: ErrorResponseSchema,
          },
          summary: "Get only the most recent ban record for a user",
        },
        updateUserBan: {
          method: "PATCH",
          path: "/update/:userId",
          body: UserBanSchema,
          responses: {
            200: SimpleMessageResponseSchema,
            400: ErrorResponseSchema,
          },
          summary: "Update the most recent ban record for a specific user",
        },
        delete: {
          method: "DELETE",
          path: "/delete/:userId",
          pathParams: z.object({ userId: z.string().cuid() }),
          responses: {
            200: SimpleMessageResponseSchema,
            400: ErrorResponseSchema,
          },
          summary:
            "Remove a ban record for a specific user (commented-out in existing)",
        },
        getAllPassedDate: {
          method: "GET",
          path: "/getAllPassedDate",
          responses: {
            200: z.array(UserBanSchema),
            400: ErrorResponseSchema,
          },
          summary: "Check banned users eligible for reinstatement",
        },
        deletePassedBanDate: {
          method: "DELETE",
          path: "/deletePassedBanDate",
          pathParams: z.object({ userId: z.string().cuid() }),
          responses: {
            200: SimpleMessageResponseSchema,
            400: ErrorResponseSchema,
          },
          summary: "Remove users from ban table if their ban is over",
        },
      },
      { pathPrefix: "/banUser" },
    ),
  },
  //{ pathPrefix: "/bans" },
);
