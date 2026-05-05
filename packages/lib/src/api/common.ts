import { Decimal } from "@prisma/client/runtime/client";
import z from "zod";
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

/**
 * Recommended maximum precision is 6 decimal places (~10cm in GPS),
 * which is well covered by standard JavaScript Number type (>=15)
 * Context: commercial GPS is accurate to ~3m
 */
export const LatSchema = z.coerce
  .number()
  .min(-90, { message: "Latitude must be between -90 and 90" })
  .max(90, { message: "Latitude must be between -90 and 90" });
/**
 * Recommended maximum precision is 6 decimal places (~10cm in GPS),
 * which is well covered by standard JavaScript Number type (>=15)
 * Context: commercial GPS is accurate to ~3m
 */
export const LonSchema = z.coerce
  .number()
  .min(-180, { message: "Longitude must be between -180 and 180" })
  .max(180, { message: "Longitude must be between -180 and 180" });

/**
 * database has this typed as a Decimal, which is unnecessary
 */
export const RadiusSchema = z.coerce
  .number()
  .min(1, { message: "Minimum radius is 1km" })
  //arbitrary, but should be capped to prevent abuse
  .max(100, { message: "Maximum radius is 100km" });

/**
 * Formats to Number with recommended maximum precision of 6 decimal places.
 * Meant for items being pulled from Decimal fields in database, until
 * the schema can be updated to type lat, lon and radius as Float
 */
export const formatCoord = (val: unknown) => Number(Number(val).toFixed(6));

/* Example - validate latitude entry
const result = LatSchema.safeParse(120); // Invalid latitude
if (!result.success) {
  // result.error.errors is an array of error objects
  console.log(result.error.errors[0]!.message);
  // Output: "Latitude must be between -90 and 90"
}
 */
