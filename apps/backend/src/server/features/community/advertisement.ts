import { advertisementApiContracts } from "@mlc/lib/api";
import { initServer } from "@ts-rest/express";
import passport from "passport";
import { prisma } from "src/prisma/client";
import {
  getRequestUser,
  isBodyEmpty,
  normalizeUploadImagePath,
  parseIntegerParam,
  toSerialized,
  upload,
} from "./utils";
import { imagePathsToS3Url, toErrorDetails } from "src/server/utils";
import { deleteImage } from "src/server/utils/image";
import { createHandlers } from "src/server";

const s = initServer();

const getAdvertisementOwnerType = async (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { userType: true },
  });
};

const canManageAdvertisement = (userType: UserType | null | undefined) =>
  userType === "SUPER_ADMIN" ||
  userType === "ADMIN" ||
  userType === "BUSINESS" ||
  userType === "COMMUNITY";

const create = s.route(advertisementApiContracts.create, {
  middleware: [passport.authenticate("jwt", { session: false }), upload],
  handler: async ({ req, body }) => {
    let error = "";
    let errorMessage = "";
    let errorStack = "";

    try {
      const user = getRequestUser(req);
      if (!user?.id || !user.email) {
        return {
          status: 403,
          body: {
            message: "You don't have the right to add an advertisement!",
            details: {
              errorMessage:
                "In order to create an advertisement, you must be an admin or business user.",
              errorStack: "user must be authenticated and authorized",
            },
          },
        };
      }

      const imagePath = normalizeUploadImagePath((req as any).file);
      const theUser = await getAdvertisementOwnerType(user.id);

      if (!canManageAdvertisement(theUser?.userType)) {
        return {
          status: 403,
          body: {
            message: "You don't have the right to add an advertisement!",
            details: {
              errorMessage:
                "In order to create an advertisement, you must be an admin or business user.",
              errorStack:
                "user must be an admin or business if they want to create an advertisement",
            },
          },
        };
      }

      if (isBodyEmpty(body)) {
        return {
          status: 400,
          body: {
            message: "The objects in the request body are missing",
            details: {
              errorMessage:
                "Creating an advertisement must supply necessary fields explicitly.",
              errorStack:
                "necessary fields must be provided in the body with a valid id found in the database.",
            },
          },
        };
      }

      const {
        adType,
        adTitle,
        adDuration,
        adPosition,
        externalLink,
        published,
      } = body as any;

      if (
        adType === "COMPLIMENTARY" &&
        theUser?.userType !== "SUPER_ADMIN" &&
        theUser?.userType !== "ADMIN"
      ) {
        const complimentaryAd = await prisma.advertisements.findFirst({
          where: { ownerId: user.id, adType: "COMPLIMENTARY" },
        });

        if (complimentaryAd) {
          if (imagePath) {
            await deleteImage("advertisement", imagePath);
          }

          return {
            status: 400,
            body: {
              message:
                'You already created a complimentary advertisement, if you want to create more, please select type "PAID"; you can edit or delete the current complimentary advertisement.',
            },
          };
        }
      }

      if (!adType) {
        error += "An advertisement must has a type. ";
        errorMessage +=
          'Creating an advertisement must explicitly be supplied with a "adType" field. ';
        errorStack +=
          "adType must be defined in the body with a predefined value. ";
      }

      if (adType && adType !== "PAID" && adType !== "COMPLIMENTARY") {
        error += "adType is invalid. ";
        errorMessage += "adType must be predefined value. ";
        errorStack += "adType must be assigned with predfined value. ";
      }

      if (!adTitle) {
        error += "An advertisement needs a title. ";
        errorMessage +=
          "Creating an advertisement must explicitly supply a adTitle field. ";
        errorStack +=
          "adTitle must be defined in the body with a valid length. ";
      }

      if (adTitle && (adTitle.length <= 2 || adTitle.length >= 40)) {
        error += "adTitle size is invalid. ";
        errorMessage +=
          "adTitle length must be longer than 2 and shorter than 40. ";
        errorStack += "adTitle content size must be valid ";
      }

      if (!published) {
        error += "An published filed must be provided. ";
        errorMessage +=
          "Creating an advertisement must explicitly supply a published field. ";
        errorStack +=
          "Published must be defined in the body with a valid value. ";
      }

      let thePublished = false;
      if (published && (published === "false" || published === "true")) {
        thePublished = published === "true";
      } else {
        error += "published must be predefined values. ";
        errorMessage +=
          "Creating an advertisement must explicitly supply a valid published value. ";
        errorStack +=
          "Published must be provided in the body with a valid value. ";
      }

      if (
        (!adDuration && adType === "PAID") ||
        (Number.parseInt(adDuration, 10) <= 0 && adType === "PAID")
      ) {
        error += "adDuration must be provided. ";
        errorMessage +=
          "adDuration must be provided in the body with a valid length. ";
        errorStack +=
          "adDuration must be provided in the body with a valid length. ";
      }

      if (!adPosition) {
        error += "adPosition is missing. ";
        errorMessage +=
          "Creating an advertisement must explicitly be supply a adPosition field. ";
        errorStack +=
          '"adPosition" must be provided in the body with a valid position found in the database. ';
      }

      if (!externalLink) {
        error += "externalLink is missing. ";
        errorMessage +=
          "Creating an advertisement must explicitly be supply a externalLink field. ";
        errorStack +=
          '"externalLink" must be provided in the body with a valid position found in the database. ';
      }

      if (error && errorMessage && errorStack) {
        if (imagePath) {
          await deleteImage("advertisement", imagePath);
        }

        return {
          status: 400,
          body: {
            message: error,
            details: {
              errorMessage,
              errorStack,
            },
          },
        };
      }

      let createAnAdvertisement;
      if (adType === "PAID") {
        const theDate = new Date();
        const endDate = new Date();
        endDate.setDate(
          theDate.getDate() + Number.parseInt(adDuration, 10) * 7,
        );

        createAnAdvertisement = await prisma.advertisements.create({
          data: {
            ownerId: user.id,
            ownerEmail: user.email,
            adTitle,
            duration: endDate,
            adType,
            adPosition,
            imagePath: imagePath ?? "",
            externalLink,
            published: thePublished,
          },
        });
      } else {
        createAnAdvertisement = await prisma.advertisements.create({
          data: {
            ownerId: user.id,
            ownerEmail: user.email,
            adTitle,
            adType,
            adPosition,
            imagePath: imagePath ?? "",
            externalLink,
            published: thePublished,
          },
        });
      }

      return {
        status: 200,
        body: toSerialized(createAnAdvertisement),
      };
    } catch (caughtError) {
      return {
        status: 400,
        body: {
          message: "An error occured while trying to create an Advertisement.",
          details: toErrorDetails(caughtError),
        },
      };
    }
  },
});

const getAll = s.route(advertisementApiContracts.getAll, {
  handler: async () => {
    try {
      const allAd = await prisma.advertisements.findMany({});
      await imagePathsToS3Url(allAd, "advertisement");

      if (allAd) {
        return {
          status: 200,
          body: toSerialized(allAd),
        };
      }

      return {
        status: 404,
        body: "there's no advertisement belongs to you!",
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "An error occured while trying to get advertisements.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const getAllPublished = s.route(advertisementApiContracts.getAllPublished, {
  handler: async () => {
    try {
      const allAd = await prisma.advertisements.findMany({
        where: {
          OR: [
            {
              adType: "COMPLIMENTARY",
            },
            {
              published: true,
            },
          ],
        },
      });

      if (allAd) {
        await imagePathsToS3Url(allAd, "advertisement");
        return {
          status: 200,
          body: toSerialized(allAd),
        };
      }

      return {
        status: 404,
        body: "there's no advertisement belongs to you!",
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "An error occured while trying to get advertisements.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const getAllUser = s.route(advertisementApiContracts.getAllUser, {
  handler: async ({ params }) => {
    try {
      const result = await prisma.advertisements.findMany({
        where: { ownerId: params.userId },
      });

      if (!result) {
        return {
          status: 204,
          body: "adsId not found!",
        };
      }

      await imagePathsToS3Url(result, "advertisement");

      return {
        status: 200,
        body: toSerialized(result),
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "An error occured while trying to retrieve the adsId.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const getById = s.route(advertisementApiContracts.getById, {
  handler: async ({ params }) => {
    try {
      const adsId = parseIntegerParam(params.adsId);
      const result = adsId
        ? await prisma.advertisements.findFirst({
          where: { id: adsId },
        })
        : null;

      if (!result) {
        return {
          status: 204,
          body: "adsId not found!",
        };
      }

      await imagePathsToS3Url([result], "advertisement");

      return {
        status: 200,
        body: toSerialized(result),
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "An error occured while trying to retrieve the adsId.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const getAdsByOwner = s.route(advertisementApiContracts.getAdsByOwner, {
  handler: async ({ params }) => {
    try {
      const result = await prisma.advertisements.findMany({
        where: { ownerId: params.ownerId },
      });
      await imagePathsToS3Url(result, "advertisement");

      return {
        status: 200,
        body: toSerialized(result),
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "An error occured while trying to retrieve the adsId.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const update = s.route(advertisementApiContracts.update, {
  middleware: [passport.authenticate("jwt", { session: false }), upload],
  handler: async ({ params, req, body }) => {
    let error = "";
    let errorMessage = "";
    let errorStack = "";

    try {
      const user = getRequestUser(req);
      if (!user?.id || !user.email) {
        return {
          status: 403,
          body: {
            message: "You don't have the right to update an advertisement!",
            details: {
              errorMessage:
                "In order to update an advertisement, you must be an admin or business user.",
              errorStack: "user must be authenticated and authorized",
            },
          },
        };
      }

      const theUser = await getAdvertisementOwnerType(user.id);
      const { adType, adTitle, adDuration, externalLink, published } =
        body as any;
      const parsedAdvertisementId = parseIntegerParam(params.advertisementId);

      if (!canManageAdvertisement(theUser?.userType)) {
        return {
          status: 403,
          body: {
            message: "You don't have the right to update an advertisement!",
            details: {
              errorMessage:
                "In order to update an advertisement, you must be an admin or business user.",
              errorStack:
                "user must be an admin or business if they want to update an advertisement",
            },
          },
        };
      }

      if (!params.advertisementId || !parsedAdvertisementId) {
        return {
          status: 400,
          body: {
            message:
              "A valid advertisementId must be specified in the route paramater.",
          },
        };
      }

      const theAdvertisement = await prisma.advertisements.findUnique({
        where: { id: parsedAdvertisementId },
      });

      if (!theAdvertisement) {
        return {
          status: 400,
          body: {
            message: `The advertisement with that listed ID (${params.advertisementId}) does not exist.`,
          },
        };
      }

      if (theAdvertisement.ownerId !== user.id) {
        return {
          status: 401,
          body: {
            message: `The user ${user.email} is not the owner or an admin and therefore cannot edit this advertisement.`,
          },
        };
      }

      let endDate: Date | undefined;
      let thePublished: boolean | undefined;

      if (adType && adType !== "COMPLIMENTARY" && adType !== "PAID") {
        error += "adType is invalid. ";
        errorMessage += "adType must be predefined value. ";
        errorStack += "adType must be assigned with predfined value. ";
      }

      if (adTitle && (adTitle.length < 2 || adTitle.length > 40)) {
        error += "adTitle size is invalid. ";
        errorMessage +=
          "adTitle length must be longer than 2 and shorter than 40. ";
        errorStack += "adTitle content size must be valid ";
      }

      if (
        theAdvertisement.duration == null &&
        !adDuration &&
        adType === "PAID"
      ) {
        error += "adDuration must be provided. ";
        errorMessage +=
          "adDuration must be provided in the body with a valid length if there's no exisintg duration. ";
        errorStack +=
          "adDuration must be provided in the body with a valid lenght. ";
      }

      if (adDuration && theAdvertisement.adType === "PAID") {
        if (Number.parseInt(adDuration, 10) <= 0) {
          error += "adDuration must be provided. ";
          errorMessage +=
            "adDuration must be provided in the body with a valid length. ";
          errorStack +=
            "adDuration must be provided in the body with a valid lenght. ";
        } else {
          const theDate = new Date();
          endDate = new Date();
          endDate.setDate(theDate.getDate() + Number.parseInt(adDuration, 10));
        }
      }

      if (published) {
        if (published === "false" || published === "true") {
          thePublished = published === "true";
        } else {
          error += "published must be predefined values. ";
          errorMessage +=
            "Updating an advertisement must explicitly supply a valid published value. ";
          errorStack +=
            "Published must be provided in the body with a valid value.";
        }
      }

      if (error && errorMessage && errorStack) {
        const newUploadPath = normalizeUploadImagePath((req as any).file);
        if (newUploadPath) {
          await deleteImage("advertisement", newUploadPath);
        }

        return {
          status: 400,
          body: {
            message: error,
            details: {
              errorMessage,
              errorStack,
            },
            reqBody: {
              adType,
              adTitle,
              adDuration,
              externalLink,
              published,
            },
          },
        };
      }

      let newImagePath: string | null | undefined;
      if ((req as any).file) {
        if (theAdvertisement.imagePath) {
          await deleteImage("advertisement", theAdvertisement.imagePath);
        }
        newImagePath = normalizeUploadImagePath((req as any).file);
      }

      const updatedAdvertisement = await prisma.advertisements.update({
        where: { id: parsedAdvertisementId },
        data: {
          ...(adType !== undefined ? { adType } : {}),
          ...(adTitle !== undefined ? { adTitle } : {}),
          ...(adType === "COMPLIMENTARY" ? { duration: null } : {}),
          ...(endDate !== undefined ? { duration: endDate } : {}),
          ...(newImagePath !== null && newImagePath !== undefined
            ? { imagePath: newImagePath }
            : {}),
          ...(externalLink !== undefined ? { externalLink } : {}),
          ...(thePublished !== undefined ? { published: thePublished } : {}),
        },
      });

      return {
        status: 200,
        body: toSerialized(updatedAdvertisement),
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "An error occured while trying to update an Advertisement.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const handleDelete = s.route(advertisementApiContracts.delete, {
  middleware: [passport.authenticate("jwt", { session: false })],
  handler: async ({ params, req }) => {
    try {
      const user = getRequestUser(req);
      const parsedAdvertisementId = parseIntegerParam(params.advertisementId);

      if (!parsedAdvertisementId) {
        return {
          status: 400,
          body: {
            message:
              "A valid advertisementId must be specified in the route paramater.",
          },
        };
      }

      const theUser = user?.id
        ? await prisma.user.findUnique({
          where: { id: user.id },
          select: { userType: true },
        })
        : null;

      if (
        theUser?.userType !== "SUPER_ADMIN" &&
        theUser?.userType !== "ADMIN" &&
        theUser?.userType !== "BUSINESS"
      ) {
        return {
          status: 403,
          body: {
            message: "You don't have the right to add an advertisement!",
            details: {
              errorMessage:
                "In order to delete an advertisement, you must be an admin or business user.",
              errorStack:
                "user must be an admin or business if they want to delete an advertisement",
            },
          },
        };
      }

      const theAdvertisement = await prisma.advertisements.findUnique({
        where: { id: parsedAdvertisementId },
      });

      if (!theAdvertisement) {
        return {
          status: 404,
          body: "Advertisement which needs to be deleted not found!",
        };
      }

      if (theAdvertisement.ownerId !== user?.id) {
        return {
          status: 401,
          body: {
            message: `The user ${user?.email} is not the author or an admin and therefore cannot delete this advertisement.`,
          },
        };
      }

      if (theAdvertisement.imagePath) {
        await deleteImage("advertisement", theAdvertisement.imagePath);
      }

      const deletedAd = await prisma.advertisements.delete({
        where: {
          id: parsedAdvertisementId,
        },
      });

      return {
        status: 200,
        body: {
          message: "Advertisement succesfully deleted",
          deletedAd: toSerialized(deletedAd),
        },
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "An error occured while trying to delete advertisement.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const getPrices = s.route(advertisementApiContracts.getPrices, {
  handler: async () => {
    try {
      const result = await prisma.adPrice.findMany({
        orderBy: {
          lengthWeeks: "asc",
        },
      });

      return {
        status: 200,
        body: toSerialized(result),
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "An error occurred while trying to retrieve ad pricing.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const addPrice = s.route(advertisementApiContracts.addPrice, {
  handler: async ({ body }) => {
    try {
      const { lengthWeeks, priceCadDollars } = body as any;

      if (!lengthWeeks || !priceCadDollars) {
        return {
          status: 400,
          body: {
            message: "Missing required fields",
          },
        };
      }

      const newPrice = await prisma.adPrice.create({
        data: {
          lengthWeeks,
          priceCadDollars,
        },
      });

      return {
        status: 201,
        body: toSerialized(newPrice),
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "Failed to create ad price",
          details: error instanceof Error ? error.message : String(error),
        },
      };
    }
  },
});

const updatePrice = s.route(advertisementApiContracts.updatePrice, {
  handler: async ({ params, body }) => {
    try {
      const id = Number(params.id);
      const { lengthWeeks, priceCadDollars } = body as any;

      if (Number.isNaN(id)) {
        return {
          status: 400,
          body: {
            message: "Invalid ID",
          },
        };
      }

      const updatedPrice = await prisma.adPrice.update({
        where: { id },
        data: {
          lengthWeeks,
          priceCadDollars,
        },
      });

      return {
        status: 200,
        body: toSerialized(updatedPrice),
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "Failed to update ad price",
          details: error instanceof Error ? error.message : String(error),
        },
      };
    }
  },
});

const deletePrice = s.route(advertisementApiContracts.deletePrice, {
  handler: async ({ params }) => {
    try {
      const id = Number(params.id);

      if (Number.isNaN(id)) {
        return {
          status: 400,
          body: {
            message: "Invalid ID",
          },
        };
      }

      await prisma.adPrice.delete({
        where: { id },
      });

      return {
        status: 204,
        body: undefined,
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "Failed to delete ad price",
          details: error instanceof Error ? error.message : String(error),
        },
      };
    }
  },
});

const pricing = s.route(advertisementApiContracts.pricing, {
  middleware: [passport.authenticate("jwt", { session: false })],
  handler: async () => {
    try {
      const segmentUserCounts = await (prisma as any).userSegments.groupBy({
        by: ["homeSegmentId"],
        _count: {
          userId: true,
        },
        orderBy: {
          homeSegmentId: "asc",
        },
      });

      const segments = await prisma.segments.findMany({
        distinct: ["segId"],
        orderBy: {
          segId: "asc",
        },
      });

      const mapped = segmentUserCounts.map((segmentUserCount: any) => ({
        name: segments[segmentUserCount.homeSegmentId - 1]?.name ?? "",
        segId: segments[segmentUserCount.homeSegmentId - 1]?.segId ?? null,
        count: segmentUserCount._count.userId,
      }));

      return {
        status: 200,
        body: toSerialized(mapped),
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: error instanceof Error ? error.message : String(error),
        },
      };
    }
  },
});

const getSegmentPrices = s.route(advertisementApiContracts.getSegmentPrices, {
  handler: async () => {
    try {
      const segments = await prisma.segments.findMany({
        orderBy: { segId: "asc" },
        include: {
          segmentAdPrice: true,
        },
      });

      const mapped = segments.map((segment) => ({
        id: segment.segmentAdPrice?.id ?? null,
        segmentId: segment.segId,
        segmentName: segment.name,
        weeklyPrice: segment.segmentAdPrice?.weeklyPrice?.toString() ?? null,
      }));

      return {
        status: 200,
        body: mapped,
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "An error occurred while retrieving segment ad prices.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const updateSegmentPrice = s.route(
  advertisementApiContracts.updateSegmentPrice,
  {
    middleware: [passport.authenticate("jwt", { session: false })],
    handler: async ({ params, req, body }) => {
      try {
        const segmentId = Number(params.segmentId);
        const { weeklyPrice } = body as any;

        if (Number.isNaN(segmentId)) {
          return {
            status: 400,
            body: {
              message: "Invalid segment ID",
            },
          };
        }

        const user = getRequestUser(req);
        const theUser = user?.id
          ? await prisma.user.findUnique({
            where: { id: user.id },
            select: { userType: true },
          })
          : null;

        if (
          theUser?.userType !== "SUPER_ADMIN" &&
          theUser?.userType !== "ADMIN"
        ) {
          return {
            status: 403,
            body: {
              message: "You don't have the right to update ad pricing!",
            },
          };
        }

        const updated = await prisma.segmentAdPrice.upsert({
          where: { segmentId },
          update: { weeklyPrice },
          create: { segmentId, weeklyPrice },
          include: { segment: { select: { name: true } } },
        });

        return {
          status: 200,
          body: {
            id: updated.id,
            segmentId: updated.segmentId,
            segmentName: updated.segment.name,
            weeklyPrice: updated.weeklyPrice.toString(),
          },
        };
      } catch (error) {
        return {
          status: 400,
          body: {
            message: "Failed to update segment ad price",
            details: toErrorDetails(error),
          },
        };
      }
    },
  },
);

const deleteSegmentPrice = s.route(
  advertisementApiContracts.deleteSegmentPrice,
  {
    middleware: [passport.authenticate("jwt", { session: false })],
    handler: async ({ params, req }) => {
      try {
        const segmentId = Number(params.segmentId);

        if (Number.isNaN(segmentId)) {
          return {
            status: 400,
            body: {
              message: "Invalid segment ID",
            },
          };
        }

        const user = getRequestUser(req);
        const theUser = user?.id
          ? await prisma.user.findUnique({
            where: { id: user.id },
            select: { userType: true },
          })
          : null;

        if (
          theUser?.userType !== "SUPER_ADMIN" &&
          theUser?.userType !== "ADMIN"
        ) {
          return {
            status: 403,
            body: {
              message: "You don't have the right to update ad pricing!",
            },
          };
        }

        await prisma.segmentAdPrice.deleteMany({
          where: { segmentId },
        });

        return {
          status: 200,
          body: {
            message: "Segment price reset to default",
          },
        };
      } catch (error) {
        return {
          status: 400,
          body: {
            message: "Failed to reset segment ad price",
            details: toErrorDetails(error),
          },
        };
      }
    },
  },
);

export const advertisementApiHandlers = createHandlers({
  schema: advertisementApiContracts,
  router: {
    addPrice,
    create,
    delete: handleDelete,
    deletePrice,
    deleteSegmentPrice,
    getAdsByOwner,
    getAll,
    getAllPublished,
    getAllUser,
    getById,
    getPrices,
    getSegmentPrices,
    pricing,
    update,
    updatePrice,
    updateSegmentPrice,
  },
});
