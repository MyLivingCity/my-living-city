import { /* Prisma, */ SegmentType /*,  UserType */ } from "#prisma/client";
import { prisma } from "src/prisma/client";
import z from "zod";
import { DecimalLikeSchema } from "@mlc/lib/api/common";
import { authorizeUser } from "../admin/service";

type Dec = z.infer<typeof DecimalLikeSchema>;
// ============================================================================
// subSegment
// ============================================================================
const createSubSegmentEntry = async (
  userId: string,
  data: {
    segId: number;
    name: string;
    lat?: Dec | string | null;
    lon?: Dec | string | null;
    radius?: Dec | string | null;
  },
) => {
  const isAdmin = await authorizeUser(userId);

  if (!isAdmin) {
    throw new Error("Insufficient permissions");
  }

  const parentExists = await prisma.segments.findUnique({
    where: { segId: data.segId },
  });

  if (!parentExists) {
    throw new Error("The provided parent segment ID does not exist");
  }

  return await prisma.segments.create({
    data: {
      name: data.name,
      segmentType: SegmentType.subSegment,
      lat: data.lat ?? null,
      lon: data.lon ?? null,
      radius: data.radius ?? null,
      parentSegment: {
        connect: { segId: data.segId },
      },
    },
  });
};
// ----------------------------------------------------------------------------
const deleteSubSegmentEntry = async (userId: string, subSegmentId: number) => {
  const isAdmin = await authorizeUser(userId);

  if (!isAdmin) {
    throw new Error("Insufficient permissions");
  }

  // Remember: subSegments are just records in the Segments table with a parentId
  const subSegment = await prisma.segments.findUnique({
    where: { segId: subSegmentId },
  });

  if (!subSegment) {
    throw new Error("Subsegment not found");
  }

  await prisma.segments.delete({
    where: { segId: subSegmentId },
  });

  return { success: true };
};
// ----------------------------------------------------------------------------
const getAllSubSegments = async () => {
  return await prisma.segments.findMany({
    where: {
      segmentType: SegmentType.subSegment,
    },
  });
};
// ----------------------------------------------------------------------------
const getSubSegmentBySegId = async (subSegmentId: number) => {
  return await prisma.segments.findUnique({
    where: {
      segId: subSegmentId,
      segmentType: SegmentType.subSegment,
    },
  });
};
// ============================================================================
// superSegment
// ============================================================================
export {
  createSubSegmentEntry,
  deleteSubSegmentEntry,
  getAllSubSegments,
  getSubSegmentBySegId,
};
