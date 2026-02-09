import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import sensible from "@fastify/sensible";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { env } from "./config/env.js";
import { migrate } from "./db/migrate.js";
import { getChallenge } from "./services/issuers/challengeStore.js";
import authRoutes from "./routes/auth.js";
import providerRoutes from "./routes/providers.js";
import siteRoutes from "./routes/sites.js";
import domainSettingsRoutes from "./routes/domainSettings.js";
import userSettingsRoutes from "./routes/userSettings.js";
import certificateRoutes from "./routes/certificates.js";
import deploymentRoutes from "./routes/deployments.js";
import jobsRoutes from "./routes/jobs.js";

export async function buildApp() {
  await migrate();
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: true });
  await app.register(sensible);
  await app.register(jwt, {
    secret: env.JWT_SECRET,
    sign: { expiresIn: `${env.ACCESS_TOKEN_TTL_MINUTES}m` }
  });

  app.decorate(
    "authenticate",
    async (request: any, reply: any) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.code(401).send({ message: "Unauthorized" });
      }
    }
  );

  if (env.NODE_ENV !== "production") {
    await app.register(swagger, {
      openapi: {
        info: {
          title: "Auto CDN SSL API",
          version: "0.1.0"
        }
      }
    });
    await app.register(swaggerUi, { routePrefix: "/docs" });
  }

  app.get("/health", async () => ({ status: "ok" }));

  app.get("/.well-known/acme-challenge/:token", async (request, reply) => {
    const token = (request.params as { token: string }).token;
    const value = getChallenge(token);
    if (!value) {
      reply.code(404).send({ message: "challenge not found" });
      return;
    }
    reply.header("content-type", "text/plain").send(value);
  });

  await app.register(authRoutes, { prefix: "/auth" });
  await app.register(providerRoutes, { prefix: "/providers" });
  await app.register(siteRoutes, { prefix: "/sites" });
  await app.register(userSettingsRoutes, { prefix: "/user-settings" });
  await app.register(domainSettingsRoutes, { prefix: "/domain-settings" });
  await app.register(certificateRoutes, { prefix: "/certificates" });
  await app.register(deploymentRoutes, { prefix: "/deployments" });
  await app.register(jobsRoutes, { prefix: "/jobs" });

  return app;
}
