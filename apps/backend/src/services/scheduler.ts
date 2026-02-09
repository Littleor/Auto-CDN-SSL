import cron, { ScheduledTask } from "node-cron";
import { Site, listSites } from "./siteService";
import { getLatestCertificateForSite, issueCertificateForSite } from "./certificateService";
import { getProviderCredential } from "./providerService";
import { deployCertificate } from "./deploymentService";
import { getResolvedUserSettings, ResolvedUserSettings } from "./userSettingsService";
import { listUsers } from "./userService";

const scheduledTasks = new Map<string, ScheduledTask>();
let schedulerStarted = false;

function buildCronExpression(hour: number, minute: number) {
  return `${minute} ${hour} * * *`;
}

function shouldRenew(site: Site, settings: ResolvedUserSettings, expiresAt?: string | null): boolean {
  if (!site.auto_renew) return false;
  if (!expiresAt) return true;
  const expiry = new Date(expiresAt).getTime();
  const thresholdDays = settings.renewalThresholdDays;
  const thresholdMs = thresholdDays * 24 * 60 * 60 * 1000;
  return expiry - Date.now() <= thresholdMs;
}

async function processSite(site: Site, settings: ResolvedUserSettings) {
  const latestCert = await getLatestCertificateForSite(site.id);
  if (!shouldRenew(site, settings, latestCert?.expires_at)) return;
  const newCert = await issueCertificateForSite(site, settings);
  if (site.provider_credential_id && site.auto_deploy) {
    const credential = await getProviderCredential(site.user_id, site.provider_credential_id);
    if (credential) {
      await deployCertificate({
        siteId: site.id,
        domain: site.domain,
        certificate: newCert,
        providerCredential: credential
      });
    }
  }
}

async function processUser(userId: string) {
  const settings = await getResolvedUserSettings(userId);
  const sites = await listSites(userId);
  for (const site of sites) {
    try {
      await processSite(site, settings);
    } catch (error) {
      // best-effort; individual site failures should not stop schedule
      // eslint-disable-next-line no-console
      console.error("Scheduled renewal failed", error);
    }
  }
}

async function scheduleUser(userId: string) {
  const settings = await getResolvedUserSettings(userId);
  const expression = buildCronExpression(settings.renewalHour, settings.renewalMinute);
  const task = cron.schedule(expression, async () => {
    await processUser(userId);
  });
  scheduledTasks.set(userId, task);
}

function stopUserSchedule(userId: string) {
  const task = scheduledTasks.get(userId);
  if (task) {
    task.stop();
    scheduledTasks.delete(userId);
  }
}

export async function startScheduler() {
  schedulerStarted = true;
  const users = await listUsers();
  for (const user of users) {
    stopUserSchedule(user.id);
    await scheduleUser(user.id);
  }
}

export async function refreshUserSchedule(userId: string) {
  if (!schedulerStarted) return;
  stopUserSchedule(userId);
  await scheduleUser(userId);
}
