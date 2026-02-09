import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { getResolvedUserSettings, upsertUserSettings } from "../services/userSettingsService";
import { refreshUserSchedule } from "../services/scheduler";

const userSettingsRoutes: FastifyPluginAsync = async (app) => {
  app.get("/", { preHandler: [app.authenticate] }, async (request: any) => {
    const settings = getResolvedUserSettings(request.user.sub);
    return {
      renewalHour: settings.renewalHour,
      renewalMinute: settings.renewalMinute,
      renewalThresholdDays: settings.renewalThresholdDays,
      acmeAccountEmail: settings.acme.accountEmail,
      acmeDirectoryUrl: settings.acme.directoryUrl,
      acmeSkipLocalVerify: settings.acme.skipLocalVerify,
      acmeDnsWaitSeconds: settings.acme.dnsWaitSeconds,
      acmeDnsTtl: settings.acme.dnsTtl
    };
  });

  app.put("/", { preHandler: [app.authenticate] }, async (request: any, reply) => {
    const body = z
      .object({
        renewalHour: z.coerce.number().int().min(0).max(23),
        renewalMinute: z.coerce.number().int().min(0).max(59),
        renewalThresholdDays: z.coerce.number().int().min(1).max(90),
        acmeAccountEmail: z.string().email().nullable().optional(),
        acmeDirectoryUrl: z.string().url().nullable().optional(),
        acmeSkipLocalVerify: z.coerce.boolean(),
        acmeDnsWaitSeconds: z.coerce.number().int().min(0).max(600),
        acmeDnsTtl: z.coerce.number().int().min(60).max(86400)
      })
      .parse(request.body);

    const accountEmail = body.acmeAccountEmail?.trim() || null;
    const directoryUrl = body.acmeDirectoryUrl?.trim() || null;

    upsertUserSettings({
      userId: request.user.sub,
      renewalHour: body.renewalHour,
      renewalMinute: body.renewalMinute,
      renewalThresholdDays: body.renewalThresholdDays,
      acmeAccountEmail: accountEmail,
      acmeDirectoryUrl: directoryUrl,
      acmeSkipLocalVerify: body.acmeSkipLocalVerify,
      acmeDnsWaitSeconds: body.acmeDnsWaitSeconds,
      acmeDnsTtl: body.acmeDnsTtl
    });

    refreshUserSchedule(request.user.sub);
    reply.code(204).send();
  });
};

export default userSettingsRoutes;
