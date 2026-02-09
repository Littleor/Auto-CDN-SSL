import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import * as acme from "acme-client";
import { env } from "../../config/env";
import { setChallenge, removeChallenge } from "./challengeStore";
import { IssuedCertificate } from "./selfSignedIssuer";

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
  const data: AccountStore = { accountKey };
  fs.writeFileSync(accountStorePath, JSON.stringify(data, null, 2));
  return accountKey;
}

function parseExpiresAt(certPem: string): string {
  const x509 = new crypto.X509Certificate(certPem);
  return new Date(x509.validTo).toISOString();
}

export async function issueAcme(domain: string, sans: string[]): Promise<IssuedCertificate> {
  if (!env.ACME_ACCOUNT_EMAIL) {
    throw new Error("ACME_ACCOUNT_EMAIL is required for Let's Encrypt issuance");
  }
  const accountKey = await loadAccountKey();
  const client = new acme.Client({
    directoryUrl: env.ACME_DIRECTORY_URL,
    accountKey
  });

  await client.createAccount({
    termsOfServiceAgreed: true,
    contact: [`mailto:${env.ACME_ACCOUNT_EMAIL}`]
  });

  const [key, csr] = await acme.forge.createCsr({
    commonName: domain,
    altNames: [domain, ...sans]
  });

  const cert = await client.auto({
    csr,
    email: env.ACME_ACCOUNT_EMAIL,
    termsOfServiceAgreed: true,
    challengePriority: ["http-01"],
    challengeCreateFn: async (_authz, challenge, keyAuthorization) => {
      setChallenge(challenge.token, keyAuthorization);
    },
    challengeRemoveFn: async (_authz, challenge, _keyAuthorization) => {
      removeChallenge(challenge.token);
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
}
