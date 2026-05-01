import { prisma } from "src/prisma/client";
// ============================================================================
// workDetails
// ============================================================================
const createSchoolDetailsEntry = async (data: {
  streetAddress: string | null;
  postalCode: string | null;
  faculty: string | null;
  programCompletionDate: Date | null;
  userId: string;
}) => {
  return await prisma.school_Details.create({
    data: {
      streetAddress: data.streetAddress || null,
      postalCode: data.postalCode || null,
      faculty: data.faculty || null,
      programCompletionDate: data.programCompletionDate || null,
      userId: data.userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      displayFName: null,
      displayLName: null,
    },
  });
};
// ----------------------------------------------------------------------------
const deleteSchoolDetailsAndSegments = async (userId: string) => {
  const schoolDetails = await prisma.school_Details.findFirst({
    where: { userId },
  });

  if (!schoolDetails) {
    return { success: false, error: "School details not found" };
  }

  // Delete school details by its unique ID
  await prisma.school_Details.delete({
    where: { id: schoolDetails.id },
  });

  // Cleanup related user segments
  await prisma.userSegments.deleteMany({
    where: {
      userId,
      userSegmentRelationship: "SCHOOL",
    },
  });

  return { success: true };
};
// ----------------------------------------------------------------------------
const getSchoolDetailsByUserId = async (userId: string) => {
  // Prisma findFirst returns null if not found
  return await prisma.school_Details.findFirst({
    where: {
      userId: userId,
    },
  });
};
// ----------------------------------------------------------------------------
const upsertSchoolDetailsAndHandle = async (
  userId: string,
  data: {
    streetAddress?: string | null;
    postalCode?: string | null;
    displayFName?: string | null;
    displayLName?: string | null;
  },
) => {
  const profile = await prisma.school_Details.findFirst({
    where: { userId },
  });

  let schoolDetails;

  if (!profile) {
    // Create logic
    schoolDetails = await prisma.school_Details.create({
      data: {
        streetAddress: data.streetAddress || null,
        postalCode: data.postalCode || null,
        displayFName: data.displayFName || null,
        displayLName: data.displayLName || null,
        userId: userId,
      },
    });
  } else {
    // Update logic
    schoolDetails = await prisma.school_Details.update({
      where: { id: profile.id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    // Handle sync logic
    if (data.displayFName || data.displayLName) {
      await prisma.userHandle.updateMany({
        where: {
          userId: userId,
          userSegmentRelationship: "SCHOOL",
        },
        data: {
          handle: `${data.displayFName ?? ""}@${data.displayLName ?? ""}`,
        },
      });
    }
  }

  return schoolDetails;
};
// ----------------------------------------------------------------------------
/**
 * Inserts or updates a user segment entry in the UserSegments table.
 *
 * If segmentId is null, we skip creation but allow updates (clearing the link).
 */
const upsertUserSegment = async (
  existing: { id: number } | null | undefined,
  userId: string,
  segmentId: number,
  relationship: "HOME" | "WORK" | "SCHOOL",
) => {
  // If no record exists and no segmentId is provided, there is nothing to do.
  if (!existing && segmentId === null) return;

  if (existing) {
    return await prisma.userSegments.update({
      where: { id: existing.id },
      data: { segmentId },
    });
  }

  return await prisma.userSegments.create({
    data: {
      userId,
      userSegmentRelationship: relationship,
      segmentId: segmentId!, // Non-null assertion safe due to check above
    },
  });
};
// ----------------------------------------------------------------------------
const updateSchoolCityAndNeighbourhood = async (
  userId: string,
  data: { city: string; neighbourhood: string },
) => {
  // 1. Find the target segments
  const city = await prisma.segments.findFirst({
    where: { name: { equals: data.city, mode: "insensitive" } },
  });

  const neighbourhood = await prisma.segments.findFirst({
    where: { name: { equals: data.neighbourhood, mode: "insensitive" } },
  });

  if (!neighbourhood) {
    throw new Error("A neighbourhood is required.");
  }

  const segmentId = city ? city.segId : null;
  const subSegmentId = neighbourhood.segId;

  // 2. Find existing user segment links for this relationship
  const [userCitySegment, userNeighbourhoodSegment] = await Promise.all([
    prisma.userSegments.findFirst({
      where: {
        userId,
        userSegmentRelationship: "SCHOOL",
        segment: { segmentType: "segment" },
      },
    }),
    prisma.userSegments.findFirst({
      where: {
        userId,
        userSegmentRelationship: "SCHOOL",
        segment: { segmentType: "subSegment" },
      },
    }),
  ]);

  // 3. Execute upserts (assuming upsertUserSegment is available globally/imported)
  await upsertUserSegment(userCitySegment, userId, segmentId!, "SCHOOL");
  await upsertUserSegment(
    userNeighbourhoodSegment,
    userId,
    subSegmentId,
    "SCHOOL",
  );

  return { message: "City and neighbourhood successfully updated" };
};
// ============================================================================
// workDetails
// ============================================================================
const createWorkDetailsEntry = async (data: {
  streetAddress: string | null;
  postalCode: string | null;
  company: string | null;
  userId: string;
}) => {
  return await prisma.work_Details.create({
    data: {
      streetAddress: data.streetAddress,
      postalCode: data.postalCode,
      company: data.company,
      userId: data.userId,
    },
  });
};
// ----------------------------------------------------------------------------
const deleteWorkDetailsAndSegments = async (userId: string) => {
  const workDetails = await prisma.work_Details.findFirst({
    where: { userId },
  });

  if (!workDetails) {
    return { success: false, error: "Work details not found" };
  }

  // Delete work details by unique ID
  await prisma.work_Details.delete({
    where: { id: workDetails.id },
  });

  // Cleanup work-related user segments
  await prisma.userSegments.deleteMany({
    where: {
      userId,
      userSegmentRelationship: "WORK",
    },
  });

  return { success: true };
};
// ----------------------------------------------------------------------------
const getWorkDetailsByUserId = async (userId: string) => {
  return await prisma.work_Details.findFirst({
    where: {
      userId,
    },
  });
};
// ----------------------------------------------------------------------------
const upsertWorkDetailsAndHandle = async (
  userId: string,
  data: {
    streetAddress?: string | null;
    postalCode?: string | null;
    displayFName?: string | null;
    displayLName?: string | null;
  },
) => {
  const profile = await prisma.work_Details.findFirst({
    where: { userId },
  });

  let workDetails;

  if (!profile) {
    // Create logic
    workDetails = await prisma.work_Details.create({
      data: {
        streetAddress: data.streetAddress ?? null,
        postalCode: data.postalCode ?? null,
        displayFName: data.displayFName ?? null,
        displayLName: data.displayLName ?? null,
        userId: userId,
      },
    });
  } else {
    // Update logic
    workDetails = await prisma.work_Details.update({
      where: { id: profile.id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    // Handle sync logic for WORK relationship
    if (data.displayFName || data.displayLName) {
      await prisma.userHandle.updateMany({
        where: {
          userId: userId,
          userSegmentRelationship: "WORK",
        },
        data: {
          handle: `${data.displayFName ?? ""}@${data.displayLName ?? ""}`,
        },
      });
    }
  }

  return workDetails;
};
// ----------------------------------------------------------------------------
const updateWorkCityAndNeighbourhood = async (
  userId: string,
  data: { city: string; neighbourhood: string },
) => {
  // 1. Find the target segments with case-insensitive name matching
  const city = await prisma.segments.findFirst({
    where: { name: { equals: data.city, mode: "insensitive" } },
  });

  const neighbourhood = await prisma.segments.findFirst({
    where: { name: { equals: data.neighbourhood, mode: "insensitive" } },
  });

  if (!neighbourhood) {
    throw new Error("A neighbourhood is required.");
  }

  const segmentId = city ? city.segId : null;
  const subSegmentId = neighbourhood.segId;

  // 2. Locate existing WORK relationship segments for this user
  const [userCitySegment, userNeighbourhoodSegment] = await Promise.all([
    prisma.userSegments.findFirst({
      where: {
        userId,
        userSegmentRelationship: "WORK",
        segment: { segmentType: "segment" },
      },
    }),
    prisma.userSegments.findFirst({
      where: {
        userId,
        userSegmentRelationship: "WORK",
        segment: { segmentType: "subSegment" },
      },
    }),
  ]);

  // 3. Execute upserts using the WORK discriminator
  await upsertUserSegment(userCitySegment, userId, segmentId!, "WORK");
  await upsertUserSegment(
    userNeighbourhoodSegment,
    userId,
    subSegmentId,
    "WORK",
  );

  return { message: "City and neighbourhood successfully updated" };
};
// ----------------------------------------------------------------------------

export {
  //schoolDetails
  createSchoolDetailsEntry,
  deleteSchoolDetailsAndSegments,
  getSchoolDetailsByUserId,
  upsertSchoolDetailsAndHandle,
  updateSchoolCityAndNeighbourhood,
  // workDetails
  createWorkDetailsEntry,
  deleteWorkDetailsAndSegments,
  getWorkDetailsByUserId,
  upsertWorkDetailsAndHandle,
  updateWorkCityAndNeighbourhood,
};
