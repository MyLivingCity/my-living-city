import { initContract } from "@ts-rest/core";
import z from "zod";
import { DateTimeString, ErrorResponseSchema } from "../common";

const c = initContract();

const PricingAccountTypeSchema = z.enum(["ENHANCED_REGULAR", "COMMUNITY", "BUSINESS"]);

export const AccountPricingSchema = z.object({
  accountType: PricingAccountTypeSchema,
  yearlyPriceCents: z.number(),
  updatedAt: DateTimeString,
  updatedByUserId: z.string().nullable(),
});

const AccountPricingItemSchema = z.object({
  accountType: z.string(),
  yearlyPriceCents: z.number().int().nonnegative(),
});

const ProposalLimitItemSchema = z.object({
  accountType: z.string(),
  yearlyProposalLimit: z.number().int().nonnegative(),
});

const ProposalLimitSchema = z.object({
  accountType: z.string(),
  yearlyProposalLimit: z.number().nullable(),
});

const UserPricingSchema = z.object({
  id: z.string(),
  fname: z.string().nullable(),
  lname: z.string().nullable(),
  email: z.string(),
  userType: z.string().nullable(),
  proposalLimit: z.number().nullable(),
  proposalCount: z.number(),
});

const UserLimitResponseSchema = z.object({
  id: z.string(),
  proposalLimit: z.number().nullable(),
});

const ForbiddenResponseSchema = z.object({ message: z.string() });

export const accountPricingApiContracts = c.router(
  {
    getPricing: {
      method: "GET",
      path: "/pricing",
      responses: {
        200: z.object({ items: z.array(AccountPricingSchema) }),
        400: ErrorResponseSchema,
      },
      summary: "Get all account type yearly pricing",
    },
    upsertPricing: {
      method: "PUT",
      path: "/pricing",
      body: z.object({
        items: z.array(AccountPricingItemSchema).nonempty(),
      }),
      responses: {
        200: z.object({ items: z.array(AccountPricingSchema) }),
        400: ErrorResponseSchema,
        403: ForbiddenResponseSchema,
      },
      summary: "Upsert account type yearly pricing (admin only)",
    },
    getProposalLimits: {
      method: "GET",
      path: "/proposal-limits",
      responses: {
        200: z.object({ items: z.array(ProposalLimitSchema) }),
        400: ErrorResponseSchema,
      },
      summary: "Get yearly proposal limits per account type",
    },
    upsertProposalLimits: {
      method: "PUT",
      path: "/proposal-limits",
      body: z.object({
        items: z.array(ProposalLimitItemSchema).nonempty(),
      }),
      responses: {
        200: z.object({ items: z.array(ProposalLimitSchema) }),
        400: ErrorResponseSchema,
        403: ForbiddenResponseSchema,
      },
      summary: "Upsert yearly proposal limits per account type (admin only)",
    },
    getUsers: {
      method: "GET",
      path: "/users",
      responses: {
        200: z.object({ items: z.array(UserPricingSchema) }),
        400: ErrorResponseSchema,
        403: ForbiddenResponseSchema,
      },
      summary: "Get users with proposal count and limit (admin only)",
    },
    updateUserLimit: {
      method: "PUT",
      path: "/users/:userId/limit",
      body: z.object({
        proposalLimit: z.number().int().nonnegative().nullable(),
      }),
      responses: {
        200: UserLimitResponseSchema,
        400: ErrorResponseSchema,
        403: ForbiddenResponseSchema,
      },
      summary: "Set a per-user proposal limit override (admin only)",
    },
  },
  {
    pathPrefix: "/pricing-and-limit",
  },
);
