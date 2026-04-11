import { getApexDomain } from "../utils/domain.js";
import { getDomainSetting } from "./domainSettingsService.js";
import { ProviderCredential, getProviderCredential, listProviderCredentials } from "./providerService.js";
import { Site, listSites } from "./siteService.js";

export type ResolvedAcmeChallenge = {
  apexDomain: string | null;
  challengeType: "http-01" | "dns-01";
  dnsCredentialId: string | null;
  dnsCredential: ProviderCredential | null;
  source: "configured" | "legacy" | "site_provider" | "apex_provider" | "single_credential" | "default";
};

type ResolveAcmeChallengeParams = {
  userId: string;
  domain: string;
  siteProviderCredentialId?: string | null;
  context?: {
    sites?: Site[];
    providerCredentials?: ProviderCredential[];
  };
};

function isDnsCapableCredential(
  credential: ProviderCredential | null | undefined
): credential is ProviderCredential {
  return Boolean(credential && ["tencent", "tencent_dns"].includes(credential.provider_type));
}

export async function resolveAcmeChallenge(
  params: ResolveAcmeChallengeParams
): Promise<ResolvedAcmeChallenge> {
  const apexDomain = getApexDomain(params.domain);
  let sitesCache = params.context?.sites;
  let credentialsCache = params.context?.providerCredentials;

  const loadSites = async () => {
    if (!sitesCache) {
      sitesCache = await listSites(params.userId);
    }
    return sitesCache;
  };

  const loadCredentials = async () => {
    if (!credentialsCache) {
      credentialsCache = await listProviderCredentials(params.userId);
    }
    return credentialsCache;
  };

  const loadCredentialById = async (credentialId: string) => {
    const cached = credentialsCache?.find((item) => item.id === credentialId);
    if (cached) {
      return cached;
    }
    return getProviderCredential(params.userId, credentialId);
  };

  if (apexDomain) {
    const setting = await getDomainSetting(params.userId, apexDomain);
    if (setting) {
      if (setting.challenge_type === "http-01") {
        return {
          apexDomain,
          challengeType: "http-01",
          dnsCredentialId: null,
          dnsCredential: null,
          source: "configured"
        };
      }

      if (!setting.dns_credential_id) {
        throw new Error(`域名 ${apexDomain} 已配置为 DNS-01，但未绑定 DNS 凭据`);
      }

      const credential = await loadCredentialById(setting.dns_credential_id);
      if (!credential) {
        throw new Error(`域名 ${apexDomain} 使用的 DNS 凭据不存在`);
      }
      if (!isDnsCapableCredential(credential)) {
        throw new Error("当前仅支持腾讯云 DNS 凭据");
      }

      return {
        apexDomain,
        challengeType: "dns-01",
        dnsCredentialId: credential.id,
        dnsCredential: credential,
        source: "configured"
      };
    }
  }

  const inferDnsCredential = async () => {
    const sites = await loadSites();

    if (apexDomain) {
      const legacySite = sites.find(
        (site) =>
          getApexDomain(site.domain) === apexDomain &&
          site.acme_challenge_type === "dns-01" &&
          site.dns_credential_id
      );
      if (legacySite?.dns_credential_id) {
        const credential = await loadCredentialById(legacySite.dns_credential_id);
        if (isDnsCapableCredential(credential)) {
          return { credential, source: "legacy" as const };
        }
      }
    }

    if (params.siteProviderCredentialId) {
      const credential = await loadCredentialById(params.siteProviderCredentialId);
      if (isDnsCapableCredential(credential)) {
        return { credential, source: "site_provider" as const };
      }
    }

    if (apexDomain) {
      const sameApexProviderIds = Array.from(
        new Set(
          sites
            .filter((site) => getApexDomain(site.domain) === apexDomain && site.provider_credential_id)
            .map((site) => site.provider_credential_id as string)
        )
      );

      for (const credentialId of sameApexProviderIds) {
        const credential = await loadCredentialById(credentialId);
        if (isDnsCapableCredential(credential)) {
          return { credential, source: "apex_provider" as const };
        }
      }
    }

    const credentials = await loadCredentials();
    const dnsCapableCredentials = credentials.filter(isDnsCapableCredential);
    if (dnsCapableCredentials.length === 1) {
      return { credential: dnsCapableCredentials[0], source: "single_credential" as const };
    }

    return null;
  };

  const inferred = await inferDnsCredential();
  if (inferred) {
    return {
      apexDomain,
      challengeType: "dns-01",
      dnsCredentialId: inferred.credential.id,
      dnsCredential: inferred.credential,
      source: inferred.source
    };
  }

  return {
    apexDomain,
    challengeType: "dns-01",
    dnsCredentialId: null,
    dnsCredential: null,
    source: "default"
  };
}
