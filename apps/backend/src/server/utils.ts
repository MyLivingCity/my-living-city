import { Prisma } from "#prisma/client";

export const toErrorDetails = (error: unknown) => {
  if (error instanceof Error) {
    return {
      errorMessage: error.message,
      errorStack: error.stack ?? "",
    };
  }

  return {
    errorMessage: String(error),
    errorStack: "",
  };
};

export const serializeForContract = <T>(value: T): T => {
  if (value instanceof Date) {
    return value.toISOString() as T;
  }

  if (typeof value === "bigint") {
    return value.toString() as T;
  }

  if (value instanceof Prisma.Decimal) {
    return value.toString() as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => serializeForContract(item)) as T;
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value).map(([key, item]) => [
      key,
      serializeForContract(item),
    ]);

    return Object.fromEntries(entries) as T;
  }

  return value;
};
