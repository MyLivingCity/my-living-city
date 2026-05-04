// NOTE: This handler requires stripe to be installed in the backend:
//   pnpm --filter @mlc/backend add stripe
import Stripe from "stripe";
import { stripeAccountApiContracts } from "@mlc/lib/api";
import { prisma } from "src/prisma/client";
import { initServer } from "@ts-rest/express";
import { createHandlers } from "src/server";
import { serializeForContract, toErrorDetails } from "src/server/utils";

const s = initServer();

const stripe = new Stripe(process.env["STRIPE_SECRET_KEY"] ?? "");

// Map from userType to Stripe price IDs — keep in sync with server/lib/constants.js STRIPE_PRODUCTS
const STRIPE_PRODUCTS: Record<string, string> = {
  BUSINESS: process.env["STRIPE_PRICE_BUSINESS"] ?? "",
  COMMUNITY: process.env["STRIPE_PRICE_COMMUNITY"] ?? "",
  MUNICIPAL: process.env["STRIPE_PRICE_MUNICIPAL"] ?? "",
};

const getDetails = s.route(stripeAccountApiContracts.getDetails, {
  handler: async ({ query }) => {
    try {
      const result = await prisma.userStripe.findFirst({
        where: { userId: query.userId },
      });
      return {
        status: 200,
        body: serializeForContract(result),
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "An error occurred while fetching Stripe account details.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const cancelWebhook = s.route(stripeAccountApiContracts.cancelWebhook, {
  handler: async ({ body }) => {
    try {
      if (body.type !== "customer.subscription.deleted") {
        return {
          status: 400,
          body: {
            message: `Unhandled event type: ${body.type}`,
            details: { errorMessage: "Unexpected Stripe event type.", errorStack: "" },
          },
        };
      }

      const eventObject = body.data.object as { customer?: string };
      const stripeId = eventObject.customer;

      if (stripeId) {
        await prisma.userStripe.updateMany({
          where: { stripeId },
          data: { status: "incomplete" },
        });
      }

      return { status: 200, body: {} };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "An error occurred while handling the cancel webhook.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const subscribeWebhook = s.route(stripeAccountApiContracts.subscribeWebhook, {
  handler: async ({ body }) => {
    try {
      if (body.type !== "payment_intent.succeeded") {
        return {
          status: 400,
          body: {
            message: `Unhandled event type: ${body.type}`,
            details: { errorMessage: "Unexpected Stripe event type.", errorStack: "" },
          },
        };
      }

      const eventObject = body.data.object as { customer?: string };
      const stripeId = eventObject.customer;

      if (stripeId) {
        await prisma.userStripe.updateMany({
          where: { stripeId },
          data: { status: "active" },
        });
      }

      return { status: 200, body: {} };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "An error occurred while handling the subscribe webhook.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const activate = s.route(stripeAccountApiContracts.activate, {
  handler: async ({ body, req }) => {
    try {
      const userStripe = await prisma.userStripe.findFirst({
        where: { userId: body.userId },
      });
      const user = await prisma.user.findUnique({ where: { id: body.userId } });

      if (!userStripe || !user) {
        return {
          status: 400,
          body: {
            message: "User or Stripe account not found.",
            details: { errorMessage: "Could not find user or userStripe record.", errorStack: "" },
          },
        };
      }

      const priceId = STRIPE_PRODUCTS[user.userType ?? ""];
      const origin = (req.headers["origin"] as string | undefined) ?? "";

      const session = await stripe.checkout.sessions.create({
        success_url: origin,
        cancel_url: `${origin}/profile`,
        line_items: [{ price: priceId, quantity: 1 }],
        customer: userStripe.stripeId,
        mode: "subscription",
      });

      return { status: 200, body: session };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "An error occurred while creating the Stripe checkout session.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const update = s.route(stripeAccountApiContracts.update, {
  handler: async ({ body, req }) => {
    try {
      const userStripe = await prisma.userStripe.findFirst({
        where: { userId: body.userId },
      });

      if (!userStripe) {
        return {
          status: 400,
          body: {
            message: "Stripe account not found for this user.",
            details: { errorMessage: "Could not find userStripe record.", errorStack: "" },
          },
        };
      }

      const origin = (req.headers["origin"] as string | undefined) ?? "";

      const session = await stripe.billingPortal.sessions.create({
        return_url: origin,
        customer: userStripe.stripeId,
      });

      return { status: 200, body: session };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "An error occurred while creating the Stripe billing portal session.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

export default createHandlers({
  schema: stripeAccountApiContracts,
  router: {
    getDetails,
    cancelWebhook,
    subscribeWebhook,
    activate,
    update,
  },
});
