import { Decimal } from "@prisma/client/runtime/client";
import z from "zod";
import { Prisma } from "../../../../apps/backend/node_modules/.prisma/client/client";

export const DateTimeString = z.date();

// EXTENDS DateTimeString
export const SafeDateFormat = z.preprocess((val: unknown) => {
  if (val instanceof Date) return val.toISOString();
  return val;
}, DateTimeString);

export const DecimalLikeSchema = z.union([
  z.number(),
  z.string(),
  z.instanceof(Decimal),
]);

export const SimpleMessageResponseSchema = z.object({
  message: z.string(),
});

export const ErrorResponseSchema = z.object({
  message: z.string(),
  details: z.object({
    errorMessage: z.string(),
    errorStack: z.string(),
  }),
});
