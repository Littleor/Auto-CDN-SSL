import { z } from "zod";

export const ProviderTypeSchema = z.enum(["tencent", "qiniu", "tencent_dns"]);
export type ProviderType = z.infer<typeof ProviderTypeSchema>;

export const TencentConfigSchema = z.object({
  secretId: z.string().min(8),
  secretKey: z.string().min(8)
});

export const QiniuConfigSchema = z.object({
  accessKey: z.string().min(8),
  secretKey: z.string().min(8)
});

export type TencentConfig = z.infer<typeof TencentConfigSchema>;
export type QiniuConfig = z.infer<typeof QiniuConfigSchema>;

export const ProviderConfigSchema = z.discriminatedUnion("providerType", [
  z.object({ providerType: z.literal("tencent"), config: TencentConfigSchema }),
  z.object({ providerType: z.literal("tencent_dns"), config: TencentConfigSchema }),
  z.object({ providerType: z.literal("qiniu"), config: QiniuConfigSchema })
]);
