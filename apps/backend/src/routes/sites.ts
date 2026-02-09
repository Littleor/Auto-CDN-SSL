import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { createSite, deleteSite, getSite, listSites, updateSite } from "../services/siteService.js";
import { getLatestCertificateForSite } from "../services/certificateService.js";

const SiteSchema = z.object({
  name: z.string().min(1),
  domain: z.string().min(1),
  providerCredentialId: z.string().nullable().optional(),
  certificateSource: z.enum(["letsencrypt", "self_signed"]).default("self_signed"),
  autoRenew: z.boolean().default(true),
  renewDaysBefore: z.coerce.number().min(1).max(90).default(30),
  status: z.enum(["active", "paused"]).default("active")
});

const siteRoutes: FastifyPluginAsync = async (app) => {
  app.get("/", { preHandler: [app.authenticate] }, async (request: any) => {
    const sites = await listSites(request.user.sub);
    return Promise.all(sites.map(async (site) => {
      const cert = await getLatestCertificateForSite(site.id);
      return {
        id: site.id,
        name: site.name,
        domain: site.domain,
        providerCredentialId: site.provider_credential_id,
        providerStatus: site.provider_status ?? null,
        providerHttps: site.provider_https ?? null,
        providerCertExpiresAt: site.provider_cert_expires_at ?? null,
        providerCertName: site.provider_cert_name ?? null,
        providerCertDeployAt: site.provider_cert_deploy_at ?? null,
        certificateSource: site.certificate_source,
        autoRenew: Boolean(site.auto_renew),
        renewDaysBefore: site.renew_days_before,
        status: site.status,
        latestCertificate: cert
          ? {
              id: cert.id,
              expiresAt: cert.expires_at,
              issuedAt: cert.issued_at,
              status: cert.status
            }
          : null
      };
    }));
  });

  app.post("/", { preHandler: [app.authenticate] }, async (request: any, reply) => {
    const body = SiteSchema.parse(request.body);
    const created = await createSite({
      userId: request.user.sub,
      name: body.name,
      domain: body.domain,
      providerCredentialId: body.providerCredentialId ?? null,
      certificateSource: body.certificateSource,
      autoRenew: body.autoRenew,
      renewDaysBefore: body.renewDaysBefore
    });
    reply.code(201).send(created);
  });

  app.get("/:id", { preHandler: [app.authenticate] }, async (request: any, reply) => {
    const params = z.object({ id: z.string().min(1) }).parse(request.params);
    const site = await getSite(request.user.sub, params.id);
    if (!site) {
      return reply.code(404).send({ message: "Site not found" });
    }
    const cert = await getLatestCertificateForSite(site.id);
    return {
      id: site.id,
      name: site.name,
      domain: site.domain,
      providerCredentialId: site.provider_credential_id,
      providerStatus: site.provider_status ?? null,
      providerHttps: site.provider_https ?? null,
      providerCertExpiresAt: site.provider_cert_expires_at ?? null,
      providerCertName: site.provider_cert_name ?? null,
      providerCertDeployAt: site.provider_cert_deploy_at ?? null,
      certificateSource: site.certificate_source,
      autoRenew: Boolean(site.auto_renew),
      renewDaysBefore: site.renew_days_before,
      status: site.status,
      latestCertificate: cert
        ? {
            id: cert.id,
            expiresAt: cert.expires_at,
            issuedAt: cert.issued_at,
            status: cert.status
          }
        : null
    };
  });

  app.patch("/:id", { preHandler: [app.authenticate] }, async (request: any, reply) => {
    const params = z.object({ id: z.string().min(1) }).parse(request.params);
    const body = SiteSchema.parse(request.body);
    await updateSite({
      userId: request.user.sub,
      id: params.id,
      name: body.name,
      domain: body.domain,
      providerCredentialId: body.providerCredentialId ?? null,
      certificateSource: body.certificateSource,
      autoRenew: body.autoRenew,
      renewDaysBefore: body.renewDaysBefore,
      status: body.status
    });
    reply.code(204).send();
  });

  app.delete("/:id", { preHandler: [app.authenticate] }, async (request: any, reply) => {
    const params = z.object({ id: z.string().min(1) }).parse(request.params);
    await deleteSite(request.user.sub, params.id);
    reply.code(204).send();
  });
};

export default siteRoutes;
