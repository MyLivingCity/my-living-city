import { initContract } from "@ts-rest/core";
import z from "zod";
import { ErrorResponseSchema } from "../common";

const c = initContract();

export const sendEmailResetApiContracts = c.router(
  {
    sendReset: {
      method: "POST",
      path: "/",
      body: z.object({
        email: z.string().email(),
      }),
      responses: {
        200: z.object({ message: z.string() }),
        400: ErrorResponseSchema,
      },
      summary: "Send a password reset email to the specified address",
    },
  },
  {
    pathPrefix: "/sendEmailReset",
  },
);
