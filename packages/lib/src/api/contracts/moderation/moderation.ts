/* 
//this contract is getting rather long...breaking into subcontracts

shared/contracts/moderation/
├── index.ts                # The main entry point (Barrel file)
├── bans.contract.ts        # User, Post, and Comment bans
├── flags.contract.ts       # Idea and Comment flagging
└── reputation.contract.ts  # Bad behavior & false flagging stats 
*/
import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();

//issues:
//confirm names and structure - very inconsistent between types
//should banMessage be included in tables, or automatic?

//need to sanity check these fields
export const BadPostingBehaviourSchema = z.object({
  bad_post_count: z.number(),
  bannedAt: z.date(),
  bannedUntil: z.date(),
  id: z.number(),
  postCommentBan: z.boolean(),
  postFlagCount: z.number(),
  userId: z.number(),
});

//if ideaId and commentId are tracking a user's bans, shouldn't they be arrays?
export const BanHistorySchema = z.object({
  commentId: z.number(),
  createdAt: z.date(),
  id: z.number(),
  ideaId: z.number(),
  message: z.string(), //name: banMessage elsewhere
  modId: z.number(), //name: bannedBy elsewhere
  reason: z.string(), //name: banReason elsewhere
  type: z.string(), //name: banType elsewhere
  userBannedUntil: z.date(), //name: banUntil elsewhere, too verbose
  userId: z.number(),
});

export const CommentBanSchema = z.object({
  authorId: z.number(),
  commentId: z.number(),
  banMessage: z.string(),
  bannedBy: z.string(),
  banReason: z.string(),
  createdAt: z.date(),
  id: z.number(),
  notificationDismissed: z.boolean(), //z.transformed => isRead in bans.ts
  postId: z.number(),
});

export const CommentFlagSchema = z.object({
  falseFlag: z.boolean(),
  flaggerId: z.number(),
  flagReason: z.string(),
  id: z.number(),
  ideaId: z.number(),
});

//handles the questionably-named False_Flagging_Behaviour table
export const FalseFlagSchema = z.object({
  bannedAt: z.boolean(),
  bannedUntil: z.date(), //banUntil elsewhere
  flagBan: z.boolean(),
  flagCount: z.number(),
  id: z.number(),
  userId: z.number(),
});

export const IdeaFlagSchema = z.object({
  falseFlag: z.boolean(),
  flaggerId: z.number(),
  flagReason: z.string(),
  id: z.number(),
  ideaId: z.number(),
});

export const PostBanSchema = z.object({
  authorId: z.number(),
  banDuration: z.number(),
  banMessage: z.string(),
  bannedBy: z.string(),
  banReason: z.string(),
  banType: z.string(), //constants/bans.ts added
  banUntil: z.date(),
  createdAt: z.date(),
  id: z.number(),
  notificationDismissed: z.boolean(), //needs a better name
  postId: z.number(),
});

export const ReportSchema = z.object({
  createdAt: z.date(),
  description: z.string(),
  email: z.string(),
  id: z.number(),
  updatedAt: z.date(),
});

export const UserBanSchema = z.object({
  banDuration: z.number(),
  banMessage: z.string(),
  bannedBy: z.string(),
  banReason: z.string(),
  banType: z.string(), //constants/bans.ts added
  banUntil: z.date(),
  createdAt: z.date(),
  id: z.number(),
  notificationDismissed: z.boolean(), //needs a better name
  userId: z.number(),
});

//=============================================================================
//ROUTES
//=============================================================================
export const moderationApiContracts = c.router({
  //=============================================================================
  //badPostingBehaviour
  //=============================================================================
  incrementBadPostCount: {
    method: "POST", // POST is safer for non-idempotent increments
    path: "/moderation/bad-posts/:ideaId",
    pathParams: z.object({
      ideaId: z.coerce.number(), // Replaces parseInt(ideaId)
    }),
    body: z.object({}), // No body needed for this specific action
    responses: {
      200: z.object({ message: z.string() }),
      404: z.object({ message: z.string() }),
    },
    summary: "Increments the bad post counter for an idea author",
  },
});
