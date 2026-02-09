import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { getResolvedUserSettings, upsertUserSettings } from "../services/userSettingsService";
import { refreshUserSchedule } from "../services/scheduler";

const userSettingsRoutes: FastifyPluginAsync = async (app) => {
  app.get("/", { preHandler: [app.authenticate] }, async (request: any) => {
    const settings = await getResolvedUserSettings(request.user.sub);
    return {
      renewalHour: settings.renewalHour,
      renewalMinute: settings.renewalMinute,
      renewalThresholdDays: settings.renewalThresholdDays,
      autoDeploy: settings.autoDeploy
    };
  });

  app.put("/", { preHandler: [app.authenticate] }, async (request: any, reply) => {
    const body = z
      .object({
        renewalHour: z.coerce.number().int().min(0).max(23),
        renewalMinute: z.coerce.number().int().min(0).max(59),
        renewalThresholdDays: z.coerce.number().int().min(1).max(90),
        autoDeploy: z.coerce.boolean().optional().default(true)
      })
      .parse(request.body);

    await upsertUserSettings({
      userId: request.user.sub,
      renewalHour: body.renewalHour,
      renewalMinute: body.renewalMinute,
      renewalThresholdDays: body.renewalThresholdDays,
      autoDeploy: body.autoDeploy ?? true
    });

    await refreshUserSchedule(request.user.sub);
    reply.code(204).send();
  });
};

export default userSettingsRoutes;
