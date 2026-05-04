import { initContract } from "@ts-rest/core";
import z from "zod";
import { ErrorResponseSchema } from "../common";

const c = initContract();

const PlaceIdResponseSchema = z.object({
  placeId: z.string(),
});

const LocationDetailsResponseSchema = z.object({
  country: z.string(),
  province: z.string(),
  city: z.string(),
  city2: z.string(),
});

export const googleMapApiContracts = c.router(
  {
    searchLocation: {
      method: "POST",
      path: "/searchLocation",
      body: z.object({
        lat: z.union([z.number(), z.string()]),
        lon: z.union([z.number(), z.string()]),
      }),
      responses: {
        200: PlaceIdResponseSchema,
        400: ErrorResponseSchema,
      },
      summary: "Search for a location by lat/lon and return a Google Place ID",
    },
    locationDetails: {
      method: "GET",
      path: "/locationDetails/:placeId",
      responses: {
        200: LocationDetailsResponseSchema,
        400: ErrorResponseSchema,
      },
      summary: "Get location details (country, province, city) from a Place ID",
    },
  },
  {
    pathPrefix: "/location",
  },
);
