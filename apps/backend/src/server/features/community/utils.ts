import { serializeForContract } from "src/server/utils";
import { makeUpload } from "src/server/utils/image";

export const upload = makeUpload("advertisement").single("imagePath");

export const isBodyEmpty = (value: unknown) =>
  value == null ||
  (typeof value === "object" &&
    !Array.isArray(value) &&
    Object.keys(value as Record<string, unknown>).length === 0);

export const parseIntegerParam = (value: string) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) ? parsed : null;
};

export const getRequestUser = (req: {
  user?: Express.User | null | undefined;
}) =>
  (req.user ?? null) as
  | (Express.User & {
    id?: string;
    email?: string;
    userType?: UserType;
  })
  | null;

export const normalizeUploadImagePath = (
  file: { key?: string; path?: string } | undefined,
) => {
  if (!file) {
    return null;
  }

  const source = file.key ?? file.path ?? null;
  if (!source) {
    return null;
  }

  const slashIndex = source.indexOf("/");
  return slashIndex >= 0 ? source.slice(slashIndex + 1) : source;
};

export const toSerialized = <T>(value: T) => serializeForContract(value);
