import { initServer } from "@ts-rest/express";
import { Prisma, UserType } from "#prisma/client";
import * as passport from "passport";

import { prisma } from "src/prisma/client";
import { createHandlers } from "src/server";
import { subgroupApiContracts } from "@mlc/lib/api/contracts/subgroups";

const s = initServer();

const SUBGROUP_ADMIN_TYPES = new Set<UserType>([
  UserType.SUPER_ADMIN,
  UserType.ADMIN,
  UserType.MOD,
]);

const getRequestUserId = (req: { user?: unknown }) => {
  const user = req.user as { id?: string } | undefined;
  return user?.id;
};

const getSubgroupAdminType = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { userType: true },
  });

  return user?.userType;
};

const getIsSubGroupManager = s.route(
  subgroupApiContracts.subgroups.getIsSubGroupManager,
  {
    middleware: [passport.authenticate("jwt", { session: false })],
    handler: async ({ req }) => {
      try {
        const userId = getRequestUserId(req);

        if (!userId) {
          return {
            status: 500,
            body: {
              message: "Error checking subgroup manager status",
              details: {
                error: "Authenticated user id is missing",
                errorStack: "",
              },
            },
          };
        }

        const managedSubgroups = await prisma.subGroup.findMany({
          where: { managerId: userId },
          select: { id: true },
        });

        return {
          status: 200,
          body: { isSubGroupManager: managedSubgroups.length > 0 },
        };
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));

        return {
          status: 500,
          body: {
            message: "Error checking subgroup manager status",
            details: {
              error: err.message,
              errorStack: err.stack ?? "",
            },
          },
        };
      }
    },
  },
);

const getManagedSubgroups = s.route(
  subgroupApiContracts.subgroups.getManagedSubgroups,
  {
    middleware: [passport.authenticate("jwt", { session: false })],
    handler: async ({ req }) => {
      try {
        const userId = getRequestUserId(req);

        if (!userId) {
          return {
            status: 500,
            body: {
              message: "Error fetching subgroups",
              details: {
                error: "Authenticated user id is missing",
                errorStack: "",
              },
            },
          };
        }

        const managedSubgroups = await prisma.subGroup.findMany({
          where: { managerId: userId },
          orderBy: { name: "asc" },
          include: {
            region: { select: { name: true } },
            segment: { select: { name: true } },
            subSegment: { select: { name: true } },
          },
        });

        if (managedSubgroups.length === 0) {
          return {
            status: 204,
            body: {
              message: "No subgroups managed by this user",
              data: [],
            },
          };
        }

        return {
          status: 200,
          body: managedSubgroups,
        };
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));

        return {
          status: 500,
          body: {
            message: "Error fetching subgroups",
            details: {
              error: err.message,
              errorStack: err.stack ?? "",
            },
          },
        };
      }
    },
  },
);

const getSubgroupUsers = s.route(
  subgroupApiContracts.subgroups.getSubgroupUsers,
  {
    middleware: [passport.authenticate("jwt", { session: false })],
    handler: async ({ params }) => {
      try {
        const currentUsers = await prisma.subGroupMember.findMany({
          where: { subGroupId: params.subGroupId },
          orderBy: { joinedAt: "asc" },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                organizationName: true,
                fname: true,
                lname: true,
                userType: true,
              },
            },
          },
        });

        return {
          status: 200,
          body: currentUsers,
        };
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));

        return {
          status: 400,
          body: {
            message: "Error fetching current users",
            details: {
              error: err.message,
              errorStack: err.stack ?? "",
            },
          },
        };
      }
    },
  },
);

const getUsersNotInSubGroup = s.route(
  subgroupApiContracts.subgroups.getUsersNotInSubGroup,
  {
    middleware: [passport.authenticate("jwt", { session: false })],
    handler: async ({ req, params }) => {
      try {
        const userId = getRequestUserId(req);

        if (!userId) {
          return {
            status: 400,
            body: {
              message: "Error fetching users not in subgroup",
              details: {
                error: "Authenticated user id is missing",
                errorStack: "",
              },
            },
          };
        }

        const currentUsers = await prisma.subGroupMember.findMany({
          where: { subGroupId: params.subGroupId },
          select: { userId: true },
        });

        const excludeIds = [
          ...currentUsers.map((member) => member.userId),
          userId,
        ];

        const usersNotInSubGroup = await prisma.user.findMany({
          where: {
            id: {
              notIn: excludeIds.length > 0 ? excludeIds : [""],
            },
          },
          select: {
            id: true,
            email: true,
            userType: true,
            fname: true,
            lname: true,
            organizationName: true,
          },
          orderBy: { fname: "asc" },
        });

        return {
          status: 200,
          body: usersNotInSubGroup,
        };
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));

        return {
          status: 400,
          body: {
            message: "Error fetching users not in subgroup",
            details: {
              error: err.message,
              errorStack: err.stack ?? "",
            },
          },
        };
      }
    },
  },
);

const addUserToSubGroup = s.route(
  subgroupApiContracts.subgroups.addUserToSubGroup,
  {
    middleware: [passport.authenticate("jwt", { session: false })],
    handler: async ({ params }) => {
      try {
        const newMember = await prisma.user.findUnique({
          where: { id: params.userId },
        });

        if (!newMember) {
          return {
            status: 404,
            body: {
              message: "User not found",
            },
          };
        }

        const existingMember = await prisma.subGroupMember.findFirst({
          where: {
            subGroupId: params.subGroupId,
            userId: params.userId,
          },
        });

        if (existingMember) {
          return {
            status: 400,
            body: {
              message: "User is already a member of this subgroup",
            },
          };
        }

        const addedMember = await prisma.subGroupMember.create({
          data: {
            userId: params.userId,
            subGroupId: params.subGroupId,
            status: "APPROVED",
            joinedAt: new Date(),
          },
          include: {
            user: true,
            subGroup: true,
          },
        });

        return {
          status: 201,
          body: {
            message: `User ID ${params.userId} added to subgroup ID ${params.subGroupId} successfully`,
            data: addedMember,
            email: addedMember.user.email,
            subGroupName: addedMember.subGroup.name,
          },
        };
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));

        return {
          status: 400,
          body: {
            message: "Error adding user to subgroup",
            details: {
              error: err.message,
              errorStack: err.stack ?? "",
            },
          },
        };
      }
    },
  },
);

const updateUserRequestInSubGroup = s.route(
  subgroupApiContracts.subgroups.updateUserRequestInSubGroup,
  {
    middleware: [passport.authenticate("jwt", { session: false })],
    handler: async ({ params, body }) => {
      try {
        if (!["APPROVED", "REJECTED", "PENDING"].includes(body.action)) {
          return {
            status: 400,
            body: {
              message: 'Invalid action. Use "APPROVED" or "REJECTED".',
            },
          };
        }

        const existingMember = await prisma.subGroupMember.findUnique({
          where: {
            userId_subGroupId: {
              subGroupId: params.subGroupId,
              userId: params.userId,
            },
          },
        });

        if (!existingMember) {
          return {
            status: 404,
            body: {
              message: "User not found in the specified subgroup",
            },
          };
        }

        const updatedMember = await prisma.subGroupMember.update({
          where: {
            userId_subGroupId: {
              subGroupId: params.subGroupId,
              userId: params.userId,
            },
          },
          data: {
            status: body.action,
          },
          include: {
            user: true,
          },
        });

        return {
          status: 200,
          body: {
            message: `User ID ${params.userId} updated in subgroup ID ${params.subGroupId} successfully`,
            data: updatedMember,
            email: updatedMember.user.email,
          },
        };
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));

        return {
          status: 400,
          body: {
            message: "Error updating user in subgroup",
            details: {
              error: err.message,
              errorStack: err.stack ?? "",
            },
          },
        };
      }
    },
  },
);

const removeUserFromSubGroup = s.route(
  subgroupApiContracts.subgroups.removeUserFromSubGroup,
  {
    middleware: [passport.authenticate("jwt", { session: false })],
    handler: async ({ params }) => {
      try {
        const deletedUser = await prisma.subGroupMember.deleteMany({
          where: {
            subGroupId: params.subGroupId,
            userId: params.userId,
          },
        });

        if (deletedUser.count === 0) {
          return {
            status: 404,
            body: {
              message: "User not found in the specified subgroup",
            },
          };
        }

        return {
          status: 200,
          body: {
            message: `User ID ${params.userId} removed from subgroup ID ${params.subGroupId}`,
            data: deletedUser,
          },
        };
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));

        return {
          status: 400,
          body: {
            message: "Error removing user from subgroup",
            details: {
              error: err.message,
              errorStack: err.stack ?? "",
            },
          },
        };
      }
    },
  },
);

const removeRejectedRequestFromSubGroup = s.route(
  subgroupApiContracts.subgroups.removeRejectedRequestFromSubGroup,
  {
    middleware: [passport.authenticate("jwt", { session: false })],
    handler: async ({ params }) => {
      try {
        const rejectedRequest = await prisma.subGroupMember.findUnique({
          where: {
            userId_subGroupId: {
              userId: params.userId,
              subGroupId: params.subGroupId,
            },
          },
        });

        if (!rejectedRequest || rejectedRequest.status !== "REJECTED") {
          return {
            status: 404,
            body: {
              message:
                "Rejected request not found for the specified user in this subgroup",
            },
          };
        }

        await prisma.subGroupMember.delete({
          where: {
            userId_subGroupId: {
              userId: params.userId,
              subGroupId: params.subGroupId,
            },
          },
        });

        return {
          status: 200,
          body: {
            message: `Rejected request for user ID ${params.userId} removed from subgroup ID ${params.subGroupId}`,
            data: rejectedRequest,
          },
        };
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));

        return {
          status: 400,
          body: {
            message: "Error removing rejected request from subgroup",
            details: {
              error: err.message,
              errorStack: err.stack ?? "",
            },
          },
        };
      }
    },
  },
);

const getAllSubgroups = s.route(subgroupApiContracts.subgroup.getAllSubgroups, {
  handler: async () => {
    try {
      const result = await prisma.subGroup.findMany({
        include: {
          region: { select: { name: true } },
          segment: { select: { name: true } },
          subSegment: { select: { name: true } },
          manager: {
            select: {
              id: true,
              email: true,
              adminmodEmail: true,
              fname: true,
              lname: true,
            },
          },
        },
      });

      return {
        status: 200,
        body: result,
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      return {
        status: 400,
        body: {
          message: "An error occurred while trying to retrieve Subgroups.",
          details: {
            errorMessage: err.message,
            errorStack: err.stack ?? "",
          },
        },
      };
    }
  },
});

const getSubgroupsByName = s.route(
  subgroupApiContracts.subgroup.getSubgroupsByName,
  {
    handler: async ({ params }) => {
      try {
        const result = await prisma.subGroup.findMany({
          where: {
            name: {
              contains: params.name,
            },
          },
        });

        if (result.length === 0) {
          return {
            status: 404,
            body: {
              message: `No Subgroups found with name '${params.name}'`,
            },
          };
        }

        return {
          status: 200,
          body: result,
        };
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));

        return {
          status: 400,
          body: {
            message:
              "An error occurred while trying to retrieve Subgroups by name.",
            details: {
              errorMessage: err.message,
              errorStack: err.stack ?? "",
            },
          },
        };
      }
    },
  },
);

const createSubgroup = s.route(subgroupApiContracts.subgroup.createSubgroup, {
  middleware: [passport.authenticate("jwt", { session: false })],
  handler: async ({ req, body }) => {
    try {
      const userId = getRequestUserId(req);

      if (!userId) {
        return {
          status: 403,
          body: {
            message: "You don't have the right to add a subgroup!",
            details: {
              errorMessage: "You must be an admin/mod to create a subgroup.",
              errorStack: "user must be authenticated and authorized",
            },
          },
        };
      }

      const userType = await getSubgroupAdminType(userId);

      if (!userType || !SUBGROUP_ADMIN_TYPES.has(userType)) {
        return {
          status: 403,
          body: {
            message: "You don't have the right to add a subgroup!",
            details: {
              errorMessage: "You must be an admin/mod to create a subgroup.",
              errorStack: "user must be an admin/mod to create a subgroup",
            },
          },
        };
      }

      const newSubGroup = await prisma.subGroup.create({
        data: {
          name: body.name,
          typeField: body.typeField,
          privacyField: body.privacyField,
          isVirtual: body.typeField === "VIRTUAL",
          isPrivate: body.privacyField === "PRIVATE",
          managerId: body.managerId,
          ...(body.description !== undefined
            ? { description: body.description }
            : {}),
          ...(body.regionId !== undefined ? { regionId: body.regionId } : {}),
          ...(body.segmentId !== undefined
            ? { segmentId: body.segmentId }
            : {}),
          ...(body.subSegmentId !== undefined
            ? { subSegmentId: body.subSegmentId }
            : {}),
        } satisfies Prisma.SubGroupUncheckedCreateInput,
        include: {
          manager: true,
        },
      });

      return {
        status: 201,
        body: newSubGroup,
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      return {
        status: 400,
        body: {
          message: "An error occurred while trying to create a Subgroup.",
          details: {
            errorMessage: err.message,
            errorStack: err.stack ?? "",
          },
        },
      };
    }
  },
});

const deleteSubgroup = s.route(subgroupApiContracts.subgroup.deleteSubgroup, {
  middleware: [passport.authenticate("jwt", { session: false })],
  handler: async ({ req, params }) => {
    try {
      const userId = getRequestUserId(req);

      if (!userId) {
        return {
          status: 403,
          body: {
            message: "You don't have the right to delete a subgroup!",
            details: {
              errorMessage: "You must be an admin/mod to delete a subgroup.",
              errorStack: "user must be authenticated and authorized",
            },
          },
        };
      }

      const userType = await getSubgroupAdminType(userId);

      if (!userType || !SUBGROUP_ADMIN_TYPES.has(userType)) {
        return {
          status: 403,
          body: {
            message: "You don't have the right to delete a subgroup!",
            details: {
              errorMessage: "You must be an admin/mod to delete a subgroup.",
              errorStack: "user must be admin/mod to delete subgroup",
            },
          },
        };
      }

      const existingSubGroup = await prisma.subGroup.findUnique({
        where: { id: params.subGroupId },
      });

      if (!existingSubGroup) {
        return {
          status: 404,
          body: {
            message: `Subgroup with id ${params.subGroupId} not found.`,
          },
        };
      }

      await prisma.subGroup.delete({
        where: { id: params.subGroupId },
      });

      return {
        status: 204,
        body: undefined,
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      return {
        status: 400,
        body: {
          message: "An error occurred while trying to delete the subgroup.",
          details: {
            errorMessage: err.message,
            errorStack: err.stack ?? "",
          },
        },
      };
    }
  },
});

const updateSubgroup = s.route(subgroupApiContracts.subgroup.updateSubgroup, {
  middleware: [passport.authenticate("jwt", { session: false })],
  handler: async ({ req, params, body }) => {
    try {
      const userId = getRequestUserId(req);

      if (!userId) {
        return {
          status: 403,
          body: {
            message: "You don't have the right to update a subgroup!",
            details: {
              errorMessage: "You must be an admin/mod to update a subgroup.",
              errorStack: "user must be authenticated and authorized",
            },
          },
        };
      }

      const userType = await getSubgroupAdminType(userId);

      if (!userType || !SUBGROUP_ADMIN_TYPES.has(userType)) {
        return {
          status: 403,
          body: {
            message: "You don't have the right to update a subgroup!",
            details: {
              errorMessage: "You must be an admin/mod to update a subgroup.",
              errorStack: "user must be admin/mod to update subgroup",
            },
          },
        };
      }

      if (Object.keys(body).length === 0) {
        return {
          status: 400,
          body: {
            message: "The objects in the request body are missing",
          },
        };
      }

      const existingSubGroup = await prisma.subGroup.findUnique({
        where: { id: params.subGroupId },
      });

      if (!existingSubGroup) {
        return {
          status: 404,
          body: {
            message: `Subgroup with id ${params.subGroupId} not found.`,
          },
        };
      }

      const data: {
        name?: string;
        description?: string | null;
        typeField?: "VIRTUAL" | "NESTED";
        privacyField?: "PUBLIC" | "PRIVATE" | "TEST";
        isVirtual?: boolean;
        isPrivate?: boolean;
      } = {};

      if (body.name !== undefined) {
        data.name = body.name;
      }

      if (body.description !== undefined) {
        data.description = body.description;
      }

      if (body.typeField !== undefined) {
        data.typeField = body.typeField;
      }

      if (body.privacyField !== undefined) {
        data.privacyField = body.privacyField;
      }

      if (body.typeField !== undefined) {
        data.isVirtual = body.typeField === "VIRTUAL";
      }

      if (body.privacyField !== undefined) {
        data.isPrivate = body.privacyField === "PRIVATE";
      }

      const updatedSubGroup = await prisma.subGroup.update({
        where: { id: params.subGroupId },
        data,
        include: {
          region: { select: { name: true } },
          segment: { select: { name: true } },
          subSegment: { select: { name: true } },
          manager: {
            select: {
              id: true,
              email: true,
              adminmodEmail: true,
              fname: true,
              lname: true,
            },
          },
        },
      });

      return {
        status: 200,
        body: updatedSubGroup,
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      return {
        status: 400,
        body: {
          message: "An error occurred while trying to update a subgroup.",
          details: {
            errorMessage: err.message,
            errorStack: err.stack ?? "",
          },
        },
      };
    }
  },
});

const getEligibleManagers = s.route(
  subgroupApiContracts.subgroup.getEligibleManagers,
  {
    handler: async () => {
      try {
        const managers = await prisma.user.findMany({
          select: {
            id: true,
            email: true,
            adminmodEmail: true,
            fname: true,
            lname: true,
          },
        });

        return {
          status: 200,
          body: managers,
        };
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));

        return {
          status: 500,
          body: {
            message: "Error fetching managers",
            details: err.message,
          },
        };
      }
    },
  },
);

const getAllRequests = s.route(
  subgroupApiContracts.subgroupRequest.getAllRequests,
  {
    handler: async ({ params }) => {
      try {
        if (!params.userId) {
          return {
            status: 400,
            body: {
              message:
                "A valid userId must be specified in the route paramater.",
            },
          };
        }

        const publicSubgroups = await prisma.subGroupMember.findMany({
          where: { userId: params.userId },
          select: {
            id: true,
            subGroup: {
              select: {
                name: true,
              },
            },
            status: true,
            joinedAt: true,
          },
          orderBy: [{ joinedAt: "desc" }],
        });

        return {
          status: 200,
          body: publicSubgroups,
        };
      } catch {
        return {
          status: 500,
          body: {
            message: "Internal server error",
          },
        };
      }
    },
  },
);

const createRequest = s.route(
  subgroupApiContracts.subgroupRequest.createRequest,
  {
    handler: async ({ params }) => {
      try {
        if (!params.userId || !params.subGroupId) {
          return {
            status: 400,
            body: {
              message:
                "A valid userId or subGroupId must be specified in the route paramater.",
            },
          };
        }

        const requestExist = await prisma.subGroupMember.findUnique({
          where: {
            userId_subGroupId: {
              userId: params.userId,
              subGroupId: params.subGroupId,
            },
          },
        });

        if (requestExist) {
          return {
            status: 409,
            body: {
              message: "Request already exists",
            },
          };
        }

        const request = await prisma.subGroupMember.create({
          data: {
            userId: params.userId,
            subGroupId: params.subGroupId,
          },
        });

        return {
          status: 200,
          body: request,
        };
      } catch {
        return {
          status: 500,
          body: {
            message: "Internal server error",
          },
        };
      }
    },
  },
);

const getPublicSubgroups = s.route(subgroupApiContracts.getPublicSubgroups, {
  handler: async ({ params }) => {
    try {
      if (!params.userId) {
        return {
          status: 400,
          body: {
            message: "A valid userId must be specified in the route paramater.",
          },
        };
      }

      const publicSubgroups = await prisma.subGroup.findMany({
        where: {
          privacyField: "PUBLIC",
          managerId: { not: params.userId },
          members: {
            none: {
              userId: params.userId,
            },
          },
        },
        select: {
          id: true,
          name: true,
          region: {
            select: {
              name: true,
            },
          },
          segment: {
            select: {
              name: true,
            },
          },
          subSegment: {
            select: {
              name: true,
            },
          },
          description: true,
        },
        orderBy: { name: "asc" },
      });

      return {
        status: 200,
        body: publicSubgroups,
      };
    } catch {
      return {
        status: 500,
        body: {
          message: "Internal server error",
        },
      };
    }
  },
});

export default createHandlers({
  schema: subgroupApiContracts,
  router: {
    subgroups: {
      getIsSubGroupManager,
      getManagedSubgroups,
      getSubgroupUsers,
      getUsersNotInSubGroup,
      addUserToSubGroup,
      updateUserRequestInSubGroup,
      removeUserFromSubGroup,
      removeRejectedRequestFromSubGroup,
    },
    subgroup: {
      getAllSubgroups,
      getSubgroupsByName,
      createSubgroup,
      deleteSubgroup,
      updateSubgroup,
      getEligibleManagers,
    },
    subgroupRequest: {
      getAllRequests,
      createRequest,
    },
    getPublicSubgroups,
  },
});
