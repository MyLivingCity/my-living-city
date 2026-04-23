import { userSegmentsApiContracts } from "@mlc/lib/api";
import {
  Prisma,
  SegmentType,
  UserSegmentRelationShipType,
} from "@prisma/client";
import { initServer } from "@ts-rest/express";
import * as passport from "passport";
import { prisma } from "src/prisma/client";
import { Handlers } from "src/server";

const s = initServer();

type RelationshipConfig = {
  relationship: UserSegmentRelationShipType;
  segmentIdKey: keyof MutationBody;
  subSegmentIdKey: keyof MutationBody;
  denormalizedPrefix: "home" | "work" | "school";
};

type MutationBody = {
  homeSegmentId?: number;
  workSegmentId?: number;
  schoolSegmentId?: number;
  homeSubSegmentId?: number;
  workSubSegmentId?: number;
  schoolSubSegmentId?: number;
};

type LoadedSegment = {
  segId: number;
  country: string | null;
  province: string | null;
  name: string;
  createdAt: Date;
  updatedAt: Date | null;
  lat: Prisma.Decimal | null;
  lon: Prisma.Decimal | null;
  parentId: number | null;
  radius: Prisma.Decimal | null;
  segmentType: SegmentType;
  parentSegment?: LoadedSegmentParent | null;
};

type LoadedSegmentParent = {
  segId: number;
  country: string | null;
  province: string | null;
  name: string;
  createdAt: Date;
  updatedAt: Date | null;
  lat: Prisma.Decimal | null;
  lon: Prisma.Decimal | null;
  parentId: number | null;
  radius: Prisma.Decimal | null;
  segmentType: SegmentType;
  parentSegment?: LoadedSegmentGrandparent | null;
};

type LoadedSegmentGrandparent = {
  segId: number;
  country: string | null;
  province: string | null;
  name: string;
  createdAt: Date;
  updatedAt: Date | null;
  lat: Prisma.Decimal | null;
  lon: Prisma.Decimal | null;
  parentId: number | null;
  radius: Prisma.Decimal | null;
  segmentType: SegmentType;
};

type LoadedUserSegment = {
  id: number;
  userId: string;
  segmentId: number;
  userSegmentRelationship: UserSegmentRelationShipType;
  segment: LoadedSegment;
};

type SegmentAssignment = {
  relationship: UserSegmentRelationShipType;
  targetSegmentId: number;
};

const RELATIONSHIP_CONFIGS: RelationshipConfig[] = [
  {
    relationship: UserSegmentRelationShipType.HOME,
    segmentIdKey: "homeSegmentId",
    subSegmentIdKey: "homeSubSegmentId",
    denormalizedPrefix: "home",
  },
  {
    relationship: UserSegmentRelationShipType.WORK,
    segmentIdKey: "workSegmentId",
    subSegmentIdKey: "workSubSegmentId",
    denormalizedPrefix: "work",
  },
  {
    relationship: UserSegmentRelationShipType.SCHOOL,
    segmentIdKey: "schoolSegmentId",
    subSegmentIdKey: "schoolSubSegmentId",
    denormalizedPrefix: "school",
  },
];

const toErrorDetails = (error: unknown) => {
  if (error instanceof Error) {
    return {
      errorMessage: error.message,
      errorStack: error.stack ?? "",
    };
  }

  return {
    errorMessage: String(error),
    errorStack: "",
  };
};

const serializeForContract = <T>(value: T): T => {
  if (value instanceof Date) {
    return value.toISOString() as T;
  }

  if (typeof value === "bigint") {
    return value.toString() as T;
  }

  if (value instanceof Prisma.Decimal) {
    return value.toString() as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => serializeForContract(item)) as T;
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        serializeForContract(item),
      ]),
    ) as T;
  }

  return value;
};

const buildErrorResponse = (message: string, error?: unknown) => ({
  message,
  details: error
    ? toErrorDetails(error)
    : {
      errorMessage: message,
      errorStack: message,
    },
});

const asInteger = (value: unknown) =>
  typeof value === "number" && Number.isInteger(value) ? value : null;

const loadSegment = async (segId: number) =>
  prisma.segments.findUnique({
    where: { segId },
    select: {
      segId: true,
      country: true,
      province: true,
      name: true,
      createdAt: true,
      updatedAt: true,
      lat: true,
      lon: true,
      parentId: true,
      radius: true,
      segmentType: true,
      parentSegment: {
        select: {
          segId: true,
          country: true,
          province: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          lat: true,
          lon: true,
          parentId: true,
          radius: true,
          segmentType: true,
          parentSegment: {
            select: {
              segId: true,
              country: true,
              province: true,
              name: true,
              createdAt: true,
              updatedAt: true,
              lat: true,
              lon: true,
              parentId: true,
              radius: true,
              segmentType: true,
            },
          },
        },
      },
    },
  });

const loadUserSegments = async (userId: string) =>
  prisma.userSegments.findMany({
    where: { userId },
    include: {
      segment: {
        select: {
          segId: true,
          country: true,
          province: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          lat: true,
          lon: true,
          parentId: true,
          radius: true,
          segmentType: true,
          parentSegment: {
            select: {
              segId: true,
              country: true,
              province: true,
              name: true,
              createdAt: true,
              updatedAt: true,
              lat: true,
              lon: true,
              parentId: true,
              radius: true,
              segmentType: true,
              parentSegment: {
                select: {
                  segId: true,
                  country: true,
                  province: true,
                  name: true,
                  createdAt: true,
                  updatedAt: true,
                  lat: true,
                  lon: true,
                  parentId: true,
                  radius: true,
                  segmentType: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: { id: "asc" },
  });

const toSegmentSummary = (
  segment: LoadedSegment | LoadedSegmentParent | LoadedSegmentGrandparent,
) => ({
  segId: segment.segId,
  country: segment.country,
  province: segment.province,
  name: segment.name,
  createdAt: segment.createdAt,
  updatedAt: segment.updatedAt,
  lat: segment.lat,
  lon: segment.lon,
  parentId: segment.parentId,
  radius: segment.radius,
  segmentType: segment.segmentType,
});

const getMainSegmentForAssignment = (segment: LoadedSegment) => {
  if (segment.segmentType === SegmentType.segment) {
    return segment;
  }

  if (
    segment.segmentType === SegmentType.subSegment &&
    segment.parentSegment?.segmentType === SegmentType.segment
  ) {
    return segment.parentSegment;
  }

  return null;
};

const getSubSegmentForAssignment = (segment: LoadedSegment) =>
  segment.segmentType === SegmentType.subSegment ? segment : null;

const getSuperSegmentForAssignment = (segment: LoadedSegment) => {
  if (segment.segmentType === SegmentType.superSegment) {
    return segment;
  }

  if (segment.parentSegment?.segmentType === SegmentType.superSegment) {
    return segment.parentSegment;
  }

  if (
    segment.parentSegment?.parentSegment?.segmentType ===
    SegmentType.superSegment
  ) {
    return segment.parentSegment.parentSegment;
  }

  return null;
};

const buildHandle = (
  relationship: UserSegmentRelationShipType,
  user: {
    fname: string | null;
    address: { streetAddress: string | null } | null;
    Work_Details: Array<{ company: string | null }>;
    School_Details: Array<{ faculty: string | null }>;
  },
) => {
  if (!user.fname) {
    return null;
  }

  if (relationship === UserSegmentRelationShipType.HOME) {
    const streetAddress = user.address?.streetAddress;
    return streetAddress ? `${user.fname}@${streetAddress}` : null;
  }

  if (relationship === UserSegmentRelationShipType.WORK) {
    const company = user.Work_Details[0]?.company;
    return company ? `${user.fname}@${company}` : null;
  }

  const faculty = user.School_Details[0]?.faculty;
  return faculty ? `${user.fname}@${faculty}` : null;
};

const toDenormalizedUserSegment = (
  userId: string,
  rows: LoadedUserSegment[],
  handles?: Partial<Record<UserSegmentRelationShipType, string | null>>,
) => {
  const base = {
    id: rows[0]?.id ?? 0,
    userId,
  } as Record<string, unknown>;

  for (const config of RELATIONSHIP_CONFIGS) {
    const row = rows.find(
      (item) => item.userSegmentRelationship === config.relationship,
    );

    if (!row) {
      continue;
    }

    const prefix = config.denormalizedPrefix;
    const mainSegment = getMainSegmentForAssignment(row.segment);
    const subSegment = getSubSegmentForAssignment(row.segment);
    const superSegment = getSuperSegmentForAssignment(row.segment);

    if (superSegment) {
      base[`${prefix}SuperSegId`] = superSegment.segId;
      base[`${prefix}SuperSegName`] = superSegment.name;
    }

    if (mainSegment) {
      base[`${prefix}SegmentId`] = mainSegment.segId;
      base[`${prefix}SegmentName`] = mainSegment.name;
    } else if (row.segment.segmentType === SegmentType.segment) {
      base[`${prefix}SegmentId`] = row.segment.segId;
      base[`${prefix}SegmentName`] = row.segment.name;
    }

    if (subSegment) {
      base[`${prefix}SubSegmentId`] = subSegment.segId;
      base[`${prefix}SubSegmentName`] = subSegment.name;
    }

    const handle = handles?.[config.relationship];
    if (handle !== undefined) {
      base[`${prefix}SegHandle`] = handle;
    }
  }

  return base;
};

const validateAssignments = async (body: MutationBody) => {
  const assignments: SegmentAssignment[] = [];
  let error = "";
  let errorMessage = "";
  let errorStack = "";

  for (const config of RELATIONSHIP_CONFIGS) {
    const segmentIdRaw = body[config.segmentIdKey];
    const subSegmentIdRaw = body[config.subSegmentIdKey];

    if (segmentIdRaw === undefined && subSegmentIdRaw === undefined) {
      continue;
    }

    let mainSegment: LoadedSegment | null = null;

    if (segmentIdRaw !== undefined) {
      const segmentId = asInteger(segmentIdRaw);

      if (segmentId === null) {
        error += `${String(config.segmentIdKey)} must be integer.`;
        errorMessage += `${String(config.segmentIdKey)} must be provided in request body as an integer.`;
        errorStack += `${String(config.segmentIdKey)} must be provided in request body as an integer.`;
      } else {
        const foundSegment = await loadSegment(segmentId);

        if (!foundSegment) {
          error += `${String(config.segmentIdKey)} doesn't exist in the database!`;
          errorMessage += `${String(config.segmentIdKey)} must reference an existing segment id in the database.`;
          errorStack += `${String(config.segmentIdKey)} must reference an existing segment id in the database.`;
        } else {
          mainSegment = foundSegment;
        }
      }
    }

    if (subSegmentIdRaw !== undefined) {
      const subSegmentId = asInteger(subSegmentIdRaw);

      if (segmentIdRaw === undefined) {
        error += `${String(config.segmentIdKey)} must be provided if request body contains ${String(config.subSegmentIdKey)}.`;
        errorMessage +=
          "In order to assign user a subsegment, segmentId must be provided with sub segment id.";
        errorStack +=
          "In order to assign user a subsegment, segmentId must be provided with sub segment id.";
      }

      if (subSegmentId === null) {
        error += `${String(config.subSegmentIdKey)} must be integer.`;
        errorMessage += `${String(config.subSegmentIdKey)} must be provided in request body as an integer.`;
        errorStack += `${String(config.subSegmentIdKey)} must be provided in request body as an integer.`;
      } else {
        const foundSubSegment = await loadSegment(subSegmentId);

        if (
          !foundSubSegment ||
          foundSubSegment.segmentType !== SegmentType.subSegment ||
          (mainSegment && foundSubSegment.parentId !== mainSegment.segId)
        ) {
          error += `${String(config.subSegmentIdKey)} doesn't exist in the database!`;
          errorMessage += `${String(config.subSegmentIdKey)} must be provided with an existing sub segment id for the provided segment.`;
          errorStack += `${String(config.subSegmentIdKey)} must be provided with an existing sub segment id for the provided segment.`;
        } else {
          assignments.push({
            relationship: config.relationship,
            targetSegmentId: foundSubSegment.segId,
          });
          continue;
        }
      }
    }

    if (mainSegment) {
      assignments.push({
        relationship: config.relationship,
        targetSegmentId: mainSegment.segId,
      });
    }
  }

  return {
    assignments,
    error,
    errorMessage,
    errorStack,
  };
};

const getAuthenticatedUserId = (reqUser: unknown) =>
  (reqUser as { id?: string } | undefined)?.id ?? null;

const getSegmentByRelationship = async (
  userId: string,
  relationship: UserSegmentRelationShipType,
) => {
  const userRows = await loadUserSegments(userId);

  if (userRows.length === 0) {
    return {
      kind: "missing-user-segment" as const,
    };
  }

  const row = userRows.find(
    (item) => item.userSegmentRelationship === relationship,
  );

  if (!row) {
    return {
      kind: "missing-relationship" as const,
    };
  }

  return {
    kind: "found" as const,
    row,
  };
};

const getAllForAuthenticatedUser = s.route(
  userSegmentsApiContracts.getAllForAuthenticatedUser,
  {
    middleware: [passport.authenticate("jwt", { session: false })],
    handler: async ({ req }: { req: any }) => {
      try {
        const userId = getAuthenticatedUserId(req.user);

        if (!userId) {
          return {
            status: 400,
            body: {
              success: false,
              message: "User ID is required",
            },
          };
        }

        const rows = await loadUserSegments(userId);

        return {
          status: 200,
          body: {
            success: true as const,
            data: serializeForContract(rows),
          },
        };
      } catch (error) {
        return {
          status: 500,
          body: {
            success: false,
            message: "An error occurred while fetching user segments",
            error: error instanceof Error ? error.message : String(error),
          },
        };
      }
    },
  },
);

const create = s.route(userSegmentsApiContracts.create, {
  middleware: [passport.authenticate("jwt", { session: false })],
  handler: async ({ req, body }: { req: any; body: MutationBody }) => {
    try {
      const userId = getAuthenticatedUserId(req.user);

      if (!userId) {
        return {
          status: 400,
          body: buildErrorResponse("User ID is required"),
        };
      }

      const existing = await prisma.userSegments.findFirst({
        where: { userId },
      });

      if (existing) {
        return {
          status: 409,
          body: "You are not allow to create another user segment!",
        };
      }

      const validation = await validateAssignments(body);

      if (
        validation.error ||
        validation.errorMessage ||
        validation.errorStack
      ) {
        return {
          status: 400,
          body: {
            message: validation.error,
            details: {
              errorMessage: validation.errorMessage,
              errorStack: validation.errorStack,
            },
          },
        };
      }

      if (validation.assignments.length === 0) {
        return {
          status: 400,
          body: buildErrorResponse(
            "At least one segment must be provided to create a user segment.",
          ),
        };
      }

      await prisma.$transaction(
        validation.assignments.map((assignment) =>
          prisma.userSegments.create({
            data: {
              userId,
              userSegmentRelationship: assignment.relationship,
              segmentId: assignment.targetSegmentId,
            },
          }),
        ),
      );

      const [rows, user] = await Promise.all([
        loadUserSegments(userId),
        prisma.user.findUnique({
          where: { id: userId },
          select: {
            fname: true,
            address: {
              select: {
                streetAddress: true,
              },
            },
            Work_Details: {
              select: {
                company: true,
              },
              orderBy: { id: "asc" },
              take: 1,
            },
            School_Details: {
              select: {
                faculty: true,
              },
              orderBy: { id: "asc" },
              take: 1,
            },
          },
        }),
      ]);

      const handles = user
        ? {
          [UserSegmentRelationShipType.HOME]: buildHandle(
            UserSegmentRelationShipType.HOME,
            user,
          ),
          [UserSegmentRelationShipType.WORK]: buildHandle(
            UserSegmentRelationShipType.WORK,
            user,
          ),
          [UserSegmentRelationShipType.SCHOOL]: buildHandle(
            UserSegmentRelationShipType.SCHOOL,
            user,
          ),
        }
        : undefined;

      return {
        status: 200,
        body: serializeForContract(
          toDenormalizedUserSegment(
            userId,
            rows as LoadedUserSegment[],
            handles,
          ),
        ),
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "An error occured while trying to create a userSegment.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const getMine = s.route(userSegmentsApiContracts.getMine, {
  middleware: [passport.authenticate("jwt", { session: false })],
  handler: async ({ req }: { req: any }) => {
    try {
      const userId = getAuthenticatedUserId(req.user);

      if (!userId) {
        return {
          status: 400,
          body: buildErrorResponse("User ID is required"),
        };
      }

      const rows = await loadUserSegments(userId);

      if (rows.length === 0) {
        return {
          status: 404,
          body: "user segment not found!",
        };
      }

      return {
        status: 200,
        body: serializeForContract(
          toDenormalizedUserSegment(userId, rows as LoadedUserSegment[]),
        ),
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "An error occured while trying to retrieve a userSegment.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const getByUserId = s.route(userSegmentsApiContracts.getByUserId, {
  middleware: [passport.authenticate("jwt", { session: false })],
  handler: async ({ params }: { params: { userId: string } }) => {
    try {
      const rows = await loadUserSegments(params.userId);

      if (rows.length === 0) {
        return {
          status: 204,
          body: "user segment not found!",
        };
      }

      return {
        status: 200,
        body: serializeForContract(rows),
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "An error occured while trying to retrieve a userSegment.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const deleteMine = s.route(userSegmentsApiContracts.deleteMine, {
  middleware: [passport.authenticate("jwt", { session: false })],
  handler: async ({ req }: { req: any }) => {
    try {
      const userId = getAuthenticatedUserId(req.user);

      if (!userId) {
        return {
          status: 400,
          body: "You don't have a user segment to delete!",
        };
      }

      const existing = await prisma.userSegments.findFirst({
        where: { userId },
      });

      if (!existing) {
        return {
          status: 400,
          body: "You don't have a user segment to delete!",
        };
      }

      await prisma.userSegments.deleteMany({
        where: { userId },
      });

      return {
        status: 204,
        body: undefined,
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "An error occured while trying to delete a userSegment.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const upsertMine = s.route(userSegmentsApiContracts.upsertMine, {
  middleware: [passport.authenticate("jwt", { session: false })],
  handler: async ({ req, body }: { req: any; body: MutationBody }) => {
    try {
      const userId = getAuthenticatedUserId(req.user);

      if (!userId) {
        return {
          status: 400,
          body: buildErrorResponse("User ID is required"),
        };
      }

      const validation = await validateAssignments(body);

      if (
        validation.error ||
        validation.errorMessage ||
        validation.errorStack
      ) {
        return {
          status: 400,
          body: {
            message: validation.error,
            details: {
              errorMessage: validation.errorMessage,
              errorStack: validation.errorStack,
            },
          },
        };
      }

      if (validation.assignments.length === 0) {
        return {
          status: 400,
          body: buildErrorResponse(
            "At least one segment must be provided to update a user segment.",
          ),
        };
      }

      await prisma.$transaction(async (tx) => {
        for (const assignment of validation.assignments) {
          const existing = await tx.userSegments.findFirst({
            where: {
              userId,
              userSegmentRelationship: assignment.relationship,
            },
          });

          if (existing) {
            await tx.userSegments.update({
              where: { id: existing.id },
              data: {
                segmentId: assignment.targetSegmentId,
              },
            });
            continue;
          }

          await tx.userSegments.create({
            data: {
              userId,
              userSegmentRelationship: assignment.relationship,
              segmentId: assignment.targetSegmentId,
            },
          });
        }
      });

      const rows = await loadUserSegments(userId);

      return {
        status: 200,
        body: serializeForContract(
          toDenormalizedUserSegment(userId, rows as LoadedUserSegment[]),
        ),
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "An error occured while trying to update a userSegment.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const updateByUserId = s.route(userSegmentsApiContracts.updateByUserId, {
  middleware: [passport.authenticate("jwt", { session: false })],
  handler: async ({
    params,
    body,
  }: {
    params: { id: string };
    body: MutationBody;
  }) => {
    try {
      const existingRows = await loadUserSegments(params.id);

      if (existingRows.length === 0) {
        return {
          status: 400,
          body: buildErrorResponse(
            "user with id doesn't exist in the database!",
          ),
        };
      }

      const validation = await validateAssignments(body);

      if (
        validation.error ||
        validation.errorMessage ||
        validation.errorStack
      ) {
        return {
          status: 400,
          body: {
            message: validation.error,
            details: {
              errorMessage: validation.errorMessage,
              errorStack: validation.errorStack,
            },
          },
        };
      }

      if (validation.assignments.length === 0) {
        return {
          status: 400,
          body: buildErrorResponse(
            "At least one segment must be provided to update a user segment.",
          ),
        };
      }

      await prisma.$transaction(async (tx) => {
        for (const assignment of validation.assignments) {
          const existing = existingRows.find(
            (row) => row.userSegmentRelationship === assignment.relationship,
          );

          if (!existing) {
            await tx.userSegments.create({
              data: {
                userId: params.id,
                userSegmentRelationship: assignment.relationship,
                segmentId: assignment.targetSegmentId,
              },
            });
            continue;
          }

          await tx.userSegments.update({
            where: { id: existing.id },
            data: {
              segmentId: assignment.targetSegmentId,
            },
          });
        }
      });

      const rows = await loadUserSegments(params.id);

      return {
        status: 200,
        body: serializeForContract(
          toDenormalizedUserSegment(params.id, rows as LoadedUserSegment[]),
        ),
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "An error occured while trying to update a userSegment.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const getHomeSegment = s.route(userSegmentsApiContracts.getHomeSegment, {
  middleware: [passport.authenticate("jwt", { session: false })],
  handler: async ({ req }: { req: any }) => {
    try {
      const userId = getAuthenticatedUserId(req.user);

      if (!userId) {
        return {
          status: 400,
          body: buildErrorResponse("User ID is required"),
        };
      }

      const result = await getSegmentByRelationship(
        userId,
        UserSegmentRelationShipType.HOME,
      );

      if (result.kind === "missing-user-segment") {
        return { status: 404, body: "user segment not found!" };
      }

      if (result.kind === "missing-relationship") {
        return { status: 204, body: undefined };
      }

      const mainSegment = getMainSegmentForAssignment(result.row.segment);

      if (!mainSegment) {
        return { status: 204, body: undefined };
      }

      return {
        status: 200,
        body: serializeForContract(toSegmentSummary(mainSegment)),
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "An error occured while trying to retrieve a userSegment.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const getWorkSegment = s.route(userSegmentsApiContracts.getWorkSegment, {
  middleware: [passport.authenticate("jwt", { session: false })],
  handler: async ({ req }: { req: any }) => {
    try {
      const userId = getAuthenticatedUserId(req.user);

      if (!userId) {
        return {
          status: 400,
          body: buildErrorResponse("User ID is required"),
        };
      }

      const result = await getSegmentByRelationship(
        userId,
        UserSegmentRelationShipType.WORK,
      );

      if (result.kind === "missing-user-segment") {
        return { status: 404, body: "user segment not found!" };
      }

      if (result.kind === "missing-relationship") {
        return { status: 204, body: undefined };
      }

      const mainSegment = getMainSegmentForAssignment(result.row.segment);

      if (!mainSegment) {
        return { status: 204, body: undefined };
      }

      return {
        status: 200,
        body: serializeForContract(toSegmentSummary(mainSegment)),
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "An error occured while trying to retrieve a userSegment.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const getSchoolSegment = s.route(userSegmentsApiContracts.getSchoolSegment, {
  middleware: [passport.authenticate("jwt", { session: false })],
  handler: async ({ req }: { req: any }) => {
    try {
      const userId = getAuthenticatedUserId(req.user);

      if (!userId) {
        return {
          status: 400,
          body: buildErrorResponse("User ID is required"),
        };
      }

      const result = await getSegmentByRelationship(
        userId,
        UserSegmentRelationShipType.SCHOOL,
      );

      if (result.kind === "missing-user-segment") {
        return { status: 404, body: "user segment not found!" };
      }

      if (result.kind === "missing-relationship") {
        return { status: 204, body: undefined };
      }

      const mainSegment = getMainSegmentForAssignment(result.row.segment);

      if (!mainSegment) {
        return { status: 204, body: undefined };
      }

      return {
        status: 200,
        body: serializeForContract(toSegmentSummary(mainSegment)),
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "An error occured while trying to retrieve a userSegment.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const getHomeSubSegment = s.route(userSegmentsApiContracts.getHomeSubSegment, {
  middleware: [passport.authenticate("jwt", { session: false })],
  handler: async ({ req }: { req: any }) => {
    try {
      const userId = getAuthenticatedUserId(req.user);

      if (!userId) {
        return {
          status: 400,
          body: buildErrorResponse("User ID is required"),
        };
      }

      const result = await getSegmentByRelationship(
        userId,
        UserSegmentRelationShipType.HOME,
      );

      if (result.kind === "missing-user-segment") {
        return { status: 404, body: "user segment not found!" };
      }

      if (result.kind === "missing-relationship") {
        return { status: 204, body: undefined };
      }

      const subSegment = getSubSegmentForAssignment(result.row.segment);

      if (!subSegment) {
        return { status: 204, body: undefined };
      }

      return {
        status: 200,
        body: serializeForContract(toSegmentSummary(subSegment)),
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "An error occured while trying to retrieve a userSegment.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const getWorkSubSegment = s.route(userSegmentsApiContracts.getWorkSubSegment, {
  middleware: [passport.authenticate("jwt", { session: false })],
  handler: async ({ req }: { req: any }) => {
    try {
      const userId = getAuthenticatedUserId(req.user);

      if (!userId) {
        return {
          status: 400,
          body: buildErrorResponse("User ID is required"),
        };
      }

      const result = await getSegmentByRelationship(
        userId,
        UserSegmentRelationShipType.WORK,
      );

      if (result.kind === "missing-user-segment") {
        return { status: 404, body: "user segment not found!" };
      }

      if (result.kind === "missing-relationship") {
        return { status: 204, body: undefined };
      }

      const subSegment = getSubSegmentForAssignment(result.row.segment);

      if (!subSegment) {
        return { status: 204, body: undefined };
      }

      return {
        status: 200,
        body: serializeForContract(toSegmentSummary(subSegment)),
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "An error occured while trying to retrieve a userSegment.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const getSchoolSubSegment = s.route(
  userSegmentsApiContracts.getSchoolSubSegment,
  {
    middleware: [passport.authenticate("jwt", { session: false })],
    handler: async ({ req }: { req: any }) => {
      try {
        const userId = getAuthenticatedUserId(req.user);

        if (!userId) {
          return {
            status: 400,
            body: buildErrorResponse("User ID is required"),
          };
        }

        const result = await getSegmentByRelationship(
          userId,
          UserSegmentRelationShipType.SCHOOL,
        );

        if (result.kind === "missing-user-segment") {
          return { status: 404, body: "user segment not found!" };
        }

        if (result.kind === "missing-relationship") {
          return { status: 204, body: undefined };
        }

        const subSegment = getSubSegmentForAssignment(result.row.segment);

        if (!subSegment) {
          return { status: 204, body: undefined };
        }

        return {
          status: 200,
          body: serializeForContract(toSegmentSummary(subSegment)),
        };
      } catch (error) {
        return {
          status: 400,
          body: {
            message: "An error occured while trying to retrieve a userSegment.",
            details: toErrorDetails(error),
          },
        };
      }
    },
  },
);

const getSegmentByName = s.route(userSegmentsApiContracts.getSegmentByName, {
  handler: async ({ params }: { params: { name: string } }) => {
    try {
      const result = await prisma.segments.findFirst({
        where: { name: params.name },
        select: {
          segId: true,
          country: true,
          province: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          lat: true,
          lon: true,
          parentId: true,
          radius: true,
          segmentType: true,
        },
      });

      if (!result) {
        return {
          status: 404,
          body: "segment not found!",
        };
      }

      return {
        status: 200,
        body: serializeForContract(result),
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "An error occured while trying to retrieve a segment.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const patchByUserId = s.route(userSegmentsApiContracts.patchByUserId, {
  handler: async ({
    params,
    body,
  }: {
    params: { userId: string };
    body: Record<string, unknown>;
  }) => {
    const updates = body as Record<string, unknown>;

    if (Object.keys(updates).length === 0) {
      return {
        status: 400,
        body: {
          message: "No fields provided to update",
        },
      };
    }

    try {
      const relationshipValue = updates["userSegmentRelationship"];
      const segmentIdValue = updates["segmentId"];

      if (segmentIdValue === undefined) {
        return {
          status: 400,
          body: {
            message: "No fields provided to update",
          },
        };
      }

      const segmentId = asInteger(segmentIdValue);

      if (segmentId === null) {
        return {
          status: 400,
          body: {
            message: "segmentId must be provided as an integer",
          },
        };
      }

      const segment = await loadSegment(segmentId);

      if (!segment) {
        return {
          status: 400,
          body: buildErrorResponse(
            "segmentId must reference an existing segment.",
          ),
        };
      }

      const rows = await prisma.userSegments.findMany({
        where: { userId: params.userId },
        orderBy: { id: "asc" },
      });

      let targetRow = null;

      if (
        relationshipValue === UserSegmentRelationShipType.HOME ||
        relationshipValue === UserSegmentRelationShipType.WORK ||
        relationshipValue === UserSegmentRelationShipType.SCHOOL
      ) {
        targetRow =
          rows.find(
            (row) => row.userSegmentRelationship === relationshipValue,
          ) ?? null;
      } else if (rows.length === 1) {
        targetRow = rows[0];
      } else {
        return {
          status: 400,
          body: {
            message:
              "userSegmentRelationship is required when a user has multiple segment records",
          },
        };
      }

      if (!targetRow) {
        return {
          status: 400,
          body: buildErrorResponse(
            "An error occured while trying to update a user segment.",
          ),
        };
      }

      const updatedUserSegment = await prisma.userSegments.update({
        where: { id: targetRow.id },
        data: { segmentId },
      });

      return {
        status: 200,
        body: {
          message: "UserSegment updated successfully",
          userSegement: serializeForContract(updatedUserSegment),
        },
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "An error occured while trying to update a user segment.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

export default {
  schema: userSegmentsApiContracts,
  router: {
    getAllForAuthenticatedUser,
    create,
    getMine,
    getByUserId,
    deleteMine,
    upsertMine,
    updateByUserId,
    getHomeSegment,
    getWorkSegment,
    getSchoolSegment,
    getHomeSubSegment,
    getWorkSubSegment,
    getSchoolSubSegment,
    getSegmentByName,
    patchByUserId,
  },
} as unknown as Handlers;
