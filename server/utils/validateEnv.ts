const requiredEnvVars = [
  "SPOTIFY_CLIENT_ID",
  "SPOTIFY_CLIENT_SECRET",
  "MONGO_URI",
  "SERVER_URL",
  "FRONTEND_URL",
  "JWT_SECRET",
  "JWT_KEY",
] as const;

export type EnvVars = Record<(typeof requiredEnvVars)[number], string>;

export const validateEnv = (): EnvVars => {
  const missingVars = requiredEnvVars.filter((key) => !process.env[key]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}`
    );
  }

  return requiredEnvVars.reduce((acc, key) => {
    acc[key] = process.env[key]!;
    return acc;
  }, {} as EnvVars);
};
