import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ProviderCredential } from "../services/providerService.js";
import type { Site } from "../services/siteService.js";

const getDomainSetting = vi.fn();
const getProviderCredential = vi.fn();
const listProviderCredentials = vi.fn();
const listSites = vi.fn();

vi.mock("../services/domainSettingsService.js", () => ({
  getDomainSetting
}));

vi.mock("../services/providerService.js", () => ({
  getProviderCredential,
  listProviderCredentials
}));

vi.mock("../services/siteService.js", () => ({
  listSites
}));

const baseSite: Site = {
  id: "site-1",
  user_id: "user-1",
  name: "Main",
  domain: "www.example.com",
  provider_credential_id: "provider-1",
  certificate_source: "letsencrypt",
  auto_renew: 1,
  renew_days_before: 30,
  status: "active",
  created_at: "",
  updated_at: ""
};

const tencentCredential: ProviderCredential = {
  id: "provider-1",
  user_id: "user-1",
  provider_type: "tencent",
  name: "Tencent CDN",
  config_json: "{}",
  created_at: "",
  updated_at: ""
};

describe("resolveAcmeChallenge", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    getDomainSetting.mockResolvedValue(null);
    listSites.mockResolvedValue([baseSite]);
    listProviderCredentials.mockResolvedValue([tencentCredential]);
    getProviderCredential.mockImplementation(async (_userId: string, id: string) =>
      id === tencentCredential.id ? tencentCredential : null
    );
  });

  it("defaults to DNS-01 and reuses current Tencent credential", async () => {
    const { resolveAcmeChallenge } = await import("../services/acmeChallengeService.js");

    const result = await resolveAcmeChallenge({
      userId: "user-1",
      domain: "www.example.com",
      siteProviderCredentialId: "provider-1"
    });

    expect(result.challengeType).toBe("dns-01");
    expect(result.dnsCredentialId).toBe("provider-1");
    expect(result.source).toBe("site_provider");
  });

  it("honors explicit HTTP-01 configuration", async () => {
    getDomainSetting.mockResolvedValue({
      id: "setting-1",
      user_id: "user-1",
      apex_domain: "example.com",
      challenge_type: "http-01",
      dns_credential_id: null,
      created_at: "",
      updated_at: ""
    });

    const { resolveAcmeChallenge } = await import("../services/acmeChallengeService.js");

    const result = await resolveAcmeChallenge({
      userId: "user-1",
      domain: "www.example.com",
      siteProviderCredentialId: "provider-1"
    });

    expect(result.challengeType).toBe("http-01");
    expect(result.dnsCredentialId).toBeNull();
    expect(result.source).toBe("configured");
  });

  it("keeps DNS-01 as default even when no credential can be inferred", async () => {
    listProviderCredentials.mockResolvedValue([]);
    listSites.mockResolvedValue([{ ...baseSite, provider_credential_id: null }]);
    getProviderCredential.mockResolvedValue(null);

    const { resolveAcmeChallenge } = await import("../services/acmeChallengeService.js");

    const result = await resolveAcmeChallenge({
      userId: "user-1",
      domain: "www.example.com",
      siteProviderCredentialId: null
    });

    expect(result.challengeType).toBe("dns-01");
    expect(result.dnsCredentialId).toBeNull();
    expect(result.source).toBe("default");
  });
});
