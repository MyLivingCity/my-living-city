import passport from "passport";
import { proposalApiContracts } from "@mlc/lib/api";
import { prisma } from "src/prisma/client";
import { initServer } from "@ts-rest/express";
import { createHandlers } from "src/server";
import { serializeForContract, toErrorDetails } from "src/server/utils";

const s = initServer();

const PROPOSAL_FULL_INCLUDE = {
  suggestedIdeas: {
    select: {
      id: true,
      title: true,
      segments: true,
      ratings: true,
      comments: true,
      author: {
        select: {
          fname: true,
          lname: true,
          displayFName: true,
          displayLName: true,
          School_Details: true,
          Work_Details: true,
          userHandles: true,
          userSegment: {
            select: {
              userSegmentRelationship: true,
              segmentId: true,
              segment: true,
            },
          },
        },
      },
    },
  },
  collaborations: {
    select: {
      experience: true,
      role: true,
      time: true,
      contactInfo: true,
      author: { select: { id: true, fname: true, lname: true } },
    },
  },
  volunteers: {
    select: {
      experience: true,
      task: true,
      time: true,
      contactInfo: true,
      author: {
        select: { id: true, fname: true, lname: true, address: true },
      },
    },
  },
  donors: {
    select: {
      donations: true,
      contactInfo: true,
      author: {
        select: { id: true, fname: true, lname: true, address: true },
      },
    },
  },
} as const;

const getAll = s.route(proposalApiContracts.getAll, {
  handler: async () => {
    try {
      const proposals = await prisma.proposal.findMany();
      return {
        status: 200,
        body: serializeForContract(proposals),
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "An error occurred while trying to fetch all proposals.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const getAllWithSort = s.route(proposalApiContracts.getAllWithSort, {
  handler: async ({ body }) => {
    try {
      const allProposals = await prisma.proposal.findMany(body as never);
      return {
        status: 200,
        body: serializeForContract(allProposals),
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "An error occurred while trying to fetch proposals.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const getAllWithAggregations = s.route(
  proposalApiContracts.getAllWithAggregations,
  {
    handler: async () => {
      try {
        const proposals = await prisma.proposal.findMany({
          include: {
            idea: {
              include: { ratings: true },
            },
          },
        });
        return {
          status: 200,
          body: serializeForContract(proposals),
        };
      } catch (error) {
        return {
          status: 400,
          body: {
            message:
              "An error occurred while trying to fetch proposals with aggregations.",
            details: toErrorDetails(error),
          },
        };
      }
    },
  },
);

const getByIdeaId = s.route(proposalApiContracts.getByIdeaId, {
  handler: async ({ params }) => {
    try {
      const parsedIdeaId = parseInt(params.ideaId, 10);

      if (!parsedIdeaId) {
        return {
          status: 400,
          body: {
            message: "A valid ideaId must be specified in the route parameter.",
          },
        } as never;
      }

      const foundProposal = await prisma.proposal.findUnique({
        where: { ideaId: parsedIdeaId },
        include: PROPOSAL_FULL_INCLUDE,
      });

      if (!foundProposal) {
        return {
          status: 400,
          body: {
            message: `The proposal for idea ID (${parsedIdeaId}) does not exist.`,
          },
        } as never;
      }

      return {
        status: 200,
        body: serializeForContract(foundProposal),
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: `An error occurred while trying to fetch proposal for idea ${params.ideaId}.`,
          details: toErrorDetails(error),
        },
      };
    }
  },
});
const getByIdEmpty = s.route(proposalApiContracts.getByIdEmpty, {
  handler: async () => {
    return {
      status: 200,
      body: null,
    };
  },
});
const getById = s.route(proposalApiContracts.getById, {
  handler: async ({ params }) => {
    try {
      const parsedProposalId = parseInt(params.proposalId, 10);

      if (!parsedProposalId) {
        return {
          status: 400,
          body: {
            message:
              "A valid proposalId must be specified in the route parameter.",
          },
        } as never;
      }

      const foundProposal = await prisma.proposal.findUnique({
        where: { id: parsedProposalId },
        include: PROPOSAL_FULL_INCLUDE,
      });

      if (!foundProposal) {
        return {
          status: 400,
          body: {
            message: `The proposal with that listed ID (${parsedProposalId}) does not exist.`,
          },
        } as never;
      }

      return {
        status: 200,
        body: serializeForContract(foundProposal),
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: `An error occurred while trying to fetch proposal ${params.proposalId}.`,
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const create = s.route(proposalApiContracts.create, {
  middleware: [passport.authenticate("jwt", { session: false })],
  handler: async ({ body, req }) => {
    try {
      const { id: loggedInUserId } = req.user as { id: string };

      const isBanned = await prisma.bad_Posting_Behavior.findFirst({
        where: { userId: loggedInUserId, post_comment_ban: true },
      });
      if (isBanned) {
        return {
          status: 400,
          body: {
            message: "User is banned from posting.",
            details: {
              errorMessage:
                "User is in bad posting behavior table with post_comment_ban: true.",
              errorStack: "",
            },
          },
        };
      }

      const createdProposal = await prisma.proposal.create({
        data: {
          ideaId: body.ideaId,
          needCollaborators: body.needCollaborators ?? false,
          needVolunteers: body.needVolunteers ?? false,
          needDonations: body.needDonations ?? false,
          needFeedback: body.needFeedback ?? false,
          needSuggestions: body.needSuggestions ?? false,
          location: body.location ?? null,
          feedback1: body.feedback1 ?? null,
          feedback2: body.feedback2 ?? null,
          feedback3: body.feedback3 ?? null,
          feedback4: body.feedback4 ?? null,
          feedback5: body.feedback5 ?? null,
          feedbackType1: body.feedbackType1 ?? null,
          feedbackType2: body.feedbackType2 ?? null,
          feedbackType3: body.feedbackType3 ?? null,
          feedbackType4: body.feedbackType4 ?? null,
          feedbackType5: body.feedbackType5 ?? null,
        },
      });

      return {
        status: 201,
        body: serializeForContract(createdProposal),
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "An error occurred while trying to create a proposal.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const update = s.route(proposalApiContracts.update, {
  middleware: [passport.authenticate("jwt", { session: false })],
  handler: async ({ params, body, req }) => {
    try {
      const { id: loggedInUserId, email } = req.user as {
        id: string;
        email: string;
      };
      const parsedIdeaId = parseInt(params.ideaId, 10);

      if (!parsedIdeaId) {
        return {
          status: 400,
          body: {
            message: "A valid ideaId must be specified in the route parameter.",
          },
        } as never;
      }

      const foundIdea = await prisma.idea.findUnique({
        where: { id: parsedIdeaId },
      });
      if (!foundIdea) {
        return {
          status: 400,
          body: {
            message: `The idea with that listed ID (${parsedIdeaId}) does not exist.`,
          },
        } as never;
      }

      if (foundIdea.authorId !== loggedInUserId) {
        return {
          status: 400,
          body: {
            message: `The user ${email} is not the author and therefore cannot edit this proposal.`,
          },
        } as never;
      }

      // Only update fields that were actually provided.
      const ideaUpdateData = {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.description !== undefined && {
          description: body.description,
        }),
        ...(body.communityImpact !== undefined && {
          communityImpact: body.communityImpact,
        }),
        ...(body.natureImpact !== undefined && {
          natureImpact: body.natureImpact,
        }),
        ...(body.artsImpact !== undefined && { artsImpact: body.artsImpact }),
        ...(body.energyImpact !== undefined && {
          energyImpact: body.energyImpact,
        }),
        ...(body.manufacturingImpact !== undefined && {
          manufacturingImpact: body.manufacturingImpact,
        }),
      };

      const geoData = {
        ...(body.geo?.lat !== undefined && { lat: body.geo.lat }),
        ...(body.geo?.lon !== undefined && { lon: body.geo.lon }),
      };

      const addressData = {
        ...(body.address?.streetAddress !== undefined && {
          streetAddress: body.address.streetAddress,
        }),
        ...(body.address?.streetAddress2 !== undefined && {
          streetAddress2: body.address.streetAddress2,
        }),
        ...(body.address?.city !== undefined && {
          city: body.address.city,
        }),
        ...(body.address?.country !== undefined && {
          country: body.address.country,
        }),
        ...(body.address?.postalCode !== undefined && {
          postalCode: body.address.postalCode,
        }),
      };

      const updatedProposal = await prisma.idea.update({
        where: { id: parsedIdeaId },
        data: {
          ...ideaUpdateData,
          ...(Object.keys(geoData).length > 0 && {
            geo: { update: geoData },
          }),
          ...(Object.keys(addressData).length > 0 && {
            address: { update: addressData },
          }),
        },
        include: { geo: true, address: true },
      });

      return {
        status: 200,
        body: serializeForContract({
          message: "Proposal successfully updated",
          idea: updatedProposal,
        }),
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "An error occurred while trying to update the proposal.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const deleteProposal = s.route(proposalApiContracts.deleteProposal, {
  middleware: [passport.authenticate("jwt", { session: false })],
  handler: async ({ params, req }) => {
    try {
      const { id: loggedInUserId, email } = req.user as {
        id: string;
        email: string;
      };
      const parsedIdeaId = parseInt(params.ideaId, 10);

      if (!parsedIdeaId) {
        return {
          status: 400,
          body: {
            message: "A valid ideaId must be specified in the route parameter.",
          },
        } as never;
      }

      const foundIdea = await prisma.idea.findUnique({
        where: { id: parsedIdeaId },
      });
      if (!foundIdea) {
        return {
          status: 400,
          body: {
            message: `The idea with that listed ID (${parsedIdeaId}) does not exist.`,
          },
        } as never;
      }

      if (foundIdea.authorId !== loggedInUserId) {
        return {
          status: 400,
          body: {
            message: `The user ${email} is not the author and therefore cannot delete this proposal.`,
          },
        } as never;
      }

      // Cascade delete related records before deleting the idea.
      await prisma.ideaComment.deleteMany({ where: { ideaId: foundIdea.id } });
      await prisma.ideaRating.deleteMany({ where: { ideaId: foundIdea.id } });
      await prisma.ideaGeo.deleteMany({ where: { ideaId: foundIdea.id } });
      await prisma.ideaAddress.deleteMany({ where: { ideaId: foundIdea.id } });
      await prisma.userIdeaEndorse.deleteMany({
        where: { ideaId: foundIdea.id },
      });
      await prisma.proposal.deleteMany({ where: { ideaId: foundIdea.id } });

      const deletedProposal = await prisma.idea.delete({
        where: { id: parsedIdeaId },
      });

      return {
        status: 200,
        body: serializeForContract({
          message: "Proposal successfully deleted",
          deletedProposal,
        }),
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "An error occurred while trying to delete the proposal.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

export default createHandlers({
  schema: proposalApiContracts,
  router: {
    getAll,
    getAllWithSort,
    getAllWithAggregations,
    getByIdeaId,
    getByIdEmpty,
    getById,
    create,
    update,
    deleteProposal,
  },
});
