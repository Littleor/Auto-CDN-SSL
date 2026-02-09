import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { buildApp } from "../app.js";
import { vi } from "vitest";

vi.mock("../providers/tencent", () => ({
  deployToTencentCdn: vi.fn().mockResolvedValue(undefined)
}));
vi.mock("../providers/qiniu", () => ({
  deployToQiniuCdn: vi.fn().mockResolvedValue(undefined)
}));

let app: Awaited<ReturnType<typeof buildApp>>;

beforeAll(async () => {
  app = await buildApp();
});

afterAll(async () => {
  await app.close();
});

async function registerAndLogin() {
  const register = await app.inject({
    method: "POST",
    url: "/auth/register",
    payload: {
      email: "dev@example.com",
      name: "Dev",
      password: "password123"
    }
  });
  expect(register.statusCode).toBe(201);
  const body = register.json();
  expect(body.verificationToken).toBeTruthy();

  const verify = await app.inject({
    method: "GET",
    url: `/auth/verify?token=${body.verificationToken}`
  });
  expect(verify.statusCode).toBe(200);

  const login = await app.inject({
    method: "POST",
    url: "/auth/login",
    payload: {
      email: "dev@example.com",
      password: "password123"
    }
  });
  expect(login.statusCode).toBe(200);
  const loginBody = login.json();
  return { accessToken: loginBody.accessToken };
}

describe("site + cert + deploy", () => {
  it("creates site, issues cert, deploys", async () => {
    const { accessToken } = await registerAndLogin();

    const provider = await app.inject({
      method: "POST",
      url: "/providers",
      headers: { authorization: `Bearer ${accessToken}` },
      payload: {
        providerType: "tencent",
        name: "TencentProd",
        config: {
          secretId: "secret-id-123456",
          secretKey: "secret-key-123456"
        }
      }
    });
    expect(provider.statusCode).toBe(201);
    const providerBody = provider.json();

    const site = await app.inject({
      method: "POST",
      url: "/sites",
      headers: { authorization: `Bearer ${accessToken}` },
      payload: {
        name: "Main",
        domain: "example.com",
        providerCredentialId: providerBody.id,
        certificateSource: "self_signed",
        autoRenew: true,
        renewDaysBefore: 30
      }
    });
    expect(site.statusCode).toBe(201);
    const siteBody = site.json();

    const issue = await app.inject({
      method: "POST",
      url: "/certificates/issue?mode=sync",
      headers: { authorization: `Bearer ${accessToken}` },
      payload: { siteId: siteBody.id }
    });
    expect(issue.statusCode).toBe(201);
    const certBody = issue.json();

    const deploy = await app.inject({
      method: "POST",
      url: "/deployments",
      headers: { authorization: `Bearer ${accessToken}` },
      payload: { siteId: siteBody.id, certificateId: certBody.id }
    });
    expect(deploy.statusCode).toBe(201);
    expect(deploy.json().status).toBe("success");
  });
});
