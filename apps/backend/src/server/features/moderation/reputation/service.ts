import { prisma } from "src/prisma/client";
import { Prisma } from "#prisma/client";
// ============================================================================
//  badPostingBehavior
// ============================================================================
const incrementUserBadPostStats = async (authorId: string) => {
  const behaviorRecord = await prisma.bad_Posting_Behavior.findFirst({
    where: { userId: authorId },
  });

  if (behaviorRecord) {
    return await prisma.bad_Posting_Behavior.update({
      where: { id: behaviorRecord.id },
      data: { bad_post_count: { increment: 1 } },
    });
  }

  return await prisma.bad_Posting_Behavior.create({
    data: {
      userId: authorId,
      bad_post_count: 1,
    },
  });
};
// ----------------------------------------------------------------------------
const incrementUserFlagStats = async (authorId: string) => {
  const record = await prisma.bad_Posting_Behavior.findFirst({
    where: { userId: authorId },
  });

  if (record) {
    return await prisma.bad_Posting_Behavior.update({
      where: { id: record.id },
      data: { post_flag_count: { increment: 1 } },
    });
  }

  return await prisma.bad_Posting_Behavior.create({
    data: {
      userId: authorId,
      post_flag_count: 1,
    },
  });
};
// ----------------------------------------------------------------------------
const getAuthorFromIdea = async (ideaId: number) => {
  const idea = await prisma.idea.findUnique({
    where: { id: ideaId },
    select: { authorId: true },
  });

  if (!idea) {
    return {
      error: {
        status: 400 as const,
        body: {
          message: "Idea not found",
          details: { errorMessage: "Idea not found", errorStack: "" },
        },
      },
    };
  }
  return { authorId: idea.authorId };
};
// ----------------------------------------------------------------------------
const resetUserBadPostStats = async (
  userId: string,
): Promise<Prisma.BatchPayload> => {
  return await prisma.bad_Posting_Behavior.updateMany({
    where: { userId },
    data: {
      bad_post_count: 0,
      post_flag_count: 0,
    },
  });
};
// ----------------------------------------------------------------------------
const evaluateAndApplyUserBan = async (userId: string): Promise<boolean> => {
  const behavior = await prisma.bad_Posting_Behavior.findFirst({
    where: { userId },
  });

  // 1. Check if record exists and if either threshold is hit
  if (
    behavior &&
    (behavior.bad_post_count >= 3 || behavior.post_flag_count >= 3)
  ) {
    // 2. Update the specific record found using its unique ID
    await prisma.bad_Posting_Behavior.update({
      where: { id: behavior.id },
      data: { post_comment_ban: true },
    });

    return true; // Successfully applied ban
  }

  return false; // Criteria not met or user record not found
};
// ----------------------------------------------------------------------------
const getIdsFromBehaviorTable = async (): Promise<string[]> => {
  const records = await prisma.bad_Posting_Behavior.findMany({
    select: { userId: true },
  });

  // Extract the flat list of string IDs from the objects
  return records.map((record) => record.userId);
};
// ----------------------------------------------------------------------------
// const getUserBehaviorRecord = async (userId: string) => {
//   return await prisma.bad_Posting_Behavior.findFirst({
//     where: { userId },
//   });
// };
// ----------------------------------------------------------------------------

const syncAllUsersToThreshold = async () => {
  // 1. Fetch the threshold (ID 3 per legacy requirements)
  const thresholdRecord = await prisma.threshhold.findUnique({
    where: { id: 3 },
  });

  if (!thresholdRecord) {
    throw new Error("Global threshold configuration (ID: 3) not found.");
  }

  /**
   * 2. Batch Update
   * We can't do math (A + B >= C) inside a standard Prisma updateMany easily
   * without raw SQL, so we fetch the IDs that need updating first.
   */
  const offenders = await prisma.bad_Posting_Behavior.findMany({
    where: {
      post_comment_ban: false, // Only check those not already banned
    },
  });

  const idsToBan = offenders
    .filter(
      (u) => u.bad_post_count + u.post_flag_count >= thresholdRecord.number,
    )
    .map((u) => u.userId);

  if (idsToBan.length > 0) {
    await prisma.bad_Posting_Behavior.updateMany({
      where: { userId: { in: idsToBan } },
      data: { post_comment_ban: true },
    });
  }

  return idsToBan.length;
};
// ============================================================================
// falseFlaggingBehavior
// ============================================================================
// ----------------------------------------------------------------------------
//  SERVICES
// ----------------------------------------------------------------------------
const processFalseFlaggingBans = async () => {
  const thresholdRecord = await prisma.threshhold.findUnique({
    where: { id: 2 },
  });

  if (!thresholdRecord) {
    throw new Error(
      "False flagging threshold configuration (ID: 2) not found.",
    );
  }

  const behaviors = await prisma.false_Flagging_Behavior.findMany();

  const updates = behaviors
    .filter((user) => user.flag_count >= thresholdRecord.number)
    .map((user) =>
      prisma.false_Flagging_Behavior.update({
        where: { id: user.id },
        data: { flag_ban: true },
      }),
    );

  await Promise.all(updates);
  return updates.length;
};
// ----------------------------------------------------------------------------
// TODO: determine if further fields should be SELECTed
// keeping it lean to start to minimize database load
const fetchFalseFlaggingIds = async () => {
  return await prisma.false_Flagging_Behavior.findMany({
    select: {
      userId: true,
    },
  });
};

export {
  //badPostingBehavior
  incrementUserBadPostStats,
  incrementUserFlagStats,
  getAuthorFromIdea,
  resetUserBadPostStats,
  evaluateAndApplyUserBan,
  getIdsFromBehaviorTable,
  syncAllUsersToThreshold,
  //falseFlaggingBehavior
  processFalseFlaggingBans,
  fetchFalseFlaggingIds,
};
