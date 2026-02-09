import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { listCertificatesForUser, issueCertificateForSite, enqueueCertificateIssue } from "../services/certificateService";
import { getSite } from "../services/siteService";

const certificateRoutes: FastifyPluginAsync = async (app) => {
  app.get("/", { preHandler: [app.authenticate] }, async (request: any) => {
    const certs = await listCertificatesForUser(request.user.sub);
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
    const query = z.object({ mode: z.string().optional() }).parse(request.query ?? {});
    const site = await getSite(request.user.sub, body.siteId);
    if (!site) {
      return reply.code(404).send({ message: "Site not found" });
    }
    if (query.mode === "sync") {
      const cert = await issueCertificateForSite(site);
      reply.code(201).send({
        id: cert.id,
        siteId: cert.site_id,
        commonName: cert.common_name,
        status: cert.status,
        issuedAt: cert.issued_at,
        expiresAt: cert.expires_at
      });
      return;
    }

    const job = await enqueueCertificateIssue(site);
    reply.code(202).send({ jobId: job.jobId });
  });
};

export default certificateRoutes;
