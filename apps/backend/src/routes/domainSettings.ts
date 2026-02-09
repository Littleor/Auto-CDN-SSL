import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { listSites } from "../services/siteService";
import { getProviderCredential } from "../services/providerService";
import { getApexDomain } from "../utils/domain";
import { listDomainSettings, upsertDomainSetting } from "../services/domainSettingsService";

const DomainSettingSchema = z.object({
  challengeType: z.enum(["http-01", "dns-01"]),
  dnsCredentialId: z.string().nullable().optional()
});

const domainSettingsRoutes: FastifyPluginAsync = async (app) => {
  app.get("/", { preHandler: [app.authenticate] }, async (request: any) => {
    const userId = request.user.sub;
    const sites = await listSites(userId);
    const apexDomains = new Set<string>();
    const inferred = new Map<string, { challengeType: "http-01" | "dns-01"; dnsCredentialId: string | null }>();

    for (const site of sites) {
      const apex = getApexDomain(site.domain);
      if (!apex) continue;
      apexDomains.add(apex);
      if (
        site.acme_challenge_type === "dns-01" &&
        site.dns_credential_id &&
        !inferred.has(apex)
      ) {
        inferred.set(apex, {
          challengeType: "dns-01",
          dnsCredentialId: site.dns_credential_id
        });
      }
    }

    const settings = await listDomainSettings(userId);
    const settingMap = new Map(settings.map((item) => [item.apex_domain, item]));

    return Array.from(apexDomains)
      .sort()
      .map((apexDomain) => {
        const setting = settingMap.get(apexDomain);
        if (setting) {
          return {
            apexDomain,
            challengeType: setting.challenge_type,
            dnsCredentialId: setting.dns_credential_id,
            source: "configured"
          };
        }
        const inferredSetting = inferred.get(apexDomain);
        if (inferredSetting) {
          return {
            apexDomain,
            challengeType: inferredSetting.challengeType,
            dnsCredentialId: inferredSetting.dnsCredentialId,
            source: "inferred"
          };
        }
        return {
          apexDomain,
          challengeType: "http-01",
          dnsCredentialId: null,
          source: "default"
        };
      });
  });

  app.put("/:apex", { preHandler: [app.authenticate] }, async (request: any, reply) => {
    const userId = request.user.sub;
    const params = z.object({ apex: z.string().min(1) }).parse(request.params);
    const body = DomainSettingSchema.parse(request.body);

    const sites = await listSites(userId);
    const apexDomains = new Set(
      sites
        .map((site) => getApexDomain(site.domain))
        .filter((domain): domain is string => Boolean(domain))
    );
    const apexDomain = getApexDomain(params.apex) ?? params.apex.toLowerCase();
    if (!apexDomains.has(apexDomain)) {
      return reply.code(400).send({ message: "Domain not found in sites" });
    }

    let dnsCredentialId = body.dnsCredentialId ?? null;
    if (body.challengeType === "dns-01") {
      if (!dnsCredentialId) {
        return reply.code(400).send({ message: "DNS 凭据未配置" });
      }
      const credential = await getProviderCredential(userId, dnsCredentialId);
      if (!credential) {
        return reply.code(404).send({ message: "DNS 凭据不存在" });
      }
      if (!["tencent", "tencent_dns"].includes(credential.provider_type)) {
        return reply.code(400).send({ message: "当前仅支持腾讯云 DNS 凭据" });
      }
    } else {
      dnsCredentialId = null;
    }

    await upsertDomainSetting({
      userId,
      apexDomain,
      challengeType: body.challengeType,
      dnsCredentialId
    });

    reply.code(204).send();
  });
};

export default domainSettingsRoutes;
