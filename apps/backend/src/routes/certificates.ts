import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { listCertificatesForUser, issueCertificateForSite } from "../services/certificateService";
import { getSite } from "../services/siteService";

const certificateRoutes: FastifyPluginAsync = async (app) => {
  app.get("/", { preHandler: [app.authenticate] }, async (request: any) => {
    const certs = listCertificatesForUser(request.user.sub);
    return certs.map((cert) => ({
      id: cert.id,
      siteId: cert.site_id,
      commonName: cert.common_name,
      sans: JSON.parse(cert.sans),
      status: cert.status,
      issuedAt: cert.issued_at,
      expiresAt: cert.expires_at
    }));
  });

  app.post("/issue", { preHandler: [app.authenticate] }, async (request: any, reply) => {
    const body = z.object({ siteId: z.string().min(1) }).parse(request.body);
    const site = getSite(request.user.sub, body.siteId);
    if (!site) {
      return reply.code(404).send({ message: "Site not found" });
    }
    const cert = await issueCertificateForSite(site);
    reply.code(201).send({
      id: cert.id,
      siteId: cert.site_id,
      commonName: cert.common_name,
      status: cert.status,
      issuedAt: cert.issued_at,
      expiresAt: cert.expires_at
    });
  });
};

export default certificateRoutes;
