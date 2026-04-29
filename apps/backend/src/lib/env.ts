import "dotenv/config";

type Env = {
  DATABASE_URL: string;
  DEEPINFRA_API_KEY: string;
  JWT_EXPIRY: string;
  JWT_SECRET: string;
};

export const env: Env = {
  DATABASE_URL: process.env["DATABASE_URL"]!,
  DEEPINFRA_API_KEY: process.env["DEEPINFRA_API_KEY"]!,
  JWT_SECRET: process.env["JWT_SECRET"]!,
  JWT_EXPIRY: process.env["JWT_EXPIRY"] || "7d",
};
