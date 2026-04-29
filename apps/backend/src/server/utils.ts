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

export const imagePathsToS3Url = async (
  items: Array<{ imagePath: string | null }>,
  itemType: string,
) => {
  await Promise.all(
    items.map(async (item) => {
      if (item.imagePath) {
        item.imagePath = await accessImage(itemType, item.imagePath);
      }
    }),
  );
};

const accessImage = async (imageFolder: string, imageKey: string) => {
  return imageKey;
  // TODO
  // if (!VALID_IMAGE_FOLDERS.has(imageFolder)) {
  //   return imageKey;
  // }
  //
  // if (!s3Client || !awsBucketName) {
  //   return imageKey;
  // }
  //
  // try {
  //   const command = new GetObjectCommand({
  //     Bucket: awsBucketName,
  //     Key: `${imageFolder}/${imageKey}`,
  //   });
  //
  //   return await getSignedUrl(s3Client, command, {
  //     expiresIn: SIGNED_URL_EXPIRY_SECONDS,
  //   });
  // } catch (error) {
  //   console.error("Error generating signed url for image:", error);
  //   return imageKey;
  // }
};

export const compareCommentsBasedOnLikesAndDislikes = (a, b) => {
  // TODO: Will have to change if naming convention changes as well
  const { _count: aCount, updatedAt: aUpdatedAt } = a;
  const { _count: bCount, updatedAt: bUpdatedAt } = b;
  const aTotal = aCount.likes + aCount.dislikes;
  const bTotal = bCount.likes + bCount.dislikes;

  // sort comment by number of likes and dislikes
  if (aTotal < bTotal) {
    return 1;
  }
  if (aTotal > bTotal) {
    return -1;
  }

  // if number of likes and dislikes are the same sort by updated at
  if (aUpdatedAt < bUpdatedAt) {
    return 1;
  }
  if (aUpdatedAt > bUpdatedAt) {
    return -1;
  }

  return 0;
};
