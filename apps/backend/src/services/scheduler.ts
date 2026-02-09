import cron from "node-cron";
import { Site } from "./siteService";
import { getLatestCertificateForSite, issueCertificateForSite } from "./certificateService";
import { getProviderCredential } from "./providerService";
import { deployCertificate } from "./deploymentService";
import { env } from "../config/env";
import { getDb } from "../db";

function shouldRenew(site: Site, expiresAt?: string | null): boolean {
  if (!site.auto_renew) return false;
  if (!expiresAt) return true;
  const expiry = new Date(expiresAt).getTime();
  const thresholdDays = site.renew_days_before ?? env.RENEWAL_THRESHOLD_DAYS;
  const thresholdMs = thresholdDays * 24 * 60 * 60 * 1000;
  return expiry - Date.now() <= thresholdMs;
}

async function processSite(site: Site) {
  const latestCert = getLatestCertificateForSite(site.id);
  if (!shouldRenew(site, latestCert?.expires_at)) return;
  const newCert = await issueCertificateForSite(site);
  if (site.provider_credential_id) {
    const credential = getProviderCredential(site.user_id, site.provider_credential_id);
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

export function startScheduler() {
  cron.schedule(env.CRON_SCHEDULE, async () => {
    const sites = listSitesForAllUsers();
    for (const site of sites) {
      try {
        await processSite(site);
      } catch (error) {
        // best-effort; individual site failures should not stop schedule
        // eslint-disable-next-line no-console
        console.error("Scheduled renewal failed", error);
      }
    }
  });
}

function listSitesForAllUsers() {
  // internal helper: return all sites for scheduler
  // note: listSites requires userId, so we query directly for cron
  const db = getDb();
  return db.prepare("SELECT * FROM sites ORDER BY created_at DESC").all() as Site[];
}
