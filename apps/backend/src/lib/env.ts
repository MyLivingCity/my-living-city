import "dotenv/config";

type Env = {
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRY: string;
};

export const env: Env = {
  DATABASE_URL: process.env["DATABASE_URL"],
  JWT_SECRET: process.env["JWT_SECRET"]!,
  JWT_EXPIRY: process.env["JWT_EXPIRY"] || "7d",
};
