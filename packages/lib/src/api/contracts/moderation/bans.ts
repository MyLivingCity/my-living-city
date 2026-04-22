import { z } from "zod";

// ==========================================
// 1. RAW SHAPES (Reusable Building Blocks)
// ==========================================

const auditShape = {
  id: z.number(),
  createdAt: z.date(),
};

/**
 * baseBanShape: The core fields shared by all ban-related tables.
 * We keep this as a plain object so we can use spread ... syntax later.
 */
const baseBanShape = {
  ...auditShape,
  bannedBy: z.string(),
  banReason: z.string(),
  banMessage: z.string(),
  banUntil: z.date(),
  notificationDismissed: z.boolean(),
};

// ==========================================
// 2. TRANSFORM HELPER
// ==========================================

/**
 * Reusable logic to map messy DB names to clean API names.
 * Maps 'notificationDismissed' -> 'isRead'
 */
const withNotificationFix = <T extends { notificationDismissed: boolean }>(
  data: T,
) => {
  const { notificationDismissed, ...rest } = data;
  return { ...rest, isRead: notificationDismissed };
};

// ==========================================
// 3. EXPORTED BAN SCHEMAS
// ==========================================

export const UserBanSchema = z
  .object({
    ...baseBanShape,
    userId: z.number(),
    banDuration: z.number(),
    banType: z.string(),
  })
  .transform(withNotificationFix);

export const PostBanSchema = z
  .object({
    ...baseBanShape,
    postId: z.number(),
    authorId: z.number(),
    // Add any specific fields unique to PostBan here
  })
  .transform(withNotificationFix);

export const CommentBanSchema = z
  .object({
    ...baseBanShape,
    commentId: z.number(),
    postId: z.number(),
    authorId: z.number(),
  })
  .transform(withNotificationFix);

// ==========================================
// 4. TYPES
// ==========================================

/**
 * Use z.output to get the type AFTER the transform (including 'isRead').
 */
export type UserBan = z.output<typeof UserBanSchema>;
export type PostBan = z.output<typeof PostBanSchema>;
export type CommentBan = z.output<typeof CommentBanSchema>;

// ==========================================
// 4. ROUTER
// ==========================================

import { initContract } from "@ts-rest/core";

const c = initContract();

export const bansContract = c.router({});
