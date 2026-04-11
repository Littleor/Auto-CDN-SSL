import { describe, expect, it } from "vitest";
import { normalizeAcmeError } from "../services/issuers/acmeIssuer.js";

describe("normalizeAcmeError", () => {
  it("translates the broken acme-client config error for HTTP-01", () => {
    const error = new TypeError("Cannot read properties of undefined (reading 'config')");

    const normalized = normalizeAcmeError(error, {
      challengeType: "http-01",
      domain: "www.example.com"
    });

    expect(normalized.message).toContain("HTTP-01 校验失败");
    expect(normalized.message).toContain("DNS-01");
  });

  it("translates the broken acme-client config error for DNS-01", () => {
    const error = new TypeError("Cannot read properties of undefined (reading 'config')");

    const normalized = normalizeAcmeError(error, {
      challengeType: "dns-01",
      domain: "www.example.com"
    });

    expect(normalized.message).toContain("DNS-01 校验失败");
  });
});
