import { initContract } from "@ts-rest/core";
import z from "zod";
import { ErrorResponseSchema } from "../common";

const c = initContract();

export const ProposalSchema = z.object({
  id: z.number(),
  ideaId: z.number(),
  feedback1: z.string().nullable(),
  feedback2: z.string().nullable(),
  feedback3: z.string().nullable(),
  feedback4: z.string().nullable(),
  feedback5: z.string().nullable(),
  feedbackType1: z.string().nullable(),
  feedbackType2: z.string().nullable(),
  feedbackType3: z.string().nullable(),
  feedbackType4: z.string().nullable(),
  feedbackType5: z.string().nullable(),
  needCollaborators: z.boolean(),
  needDonations: z.boolean(),
  needFeedback: z.boolean(),
  needSuggestions: z.boolean(),
  needVolunteers: z.boolean(),
  location: z.string().nullable(),
});

const ProposalDetailSchema = ProposalSchema.extend({
  collaborations: z.array(z.unknown()),
  donors: z.array(z.unknown()),
  suggestedIdeas: z.array(z.unknown()),
  volunteers: z.array(z.unknown()),
});

const ProposalWithIdeaSchema = ProposalSchema.extend({
  idea: z.unknown(),
});

const CreateProposalBodySchema = z.object({
  ideaId: z.number(),
  needCollaborators: z.boolean().optional(),
  needVolunteers: z.boolean().optional(),
  needDonations: z.boolean().optional(),
  needFeedback: z.boolean().optional(),
  needSuggestions: z.boolean().optional(),
  location: z.string().optional(),
  feedback1: z.string().optional(),
  feedback2: z.string().optional(),
  feedback3: z.string().optional(),
  feedback4: z.string().optional(),
  feedback5: z.string().optional(),
  feedbackType1: z.string().optional(),
  feedbackType2: z.string().optional(),
  feedbackType3: z.string().optional(),
  feedbackType4: z.string().optional(),
  feedbackType5: z.string().optional(),
});

const UpdateProposalBodySchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  communityImpact: z.string().optional(),
  natureImpact: z.string().optional(),
  artsImpact: z.string().optional(),
  energyImpact: z.string().optional(),
  manufacturingImpact: z.string().optional(),
  geo: z
    .object({
      lat: z.number().optional(),
      lon: z.number().optional(),
    })
    .optional(),
  address: z
    .object({
      streetAddress: z.string().optional(),
      streetAddress2: z.string().optional(),
      city: z.string().optional(),
      country: z.string().optional(),
      postalCode: z.string().optional(),
    })
    .optional(),
});

const UpdateProposalResponseSchema = z.object({
  message: z.string(),
  idea: z.unknown(),
});

const DeleteProposalResponseSchema = z.object({
  message: z.string(),
  deletedProposal: z.unknown(),
});

export const proposalApiContracts = c.router(
  {
    getAll: {
      method: "GET",
      path: "/getall",
      responses: {
        200: z.array(ProposalSchema),
        400: ErrorResponseSchema,
      },
      summary: "Get all proposals",
    },
    getAllWithSort: {
      method: "POST",
      path: "/getall/with-sort",
      body: z.record(z.unknown()),
      responses: {
        200: z.array(ProposalSchema),
        400: ErrorResponseSchema,
      },
      summary: "Get proposals with Prisma findMany options",
    },
    getAllWithAggregations: {
      method: "POST",
      path: "/getall/aggregations",
      body: z.object({}).optional(),
      responses: {
        200: z.array(ProposalWithIdeaSchema),
        400: ErrorResponseSchema,
      },
      summary: "Get proposals with idea and ratings included",
    },
    getByIdeaId: {
      method: "GET",
      path: "/getByIdeaId/:ideaId",
      responses: {
        200: ProposalDetailSchema,
        400: ErrorResponseSchema,
      },
      summary: "Get proposal by idea ID with full relations",
    },
    /**
     * this is just a hack to silence neverending retries of
     * an empty proposalId parameter
     */
    getByIdEmpty: {
      method: "GET",
      path: "/get/", // Notice the trailing slash and NO param
      responses: {
        200: z.null(),
      },
      summary: "Catch empty proposal IDs to stop 404 retries",
    },
    getById: {
      method: "GET",
      path: "/get/:proposalId",
      responses: {
        200: ProposalDetailSchema,
        400: ErrorResponseSchema,
      },
      summary: "Get proposal by proposal ID with full relations",
    },
    create: {
      method: "POST",
      path: "/create",
      body: CreateProposalBodySchema,
      responses: {
        201: ProposalSchema,
        400: ErrorResponseSchema,
      },
      summary: "Create a proposal from an idea",
    },
    update: {
      method: "PUT",
      path: "/update/:ideaId",
      body: UpdateProposalBodySchema,
      responses: {
        200: UpdateProposalResponseSchema,
        400: ErrorResponseSchema,
      },
      summary: "Update proposal's parent idea fields",
    },
    deleteProposal: {
      method: "DELETE",
      path: "/delete/:ideaId",
      body: z.undefined(),
      responses: {
        200: DeleteProposalResponseSchema,
        400: ErrorResponseSchema,
      },
      summary: "Delete a proposal and all related records",
    },
  },
  {
    pathPrefix: "/proposal",
  },
);
