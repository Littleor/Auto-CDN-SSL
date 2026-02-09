import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  HOST: z.string().default("0.0.0.0"),
  PORT: z.coerce.number().default(4000),
  MYSQL_HOST: z.string().default("127.0.0.1"),
  MYSQL_PORT: z.coerce.number().default(3306),
  MYSQL_USER: z.string().default("root"),
  MYSQL_PASSWORD: z.string().default(""),
  MYSQL_DATABASE: z.string().default("auto-ssl"),
  SMTP_HOST: z.string().min(1, "SMTP_HOST is required"),
  SMTP_PORT: z.coerce.number().default(465),
  SMTP_USER: z.string().min(1, "SMTP_USER is required"),
  SMTP_PASSWORD: z.string().min(1, "SMTP_PASSWORD is required"),
  FROM_EMAIL: z.string().email("FROM_EMAIL is required"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET is required"),
  ACCESS_TOKEN_TTL_MINUTES: z.coerce.number().default(15),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().default(30),
  DATA_ENCRYPTION_KEY: z.string().min(8, "DATA_ENCRYPTION_KEY is required"),
  ACME_DIRECTORY_URL: z
    .string()
    .default("https://acme-v02.api.letsencrypt.org/directory"),
  ACME_ACCOUNT_EMAIL: z.string().email().optional(),
  ACME_HTTP_HOST: z.string().optional(),
  ACME_HTTP_PORT: z.coerce.number().default(80),
  ACME_SKIP_LOCAL_VERIFY: z.coerce.boolean().default(false),
  ACME_DNS_WAIT_SECONDS: z.coerce.number().default(20),
  ACME_DNS_TTL: z.coerce.number().default(600),
  RENEWAL_THRESHOLD_DAYS: z.coerce.number().default(30),
  CRON_SCHEDULE: z.string().default("0 3 * * *")
});

export type Env = z.infer<typeof EnvSchema>;

export const env: Env = EnvSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  HOST: process.env.HOST,
  PORT: process.env.PORT,
  MYSQL_HOST: process.env.MYSQL_HOST,
  MYSQL_PORT: process.env.MYSQL_PORT,
  MYSQL_USER: process.env.MYSQL_USER,
  MYSQL_PASSWORD: process.env.MYSQL_PASSWORD,
  MYSQL_DATABASE: process.env.MYSQL_DATABASE,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD,
  FROM_EMAIL: process.env.FROM_EMAIL,
  JWT_SECRET: process.env.JWT_SECRET,
  ACCESS_TOKEN_TTL_MINUTES: process.env.ACCESS_TOKEN_TTL_MINUTES,
  REFRESH_TOKEN_TTL_DAYS: process.env.REFRESH_TOKEN_TTL_DAYS,
  DATA_ENCRYPTION_KEY: process.env.DATA_ENCRYPTION_KEY,
  ACME_DIRECTORY_URL: process.env.ACME_DIRECTORY_URL,
  ACME_ACCOUNT_EMAIL: process.env.ACME_ACCOUNT_EMAIL,
  ACME_HTTP_HOST: process.env.ACME_HTTP_HOST,
  ACME_HTTP_PORT: process.env.ACME_HTTP_PORT,
  ACME_SKIP_LOCAL_VERIFY: process.env.ACME_SKIP_LOCAL_VERIFY,
  ACME_DNS_WAIT_SECONDS: process.env.ACME_DNS_WAIT_SECONDS,
  ACME_DNS_TTL: process.env.ACME_DNS_TTL,
  RENEWAL_THRESHOLD_DAYS: process.env.RENEWAL_THRESHOLD_DAYS,
  CRON_SCHEDULE: process.env.CRON_SCHEDULE
});
