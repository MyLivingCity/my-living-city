import { initContract } from "@ts-rest/core";
import z from "zod";
import { DateTimeString, ErrorResponseSchema } from "../common";

const c = initContract();

const LinkTypeSchema = z.enum([
  "WEBSITE",
  "TWITTER",
  "FACEBOOK",
  "INSTAGRAM",
  "LINKEDIN",
  "YOUTUBE",
  "TIKTOK",
  "OTHER",
]);

export const ProfileVisibilitySchema = z.enum([
  "PUBLIC",
  "COMMUNITY_MEMBERS",
  "CONTACTS_ONLY",
  "PRIVATE",
]);

const LinkSchema = z.object({
  id: z.number(),
  link: z.string(),
  linkType: LinkTypeSchema,
  createdAt: DateTimeString,
  public_Community_Business_ProfileId: z.number().nullable(),
  public_Municipal_ProfileId: z.number().nullable(),
});

const LinkInputSchema = z.object({
  link: z.string(),
  linkType: LinkTypeSchema,
});

const StandardUserSchema = z
  .object({
    id: z.string(),
    fname: z.string().nullable(),
    lname: z.string().nullable(),
    email: z.string(),
    userHandles: z.array(z.unknown()).optional(),
  })
  .passthrough();

const CommunityBusinessProfileUserSchema = z.object({
  id: z.string(),
  fname: z.string().nullable(),
  lname: z.string().nullable(),
  email: z.string(),
  createdAt: DateTimeString,
  userType: z.string(),
  organizationName: z.string().nullable(),
  displayFName: z.string().nullable(),
  displayLName: z.string().nullable(),
  isEnhancedMember: z.boolean().optional(),
  displayName: z.string().optional(),
  enhancedMember: z.object({ userId: z.string() }).nullable().optional(),
});

const CommunityBusinessProfileSchema = z.object({
  id: z.number(),
  userId: z.string(),
  statement: z.string().nullable(),
  description: z.string().nullable(),
  profileVisibility: ProfileVisibilitySchema,
  address: z.string().nullable(),
  createdAt: DateTimeString,
  updatedAt: DateTimeString,
  contactFirstName: z.string().nullable(),
  contactLastName: z.string().nullable(),
  contactEmail: z.string().nullable(),
  contactPhone: z.string().nullable(),
  links: z.array(LinkSchema),
  user: CommunityBusinessProfileUserSchema,
});

const MunicipalProfileSchema = z.object({
  id: z.number(),
  userId: z.string(),
  statement: z.string(),
  responsibility: z.string(),
  address: z.string(),
  createdAt: DateTimeString,
  updatedAt: DateTimeString,
  contactEmail: z.string().nullable(),
  contactPhone: z.string().nullable(),
  links: z.array(LinkSchema),
  user: CommunityBusinessProfileUserSchema,
});

const PublicProfileSummarySchema = z.object({
  id: z.string(),
  userId: z.string(),
  fname: z.string().nullable(),
  lname: z.string().nullable(),
  avatar: z.string().nullable(),
  profileType: z
    .enum(["municipal", "community", "business", "residential"])
    .nullable()
    .optional(),
  location: z.string(),
  endorsements: z.number(),
  postsCount: z.number(),
  businessName: z.string().nullable(),
  municipalityName: z.string().nullable(),
  userName: z.string().nullable(),
  userType: z.string(),
  profileVisibility: ProfileVisibilitySchema,
});

const UpsertCommunityBusinessBodySchema = z.object({
  statement: z.string().optional(),
  description: z.string().optional(),
  links: z.array(LinkInputSchema).optional(),
  address: z.string().optional(),
  contactFirstName: z.string().optional(),
  contactLastName: z.string().optional(),
  contactEmail: z.string().optional(),
  contactPhone: z.string().optional(),
  profileVisibility: ProfileVisibilitySchema.optional(),
});

const UpsertMunicipalBodySchema = z.object({
  statement: z.string().optional(),
  responsibility: z.string().optional(),
  links: z.array(LinkInputSchema).optional(),
  address: z.string().optional(),
  contactEmail: z.string().optional(),
  contactPhone: z.string().optional(),
});

const UpdateStandardProfileBodySchema = z.object({
  fname: z.string().optional(),
  lname: z.string().optional(),
  email: z.string().optional(),
});

export const publicProfileApiContracts = c.router(
  {
    getStandardProfile: {
      method: "GET",
      path: "/standardProfile/:userId",
      responses: {
        200: StandardUserSchema,
        400: ErrorResponseSchema,
      },
      summary: "Get standard user profile",
    },
    updateStandardProfile: {
      method: "PUT",
      path: "/standardProfile/:userId",
      body: UpdateStandardProfileBodySchema,
      responses: {
        200: StandardUserSchema,
        400: ErrorResponseSchema,
      },
      summary: "Update standard user profile",
    },
    getCommunityBusinessProfile: {
      method: "GET",
      path: "/communityBusinessProfile/:userId",
      responses: {
        200: CommunityBusinessProfileSchema,
        400: ErrorResponseSchema,
      },
      summary: "Get community/business profile by user ID",
    },
    upsertCommunityBusinessProfile: {
      method: "PUT",
      path: "/communityBusinessProfile/:userId",
      body: UpsertCommunityBusinessBodySchema,
      responses: {
        200: z.unknown(),
        400: ErrorResponseSchema,
      },
      summary: "Create or update community/business profile",
    },
    getCommunityBusinessProfileLinks: {
      method: "GET",
      path: "/communityBusinessProfile/:profileId/links",
      responses: {
        200: z.array(LinkSchema),
        400: ErrorResponseSchema,
      },
      summary: "Get links for a community/business profile",
    },
    getMunicipalProfile: {
      method: "GET",
      path: "/municipalProfile/:userId",
      responses: {
        200: MunicipalProfileSchema,
        400: ErrorResponseSchema,
      },
      summary: "Get municipal profile by user ID",
    },
    upsertMunicipalProfile: {
      method: "PUT",
      path: "/municipalProfile/:userId",
      body: UpsertMunicipalBodySchema,
      responses: {
        200: z.unknown(),
        400: ErrorResponseSchema,
      },
      summary: "Create or update municipal profile",
    },
    getMunicipalProfileLinks: {
      method: "GET",
      path: "/municipalProfile/:profileId/links",
      responses: {
        200: z.array(LinkSchema),
        400: ErrorResponseSchema,
      },
      summary: "Get links for a municipal profile",
    },
    getAllProfiles: {
      method: "GET",
      path: "/all",
      query: z.object({
        search: z.string().optional(),
        profileType: z
          .enum(["municipal", "community", "residential", "business"])
          .optional(),
        communityId: z.string().optional(),
        neighbourhoodId: z.string().optional(),
      }),
      responses: {
        200: z.object({
          profiles: z.array(PublicProfileSummarySchema),
          totalCount: z.number(),
        }),
        400: ErrorResponseSchema,
      },
      summary: "Get all public profiles with search and visibility filtering",
    },
  },
  {
    pathPrefix: "/publicProfile",
  },
);
