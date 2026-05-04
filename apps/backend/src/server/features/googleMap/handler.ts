import axios from "axios";
import { googleMapApiContracts } from "@mlc/lib/api";
import { initServer } from "@ts-rest/express";
import { createHandlers } from "src/server";
import { toErrorDetails } from "src/server/utils";

const s = initServer();

const GOOGLE_TEXT_SEARCH_URL =
  "https://maps.googleapis.com/maps/api/place/textsearch/json?query=";
const GOOGLE_PLACE_DETAILS_URL =
  "https://maps.googleapis.com/maps/api/place/details/json?placeid=";

const searchLocation = s.route(googleMapApiContracts.searchLocation, {
  handler: async ({ body }) => {
    try {
      const { lat, lon } = body;

      if (!lat || !lon) {
        return {
          status: 400,
          body: {
            message: "lat or lon is missing.",
            details: {
              errorMessage: "lat and lon are required.",
              errorStack: "",
            },
          },
        };
      }

      const apiKey = process.env["GOOGLE_MAP_API_KEY"];
      const response = await axios.get(
        `${GOOGLE_TEXT_SEARCH_URL}${lat},${lon}&key=${apiKey}`,
      );

      const placeId = response.data?.results?.[0]?.place_id as
        | string
        | undefined;
      if (!placeId) {
        return {
          status: 400,
          body: {
            message: "No placeId was found in results.",
            details: {
              errorMessage: "Google Places returned no results.",
              errorStack: "",
            },
          },
        };
      }

      return {
        status: 200,
        body: { placeId },
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message:
            "An unexpected error occurred when querying location information.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

const locationDetails = s.route(googleMapApiContracts.locationDetails, {
  handler: async ({ params }) => {
    try {
      const { placeId } = params;

      if (!placeId) {
        return {
          status: 400,
          body: {
            message: "placeId is missing.",
            details: {
              errorMessage: "placeId route parameter is required.",
              errorStack: "",
            },
          },
        };
      }

      const apiKey = process.env["GOOGLE_MAP_API_KEY"];
      const response = await axios.get(
        `${GOOGLE_PLACE_DETAILS_URL}${placeId}&key=${apiKey}`,
      );

      const addressComponents = response.data?.result?.address_components as
        | { types: string[]; long_name: string }[]
        | undefined;

      if (!addressComponents) {
        return {
          status: 400,
          body: {
            message: "placeId search returned no address components.",
            details: {
              errorMessage: "No address_components in Google response.",
              errorStack: "",
            },
          },
        };
      }

      let country = "";
      let province = "";
      let city = "";
      let city2 = "";

      for (const component of addressComponents) {
        const type = component.types[0];
        if (type === "locality") {
          city = component.long_name.toLowerCase();
        } else if (type === "administrative_area_level_3") {
          city2 = component.long_name.toLowerCase();
        } else if (type === "administrative_area_level_1") {
          province = component.long_name.toLowerCase();
        } else if (type === "country") {
          country = component.long_name.toLowerCase();
        }
      }

      return {
        status: 200,
        body: { country, province, city, city2 },
      };
    } catch (error) {
      return {
        status: 400,
        body: {
          message:
            "An unexpected error occurred when querying location details.",
          details: toErrorDetails(error),
        },
      };
    }
  },
});

export default createHandlers({
  schema: googleMapApiContracts,
  router: {
    searchLocation,
    locationDetails,
  },
});
