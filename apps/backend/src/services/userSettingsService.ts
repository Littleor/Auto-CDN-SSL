import { nanoid } from "nanoid";
import { env } from "../config/env";
import { getDb } from "../db";
import { findUserById } from "./userService";

export type UserSettings = {
  id: string;
  user_id: string;
  renewal_hour: number;
  renewal_minute: number;
  renewal_threshold_days: number;
  auto_deploy: number;
  acme_account_email: string | null;
  acme_directory_url: string | null;
  acme_skip_local_verify: number;
  acme_dns_wait_seconds: number;
  acme_dns_ttl: number;
  created_at: string;
  updated_at: string;
};

export type ResolvedUserSettings = {
  userId: string;
  renewalHour: number;
  renewalMinute: number;
  renewalThresholdDays: number;
  autoDeploy: boolean;
  acme: {
    accountEmail: string | null;
    directoryUrl: string;
    skipLocalVerify: boolean;
    dnsWaitSeconds: number;
    dnsTtl: number;
  };
};

type Defaults = ResolvedUserSettings;

function parseCronDefaults() {
  const match = env.CRON_SCHEDULE.match(/^(\d{1,2})\s+(\d{1,2})\s/);
  if (!match) {
    return { minute: 0, hour: 3 };
  }
  const minute = Number(match[1]);
  const hour = Number(match[2]);
  if (
    Number.isNaN(minute) ||
    Number.isNaN(hour) ||
    minute < 0 ||
    minute > 59 ||
    hour < 0 ||
    hour > 23
  ) {
    return { minute: 0, hour: 3 };
  }
  return { minute, hour };
}

function getDefaults(userId: string): Defaults {
  const cronDefaults = parseCronDefaults();
  return {
    userId,
    renewalHour: cronDefaults.hour,
    renewalMinute: cronDefaults.minute,
    renewalThresholdDays: env.RENEWAL_THRESHOLD_DAYS,
    autoDeploy: true,
    acme: {
      accountEmail: null,
      directoryUrl: env.ACME_DIRECTORY_URL,
      skipLocalVerify: env.ACME_SKIP_LOCAL_VERIFY,
      dnsWaitSeconds: env.ACME_DNS_WAIT_SECONDS,
      dnsTtl: env.ACME_DNS_TTL
    }
  };
}

export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  const db = getDb();
  const row = (await db
    .prepare("SELECT * FROM user_settings WHERE user_id = ?")
    .get(userId)) as UserSettings | undefined;
  return row ?? null;
}

export async function getResolvedUserSettings(userId: string): Promise<ResolvedUserSettings> {
  const defaults = getDefaults(userId);
  const row = await getUserSettings(userId);
  const user = await findUserById(userId);
  const accountEmail = user?.email ?? env.ACME_ACCOUNT_EMAIL ?? defaults.acme.accountEmail;
  if (!row) {
    return {
      ...defaults,
      acme: { ...defaults.acme, accountEmail }
    };
  }
  return {
    userId,
    renewalHour: row.renewal_hour ?? defaults.renewalHour,
    renewalMinute: row.renewal_minute ?? defaults.renewalMinute,
    renewalThresholdDays: row.renewal_threshold_days ?? defaults.renewalThresholdDays,
    autoDeploy:
      typeof row.auto_deploy === "number" ? row.auto_deploy === 1 : defaults.autoDeploy,
    acme: {
      accountEmail,
      directoryUrl: defaults.acme.directoryUrl,
      skipLocalVerify: defaults.acme.skipLocalVerify,
      dnsWaitSeconds: defaults.acme.dnsWaitSeconds,
      dnsTtl: defaults.acme.dnsTtl
    }
  };
}

export async function upsertUserSettings(params: {
  userId: string;
  renewalHour: number;
  renewalMinute: number;
  renewalThresholdDays: number;
  autoDeploy: boolean;
}) {
  const db = getDb();
  const now = new Date().toISOString();
  const id = nanoid();
  await db
    .prepare(
      `INSERT INTO user_settings (
        id, user_id, renewal_hour, renewal_minute, renewal_threshold_days, auto_deploy,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        renewal_hour = VALUES(renewal_hour),
        renewal_minute = VALUES(renewal_minute),
        renewal_threshold_days = VALUES(renewal_threshold_days),
        auto_deploy = VALUES(auto_deploy),
        updated_at = VALUES(updated_at)`
    )
    .run(
      id,
      params.userId,
      params.renewalHour,
      params.renewalMinute,
      params.renewalThresholdDays,
      params.autoDeploy ? 1 : 0,
      now,
      now
    );
}
