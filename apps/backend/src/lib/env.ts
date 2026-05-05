import "dotenv/config";

type Env = {
  DATABASE_URL: string;
  DEEPINFRA_API_KEY: string;
  GOOGLE_MAP_API_KEY: string;
  JWT_EXPIRY: string;
  JWT_SECRET: string;
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
  STRIPE_PRICE_BUSINESS: process.env["STRIPE_PRICE_BUSINESS"]!,
  STRIPE_PRICE_COMMUNITY: process.env["STRIPE_PRICE_COMMUNITY"]!,
  STRIPE_PRICE_MUNICIPAL: process.env["STRIPE_PRICE_MUNICIPAL"]!,
  STRIPE_SECRET_KEY: process.env["STRIPE_SECRET_KEY"]!,
};
