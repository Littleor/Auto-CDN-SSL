import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { getJobForUser } from "../services/jobService.js";

const jobsRoutes: FastifyPluginAsync = async (app) => {
  app.get("/:id", { preHandler: [app.authenticate] }, async (request: any, reply) => {
    const params = z.object({ id: z.string().min(1) }).parse(request.params);
    const job = await getJobForUser(request.user.sub, params.id);
    if (!job) {
      return reply.code(404).send({ message: "Job not found" });
    }
    return {
      id: job.id,
      siteId: job.site_id,
      type: job.type,
      status: job.status,
      message: job.message,
      startedAt: job.started_at,
      finishedAt: job.finished_at
    };
  });
};

export default jobsRoutes;
