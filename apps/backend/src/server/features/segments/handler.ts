import { segmentApiContracts } from "@mlc/lib/api";
import { Prisma, SegmentType, UserType } from "#prisma/client";
import { prisma } from "src/prisma/client";
import { initServer } from "@ts-rest/express";
import { createHandlers } from "src/server";
import { serializeForContract, toErrorDetails } from "src/server/utils";
import { User } from "@mlc/lib/api/contracts/users";
import passport from "passport";

import {
  updateSegment,
  createSubSegmentEntry,
  deleteSegment,
  getAllSubSegments,
  getSubSegmentBySegId,
  getSubSegmentsByParentId,
  superSegmentService,
} from "./service";

const s = initServer();

const ADMIN_SEGMENT_CREATOR_TYPES = new Set<UserType>([
  UserType.SUPER_ADMIN,
  UserType.ADMIN,
  UserType.MOD,
]);

const parseSegmentId = (value: string) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) ? parsed : null;
};

const toSegmentSummary = (segment: {
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
}) => ({
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

const toParentSegment = (
  parent:
    | {
        segId: number;
        country: string | null;
        province: string | null;
        name: string;
        segmentType: SegmentType;
      }
    | null
    | undefined,
) =>
  parent
    ? {
        segId: parent.segId,
        country: parent.country,
        province: parent.province,
        name: parent.name,
        segmentType: parent.segmentType,
      }
    : undefined;

const toSegmentResponse = (segment: {
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
  parentSegment?: {
    segId: number;
    country: string | null;
    province: string | null;
    name: string;
    segmentType: SegmentType;
  } | null;
  children?: Array<{
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
  }>;
}) => ({
  ...toSegmentSummary(segment),
  parentSegment: toParentSegment(segment.parentSegment),
  children: segment.children?.map((child) => toSegmentSummary(child)),
});
// ============================================================================
// segment
// ============================================================================
const create = s.route(segmentApiContracts.segment.create, {
  middleware: [passport.authenticate("jwt", { session: false })],
  handler: async ({ req, body }) => {
    try {
      const userId = (req.user as User)?.id;

      if (!userId) {
        return {
          status: 403,
          body: {
            message: "You don't have the right to add a segment!",
            details: {
              errorMessage:
                "In order to create a segment, you must be an admin user.",
              errorStack: "user must be authenticated and authorized",
            },
          },
        };
      }

      const requestingUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { userType: true },
      });

      if (
        !requestingUser?.userType ||
        !ADMIN_SEGMENT_CREATOR_TYPES.has(requestingUser.userType)
      ) {
        return {
          status: 403,
          body: {
            message: "You don't have the right to add a segment!",
            details: {
              errorMessage:
                "In order to create a segment, you must be an admin user.",
              errorStack:
                "user must be an admin if they want to create a segment",
            },
          },
        };
      }

      const rawParentId = body.parentSuperSegId ?? body.superSegId;
      const superSegId =
        rawParentId === undefined ? null : parseSegmentId(String(rawParentId));

      if (superSegId === null) {
        return {
          status: 400,
          body: {
            message: "A segment must have a Super Segment with a valid ID.",
            details: {
              errorMessage:
                "Creating a segment must explicitly be supplied with a valid super segment id field.",
              errorStack:
                "super segment id must be provided in the body with a valid value",
            },
          },
        };
      }

      const parentSuperSegment = await prisma.segments.findUnique({
        where: { segId: superSegId },
        select: {
          segId: true,
          country: true,
          province: true,
          name: true,
          segmentType: true,
        },
      });

      if (
        !parentSuperSegment ||
        parentSuperSegment.segmentType !== "superSegment"
      ) {
        return {
          status: 400,
          body: {
            message: "A segment must have a Super Segment with a valid ID.",
            details: {
              errorMessage:
                "Creating a segment must explicitly be supplied with a valid super segment id field referencing a super segment.",
              errorStack:
                "valid super segment segId must be provided in the body",
            },
          },
        };
      }

      const createdSegment = await prisma.segments.create({
        data: {
          country: body.country,
          province: body.province,
          name: body.name,
          parentId: parentSuperSegment.segId,
          segmentType: SegmentType.segment,
        },
      });

      return {
        status: 200,
        body: serializeForContract(
          toSegmentResponse({
            ...createdSegment,
            parentSegment: parentSuperSegment,
          }),
        ),
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "An error occured while trying to create a segment.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});
const deleteSegmentById = s.route(segmentApiContracts.segment.delete, {
  handler: async ({ params: { segmentId }, req }) => {
    const userId = (req.user as User).id;

    try {
      await deleteSegment(userId, segmentId);
      return { status: 204, body: undefined };
    } catch (error: unknown) {
      const e = toErrorDetails(error);

      switch (e.errorMessage) {
        case "NOT_FOUND":
          return {
            status: 404,
            body: {
              message: "Segment not found",
              details: toErrorDetails(e),
            },
          };

        case "Insufficient permissions":
          return {
            status: 403,
            body: {
              message: "You are not authorized to perform this action",
              details: toErrorDetails(e),
            },
          };

        default:
          return {
            status: 400,
            body: {
              message: "An error occurred while trying to delete.",
              details: toErrorDetails(e),
            },
          };
      }
    }
  },
});

const getAll = s.route(segmentApiContracts.segment.getAll, {
  handler: async () => {
    try {
      const segments = await prisma.segments.findMany({
        where: { segmentType: SegmentType.segment },
        include: {
          parentSegment: {
            select: {
              segId: true,
              country: true,
              province: true,
              name: true,
              segmentType: true,
            },
          },
        },
        orderBy: { segId: "asc" },
      });

      return {
        status: 200,
        body: serializeForContract(
          segments.map((segment) => toSegmentResponse(segment)),
        ),
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "An error occured while trying to retrieve segments.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const getById = s.route(segmentApiContracts.segment.getById, {
  handler: async ({ params }) => {
    try {
      const { segmentId } = params;

      if (segmentId === null) {
        return {
          status: 400,
          body: {
            message:
              "A valid segmentId must be specified in the route parameter",
          },
        };
      }

      const segment = await prisma.segments.findUnique({
        where: { segId: segmentId },
        include: {
          parentSegment: {
            select: {
              segId: true,
              country: true,
              province: true,
              name: true,
              segmentType: true,
            },
          },
          children: true,
        },
      });

      if (!segment) {
        return {
          status: 400,
          body: {
            message: `The segment with listed ID (${segmentId}) does not exist.`,
          },
        };
      }

      return {
        status: 200,
        body: serializeForContract(toSegmentResponse(segment)),
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "An error occured while trying to fetch all segments",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const getBySuperSegId = s.route(segmentApiContracts.segment.getBySuperSegId, {
  handler: async ({ params }) => {
    try {
      const { superSegId } = params;

      if (superSegId === null) {
        return {
          status: 400,
          body: "super segment id is invalid. ",
        };
      }

      const superSegment = await prisma.segments.findUnique({
        where: { segId: superSegId },
        select: {
          segId: true,
          country: true,
          province: true,
          name: true,
          segmentType: true,
        },
      });

      if (!superSegment || superSegment.segmentType !== "superSegment") {
        return {
          status: 404,
          body: "super segment id is not in the database! ",
        };
      }

      const segments = await prisma.segments.findMany({
        where: {
          parentId: superSegId,
          segmentType: SegmentType.segment,
        },
        orderBy: { segId: "asc" },
      });

      return {
        status: 200,
        body: serializeForContract(
          segments.map((segment) =>
            toSegmentResponse({
              ...segment,
              parentSegment: superSegment,
            }),
          ),
        ),
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "An error occured while trying to retrieve segments.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const getByType = s.route(segmentApiContracts.segment.getByType, {
  handler: async ({ params }) => {
    try {
      const validTypes = [
        SegmentType.segment,
        SegmentType.superSegment,
        SegmentType.subSegment,
      ];

      if (!validTypes.includes(params.type as SegmentType)) {
        return {
          status: 400,
          body: {
            message: "Invalid segment type",
            validTypes,
          },
        };
      }

      const segments = await prisma.segments.findMany({
        where: { segmentType: params.type as SegmentType },
        include: {
          parentSegment: {
            select: {
              segId: true,
              country: true,
              province: true,
              name: true,
              segmentType: true,
            },
          },
        },
        orderBy: { segId: "asc" },
      });

      return {
        status: 200,
        body: serializeForContract(
          segments.map((segment) => toSegmentResponse(segment)),
        ),
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "An error occurred while trying to retrieve segments.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const getChildrenOfParent = s.route(
  segmentApiContracts.segment.getChildrenOfParent,
  {
    handler: async ({ params }) => {
      try {
        const { parentId } = params;

        if (parentId === null) {
          return {
            status: 400,
            body: {
              message: "Invalid parent ID format. Must be a number.",
            },
          };
        }

        const children = await prisma.segments.findMany({
          where: { parentId },
          include: {
            parentSegment: {
              select: {
                segId: true,
                country: true,
                province: true,
                name: true,
                segmentType: true,
              },
            },
            children: true,
          },
          orderBy: { segId: "asc" },
        });

        if (children.length === 0) {
          return {
            status: 404,
            body: {
              message: `No children segments found for parent ID: ${parentId}`,
            },
          };
        }

        return {
          status: 200,
          body: serializeForContract(
            children.map((segment) => toSegmentResponse(segment)),
          ),
        };
      } catch (error) {
        return {
          status: 400,
          body: {
            message:
              "An error occurred while trying to retrieve child segments.",
            details: toErrorDetails(error),
          },
        };
      }
    },
  },
);
/**
 * This needs extension to handle associations with parent/children.
 * A better option would be to correct the database, rather than adapting to
 * the creative implementation
 */
const updateSegmentById = s.route(segmentApiContracts.segment.update, {
  middleware: [passport.authenticate("jwt", { session: false })],
  handler: async ({ params, body, req }) => {
    const user = req.user as User;
    const { segmentId } = params;

    try {
      // result is typed correctly via SegmentSchema.parse
      const result = await updateSegment(user.id, segmentId, body);

      return {
        status: 200,
        body: result, // Match the contract: response is SegmentSchema, not { result }
      };
    } catch (error) {
      const status = error === "Insufficient permissions" ? 403 : 400;

      return {
        status,
        body: {
          message: "An error occurred while trying to update.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});
// ============================================================================
// subSegment
// ============================================================================
const createSubSegment = s.route(segmentApiContracts.subSegment.create, {
  middleware: [passport.authenticate("jwt", { session: false })],
  handler: async ({ body, req }) => {
    const user = req.user as User;

    try {
      await createSubSegmentEntry(user.id, body);

      return {
        status: 200,
        body: {
          message: "Subsegment successfully created",
        },
      };
    } catch (error) {
      const status = error === "Insufficient permissions" ? 403 : 400;

      return {
        status,
        body: {
          message: "An error occurred while trying to create a subsegment.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const deleteSubSegment = s.route(segmentApiContracts.subSegment.delete, {
  middleware: [passport.authenticate("jwt", { session: false })],
  handler: async ({ params, req }) => {
    const userId = (req.user as User).id;
    const { subSegmentId } = params;

    try {
      await deleteSegment(userId, subSegmentId);

      return {
        status: 204,
        body: undefined,
      };
    } catch (error) {
      let status: 400 | 403 | 404 = 400;

      if (error === "Insufficient permissions") status = 403;
      if (error === "Subsegment not found") status = 404;

      return {
        status,
        body: {
          message: "An error occurred while trying to delete the subsegment.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const getAllSubSegmentsHandler = s.route(
  segmentApiContracts.subSegment.getAll,
  {
    handler: async () => {
      try {
        const subSegments = await getAllSubSegments();

        return {
          status: 200,
          body: subSegments,
        };
      } catch (error) {
        return {
          status: 400,
          body: {
            message: "An error occurred while trying to get all subsegments.",
            details: toErrorDetails(error),
          },
        };
      }
    },
  },
);

const getSubSegmentsBySubSegmentId = s.route(
  segmentApiContracts.subSegment.getBySubSegmentId,
  {
    handler: async ({ params }) => {
      const { subSegmentId } = params;

      try {
        const subSegment = await getSubSegmentBySegId(subSegmentId);

        if (!subSegment) {
          return {
            status: 400,
            body: {
              message: "Subsegment not found",
              details: toErrorDetails("Subsegment not found"),
            },
          };
        }

        return {
          status: 200,
          body: subSegment,
        };
      } catch (error) {
        return {
          status: 400,
          body: {
            message: "An error occurred while trying to get that subsegment.",
            details: toErrorDetails(error),
          },
        };
      }
    },
  },
);
const getSubSegmentsBySegmentId = s.route(
  segmentApiContracts.subSegment.getBySegmentId,
  {
    handler: async ({ params: { segmentId } }) => {
      try {
        const theSubSegments = await getSubSegmentsByParentId(segmentId);

        if (theSubSegments.length === 0) {
          return {
            status: 404,
            body: {
              message: "Subsegment not found",
              details: toErrorDetails("Subsegment not found"),
            },
          };
        }

        return {
          status: 200,
          body: theSubSegments,
        };
      } catch (error) {
        return {
          status: 400,
          body: {
            message: "An error occurred while trying to get that subsegment.",
            details: toErrorDetails(error),
          },
        };
      }
    },
  },
);
// ============================================================================
// superSegment
// ============================================================================
const createSuperSegment = s.route(segmentApiContracts.superSegment.create, {
  handler: async ({ body, req }) => {
    try {
      const user = req.user as User;
      await superSegmentService.create(user.id, body);
      return {
        status: 200,
        body: { message: "SuperSegment created successfully" },
      };
    } catch (error) {
      const details = toErrorDetails(error);
      const status =
        details.errorMessage === "Insufficient permissions" ? 403 : 400;
      return { status, body: { message: "Creation failed", details } };
    }
  },
});

const getAllSuperSegments = s.route(segmentApiContracts.superSegment.getAll, {
  handler: async () => {
    try {
      const result = await superSegmentService.getAll();
      return { status: 200, body: result };
    } catch (error) {
      return {
        status: 400,
        body: { message: "Fetch failed", details: toErrorDetails(error) },
      };
    }
  },
});

const getSupersByCountryProvince = s.route(
  segmentApiContracts.superSegment.getByCountryProvince,
  {
    handler: async ({ query }) => {
      try {
        const result = await superSegmentService.getByLocation(
          query.country,
          query.province,
        );
        if (!result) throw new Error("NOT_FOUND");

        // Mapping to the specific object structure required by your contract
        return {
          status: 200,
          body: {
            superSegId: result.segId.toString(),
            name: result.name,
            country: result.country ?? "",
            province: result.province ?? "",
            createdAt: result.createdAt,
            updatedAt: result.updatedAt ?? result.createdAt,
          },
        };
      } catch (error) {
        const details = toErrorDetails(error);
        return { status: 400, body: { message: "Search failed", details } };
      }
    },
  },
);

const deleteSuper = s.route(segmentApiContracts.superSegment.delete, {
  handler: async ({ params, req }) => {
    try {
      const user = req.user as User;
      await superSegmentService.delete(user.id, params.deleteId);
      return { status: 204, body: undefined };
    } catch (error) {
      const details = toErrorDetails(error);
      // Switch logic we discussed
      switch (details.errorMessage) {
        case "NOT_FOUND":
          return { status: 404, body: { message: "Not found", details } };
        case "Insufficient permissions":
          return { status: 403, body: { message: "Forbidden", details } };
        default:
          return { status: 400, body: { message: "Delete failed", details } };
      }
    }
  },
});

const getBySuperSegmentId = s.route(
  segmentApiContracts.superSegment.getBySuperSegmentId,
  {
    handler: async ({ params: { superSegmentId } }) => {
      try {
        // Re-use the existing service logic
        const result =
          await superSegmentService.getSuperSegmentById(superSegmentId);

        if (!result) return { status: 404, body: { message: "Not found" } };

        return {
          status: 200,
          body: [result], // Contract expects an array
        };
      } catch (error) {
        return {
          status: 400,
          body: { message: "Fetch failed", details: toErrorDetails(error) },
        };
      }
    },
  },
);
const updateSuperSegment = s.route(segmentApiContracts.superSegment.update, {
  middleware: [passport.authenticate("jwt", { session: false })],
  handler: async ({ params, body, req }) => {
    const user = req.user as User;
    const { segmentId } = params;

    try {
      // result is typed correctly via SegmentSchema.parse
      const result = await updateSegment(user.id, segmentId, body);

      return {
        status: 200,
        body: result, // Match the contract: response is SegmentSchema, not { result }
      };
    } catch (error) {
      const status = error === "Insufficient permissions" ? 403 : 400;

      return {
        status,
        body: {
          message: "An error occurred while trying to update.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});
// ============================================================================
// exports
// ============================================================================
export default createHandlers({
  schema: segmentApiContracts,
  router: {
    segment: {
      create,
      delete: deleteSegmentById,
      getAll,
      getById,
      getBySuperSegId,
      getByType,
      getChildrenOfParent,
      update: updateSegmentById,
    },
    subSegment: {
      create: createSubSegment,
      delete: deleteSubSegment,
      getAll: getAllSubSegmentsHandler,
      getBySubSegmentId: getSubSegmentsBySubSegmentId,
      getBySegmentId: getSubSegmentsBySegmentId,
    },
    superSegment: {
      create: createSuperSegment,
      getAll: getAllSuperSegments,
      getByCountryProvince: getSupersByCountryProvince,
      getBySuperSegmentId,
      delete: deleteSuper,
      update: updateSuperSegment,
    },
  },
});
