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

const c = initContract();

export const reputationContract = c.router({});
