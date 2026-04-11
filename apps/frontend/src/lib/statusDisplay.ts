export function getPlatformLabel(providerType?: string | null) {
  if (!providerType) return "-";

  const normalized = providerType.toLowerCase();
  if (normalized === "tencent") return "腾讯云 CDN";
  if (normalized === "qiniu") return "七牛云 CDN";
  if (normalized === "tencent_dns") return "腾讯云 DNS";
  if (normalized === "http-01") return "HTTP-01 验证";
  if (normalized === "dns-01") return "DNS-01 验证";
  if (normalized === "self_signed") return "自签证书";
  if (normalized === "letsencrypt") return "Let's Encrypt";
  return providerType;
}

export function getCertificateStatusLabel(status?: string | null) {
  if (!status) return "-";

  const normalized = status.toLowerCase();
  if (normalized === "issued") return "已签发";
  if (normalized === "success") return "成功";
  if (normalized === "failed") return "失败";
  if (normalized === "running") return "处理中";
  if (normalized === "queued") return "排队中";
  return status;
}

export function getBadgeVariantByStatus(status?: string | null) {
  const normalized = status?.toLowerCase();
  if (normalized === "issued" || normalized === "success" || normalized === "online" || normalized === "normal") {
    return "success" as const;
  }
  if (normalized === "failed" || normalized === "offline" || normalized === "disabled" || normalized === "frozen") {
    return "warning" as const;
  }
  return "muted" as const;
}

export function getCdnStatusLabel(status?: string | null) {
  if (!status) return "-";

  const normalized = status.toLowerCase();
  if (normalized === "online") return "在线";
  if (normalized === "success") return "正常";
  if (normalized === "normal") return "正常";
  if (normalized === "offline") return "离线";
  if (normalized === "disabled") return "已停用";
  if (normalized === "frozen") return "已冻结";
  return status;
}

export function getHttpsStatusLabel(status?: string | null) {
  if (!status) return "-";

  const normalized = status.toLowerCase();
  if (normalized === "on" || normalized === "https") return "已启用";
  if (normalized === "off" || normalized === "http") return "未启用";
  if (normalized === "follow") return "跟随源站";
  if (normalized === "enable" || normalized === "enabled") return "已启用";
  if (normalized === "disable" || normalized === "disabled") return "已停用";
  return status;
}

export function getHistoryCategoryLabel(category: "renew" | "deploy") {
  return category === "renew" ? "续签" : "部署";
}

export function getHistoryTriggerLabel(triggerSource?: string | null) {
  if (!triggerSource) return "-";

  const normalized = triggerSource.toLowerCase();
  if (normalized === "manual_renew") return "手动续签";
  if (normalized === "scheduled_renew") return "自动续签";
  if (normalized === "manual_deploy") return "手动部署";
  if (normalized === "scheduled_deploy") return "自动部署";
  return triggerSource;
}
