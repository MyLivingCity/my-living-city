import { initContract } from "@ts-rest/core";
import z from "zod";
import { UserSchema } from "./users";

const c = initContract();

const IdeaSchema = z.object({
  id: z.number(),
  authorId: z.string(),
  categoryId: z.number(),
  title: z.string(),
  description: z.string(),
  communityImpact: z.string().nullable(),
  natureImpact: z.string().nullable(),
  artsImpact: z.string().nullable(),
  energyImpact: z.string().nullable(),
  manufacturingImpact: z.string().nullable(),
  state: z.unknown(),
  active: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  championId: z.string().nullable(),
  userType: z.string(),
  imagePath: z.string().nullable(),
  supportingProposalId: z.number().nullable(),
  banned: z.boolean(),
  reviewed: z.boolean(),
  notification_dismissed: z.boolean(),
  quarantined_at: z.date(),
  proposal_benefits: z.string(),
  proposal_role: z.string(),
  requirements: z.string(),
  PostBan: z.array(z.unknown()),
  author: UserSchema.shape.id,
  category: z.unknown(),
  champion: UserSchema.shape.id.nullable(),
  supportedProposal: z.unknown().nullable(),
  address: z.unknown().nullable(),
  comments: z.array(z.unknown()),
  flags: z.array(z.unknown()),
  geo: z.unknown().nullable(),
  ratings: z.array(z.unknown()),
  projectInfo: z.unknown().nullable(),
  proposalInfo: z.unknown().nullable(),
  Quarantine_Notifications: z.array(z.unknown()),
  userIdeaEndorse: z.array(z.unknown()),
  userIdeaFollow: z.array(z.unknown()),
  segments: z.array(z.unknown()),
});

export const ideaContracts = c.router(
  {
    getAll: {
      method: "GET",
      path: "/getall",
      responses: {
        200: z.array(IdeaSchema),
      },
      summary: "Get all ideas",
    },
    getAllWithSort: {
      method: "GET",
      path: "/getall/with-sort",
      query: z.object({
        orderBy: z.unknown(),
      }),
      responses: {
        200: z.array(IdeaSchema),
      },
      summary: "Get all ideas with orderBy",
    },
    getAllByUserId: {
      method: "GET",
      path: "/getall/:userId",
      query: z.object({
        take: z.number().optional(),
      }),
      responses: {
        200: z.array(IdeaSchema),
      },
      summary: "Get all ideas by user",
    },
    getById: {
      method: "GET",
      path: "/get/:ideaId",
      responses: {
        200: z.union([
          IdeaSchema,
          z.object({
            isChampionable: z.boolean(),
          }),
        ]),
      },
      summary: "Get idea by id",
    },
  },
  {
    pathPrefix: "/idea",
  },
);
