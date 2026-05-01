import { publicProfileApiContracts } from "@mlc/lib/api";
import { prisma } from "src/prisma/client";
import { initServer } from "@ts-rest/express";
import { createHandlers } from "src/server";
import { serializeForContract, toErrorDetails } from "src/server/utils";
import {
  PROFILE_VISIBILITY,
  ProfileVisibility,
  canViewResidentialProfile,
  computeDisplayName,
  getViewerFromRequest,
  isPrivilegedViewer,
} from "./utils";

const s = initServer();

const getStandardProfile = s.route(
  publicProfileApiContracts.getStandardProfile,
  {
    handler: async ({ params }) => {
      try {
        const { userId } = params;
        if (!userId) {
          return {
            status: 400,
            body: {
              message:
                "A valid userId must be specified in the route parameter.",
            },
          } as never;
        }

        const result = await prisma.user.findFirst({
          where: { id: userId },
          include: { userHandles: true },
        });

        if (!result) {
          return {
            status: 400,
            body: {
              message: `The user with that listed ID (${userId}) does not exist.`,
            },
          } as never;
        }

        return {
          status: 200,
          body: serializeForContract({
            ...result,
            password: undefined,
          }),
        };
      } catch (error) {
        return {
          status: 400,
          body: {
            message: "An error occurred while fetching the standard profile.",
            details: toErrorDetails(error),
          },
        };
      }
    },
  },
);

const updateStandardProfile = s.route(
  publicProfileApiContracts.updateStandardProfile,
  {
    handler: async ({ params, body }) => {
      try {
        const { userId } = params;
        if (!userId) {
          return {
            status: 400,
            body: {
              message:
                "A valid userId must be specified in the route parameter.",
            },
          } as never;
        }

        const result = await prisma.user.update({
          where: { id: userId },
          data: {
            updatedAt: new Date(),
            ...(body.fname !== undefined && { fname: body.fname }),
            ...(body.lname !== undefined && { lname: body.lname }),
            ...(body.email !== undefined && { email: body.email }),
          },
        });

        return {
          status: 200,
          body: serializeForContract({ ...result, password: undefined }),
        };
      } catch (error) {
        return {
          status: 400,
          body: {
            message: "An error occurred while updating the standard profile.",
            details: toErrorDetails(error),
          },
        };
      }
    },
  },
);

const getCommunityBusinessProfile = s.route(
  publicProfileApiContracts.getCommunityBusinessProfile,
  {
    handler: async ({ params, req }) => {
      try {
        const { userId } = params;
        const viewer = await getViewerFromRequest(req);

        if (!userId) {
          return {
            status: 400,
            body: {
              message:
                "A valid userId must be specified in the route parameter.",
            },
          } as never;
        }

        const result =
          await prisma.public_Community_Business_Profile.findFirst({
            where: { userId },
            include: {
              links: true,
              user: {
                select: {
                  id: true,
                  fname: true,
                  lname: true,
                  email: true,
                  createdAt: true,
                  userType: true,
                  organizationName: true,
                  displayFName: true,
                  displayLName: true,
                  enhancedMember: { select: { userId: true } },
                },
              },
            },
          });

        if (!result) {
          return {
            status: 400,
            body: {
              message: `The profile for user (${userId}) does not exist.`,
            },
          } as never;
        }

        if (result.user && result.user.userType === "RESIDENTIAL") {
          const canView = await canViewResidentialProfile({
            viewer,
            ownerId: result.user.id,
            visibility: result.profileVisibility as ProfileVisibility,
          });
          if (!canView) {
            return {
              status: 400,
              body: {
                message:
                  "This profile is not visible to your account based on user preferences.",
              },
            } as never;
          }
          const user = {
            ...result.user,
            displayName: computeDisplayName(result.user),
            isEnhancedMember: !!result.user.enhancedMember,
          };
          return {
            status: 200,
            body: serializeForContract({ ...result, user }),
          };
        }

        const user = result.user
          ? { ...result.user, isEnhancedMember: !!result.user.enhancedMember }
          : result.user;

        return {
          status: 200,
          body: serializeForContract({ ...result, user }),
        };
      } catch (error) {
        return {
          status: 400,
          body: {
            message:
              "An error occurred while fetching the community/business profile.",
            details: toErrorDetails(error),
          },
        };
      }
    },
  },
);

const upsertCommunityBusinessProfile = s.route(
  publicProfileApiContracts.upsertCommunityBusinessProfile,
  {
    handler: async ({ params, body }) => {
      try {
        const { userId } = params;
        if (!userId) {
          return {
            status: 400,
            body: {
              message:
                "A valid userId must be specified in the route parameter.",
            },
          } as never;
        }

        const {
          statement,
          description,
          links,
          address,
          contactFirstName,
          contactLastName,
          contactEmail,
          contactPhone,
          profileVisibility,
        } = body;
        const profileLinks = Array.isArray(links) ? links : [];
        const effectiveVisibility =
          profileVisibility || PROFILE_VISIBILITY.PUBLIC;
        const updatedAt = new Date();

        const existingProfile =
          await prisma.public_Community_Business_Profile.findFirst({
            where: { userId },
          });

        if (!existingProfile) {
          const created = await prisma.public_Community_Business_Profile.create(
            {
              data: {
                userId,
                statement: statement ?? null,
                description: description ?? null,
                profileVisibility: effectiveVisibility,
                address: address ?? null,
                contactFirstName: contactFirstName ?? null,
                contactLastName: contactLastName ?? null,
                contactEmail: contactEmail ?? null,
                contactPhone: contactPhone ?? null,
                updatedAt,
              },
            },
          );

          const createdLinks = await Promise.all(
            profileLinks.map((l) =>
              prisma.link.create({
                data: {
                  link: l.link,
                  linkType: l.linkType,
                  public_Community_Business_ProfileId: created.id,
                },
              }),
            ),
          );

          const result =
            await prisma.public_Community_Business_Profile.update({
              where: { id: created.id },
              data: { links: { connect: createdLinks.map((l) => ({ id: l.id })) } },
              include: { links: true },
            });

          return { status: 200, body: serializeForContract(result) };
        }

        // Delete old links then recreate.
        await prisma.link.deleteMany({
          where: { public_Community_Business_ProfileId: existingProfile.id },
        });

        const createdLinks = await Promise.all(
          profileLinks.map((l) =>
            prisma.link.create({
              data: {
                link: l.link,
                linkType: l.linkType,
                public_Community_Business_ProfileId: existingProfile.id,
              },
            }),
          ),
        );

        const result = await prisma.public_Community_Business_Profile.update({
          where: { id: existingProfile.id },
          data: {
            statement: statement ?? null,
            description: description ?? null,
            profileVisibility: effectiveVisibility,
            address: address ?? null,
            contactFirstName: contactFirstName ?? null,
            contactLastName: contactLastName ?? null,
            contactEmail: contactEmail ?? null,
            contactPhone: contactPhone ?? null,
            updatedAt,
            links: { connect: createdLinks.map((l) => ({ id: l.id })) },
          },
          include: { links: true },
        });

        return { status: 200, body: serializeForContract(result) };
      } catch (error) {
        return {
          status: 400,
          body: {
            message:
              "An error occurred while upserting the community/business profile.",
            details: toErrorDetails(error),
          },
        };
      }
    },
  },
);

const getCommunityBusinessProfileLinks = s.route(
  publicProfileApiContracts.getCommunityBusinessProfileLinks,
  {
    handler: async ({ params }) => {
      try {
        const profileId = parseInt(params.profileId, 10);
        if (!profileId) {
          return {
            status: 400,
            body: {
              message:
                "A valid profileId must be specified in the route parameter.",
            },
          } as never;
        }

        const result = await prisma.link.findMany({
          where: { public_Community_Business_ProfileId: profileId },
        });

        return { status: 200, body: serializeForContract(result) };
      } catch (error) {
        return {
          status: 400,
          body: {
            message: "An error occurred while fetching profile links.",
            details: toErrorDetails(error),
          },
        };
      }
    },
  },
);

const getMunicipalProfile = s.route(
  publicProfileApiContracts.getMunicipalProfile,
  {
    handler: async ({ params }) => {
      try {
        const { userId } = params;
        if (!userId) {
          return {
            status: 400,
            body: {
              message:
                "A valid userId must be specified in the route parameter.",
            },
          } as never;
        }

        const result = await prisma.public_Municipal_Profile.findFirst({
          where: { userId },
          include: {
            links: true,
            user: {
              select: {
                id: true,
                fname: true,
                lname: true,
                email: true,
                createdAt: true,
                userType: true,
                organizationName: true,
                displayFName: true,
                displayLName: true,
                enhancedMember: { select: { userId: true } },
              },
            },
          },
        });

        if (!result) {
          return {
            status: 400,
            body: {
              message: `The municipal profile for user (${userId}) does not exist.`,
            },
          } as never;
        }

        const user = result.user
          ? {
              ...result.user,
              isEnhancedMember: !!result.user.enhancedMember,
              ...(result.user.userType === "RESIDENTIAL" && {
                displayName: computeDisplayName(result.user),
              }),
            }
          : result.user;

        return {
          status: 200,
          body: serializeForContract({ ...result, user }),
        };
      } catch (error) {
        return {
          status: 400,
          body: {
            message: "An error occurred while fetching the municipal profile.",
            details: toErrorDetails(error),
          },
        };
      }
    },
  },
);

const upsertMunicipalProfile = s.route(
  publicProfileApiContracts.upsertMunicipalProfile,
  {
    handler: async ({ params, body }) => {
      try {
        const { userId } = params;
        if (!userId) {
          return {
            status: 400,
            body: {
              message:
                "A valid userId must be specified in the route parameter.",
            },
          } as never;
        }

        const {
          statement,
          responsibility,
          links,
          address,
          contactEmail,
          contactPhone,
        } = body;
        const profileLinks = Array.isArray(links) ? links : [];
        const updatedAt = new Date();

        const existingProfile =
          await prisma.public_Municipal_Profile.findFirst({
            where: { userId },
          });

        if (!existingProfile) {
          const created = await prisma.public_Municipal_Profile.create({
            data: {
              userId,
              statement: statement ?? "",
              responsibility: responsibility ?? "",
              address: address ?? "",
              contactEmail: contactEmail ?? null,
              contactPhone: contactPhone ?? null,
              updatedAt,
            },
          });

          const createdLinks = await Promise.all(
            profileLinks.map((l) =>
              prisma.link.create({
                data: {
                  link: l.link,
                  linkType: l.linkType,
                  public_Municipal_ProfileId: created.id,
                },
              }),
            ),
          );

          const result = await prisma.public_Municipal_Profile.update({
            where: { id: created.id },
            data: { links: { connect: createdLinks.map((l) => ({ id: l.id })) } },
            include: { links: true },
          });

          return { status: 200, body: serializeForContract(result) };
        }

        await prisma.link.deleteMany({
          where: { public_Municipal_ProfileId: existingProfile.id },
        });

        const createdLinks = await Promise.all(
          profileLinks.map((l) =>
            prisma.link.create({
              data: {
                link: l.link,
                linkType: l.linkType,
                public_Municipal_ProfileId: existingProfile.id,
              },
            }),
          ),
        );

        const result = await prisma.public_Municipal_Profile.update({
          where: { id: existingProfile.id },
          data: {
            statement: statement ?? existingProfile.statement,
            responsibility: responsibility ?? existingProfile.responsibility,
            address: address ?? existingProfile.address,
            contactEmail: contactEmail ?? null,
            contactPhone: contactPhone ?? null,
            updatedAt,
            links: { connect: createdLinks.map((l) => ({ id: l.id })) },
          },
          include: { links: true },
        });

        return { status: 200, body: serializeForContract(result) };
      } catch (error) {
        return {
          status: 400,
          body: {
            message: "An error occurred while upserting the municipal profile.",
            details: toErrorDetails(error),
          },
        };
      }
    },
  },
);

const getMunicipalProfileLinks = s.route(
  publicProfileApiContracts.getMunicipalProfileLinks,
  {
    handler: async ({ params }) => {
      try {
        const profileId = parseInt(params.profileId, 10);
        if (!profileId) {
          return {
            status: 400,
            body: {
              message:
                "A valid profileId must be specified in the route parameter.",
            },
          } as never;
        }

        const result = await prisma.link.findMany({
          where: { public_Municipal_ProfileId: profileId },
        });

        return { status: 200, body: serializeForContract(result) };
      } catch (error) {
        return {
          status: 400,
          body: {
            message:
              "An error occurred while fetching municipal profile links.",
            details: toErrorDetails(error),
          },
        };
      }
    },
  },
);

const getAllProfiles = s.route(publicProfileApiContracts.getAllProfiles, {
  handler: async ({ query, req }) => {
    try {
      const viewer = await getViewerFromRequest(req);
      const {
        search = "",
        profileType,
        communityId,
        neighbourhoodId,
      } = query;

      let userIdFilter: string[] | undefined;

      if (communityId && neighbourhoodId) {
        const [communityUsers, neighbourhoodUsers] = await Promise.all([
          prisma.userSegments.findMany({
            where: { segmentId: Number(communityId) },
            select: { userId: true },
          }),
          prisma.userSegments.findMany({
            where: { segmentId: Number(neighbourhoodId) },
            select: { userId: true },
          }),
        ]);
        const communityIds = communityUsers.map((u) => u.userId);
        const neighbourhoodIds = neighbourhoodUsers.map((u) => u.userId);
        userIdFilter = communityIds.filter((id) =>
          neighbourhoodIds.includes(id),
        );
        if (userIdFilter.length === 0) {
          return {
            status: 200,
            body: { profiles: [], totalCount: 0 },
          };
        }
      } else if (communityId || neighbourhoodId) {
        const segmentId = Number(communityId || neighbourhoodId);
        const userSegments = await prisma.userSegments.findMany({
          where: { segmentId },
          select: { userId: true },
        });
        userIdFilter = userSegments.map((us) => us.userId);
        if (userIdFilter.length === 0) {
          return {
            status: 200,
            body: { profiles: [], totalCount: 0 },
          };
        }
      }

      const userTypeFilter =
        profileType === "municipal"
          ? { userType: "MUNICIPAL" as const }
          : profileType === "community"
            ? { userType: { in: ["BUSINESS", "COMMUNITY"] as const } }
            : profileType === "residential"
              ? { userType: "RESIDENTIAL" as const }
              : {
                  userType: {
                    in: [
                      "MUNICIPAL",
                      "BUSINESS",
                      "COMMUNITY",
                      "RESIDENTIAL",
                    ] as const,
                  },
                };

      const searchWhere = {
        status: true,
        ...(userIdFilter && { id: { in: userIdFilter } }),
        ...(search && {
          OR: [
            { fname: { contains: search, mode: "insensitive" as const } },
            { lname: { contains: search, mode: "insensitive" as const } },
            {
              organizationName: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
          ],
        }),
        ...userTypeFilter,
      };

      const users = await prisma.user.findMany({
        where: searchWhere,
        include: {
          address: true,
          userReach: { include: { segment: true } },
          ideas: { where: { active: true }, select: { id: true, authorId: true } },
        },
        orderBy: [{ createdAt: "desc" }],
      });

      // Resolve residential visibility.
      const residentialUsers = users.filter((u) => u.userType === "RESIDENTIAL");
      const residentialUserIds = residentialUsers.map((u) => u.id);

      const profileRows = residentialUserIds.length
        ? await prisma.public_Community_Business_Profile.findMany({
            where: { userId: { in: residentialUserIds } },
            select: { userId: true, profileVisibility: true },
          })
        : [];

      const visibilityByUserId: Record<string, ProfileVisibility> =
        profileRows.reduce(
          (acc, row) => {
            acc[row.userId] =
              (row.profileVisibility as ProfileVisibility) ||
              PROFILE_VISIBILITY.PUBLIC;
            return acc;
          },
          {} as Record<string, ProfileVisibility>,
        );

      const residentialAllowedUserIds = new Set<string>();
      const defaultAllowedUserIds = new Set<string>();

      users.forEach((u) => {
        if (u.userType !== "RESIDENTIAL") defaultAllowedUserIds.add(u.id);
      });

      if (residentialUsers.length > 0) {
        if (isPrivilegedViewer(viewer)) {
          residentialUsers.forEach((u) => residentialAllowedUserIds.add(u.id));
        } else {
          const viewerMemberships = viewer
            ? await prisma.subGroupMember.findMany({
                where: { userId: viewer.id, status: "APPROVED" },
                select: { subGroupId: true },
              })
            : [];
          const viewerSubgroupSet = new Set(
            viewerMemberships.map((m) => m.subGroupId),
          );

          const ownerMemberships =
            viewer && viewerSubgroupSet.size
              ? await prisma.subGroupMember.findMany({
                  where: {
                    userId: { in: residentialUserIds },
                    status: "APPROVED",
                    subGroupId: { in: Array.from(viewerSubgroupSet) },
                  },
                  select: { userId: true },
                })
              : [];
          const ownerCommunityMemberSet = new Set(
            ownerMemberships.map((m) => m.userId),
          );

          residentialUsers.forEach((u) => {
            const visibility =
              visibilityByUserId[u.id] || PROFILE_VISIBILITY.PUBLIC;

            if (viewer?.id === u.id || visibility === PROFILE_VISIBILITY.PUBLIC) {
              residentialAllowedUserIds.add(u.id);
              return;
            }
            if (!viewer) return;
            if (
              visibility === PROFILE_VISIBILITY.COMMUNITY_MEMBERS &&
              ownerCommunityMemberSet.has(u.id)
            ) {
              residentialAllowedUserIds.add(u.id);
            }
          });
        }
      }

      const allowedUserIds = new Set([
        ...Array.from(defaultAllowedUserIds),
        ...Array.from(residentialAllowedUserIds),
      ]);
      const filteredUsers = users.filter((u) => allowedUserIds.has(u.id));
      const totalCount = filteredUsers.length;

      // Batch endorsement query.
      const allIdeaIds = filteredUsers.flatMap((u) =>
        u.ideas.map((idea) => idea.id),
      );
      let endorsementsByIdea: Record<number, number> = {};

      if (allIdeaIds.length > 0) {
        const ratings = await prisma.ideaRating.groupBy({
          by: ["ideaId"],
          where: { ideaId: { in: allIdeaIds }, rating: { gt: 0 } },
          _count: { id: true },
        });
        endorsementsByIdea = ratings.reduce(
          (acc, r) => {
            acc[r.ideaId] = r._count.id;
            return acc;
          },
          {} as Record<number, number>,
        );
      }

      const endorsementsByUser: Record<string, number> = {};
      filteredUsers.forEach((u) => {
        endorsementsByUser[u.id] = u.ideas.reduce(
          (sum, idea) => sum + (endorsementsByIdea[idea.id] || 0),
          0,
        );
      });

      const profiles = filteredUsers.map((user) => {
        const pType =
          user.userType === "MUNICIPAL"
            ? "municipal"
            : user.userType === "RESIDENTIAL"
              ? "residential"
              : user.userType === "BUSINESS"
                ? "business"
                : "community";

        const addressParts = [
          (user.address as { streetAddress?: string } | null)?.streetAddress,
          (user.address as { city?: string } | null)?.city,
        ].filter(Boolean);
        const location =
          addressParts.join(", ") ||
          (user.userReach as Array<{ segment?: { name?: string } }>)?.[0]
            ?.segment?.name ||
          "";

        return {
          id: user.id,
          userId: user.id,
          fname: user.fname,
          lname: user.lname,
          avatar: user.imagePath,
          profileType: pType as
            | "municipal"
            | "community"
            | "business"
            | "residential",
          location,
          endorsements: endorsementsByUser[user.id] || 0,
          postsCount: user.ideas.length,
          businessName:
            user.userType === "BUSINESS" || user.userType === "COMMUNITY"
              ? user.organizationName
              : null,
          municipalityName:
            user.userType === "MUNICIPAL" ? user.organizationName : null,
          userName:
            user.userType === "RESIDENTIAL"
              ? `${user.displayFName || user.fname || ""}@${user.displayLName || user.lname || ""}`
              : null,
          userType: user.userType,
          profileVisibility:
            user.userType === "RESIDENTIAL"
              ? visibilityByUserId[user.id] || PROFILE_VISIBILITY.PUBLIC
              : PROFILE_VISIBILITY.PUBLIC,
        };
      });

      profiles.sort((a, b) => {
        const aScore = a.endorsements + a.postsCount;
        const bScore = b.endorsements + b.postsCount;
        return bScore - aScore;
      });

      return {
        status: 200,
        body: serializeForContract({ profiles, totalCount }),
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "An error occurred while fetching public profiles.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

export default createHandlers({
  schema: publicProfileApiContracts,
  router: {
    getStandardProfile,
    updateStandardProfile,
    getCommunityBusinessProfile,
    upsertCommunityBusinessProfile,
    getCommunityBusinessProfileLinks,
    getMunicipalProfile,
    upsertMunicipalProfile,
    getMunicipalProfileLinks,
    getAllProfiles,
  },
});
