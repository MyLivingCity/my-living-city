import "dotenv/config";

type Env = {
  DATABASE_URL: string;
  DEEPINFRA_API_KEY: string;
  GOOGLE_MAP_API_KEY: string;
  JWT_EXPIRY: string;
  JWT_SECRET: string;
  PROJECT_RATING_AVG: number;
  PROJECT_RATING_COUNT: number;
  PROPOSAL_RATING_AVG: number;
  PROPOSAL_RATING_COUNT: number;
  STRIPE_PRICE_BUSINESS: string;
  STRIPE_PRICE_COMMUNITY: string;
  STRIPE_PRICE_MUNICIPAL: string;
  STRIPE_SECRET_KEY: string;
};

export const env: Env = {
  DATABASE_URL: process.env["DATABASE_URL"]!,
  DEEPINFRA_API_KEY: process.env["DEEPINFRA_API_KEY"]!,
  GOOGLE_MAP_API_KEY: process.env["GOOGLE_MAP_API_KEY"]!,
  JWT_EXPIRY: process.env["JWT_EXPIRY"] || "7d",
  JWT_SECRET: process.env["JWT_SECRET"]!,
  PROJECT_RATING_AVG: parseFloat(process.env["PROJECT_RATING_AVG"] || "1.5"),
  PROJECT_RATING_COUNT: parseInt(process.env["PROJECT_RATING_COUNT"] || "50"),
  PROPOSAL_RATING_AVG: parseFloat(process.env["PROPOSAL_RATING_AVG"] || "1"),
  PROPOSAL_RATING_COUNT: parseInt(process.env["PROPOSAL_RATING_COUNT"] || "25"),
  STRIPE_PRICE_BUSINESS: process.env["STRIPE_PRICE_BUSINESS"]!,
  STRIPE_PRICE_COMMUNITY: process.env["STRIPE_PRICE_COMMUNITY"]!,
  STRIPE_PRICE_MUNICIPAL: process.env["STRIPE_PRICE_MUNICIPAL"]!,
  STRIPE_SECRET_KEY: process.env["STRIPE_SECRET_KEY"]!,
};
