import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { ProviderTypeSchema, TencentConfigSchema, QiniuConfigSchema } from "../providers/definitions";
import {
  createProviderCredential,
  deleteProviderCredential,
  getProviderCredential,
  listProviderCredentials,
  updateProviderCredential
} from "../services/providerService";
import { syncProviderSites } from "../services/providerSyncService";

const providerRoutes: FastifyPluginAsync = async (app) => {
  app.get("/catalog", async () => {
    return {
      providers: [
        {
          type: "tencent",
          fields: ["secretId", "secretKey"]
        },
        {
          type: "tencent_dns",
          fields: ["secretId", "secretKey"]
        },
        {
          type: "qiniu",
          fields: ["accessKey", "secretKey"]
        }
      ]
    };
  });

  app.get("/", { preHandler: [app.authenticate] }, async (request: any) => {
    const items = listProviderCredentials(request.user.sub);
    return items.map((item) => ({
      id: item.id,
      providerType: item.provider_type,
      name: item.name,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));
  });

  app.post("/", { preHandler: [app.authenticate] }, async (request: any, reply) => {
    const body = z
      .object({
        providerType: ProviderTypeSchema,
        name: z.string().min(1),
        config: z.record(z.any())
      })
      .parse(request.body);

    if (body.providerType === "tencent" || body.providerType === "tencent_dns") {
      TencentConfigSchema.parse(body.config);
    }
    if (body.providerType === "qiniu") {
      QiniuConfigSchema.parse(body.config);
    }

    const created = createProviderCredential({
      userId: request.user.sub,
      providerType: body.providerType,
      name: body.name,
      config: body.config
    });

    reply.code(201).send(created);
  });

  app.patch("/:id", { preHandler: [app.authenticate] }, async (request: any, reply) => {
    const params = z.object({ id: z.string().min(1) }).parse(request.params);
    const body = z
      .object({
        name: z.string().min(1),
        providerType: ProviderTypeSchema,
        config: z.record(z.any())
      })
      .parse(request.body);

    if (body.providerType === "tencent" || body.providerType === "tencent_dns") {
      TencentConfigSchema.parse(body.config);
    }
    if (body.providerType === "qiniu") {
      QiniuConfigSchema.parse(body.config);
    }

    updateProviderCredential({
      userId: request.user.sub,
      id: params.id,
      name: body.name,
      config: body.config
    });

    reply.code(204).send();
  });

  app.delete("/:id", { preHandler: [app.authenticate] }, async (request: any, reply) => {
    const params = z.object({ id: z.string().min(1) }).parse(request.params);
    deleteProviderCredential(request.user.sub, params.id);
    reply.code(204).send();
  });

  app.post("/:id/sync", { preHandler: [app.authenticate] }, async (request: any, reply) => {
    const params = z.object({ id: z.string().min(1) }).parse(request.params);
    const credential = getProviderCredential(request.user.sub, params.id);
    if (!credential) {
      return reply.code(404).send({ message: "Provider credential not found" });
    }

    if (credential.provider_type === "tencent_dns") {
      return reply.code(400).send({ message: "DNS 凭据不支持站点同步" });
    }
    const result = await syncProviderSites(request.user.sub, credential);
    reply.send(result);
  });
};

export default providerRoutes;
