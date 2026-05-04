import { initContract } from "@ts-rest/core";
import z from "zod";
import { ErrorResponseSchema } from "../common";

const c = initContract();

export const UserStripeSchema = z.object({
  userId: z.string(),
  stripeId: z.string(),
  status: z.enum(["active", "incomplete"]),
});

export const stripeAccountApiContracts = c.router(
  {
    getDetails: {
      method: "GET",
      path: "/details",
      query: z.object({
        userId: z.string(),
      }),
      responses: {
        200: UserStripeSchema.nullable(),
        400: ErrorResponseSchema,
      },
      summary: "Get Stripe account details for a user",
    },
    cancelWebhook: {
      method: "POST",
      path: "/cancel",
      body: z.object({
        type: z.string(),
        data: z.object({
          object: z.unknown(),
        }),
      }),
      responses: {
        200: z.object({}),
        400: ErrorResponseSchema,
      },
      summary: "Handle Stripe customer.subscription.deleted webhook",
    },
    subscribeWebhook: {
      method: "POST",
      path: "/subscribe",
      body: z.object({
        type: z.string(),
        data: z.object({
          object: z.unknown(),
        }),
      }),
      responses: {
        200: z.object({}),
        400: ErrorResponseSchema,
      },
      summary: "Handle Stripe payment_intent.succeeded webhook",
    },
    activate: {
      method: "POST",
      path: "/activate",
      body: z.object({
        userId: z.string(),
      }),
      responses: {
        200: z.unknown(),
        400: ErrorResponseSchema,
      },
      summary: "Create a Stripe checkout session to activate a subscription",
    },
    update: {
      method: "POST",
      path: "/update",
      body: z.object({
        userId: z.string(),
      }),
      responses: {
        200: z.unknown(),
        400: ErrorResponseSchema,
      },
      summary: "Create a Stripe billing portal session to manage subscription",
    },
  },
  {
    pathPrefix: "/account",
  },
);
