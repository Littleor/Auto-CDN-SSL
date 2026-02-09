import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  HOST: z.string().default("0.0.0.0"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().default("./data/auto-ssl.sqlite"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET is required"),
  ACCESS_TOKEN_TTL_MINUTES: z.coerce.number().default(15),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().default(30),
  DATA_ENCRYPTION_KEY: z.string().min(8, "DATA_ENCRYPTION_KEY is required"),
  ACME_DIRECTORY_URL: z
    .string()
    .default("https://acme-staging-v02.api.letsencrypt.org/directory"),
  ACME_ACCOUNT_EMAIL: z.string().email().optional(),
  ACME_HTTP_HOST: z.string().optional(),
  ACME_HTTP_PORT: z.coerce.number().default(80),
  ACME_SKIP_LOCAL_VERIFY: z.coerce.boolean().default(false),
  RENEWAL_THRESHOLD_DAYS: z.coerce.number().default(30),
  CRON_SCHEDULE: z.string().default("0 3 * * *")
});

export type Env = z.infer<typeof EnvSchema>;

export const env: Env = EnvSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  HOST: process.env.HOST,
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  ACCESS_TOKEN_TTL_MINUTES: process.env.ACCESS_TOKEN_TTL_MINUTES,
  REFRESH_TOKEN_TTL_DAYS: process.env.REFRESH_TOKEN_TTL_DAYS,
  DATA_ENCRYPTION_KEY: process.env.DATA_ENCRYPTION_KEY,
  ACME_DIRECTORY_URL: process.env.ACME_DIRECTORY_URL,
  ACME_ACCOUNT_EMAIL: process.env.ACME_ACCOUNT_EMAIL,
  ACME_HTTP_HOST: process.env.ACME_HTTP_HOST,
  ACME_HTTP_PORT: process.env.ACME_HTTP_PORT,
  ACME_SKIP_LOCAL_VERIFY: process.env.ACME_SKIP_LOCAL_VERIFY,
  RENEWAL_THRESHOLD_DAYS: process.env.RENEWAL_THRESHOLD_DAYS,
  CRON_SCHEDULE: process.env.CRON_SCHEDULE
});
