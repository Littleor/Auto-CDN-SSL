import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { listDeployments, deployCertificate } from "../services/deploymentService";
import { getSite } from "../services/siteService";
import { getProviderCredential } from "../services/providerService";
import { getLatestCertificateForSite } from "../services/certificateService";
import { getDb } from "../db";

const deploymentRoutes: FastifyPluginAsync = async (app) => {
  app.get("/", { preHandler: [app.authenticate] }, async (request: any) => {
    return listDeployments(request.user.sub);
  });

  app.post("/", { preHandler: [app.authenticate] }, async (request: any, reply) => {
    const body = z
      .object({
        siteId: z.string().min(1),
        certificateId: z.string().min(1).optional()
      })
      .parse(request.body);

    const site = getSite(request.user.sub, body.siteId);
    if (!site) {
      return reply.code(404).send({ message: "Site not found" });
    }
    if (!site.provider_credential_id) {
      return reply.code(400).send({ message: "Provider credential not set" });
    }

    const credential = getProviderCredential(request.user.sub, site.provider_credential_id);
    if (!credential) {
      return reply.code(404).send({ message: "Provider credential not found" });
    }

    let cert = null;
    if (body.certificateId) {
      const db = getDb();
      cert = db
        .prepare("SELECT * FROM certificates WHERE id = ? AND site_id = ?")
        .get(body.certificateId, site.id);
    } else {
      cert = getLatestCertificateForSite(site.id);
    }
    if (!cert) {
      return reply.code(404).send({ message: "Certificate not found" });
    }

    const record = await deployCertificate({
      siteId: site.id,
      domain: site.domain,
      certificate: cert,
      providerCredential: credential
    });
    reply.code(201).send(record);
  });
};

export default deploymentRoutes;
