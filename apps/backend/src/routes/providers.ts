import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { ProviderTypeSchema, TencentConfigSchema, QiniuConfigSchema } from "../providers/definitions";
import {
  createProviderCredential,
  deleteProviderCredential,
  listProviderCredentials,
  updateProviderCredential
} from "../services/providerService";

const providerRoutes: FastifyPluginAsync = async (app) => {
  app.get("/catalog", async () => {
    return {
      providers: [
        {
          type: "tencent",
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

    if (body.providerType === "tencent") {
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

    if (body.providerType === "tencent") {
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
};

export default providerRoutes;
