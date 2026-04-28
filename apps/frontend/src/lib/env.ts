type Env = {
  GOOGLE_MAPS_KEY: string;
  TOKEN_EXPIRY_IN_MINUTES: number;
};

export const env: Env = {
  GOOGLE_MAPS_KEY: import.meta.env["VITE_GOOGLE_MAPS_KEY"],
  TOKEN_EXPIRY_IN_MINUTES:
    Number(import.meta.env["VITE_TOKEN_EXPIRY_IN_MINUTES"]) || 60,
};
