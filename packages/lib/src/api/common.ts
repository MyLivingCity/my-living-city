import z from "zod";

export const DateTimeString = z.date();

// EXTENDS DateTimeString
export const SafeDateFormat = z.preprocess((val: unknown) => {
  if (val instanceof Date) return val.toISOString();
  return val;
}, DateTimeString);

export const DecimalLikeSchema = z.union([z.number(), z.string()]);

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
