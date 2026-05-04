import { initContract } from "@ts-rest/core";
import z from "zod";
import { DateTimeString, ErrorResponseSchema } from "../common";

const c = initContract();

export const AccountTypeSchema = z.object({
  id: z.number(),
  accountType: z.string(),
  extraProposalCost: z.number().nullable(),
  updatedBy: z.string().nullable(),
  lastUpdated: DateTimeString.nullable(),
});

const AccountTypeItemSchema = z.object({
  accountType: z.string(),
  extraProposalCost: z.number().int().nonnegative(),
});

const AccountTypeListResponseSchema = z.object({
  items: z.array(AccountTypeSchema),
});

export const extraProposalPricingApiContracts = c.router(
  {
    getAll: {
      method: "GET",
      path: "/",
      responses: {
        200: AccountTypeListResponseSchema,
        400: ErrorResponseSchema,
      },
      summary: "Get all account types with extra proposal pricing",
    },
    upsertAll: {
      method: "PUT",
      path: "/",
      body: z.object({
        items: z.array(AccountTypeItemSchema).nonempty(),
      }),
      responses: {
        200: AccountTypeListResponseSchema,
        400: ErrorResponseSchema,
        403: z.object({ message: z.string() }),
      },
      summary: "Upsert account type extra proposal pricing (admin only)",
    },
  },
  {
    pathPrefix: "/extra-proposal-pricing",
  },
);
