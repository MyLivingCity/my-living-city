type Env = {
  TOKEN_EXPIRY_IN_MINUTES: number;
};

export const env: Env = {
  TOKEN_EXPIRY_IN_MINUTES:
    Number(import.meta.env.VITE_TOKEN_EXPIRY_IN_MINUTES) || 60,
};
