import { ideaApiContracts } from "@mlc/lib/api";
import { Prisma } from "#prisma/client";
import { prisma } from "src/prisma/client";
import { initServer } from "@ts-rest/express";
import { createHandlers } from "src/server";
import {
  checkIdeaThresholds,
  getAggregateIdeaWithUserSegmentJoins,
} from "./utils";
import { serializeForContract, toErrorDetails } from "src/server/utils";

const s = initServer();

const IDEA_IMAGE_FOLDER = "idea-proposal";

// TODO
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

const accessImage = async (_: string, imageKey: string) => {
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

const getAllWithAggregations = s.route(
  ideaApiContracts.getAllWithAggregations,
  {
    handler: async ({ req }) => {
      try {
        let take = req.body.take;
        take = Number.isInteger(take) ? Number(take) : undefined;

        const ideas = await prisma.idea.findMany({
          take: take,
          include: {
            segments: {
              include: {
                parentSegment: true,
                children: true,
              },
            },
            author: {
              select: {
                fname: true,
                organizationName: true,
                userType: true,
              },
            },
            address: {
              select: {
                streetAddress: true,
              },
            },
            category: true,
            comments: {
              select: {
                id: true,
              },
            },
            ratings: {
              select: {
                id: true,
                rating: true,
              },
            },
          },
          orderBy: [{ updatedAt: "desc" }],
        });

        // Process the results to match the expected format
        const processedIdeas = ideas.map((idea) => {
          // Calculate ratings stats
          const ratings = idea.ratings || [];
          const comments = idea.comments || [];
          const totalRatings = ratings.length;
          const totalComments = comments.length;

          const ratingsSum = ratings.reduce((sum, r) => sum + r.rating, 0);
          const avgRating = totalRatings > 0 ? ratingsSum / totalRatings : 0;

          const posRatings = ratings.filter((r) => r.rating > 0).length;
          const negRatings = ratings.filter((r) => r.rating < 0).length;

          const engagements = totalRatings + totalComments;

          // Process segments
          const segmentData = idea.segments.map((segment) => ({
            segId: segment.segId,
            segmentName: segment.name,
            parentSegmentName: segment.parentSegment?.name || null,
            segmentType: segment.segmentType,
          }));

          // Find one segment of each type (if exists)
          const superSegment = segmentData.find(
            (s) => s.segmentType === "superSegment",
          );
          const mainSegment = segmentData.find(
            (s) => s.segmentType === "segment",
          );
          const subSegment = segmentData.find(
            (s) => s.segmentType === "subSegment",
          );

          return {
            id: idea.id,
            authorId: idea.authorId,
            categoryId: idea.categoryId,
            title: idea.title,
            description: idea.description,
            proposal_role: idea.proposal_role,
            requirements: idea.requirements,
            proposal_benefits: idea.proposal_benefits,
            notification_dismissed: idea.notification_dismissed,
            quarantined_at: idea.quarantined_at,

            // Segment data
            segId: mainSegment?.segId || null,
            subSegId: subSegment?.segId || null,
            superSegId: superSegment?.segId || null,
            segmentName: mainSegment?.segmentName || null,
            subSegmentName: subSegment?.segmentName || null,

            // Impact data
            communityImpact: idea.communityImpact,
            natureImpact: idea.natureImpact,
            energyImpact: idea.energyImpact,
            manufacturingImpact: idea.manufacturingImpact,
            artsImpact: idea.artsImpact,

            // Engagement metrics
            engagements: engagements,
            ratingAvg: avgRating,
            commentCount: totalComments,
            ratingCount: totalRatings,
            posRatings: posRatings,
            negRatings: negRatings,

            // User data: prefer organizationName for business/community, fall back to first name
            firstName:
              idea.author?.organizationName || idea.author?.fname || "",
            streetAddress: idea.address?.streetAddress || "",

            // Status data
            state: idea.state,
            active: idea.active,
            banned: idea.banned,
            reviewed: idea.reviewed,
            updatedAt: idea.updatedAt,
            createdAt: idea.createdAt,
          };
        });

        // Sort the processed results to match the original ordering
        const sortedResults = processedIdeas.sort((a, b) => {
          // First by rating count, descending
          if (b.ratingCount !== a.ratingCount) {
            return b.ratingCount - a.ratingCount;
          }
          // Then by rating average, descending
          if (b.ratingAvg !== a.ratingAvg) {
            return b.ratingAvg - a.ratingAvg;
          }
          // Then by update date, descending
          if (b.updatedAt !== a.updatedAt) {
            return new Date(b.updatedAt) - new Date(a.updatedAt);
          }
          // Finally by engagements, descending
          return b.engagements - a.engagements;
        });

        // Convert any BigInt to strings
        const finalResults = sortedResults.map((row) => {
          const newRow = {};
          for (const key in row) {
            if (typeof row[key] === "bigint") {
              newRow[key] = String(row[key]);
            } else {
              newRow[key] = row[key];
            }
          }
          return newRow;
        });

        return {
          status: 200,
          body: finalResults,
        };
      } catch (error) {
        console.error(error);
        return {
          status: 400,
          body: {
            message: "An error occurred while trying to fetch all ideas",
            details: {
              errorMessage: error.message,
              errorStack: error.stack,
            },
          },
        };
      } finally {
        await prisma.$disconnect();
      }
    },
  },
);

export default createHandlers({
  schema: ideaApiContracts,
  router: {
    getAll,
    getAllWithSort,
    getAllByUserId,
    getById,
    getAllWithAggregations,
  },
});
