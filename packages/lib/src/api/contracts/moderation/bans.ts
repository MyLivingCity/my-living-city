import { z } from "zod";

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

import { initContract } from "@ts-rest/core";

const c = initContract();

export const bansContract = c.router({});
