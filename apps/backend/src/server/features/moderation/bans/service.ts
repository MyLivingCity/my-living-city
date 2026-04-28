import { prisma } from "src/prisma/client";
import { Prisma } from "#prisma/client";
import {
  BanTypeSchema,
  BanUserType,
} from "@mlc/lib/api/contracts/moderation/bans";
// ============================================================================
// banComment
// ============================================================================
const executeCommentBan = async (data: {
  commentId: number;
  authorId: string;
  banReason: string;
  banMessage: string;
  moderatorId: string;
  ideaId: number;
}) => {
  const createdAt = new Date();

  // We use a transaction to ensure both logs are created or neither are
  return await prisma.$transaction(async (tx) => {
    const createdBan = await tx.commentBan.create({
      data: {
        commentId: data.commentId,
        authorId: data.authorId,
        banReason: data.banReason,
        banMessage: data.banMessage,
        bannedBy: data.moderatorId,
        createdAt: createdAt,
      },
    });

    await tx.ban_History.create({
      data: {
        userId: data.authorId,
        type: "COMMENT", // Assuming BanType.COMMENT string value
        reason: data.banReason,
        ideaId: data.ideaId,
        commentId: data.commentId,
        modId: data.moderatorId,
        message: data.banMessage,
        createdAt: createdAt,
      },
    });

    return createdBan;
  });
};
// ----------------------------------------------------------------------------
const updateNotificationStatus = async (banCommentId: number) => {
  return await prisma.commentBan.update({
    where: { id: banCommentId },
    data: { notificationDismissed: true },
  });
};
// ----------------------------------------------------------------------------

const fetchCommentBanByCommentId = async (commentId: number) => {
  return await prisma.commentBan.findFirst({
    where: { commentId },
  });
};
// ----------------------------------------------------------------------------
const fetchUndismissedBans = async (authorId: string) => {
  return await prisma.commentBan.findMany({
    where: {
      notificationDismissed: false,
      authorId: authorId,
    },
    include: {
      comment: true, // Includes the related IdeaComment
    },
  });
};
// ----------------------------------------------------------------------------
const deleteCommentBanByCommentId = async (commentId: number) => {
  const foundBan = await prisma.commentBan.findFirst({
    where: { commentId },
  });

  if (!foundBan) return null;

  return await prisma.commentBan.delete({
    where: { id: foundBan.id },
  });
};
// ============================================================================
// banPost
// ============================================================================
const fetchPostBanByPostId = async (postId: number) => {
  return await prisma.postBan.findFirst({
    where: { postId },
  });
};
// ----------------------------------------------------------------------------

const fetchUndismissedPostBans = async (authorId: string) => {
  return await prisma.postBan.findMany({
    where: {
      notificationDismissed: false,
      authorId: authorId,
    },
    include: {
      post: true,
    },
  });
};
// ----------------------------------------------------------------------------
const executePostBan = async (data: {
  postId: number;
  authorId: string;
  banReason: string;
  banMessage: string;
  moderatorId: string;
}) => {
  const createdAt = new Date(); // Internal timestamping

  return await prisma.$transaction(async (tx) => {
    const createdBan = await tx.postBan.create({
      data: {
        postId: data.postId,
        authorId: data.authorId,
        banReason: data.banReason,
        banMessage: data.banMessage,
        bannedBy: data.moderatorId,
        createdAt,
      },
    });

    await tx.ban_History.create({
      data: {
        userId: data.authorId,
        type: "IDEA", // Mapping BanType.IDEA per legacy ctrl
        reason: data.banReason,
        ideaId: data.postId,
        modId: data.moderatorId,
        message: data.banMessage,
        createdAt,
      },
    });

    return createdBan;
  });
};
// ----------------------------------------------------------------------------
const updatePostNotificationStatus = async (postBanId: number) => {
  return await prisma.postBan.update({
    where: { id: postBanId },
    data: { notificationDismissed: true },
  });
};
// ----------------------------------------------------------------------------
const removePostBanByPostId = async (postId: number) => {
  const foundBan = await prisma.postBan.findFirst({
    where: { postId },
  });

  if (!foundBan) return null;

  return await prisma.postBan.delete({
    where: { id: foundBan.id },
  });
};
// ============================================================================
// banUser
// ============================================================================
const executeUserBan = async (data: {
  userId: string;
  banType: BanUserType;
  banDurationDays: number;
  banReason: string;
  banMessage: string;
  moderatorId: string;
}) => {
  const createdAt = new Date();
  // Equivalent to legacy logic: duration in days -> ms
  const banUntil = new Date(
    createdAt.getTime() + data.banDurationDays * 24 * 60 * 60 * 1000,
  );

  return await prisma.$transaction(async (tx) => {
    // 1. Create the active ban record
    const createdBan = await tx.userBan.create({
      data: {
        userId: data.userId,
        banType: data.banType,
        banReason: data.banReason,
        banMessage: data.banMessage,
        bannedBy: data.moderatorId,
        banDuration: data.banDurationDays,
        banUntil: banUntil,
        createdAt: createdAt,
      },
    });

    // 2. Log to ban history (using "USER" type for the audit trail)
    await tx.ban_History.create({
      data: {
        userId: data.userId,
        type: BanTypeSchema.enum.USER,
        reason: data.banReason,
        userBanType: data.banType,
        userBannedUntil: banUntil,
        modId: data.moderatorId,
        message: data.banMessage,
        createdAt: createdAt,
      },
    });

    // 3. Update the User model status
    await tx.user.update({
      where: { id: data.userId },
      data: { banned: true },
    });

    return createdBan;
  });
};
// ----------------------------------------------------------------------------
const fetchAllUserBans = async () => {
  return await prisma.userBan.findMany();
};
// ----------------------------------------------------------------------------
const fetchUserBanHistory = async (userId: string) => {
  return await prisma.userBan.findMany({
    where: { userId },
    orderBy: { id: "desc" },
  });
};
// ----------------------------------------------------------------------------
const fetchMostRecentUserBan = async (userId: string) => {
  return await prisma.userBan.findFirst({
    where: { userId },
    orderBy: { id: "desc" },
  });
};
// ----------------------------------------------------------------------------
const fetchSelfBanRecord = async (userId: string) => {
  return await prisma.userBan.findFirst({
    where: { userId },
    orderBy: { id: "desc" },
  });
};
// ----------------------------------------------------------------------------
const updateLatestUserBan = async (
  userId: string,
  data: Partial<Prisma.UserBanUpdateInput>,
) => {
  const latestBan = await prisma.userBan.findFirst({
    where: { userId },
    orderBy: { id: "desc" },
  });

  if (!latestBan) return null;

  return await prisma.userBan.update({
    where: { id: latestBan.id },
    data,
  });
};
// ----------------------------------------------------------------------------
const executeUserUnban = async (userId: string) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Remove all records from the userBan table for this user
    const deleteResult = await tx.userBan.deleteMany({
      where: { userId },
    });

    // 2. Update the main user record to lift the ban flag
    await tx.user.update({
      where: { id: userId },
      data: { banned: false },
    });

    return deleteResult.count;
  });
};
// ----------------------------------------------------------------------------
const fetchExpiredUserBans = async () => {
  // 1. Get IDs of all users currently flagged as 'banned'
  const bannedUsers = await prisma.user.findMany({
    where: { banned: true },
    select: { id: true },
  });

  if (bannedUsers.length === 0) return [];

  const bannedUserIds = bannedUsers.map((u) => u.id);

  // 2. Find the single most recent ban for each of those users
  const latestBans = await prisma.userBan.findMany({
    where: {
      userId: { in: bannedUserIds },
    },
    orderBy: { id: "desc" },
    distinct: ["userId"],
  });

  // 3. Filter the set down to those that have actually passed their expiry date
  const now = new Date();
  return latestBans.filter(
    (ban) => ban.banUntil !== null && ban.banUntil <= now,
  );
};
// ----------------------------------------------------------------------------
/**
 * Service to batch-remove expired bans and restore user access.
 * Handles the table cleanup and ensures the User 'banned' flag is reset.
 */
const cleanupExpiredBans = async () => {
  const now = new Date();

  return await prisma.$transaction(async (tx) => {
    // 1. Identify which users are about to be unbanned (for the User table update)
    const expiredBans = await tx.userBan.findMany({
      where: { banUntil: { lte: now } },
      select: { userId: true },
    });

    const userIdsToRestore = expiredBans.map((b) => b.userId);

    // 2. Remove the expired records from UserBan
    const deleteResult = await tx.userBan.deleteMany({
      where: { banUntil: { lte: now } },
    });

    // 3. Set 'banned' to false for those users in the main User table
    if (userIdsToRestore.length > 0) {
      await tx.user.updateMany({
        where: { id: { in: userIdsToRestore } },
        data: { banned: false },
      });
    }

    return deleteResult.count;
  });
};

export {
  //banComment
  executeCommentBan,
  updateNotificationStatus,
  fetchCommentBanByCommentId,
  fetchUndismissedBans,
  deleteCommentBanByCommentId,
  //banPost
  fetchPostBanByPostId,
  fetchUndismissedPostBans,
  executePostBan,
  updatePostNotificationStatus,
  removePostBanByPostId,
  //banUser
  executeUserBan,
  fetchAllUserBans,
  fetchUserBanHistory,
  fetchMostRecentUserBan,
  fetchSelfBanRecord,
  updateLatestUserBan,
  executeUserUnban,
  fetchExpiredUserBans,
  cleanupExpiredBans,
};
