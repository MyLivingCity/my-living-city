import { initServer } from "@ts-rest/express";
import { createHandlers } from "src/server";
import { prisma } from "src/prisma/client";
import { toErrorDetails } from "src/server/utils";
import { communityApiContracts } from "@mlc/lib/api";
import { getRequestUser, parseIntegerParam, toSerialized } from "./utils";
import { commentApiHandlers } from "./comment";
import { commentInteractionApiHandlers } from "./commentInteractions";
import { advertisementApiHandlers } from "./advertisement";
import { authenticateJwt } from "src/server/middleware/auth";

const s = initServer();

const communityCreateCollaborator = s.route(
  communityApiContracts.community.createCollaborator,
  {
    middleware: [authenticateJwt],
    handler: async ({ req, body }) => {
      try {
        const user = getRequestUser(req);
        const parsedProposalId = parseIntegerParam(
          String((body as any).proposalId),
        );

        if (!parsedProposalId) {
          return {
            status: 400,
            body: {
              message:
                "A valid ideaId must be specified in the route paramater.",
            },
          };
        }

        const foundProposal = await prisma.proposal.findUnique({
          where: { id: parsedProposalId },
        });

        if (!foundProposal) {
          return {
            status: 400,
            body: {
              message: `The idea with that listed ID (${parsedProposalId}) does not exist.`,
            },
          };
        }

        const createdCollaborator = await prisma.collaborator.upsert({
          where: {
            collaborator_unique: {
              proposalId: parsedProposalId,
              authorId: user?.id ?? "",
            },
          },
          update: {
            experience: (body as any).experience,
            role: (body as any).role,
            time: (body as any).time,
            contactInfo: (body as any).contactInfo,
          },
          create: {
            authorId: user?.id ?? "",
            proposalId: parsedProposalId,
            experience: (body as any).experience,
            role: (body as any).role,
            time: (body as any).time,
            contactInfo: (body as any).contactInfo,
          },
        });

        return {
          status: 200,
          body: toSerialized(createdCollaborator),
        };
      } catch (error) {
        return {
          status: 400,
          body: {
            message: `Error creating collaborator: ${error}`,
            details: toErrorDetails(error),
          },
        };
      }
    },
  },
);

const communityGetCollaborators = s.route(
  communityApiContracts.community.getCollaborators,
  {
    handler: async ({ params }) => {
      try {
        const parsedProposalId = parseIntegerParam(params.proposalId);
        const collaborators = await prisma.collaborator.findMany(
          parsedProposalId
            ? {
              where: {
                proposalId: parsedProposalId,
              },
            }
            : undefined,
        );

        return {
          status: 200,
          body: toSerialized(collaborators),
        };
      } catch (error) {
        return {
          status: 400,
          body: {
            message: "Cannot get collaborators.",
            details: toErrorDetails(error),
          },
        };
      }
    },
  },
);

const communityCreateVolunteer = s.route(
  communityApiContracts.community.createVolunteer,
  {
    middleware: [authenticateJwt],
    handler: async ({ req, body }) => {
      try {
        const user = getRequestUser(req);
        const parsedProposalId = parseIntegerParam(
          String((body as any).proposalId),
        );

        if (!parsedProposalId) {
          return {
            status: 400,
            body: {
              message:
                "A valid ideaId must be specified in the route paramater.",
            },
          };
        }

        const foundProposal = await prisma.proposal.findUnique({
          where: { id: parsedProposalId },
        });

        if (!foundProposal) {
          return {
            status: 400,
            body: {
              message: `The idea with that listed ID (${parsedProposalId}) does not exist.`,
            },
          };
        }

        const createdVolunteer = await prisma.volunteer.upsert({
          where: {
            volunteer_unique: {
              proposalId: parsedProposalId,
              authorId: user?.id ?? "",
            },
          },
          update: {
            experience: (body as any).experience,
            task: (body as any).task,
            time: (body as any).time,
            contactInfo: (body as any).contactInfo,
          },
          create: {
            authorId: user?.id ?? "",
            proposalId: parsedProposalId,
            experience: (body as any).experience,
            task: (body as any).task,
            time: (body as any).time,
            contactInfo: (body as any).contactInfo,
          },
        });

        return {
          status: 200,
          body: toSerialized(createdVolunteer),
        };
      } catch (error) {
        return {
          status: 400,
          body: {
            message: `Error creating volunteer: ${error}`,
            details: toErrorDetails(error),
          },
        };
      }
    },
  },
);

const communityGetVolunteers = s.route(
  communityApiContracts.community.getVolunteers,
  {
    handler: async ({ params }) => {
      try {
        const parsedProposalId = parseIntegerParam(params.proposalId);
        const volunteers = await prisma.volunteer.findMany(
          parsedProposalId
            ? {
              where: {
                proposalId: parsedProposalId,
              },
            }
            : undefined,
        );

        return {
          status: 200,
          body: toSerialized(volunteers),
        };
      } catch (error) {
        return {
          status: 400,
          body: {
            message: "Cannot get volunteers.",
            details: toErrorDetails(error),
          },
        };
      }
    },
  },
);

const communityCreateDonor = s.route(
  communityApiContracts.community.createDonor,
  {
    middleware: [authenticateJwt],
    handler: async ({ req, body }) => {
      try {
        const user = getRequestUser(req);
        const parsedProposalId = parseIntegerParam(
          String((body as any).proposalId),
        );

        if (!parsedProposalId) {
          return {
            status: 400,
            body: {
              message:
                "A valid ideaId must be specified in the route paramater.",
            },
          };
        }

        const foundProposal = await prisma.proposal.findUnique({
          where: { id: parsedProposalId },
        });

        if (!foundProposal) {
          return {
            status: 400,
            body: {
              message: `The idea with that listed ID (${parsedProposalId}) does not exist.`,
            },
          };
        }

        const createdDonor = await prisma.donor.upsert({
          where: {
            donor_unique: {
              proposalId: parsedProposalId,
              authorId: user?.id ?? "",
            },
          },
          update: {
            donations: (body as any).donations,
            contactInfo: (body as any).contactInfo,
          },
          create: {
            authorId: user?.id ?? "",
            proposalId: parsedProposalId,
            donations: (body as any).donations,
            contactInfo: (body as any).contactInfo,
          },
        });

        return {
          status: 200,
          body: toSerialized(createdDonor),
        };
      } catch (error) {
        return {
          status: 400,
          body: {
            message: `Error creating donor: ${error}`,
            details: toErrorDetails(error),
          },
        };
      }
    },
  },
);

const communityGetDonors = s.route(communityApiContracts.community.getDonors, {
  handler: async ({ params }) => {
    try {
      const parsedProposalId = parseIntegerParam(params.proposalId);
      const donors = await prisma.donor.findMany(
        parsedProposalId
          ? {
            where: {
              proposalId: parsedProposalId,
            },
          }
          : undefined,
      );

      return {
        status: 200,
        body: toSerialized(donors),
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "Cannot get donors.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const blogRoot = s.route(communityApiContracts.blogRoot, {
  handler: async () => {
    try {
      return {
        status: 200,
        body: {
          route: "welcome to blog Router",
        },
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: error instanceof Error ? error.message : String(error),
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const categoryRoot = s.route(communityApiContracts.category.get, {
  handler: async () => {
    try {
      return {
        status: 200,
        body: {
          route: "welcome to Category Router",
        },
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: error instanceof Error ? error.message : String(error),
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const categoryGetAll = s.route(communityApiContracts.category.getAll, {
  handler: async () => {
    try {
      const allIdeas = await prisma.category.findMany();

      return {
        status: 200,
        body: toSerialized(allIdeas),
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "An error occured while trying to fetch all categories",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const categoryGetById = s.route(communityApiContracts.category.getById, {
  handler: async ({ params }) => {
    try {
      const parsedCatId = parseIntegerParam(params.categoryId);

      if (!parsedCatId) {
        return {
          status: 400,
          body: {
            message:
              "A valid categoryId must be specified in the route parameter",
          },
        };
      }

      const foundCategory = await prisma.category.findUnique({
        where: { id: parsedCatId },
      });

      if (!foundCategory) {
        return {
          status: 400,
          body: {
            message: `The category with listed ID (${parsedCatId}) does not exist.`,
          },
        };
      }

      return {
        status: 200,
        body: toSerialized(foundCategory),
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "An error occured while trying to fetch all categories",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

export default createHandlers({
  schema: communityApiContracts,
  router: {
    comment: commentApiHandlers.router,
    interact: commentInteractionApiHandlers.router,
    advertisement: advertisementApiHandlers.router,
    blogRoot,
    category: {
      getAll: categoryGetAll,
      getById: categoryGetById,
      get: categoryRoot,
    },
    community: {
      createCollaborator: communityCreateCollaborator,
      createDonor: communityCreateDonor,
      createVolunteer: communityCreateVolunteer,
      getCollaborators: communityGetCollaborators,
      getDonors: communityGetDonors,
      getVolunteers: communityGetVolunteers,
    },
  },
});
