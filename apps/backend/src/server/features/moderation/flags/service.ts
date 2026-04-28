import { prisma } from "src/prisma/client";
import { Prisma, Idea } from "#prisma/client";

// ============================================================================
// commentFlag
// ============================================================================
const fetchAllCommentFlags = async () => {
  return await prisma.commentFlag.findMany();
};
// ----------------------------------------------------------------------------
const countCommentFlagsByCommentId = async (commentId: number) => {
  return await prisma.commentFlag.count({
    where: {
      commentId,
    },
  });
};
// ----------------------------------------------------------------------------
const findIdeaCommentById = async (id: number) => {
  return await prisma.ideaComment.findUnique({ where: { id } });
};
// ----------------------------------------------------------------------------
const findExistingCommentFlag = async (
  flaggerId: string,
  commentId: number,
) => {
  return await prisma.commentFlag.findFirst({
    where: { flaggerId, commentId },
  });
};
// ----------------------------------------------------------------------------
const createCommentFlag = async (data: {
  flaggerId: string;
  commentId: number;
  flagReason: string;
}) => {
  return await prisma.commentFlag.create({ data });
};
// ----------------------------------------------------------------------------
const updateManyCommentFlags = async (
  commentId: number,
  isFalse: boolean,
): Promise<Prisma.BatchPayload> => {
  return await prisma.commentFlag.updateMany({
    where: { commentId },
    data: { falseFlag: isFalse },
  });
};
// ----------------------------------------------------------------------------
const upsertFalseFlaggingBehavior = async (userId: string) => {
  const behavior = await prisma.false_Flagging_Behavior.findFirst({
    where: { userId },
  });

  if (behavior) {
    return await prisma.false_Flagging_Behavior.update({
      where: { id: behavior.id },
      data: { flag_count: behavior.flag_count + 1 },
    });
  }

  return await prisma.false_Flagging_Behavior.create({
    data: { userId, flag_count: 1 },
  });
};
// ----------------------------------------------------------------------------
const applyFalseFlaggingBans = async () => {
  const threshold = await prisma.threshhold.findUnique({ where: { id: 2 } });
  if (!threshold) return;

  const usersAboveThreshold = await prisma.false_Flagging_Behavior.findMany({
    where: { flag_count: { gte: threshold.number } },
  });

  await Promise.all(
    usersAboveThreshold.map((user) =>
      prisma.false_Flagging_Behavior.update({
        where: { id: user.id },
        data: { flag_ban: true },
      }),
    ),
  );
};
// ============================================================================
// flag
// ============================================================================
const findIdeaById = async (id: number): Promise<Idea | null> => {
  return await prisma.idea.findUnique({ where: { id } });
};
// ----------------------------------------------------------------------------
const findExistingIdeaFlag = async (flaggerId: string, ideaId: number) => {
  return await prisma.ideaFlag.findFirst({
    where: { flaggerId, ideaId },
  });
};
// ----------------------------------------------------------------------------
const createIdeaFlag = async (data: {
  flaggerId: string;
  ideaId: number;
  flagReason: string;
  falseFlag: boolean;
}) => {
  return await prisma.ideaFlag.create({ data });
};
// ----------------------------------------------------------------------------
const fetchAllIdeaFlags = async () => {
  return await prisma.ideaFlag.findMany();
};
// ----------------------------------------------------------------------------
const updateManyIdeaFlags = async (
  ideaId: number,
  isFalse: boolean,
): Promise<Prisma.BatchPayload> => {
  return await prisma.ideaFlag.updateMany({
    where: { ideaId },
    data: { falseFlag: isFalse },
  });
};
// ----------------------------------------------------------------------------
const countIdeaFlagsByIdeaId = async (ideaId: number) => {
  return await prisma.ideaFlag.count({
    where: {
      ideaId,
    },
  });
};
// ----------------------------------------------------------------------------
const findFalseFlaggingBehaviorByUserId = async (userId: string) => {
  return await prisma.false_Flagging_Behavior.findFirst({
    where: { userId },
  });
};

export {
  //commentFlag
  fetchAllCommentFlags,
  countCommentFlagsByCommentId,
  findIdeaCommentById,
  findExistingCommentFlag,
  createCommentFlag,
  updateManyCommentFlags,
  upsertFalseFlaggingBehavior,
  applyFalseFlaggingBans,
  //flag
  findIdeaById,
  findExistingIdeaFlag,
  createIdeaFlag,
  fetchAllIdeaFlags,
  updateManyIdeaFlags,
  countIdeaFlagsByIdeaId,
  findFalseFlaggingBehaviorByUserId,
};
