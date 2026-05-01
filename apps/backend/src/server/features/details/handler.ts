import { initServer } from "@ts-rest/express";
import * as passport from "passport";
import { toErrorDetails } from "src/server/utils";
import { z } from "zod";
//import { prisma } from "src/prisma/client";
import { RouterImplementation } from "@ts-rest/express/src/lib/types";

//Contracts
import {
  detailsApiContracts,
  //HybridErrorSchema,
  //SchoolDetailsSchema,
  SchoolDetailsCreateSchema,
  //SchoolDetailsUpdateSchema,
  //WorkDetailsSchema,
  //WorkDetailsCreateSchema,
  //WorkDetailsUpdateSchema,
} from "@mlc/lib/api";

type SchoolDetailsCreate = z.infer<typeof SchoolDetailsCreateSchema>;

//Services
import {
  //schoolDetails
  createSchoolDetailsEntry,
  deleteSchoolDetailsAndSegments,
  getSchoolDetailsByUserId,
  upsertSchoolDetailsAndHandle,
  updateSchoolCityAndNeighbourhood,
  //workDetails
  createWorkDetailsEntry,
  deleteWorkDetailsAndSegments,
  getWorkDetailsByUserId,
  upsertWorkDetailsAndHandle,
  updateWorkCityAndNeighbourhood,
} from "./service";
import { createHandlers } from "src/server";

const s = initServer();
// ============================================================================
// schoolDetails
// ============================================================================
const createSchoolDetails = s.route(detailsApiContracts.schoolDetails.create, {
  middleware: [passport.authenticate("jwt", { session: false })],
  handler: async ({ body }: { body: SchoolDetailsCreate }) => {
    try {
      const schoolDetails = await createSchoolDetailsEntry(body);

      return {
        status: 200,
        body: schoolDetails,
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "Error occurred while creating school details entry",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const deleteSchoolDetails = s.route(detailsApiContracts.schoolDetails.delete, {
  handler: async ({ params }) => {
    const { id: userId } = params;

    try {
      const result = await deleteSchoolDetailsAndSegments(userId);

      if (!result.success) {
        return {
          status: 400,
          body: {
            message: "Failed to delete",
            details: toErrorDetails(result.error || "Failed to delete"),
          },
        };
      }

      return {
        status: 204,
        body: undefined,
      };
    } catch (error) {
      return {
        status: 500,
        body: {
          message: "An internal server error occurred",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const getSchoolDetails = s.route(detailsApiContracts.schoolDetails.get, {
  handler: async ({ params }) => {
    const { id: userId } = params;

    try {
      const schoolDetails = await getSchoolDetailsByUserId(userId);

      if (!schoolDetails) {
        return {
          status: 400,
          body: {
            message: "School details not found",
            details: toErrorDetails("School details not found"),
          },
        };
      }

      return {
        status: 200,
        body: schoolDetails,
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "Error occurred while retrieving school details",
          details: toErrorDetails(error),
        },
      };
    }
  },
});
const updateSchoolDetails = s.route(detailsApiContracts.schoolDetails.update, {
  handler: async ({ params, body }) => {
    const { id: userId } = params;

    try {
      const schoolDetails = await upsertSchoolDetailsAndHandle(userId, body);

      return {
        status: 200,
        body: schoolDetails,
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "Error occurred while updating school details",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const updateSchoolCityNeighbourhood = s.route(
  detailsApiContracts.schoolDetails.updateCityNeighbourhood,
  {
    handler: async ({ params, body }) => {
      const { id: userId } = params;

      try {
        const result = await updateSchoolCityAndNeighbourhood(userId, body);

        return {
          status: 200,
          body: result,
        };
      } catch (error) {
        return {
          status: 400,
          body: {
            message:
              "An Error occurred while trying to update city and neighbourhood.",
            details: toErrorDetails(error),
          },
        };
      }
    },
  },
);

// ============================================================================
// workDetails
// ============================================================================
const createWorkDetails = s.route(detailsApiContracts.workDetails.create, {
  middleware: [passport.authenticate("jwt", { session: false })],
  handler: async ({ body }) => {
    try {
      // Mapping from the contract body (flattened) to the service
      const workDetails = await createWorkDetailsEntry(body);

      return {
        status: 200,
        body: workDetails,
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "Error occurred while creating work details entry",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const deleteWorkDetails = s.route(detailsApiContracts.workDetails.delete, {
  handler: async ({ params }) => {
    const { id: userId } = params;

    try {
      const result = await deleteWorkDetailsAndSegments(userId);

      if (!result.success) {
        return {
          status: 400,
          body: {
            message: "Failed to delete",
            details: toErrorDetails(result.error),
          },
        };
      }

      return {
        status: 204,
        body: undefined,
      };
    } catch (error) {
      return {
        status: 500,
        body: {
          message: "An internal server error occurred",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const getWorkDetails = s.route(detailsApiContracts.workDetails.get, {
  handler: async ({ params }) => {
    const { id: userId } = params;

    try {
      const workDetails = await getWorkDetailsByUserId(userId);

      if (!workDetails) {
        return {
          status: 400,
          body: {
            message: "Work details not found",
            details: toErrorDetails("Work details not found"),
          },
        };
      }

      return {
        status: 200,
        body: workDetails,
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "Error occurred while retrieving work details",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const updateWorkDetails = s.route(detailsApiContracts.workDetails.update, {
  handler: async ({ params, body }) => {
    const { id: userId } = params;

    try {
      const workDetails = await upsertWorkDetailsAndHandle(userId, body);

      return {
        status: 200,
        body: workDetails,
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message: "Error occurred while updating work details",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const updateWorkCityNeighbourhood = s.route(
  detailsApiContracts.workDetails.updateCityNeighbourhood,
  {
    handler: async ({ params, body }) => {
      const { id: userId } = params;

      try {
        const result = await updateWorkCityAndNeighbourhood(userId, body);

        return {
          status: 200,
          body: result,
        };
      } catch (error) {
        return {
          status: 400,
          body: {
            message:
              "An Error occurred while trying to update city and neighbourhood.",
            details: toErrorDetails(error),
          },
        };
      }
    },
  },
);

export default createHandlers({
  schema: detailsApiContracts,
  router: {
    schoolDetails: {
      create: createSchoolDetails,
      get: getSchoolDetails,
      delete: deleteSchoolDetails,
      update: updateSchoolDetails,
      updateCityNeighbourhood: updateSchoolCityNeighbourhood,
    },
    workDetails: {
      create: createWorkDetails,
      get: getWorkDetails,
      delete: deleteWorkDetails,
      update: updateWorkDetails,
      updateCityNeighbourhood: updateWorkCityNeighbourhood,
    },
  },
});
