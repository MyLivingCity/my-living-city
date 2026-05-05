import { Prisma, SegmentType /*,  UserType */ } from "#prisma/client";
import { prisma } from "src/prisma/client";
import z from "zod";
import { DecimalLikeSchema } from "@mlc/lib/api/common";
import { segmentApiContracts, SegmentSchema } from "@mlc/lib/api";
import { authorizeUser } from "../admin/service";

type DecSchema = z.infer<typeof DecimalLikeSchema>;
// ============================================================================
// segment
// ============================================================================
const updateSegment = async (
  userId: string,
  segmentId: number,
  // Using the type directly from the contract's body to ensure compatibility
  data: z.infer<typeof segmentApiContracts.segment.update.body>,
) => {
  await authorizeUser(userId);

  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== undefined),
  );

  await prisma.segments.update({
    where: { segId: segmentId },
    data: {
      ...(cleanData as Prisma.SegmentsUncheckedUpdateInput),
      updatedAt: new Date(),
    },
  });

  // Fetch the result
  const result = await prisma.segments.findUnique({
    where: { segId: segmentId },
  });

  if (!result) throw new Error("Segment not found");

  // Parse through Zod to ensure it matches the schema (dates/decimals converted)
  return SegmentSchema.parse(result);
};
// ----------------------------------------------------------------------------

// ----------------------------------------------------------------------------
const deleteSegment = async (userId: string, segmentId: number) => {
  await authorizeUser(userId);

  const segment = await prisma.segments.findUnique({
    where: { segId: segmentId },
  });

  if (!segment) throw new Error("NOT_FOUND");

  return await prisma.$transaction(async (tx) => {
    // 1. Delete 1-to-1 relations (Strictly dependent data)
    await tx.segmentAdPrice.deleteMany({
      where: { segmentId },
    });

    // 2. Unlink SubGroups (Preserves the groups)
    await tx.subGroup.updateMany({
      where: {
        OR: [
          { regionId: segmentId },
          { segmentId: segmentId },
          { subSegmentId: segmentId },
        ],
      },
      data: {
        regionId: null,
        segmentId: null,
        subSegmentId: null,
      },
    });

    // 3. Orphan children (Safe: moves them to top-level)
    await tx.segments.updateMany({
      where: { parentId: segmentId },
      data: { parentId: null },
    });

    // 4. Delete the actual segment
    // Note: Prisma automatically cleans up the "IdeaToSegments" join table
    return await tx.segments.delete({
      where: { segId: segmentId },
    });
  });
};
// ============================================================================
// subSegment
// ============================================================================
const createSubSegmentEntry = async (
  userId: string,
  data: {
    segId: number;
    name: string;
    lat?: DecSchema | null;
    lon?: DecSchema | null;
    radius?: DecSchema | null;
  },
) => {
  await authorizeUser(userId);

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
// ----------------------------------------------------------------------------
const getSubSegmentsByParentId = async (segmentId: number) => {
  return await prisma.segments.findMany({
    where: {
      parentId: segmentId,
    },
  });
};
// ============================================================================
// superSegment
// ============================================================================
const superSegmentService = {
  create: async (
    userId: string,
    data: { name: string; country?: string | null; province?: string | null },
  ) => {
    await authorizeUser(userId);
    return await prisma.segments.create({
      data: {
        ...data,
        segmentType: SegmentType.superSegment,
      },
    });
  },

  getAll: async () => {
    return await prisma.segments.findMany({
      where: { segmentType: SegmentType.superSegment },
    });
  },

  getByLocation: async (country: string, province: string) => {
    return await prisma.segments.findFirst({
      where: { country, province, segmentType: SegmentType.superSegment },
    });
  },

  // Re-uses your delete logic but adds a type-check guard
  delete: async (userId: string, segId: number) => {
    await authorizeUser(userId);
    const target = await prisma.segments.findUnique({ where: { segId } });

    if (!target) throw new Error("NOT_FOUND");
    if (target.segmentType !== SegmentType.superSegment)
      throw new Error("Method only allowed for SuperSegments");

    return await deleteSegment(userId, segId); // Reuse the logic we just built!
  },
  getSuperSegmentById: async (segId: number) => {
    return await prisma.segments.findFirst({
      where: {
        segId,
        segmentType: SegmentType.superSegment, // Adjust to your actual Enum value
      },
    });
  },
  updateSuperSegment: async (
    userId: string,
    segmentId: number,
    // Using the type directly from the contract's body to ensure compatibility
    data: z.infer<typeof segmentApiContracts.superSegment.update.body>,
  ) => {
    await authorizeUser(userId);

    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== undefined),
    );

    await prisma.segments.update({
      where: { segId: segmentId },
      data: {
        ...(cleanData as Prisma.SegmentsUncheckedUpdateInput),
        updatedAt: new Date(),
      },
    });

    // Fetch the result
    const result = await prisma.segments.findUnique({
      where: { segId: segmentId },
    });

    if (!result) throw new Error("Segment not found");

    // Parse through Zod to ensure it matches the schema (dates/decimals converted)
    return SegmentSchema.parse(result);
  },
};

export {
  updateSegment,
  createSubSegmentEntry,
  deleteSegment,
  getAllSubSegments,
  getSubSegmentBySegId,
  getSubSegmentsByParentId,
  superSegmentService,
};
