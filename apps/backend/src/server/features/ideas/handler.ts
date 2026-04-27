import { ideaApiContracts } from "@mlc/lib/api";
import { Prisma } from "#prisma/client";
import { prisma } from "src/prisma/client";
import { initServer } from "@ts-rest/express";
import { Handlers } from "src/server";
import { prisma } from "src/prisma/client";
import { getAggregateIdeaWithUserSegmentJoins } from "./utils";
import { serializeForContract, toErrorDetails } from "src/server/utils";

const s = initServer();

// TODO
// const IDEA_IMAGE_FOLDER = "idea-proposal";
// const SIGNED_URL_EXPIRY_SECONDS = 60;
// const VALID_IMAGE_FOLDERS = new Set([
//   "advertisement",
//   IDEA_IMAGE_FOLDER,
//   "avatar",
// ]);
//
// const awsRegion = process.env["AWS_REGION"];
// const awsAccessKeyId = process.env["AWS_ACCESS_KEY"];
// const awsSecretAccessKey = process.env["AWS_SECRET_KEY"];
// const awsBucketName = process.env["AWS_S3_BUCKET_NAME"];
//
// const s3Client =
//   awsRegion && awsAccessKeyId && awsSecretAccessKey
//     ? new S3Client({
//         region: awsRegion,
//         credentials: {
//           accessKeyId: awsAccessKeyId,
//           secretAccessKey: awsSecretAccessKey,
//         },
//       })
//     : null;

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

const imagePathsToS3Url = async (
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

const envProposalRatingCount = process.env["PROPOSAL_RATING_COUNT"] || "25";
const envProposalRatingAvg = process.env["PROPOSAL_RATING_AVG"] || "1";
const envProjectRatingCount = process.env["PROJECT_RATING_COUNT"] || "50";
const envProjectRatingAvg = process.env["PROJECT_RATING_AVG"] || "1.5";

// Legacy controller uses parseInt here, so keep the same threshold semantics.
const PROPOSAL_RATING_COUNT = parseInt(envProposalRatingCount, 10);
const PROPOSAL_RATING_AVG = parseInt(envProposalRatingAvg, 10);
const PROJECT_RATING_COUNT = parseInt(envProjectRatingCount, 10);
const PROJECT_RATING_AVG = parseInt(envProjectRatingAvg, 10);

const checkIdeaThresholds = async (ideaId: number) => {
  const foundIdea = await prisma.idea.findUnique({ where: { id: ideaId } });

  if (!foundIdea) {
    throw new Error(`The idea with that listed ID (${ideaId}) does not exist.`);
  }

  const ratingAggregations = await prisma.ideaRating.aggregate({
    where: { ideaId },
    _avg: {
      rating: true,
    },
    _count: true,
  });

  const ratingAvg = ratingAggregations._avg.rating || 0;
  const ratingCount = ratingAggregations._count || 0;

  return {
    triggerProposalAdvancement:
      PROPOSAL_RATING_AVG <= ratingAvg &&
      PROPOSAL_RATING_COUNT <= ratingCount &&
      foundIdea.state === "IDEA",
    triggerProjectAdvancement:
      PROJECT_RATING_AVG <= ratingAvg &&
      PROJECT_RATING_COUNT <= ratingCount &&
      (foundIdea.state === "IDEA" || foundIdea.state === "PROPOSAL"),
    isChampionable:
      foundIdea.championId == null &&
      PROPOSAL_RATING_AVG <= ratingAvg &&
      PROPOSAL_RATING_COUNT <= ratingCount,
  };
};

const getAll = s.route(ideaApiContracts.getAll, {
  handler: async () => {
    try {
      const allIdeas = await prisma.idea.findMany({
        orderBy: {
          updatedAt: "desc",
        },
      });

      await imagePathsToS3Url(allIdeas, IDEA_IMAGE_FOLDER);

      return {
        status: 200,
        body: serializeForContract(allIdeas),
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "An error occured while trying to fetch all ideas",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const getAllWithSort = s.route(ideaApiContracts.getAllWithSort, {
  handler: async ({ body }) => {
    try {
      const allIdeas = await prisma.idea.findMany(
        body as Prisma.IdeaFindManyArgs,
      );

      await imagePathsToS3Url(allIdeas, IDEA_IMAGE_FOLDER);

      return {
        status: 200,
        body: serializeForContract(allIdeas),
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "An error occured while trying to fetch all ideas",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const getAllByUserId = s.route(ideaApiContracts.getAllByUserId, {
  handler: async ({ params, req }) => {
    const rawTake = (req.body as { take?: unknown } | undefined)?.take;
    const take = Number.isInteger(rawTake) ? Number(rawTake) : undefined;
    const limitSql = take ? Prisma.sql`limit ${take}` : Prisma.empty;

    try {
      const rawData = await getAggregateIdeaWithUserSegmentJoins(
        params.userId,
        limitSql,
      );

      return {
        status: 200,
        body: serializeForContract(rawData),
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "An error occured while trying to fetch all ideas",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const getById = s.route(ideaApiContracts.getById, {
  handler: async ({ params }) => {
    try {
      const parsedIdeaId = parseInt(params.ideaId, 10);

      if (!parsedIdeaId) {
        return {
          status: 400,
          body: {
            message: "A valid ideaId must be specified in the route parameter.",
          },
        } as never;
      }

      const { isChampionable } = await checkIdeaThresholds(parsedIdeaId);

      const foundIdea = await prisma.idea.findUnique({
        where: { id: parsedIdeaId },
        include: {
          geo: true,
          address: true,
          category: true,
          projectInfo: true,
          proposalInfo: {
            select: {
              id: true,
            },
          },
          champion: {
            include: {
              address: {
                select: {
                  postalCode: true,
                  streetAddress: true,
                },
              },
            },
          },
          author: {
            include: {
              address: {
                select: {
                  postalCode: true,
                  streetAddress: true,
                },
              },
              userSegment: {
                include: {
                  segment: true,
                },
              },
              userHandles: true,
            },
          },
          segments: true,
        },
      });

      if (!foundIdea) {
        return {
          status: 400,
          body: {
            message: `The idea with that listed ID (${parsedIdeaId}) does not exist.`,
          },
        } as never;
      }

      await imagePathsToS3Url([foundIdea], IDEA_IMAGE_FOLDER);

      const result = {
        ...foundIdea,
        isChampionable,
        author: {
          ...foundIdea.author,
          password: undefined,
        },
        champion: foundIdea.champion
          ? { ...foundIdea.champion, password: undefined }
          : null,
      };

      return {
        status: 200,
        body: serializeForContract(result),
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: `An Error occured while trying to fetch idea with id ${params.ideaId}.`,
          details: toErrorDetails(error),
        },
      };
    }
  },
});

export default {
  schema: ideaApiContracts,
  router: {
    getAll,
    getAllWithSort,
    getAllByUserId,
    getById,
  },
} as Handlers;
