import { z } from "zod";
import { initContract } from "@ts-rest/core";

export const BanTypeSchema = z.enum(["USER", "POST", "COMMENT"]);
export type BanType = z.infer<typeof BanTypeSchema>;

export const BanUserTypeSchema = z.enum(["WARNING", "POST_BAN", "SYS_BAN"]);
export type BanUserType = z.infer<typeof BanTypeSchema>;

/**
 * baseBanShape: The core fields shared by all ban-related tables.
 * We keep this as a plain object so we can use spread ... syntax later.
 */
const baseBanShape = {
  id: z.number(),
  createdAt: z.date(),
  bannedBy: z.string(),
  banReason: z.string(),
  banMessage: z.string(),
  banUntil: z.date(),
  notificationDismissed: z.boolean(),
};
// ----------------------------------------------------------------------------
const UserBanRaw = z.object({
  ...baseBanShape,
  type: z.literal(BanTypeSchema.enum.USER),
  userId: z.number(),
  banDuration: z.number(),
  banType: BanUserTypeSchema,
});
const PostBanRaw = z.object({
  ...baseBanShape,
  type: z.literal(BanTypeSchema.enum.POST),
  postId: z.number(),
  authorId: z.number(),
});
const CommentBanRaw = z.object({
  ...baseBanShape,
  type: z.literal(BanTypeSchema.enum.COMMENT),
  commentId: z.number(),
  postId: z.number(),
  authorId: z.number(),
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
export const AnyBanSchema = z
  .discriminatedUnion("type", [UserBanRaw, PostBanRaw, CommentBanRaw])
  .transform(withNotificationFix);
// ==========================================
// 4. ROUTERS
// ==========================================

const c = initContract();

export const bansContract = c.router({
  // banCommentRouter.js
  //POST    /create                                 Create a new ban for a specific comment and log to history
  //GET     /getUndismissedNotification/:userId     Retrieve all undismissed comment ban notifications for a user
  //GET     /getByCommentId/:banCommentId           Fetch ban details for a specific comment ID
  //PUT     /dismissNotification/:banCommentId      Mark a comment ban notification as dismissed
  //DELETE  /delete/:banCommentId                   Remove a ban entry associated with a comment ID
  commentBans: c.router({}),

  // banPostRouter.js
  //POST    /create                                 Create a new ban for a post and log it to ban history
  //GET     /getUndismissedNotification/:userId     Retrieve all undismissed post ban notifications for a user
  //GET     /getByPostId/:banPostId                 Fetch ban details for a specific post ID
  //PUT     /dismissNotification/:banPostId         Mark a post ban notification as dismissed
  //DELETE  /delete/:banPostId                      Remove a ban entry associated with a post ID
  postBans: c.router({}),

  // banUserRouter.js
  //POST    /create                                 Ban a user, set duration, and log to ban history
  //GET     /getAll                                 Retrieve all user ban records
  //GET     /get/:userId                            Retrieve all ban records for a specific user ID
  //GET     /getMostRecent/:userId                  Retrieve only the most recent ban record for a user
  //GET     /getMostRecentWithToken                 Retrieve the most recent ban for the currently authenticated user
  //PUT     /update/:userId                         Update the most recent ban record for a specific user
  //DELETE  /delete/:userId                         Remove a ban record for a specific user (commented-out)
  userBans: c.router({}),
});
