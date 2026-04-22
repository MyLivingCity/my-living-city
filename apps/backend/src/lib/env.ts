import "dotenv/config";

type Env = {
  JWT_SECRET: string;
  JWT_EXPIRY: string;
};

export const env: Env = {
  JWT_SECRET: process.env["JWT_SECRET"]!,
  JWT_EXPIRY: process.env["JWT_EXPIRY"] || "7d",
};
