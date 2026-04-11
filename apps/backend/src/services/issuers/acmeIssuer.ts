import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import * as acme from "acme-client";
import { env } from "../../config/env.js";
import { setChallenge, removeChallenge } from "./challengeStore.js";
import { createTxtRecord, deleteRecord, TencentDnsConfig } from "../../providers/tencentDns.js";
import { setDnsRecord, getDnsRecord, removeDnsRecord } from "./dnsRecordStore.js";
import { IssuedCertificate } from "./selfSignedIssuer.js";
import { getErrorMessage } from "../../utils/errors.js";

const accountStorePath = path.resolve(process.cwd(), "data", "acme-account.json");

type AccountStore = {
  accountKey: string;
};

async function loadAccountKey(): Promise<string> {
  if (fs.existsSync(accountStorePath)) {
    const raw = fs.readFileSync(accountStorePath, "utf8");
    const data = JSON.parse(raw) as AccountStore;
    return data.accountKey;
  }
  const dir = path.dirname(accountStorePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const accountKey = await acme.forge.createPrivateKey();
  const accountKeyPem = typeof accountKey === "string" ? accountKey : accountKey.toString();
  const data: AccountStore = { accountKey: accountKeyPem };
  fs.writeFileSync(accountStorePath, JSON.stringify(data, null, 2));
  return accountKeyPem;
}

function parseExpiresAt(certPem: string): string {
  const x509 = new crypto.X509Certificate(certPem);
  return new Date(x509.validTo).toISOString();
}

type AcmeOptions = {
  challengeType?: "http-01" | "dns-01";
  dnsConfig?: TencentDnsConfig;
  onMessage?: (message: string) => void;
  config?: {
    accountEmail?: string | null;
    directoryUrl?: string;
    skipLocalVerify?: boolean;
    dnsWaitSeconds?: number;
    dnsTtl?: number;
  };
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function normalizeAcmeError(
  error: unknown,
  params: { challengeType: "http-01" | "dns-01"; domain: string }
) {
  const message = getErrorMessage(error);

  if (message.includes("Cannot read properties of undefined (reading 'config')")) {
    if (params.challengeType === "http-01") {
      return new Error(
        `HTTP-01 校验失败：${params.domain} 当前无法稳定从公网访问到本服务，默认建议改用 DNS-01，或检查 80 端口、回源和挑战路径配置。`
      );
    }
    return new Error(
      `DNS-01 校验失败：ACME 请求过程中出现网络异常。请检查 DNS 凭据、域名解析托管与外网连通性后重试。`
    );
  }

  if (message.includes("status code 404")) {
    return new Error(
      `HTTP-01 校验失败：请确保 ${params.domain} 的 80 端口能访问到本服务的 /.well-known/acme-challenge 路径`
    );
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error(message);
}

export async function issueAcme(
  domain: string,
  sans: string[],
  options: AcmeOptions = {}
): Promise<IssuedCertificate> {
  const accountEmail = options.config?.accountEmail ?? env.ACME_ACCOUNT_EMAIL ?? null;
  const directoryUrl = options.config?.directoryUrl ?? env.ACME_DIRECTORY_URL;
  const skipLocalVerify = options.config?.skipLocalVerify ?? env.ACME_SKIP_LOCAL_VERIFY;
  const dnsWaitSeconds = options.config?.dnsWaitSeconds ?? env.ACME_DNS_WAIT_SECONDS;
  const dnsTtl = options.config?.dnsTtl ?? env.ACME_DNS_TTL;

  if (!accountEmail) {
    throw new Error("ACME_ACCOUNT_EMAIL is required for Let's Encrypt issuance");
  }
  if (accountEmail.toLowerCase().endsWith("@example.com")) {
    throw new Error("ACME_ACCOUNT_EMAIL must be a real email (example.com is not allowed)");
  }
  const challengeType = options.challengeType ?? "http-01";
  const dnsConfig = options.dnsConfig;

  try {
    const accountKey = await loadAccountKey();
    const client = new acme.Client({
      directoryUrl,
      accountKey
    });

    await client.createAccount({
      termsOfServiceAgreed: true,
      contact: [`mailto:${accountEmail}`]
    });

    const [key, csr] = await acme.forge.createCsr({
      commonName: domain,
      altNames: [domain, ...sans]
    });

    const cert = await client.auto({
      csr,
      email: accountEmail,
      termsOfServiceAgreed: true,
      challengePriority: [challengeType],
      skipChallengeVerification: skipLocalVerify,
      challengeCreateFn: async (_authz, challenge, keyAuthorization) => {
        if (challengeType === "http-01") {
          options.onMessage?.("写入 HTTP-01 校验文件");
          setChallenge(challenge.token, keyAuthorization);
          return;
        }
        if (!dnsConfig) {
          throw new Error("DNS 凭据未配置");
        }
        options.onMessage?.("写入 DNS TXT 记录");
        const record = await createTxtRecord({
          domain: _authz.identifier.value,
          value: keyAuthorization,
          config: dnsConfig,
          ttl: dnsTtl
        });
        setDnsRecord(challenge.token, record);
        const waitSeconds = dnsWaitSeconds;
        if (waitSeconds > 0) {
          options.onMessage?.(`等待 DNS 解析生效（约 ${waitSeconds}s）`);
          await sleep(waitSeconds * 1000);
        }
      },
      challengeRemoveFn: async (_authz, challenge, _keyAuthorization) => {
        if (challengeType === "http-01") {
          removeChallenge(challenge.token);
          return;
        }
        if (!dnsConfig) return;
        const record = getDnsRecord(challenge.token);
        if (record) {
          await deleteRecord({ record, config: dnsConfig });
          removeDnsRecord(challenge.token);
        }
      }
    });

    const issuedAt = new Date().toISOString();
    const expiresAt = parseExpiresAt(cert);
    return {
      certPem: cert,
      keyPem: typeof key === "string" ? key : key.toString(),
      chainPem: cert,
      commonName: domain,
      sans,
      issuedAt,
      expiresAt
    };
  } catch (error: unknown) {
    throw normalizeAcmeError(error, { challengeType, domain });
  }
}
