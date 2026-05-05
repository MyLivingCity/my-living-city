import "dotenv/config";

type Env = {
  DATABASE_URL: string;
  DEEPINFRA_API_KEY: string;
  GOOGLE_MAP_API_KEY: string;
  JWT_EXPIRY: string;
  JWT_SECRET: string;
};

export const env: Env = {
  DATABASE_URL: process.env["DATABASE_URL"]!,
  DEEPINFRA_API_KEY: process.env["DEEPINFRA_API_KEY"]!,
  GOOGLE_MAP_API_KEY: process.env["GOOGLE_MAP_API_KEY"]!,
  JWT_EXPIRY: process.env["JWT_EXPIRY"] || "7d",
  JWT_SECRET: process.env["JWT_SECRET"]!,
};
