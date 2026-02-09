import selfsigned from "selfsigned";

export type IssuedCertificate = {
  certPem: string;
  keyPem: string;
  chainPem: string;
  commonName: string;
  sans: string[];
  issuedAt: string;
  expiresAt: string;
};

export function issueSelfSigned(domain: string, sans: string[] = []): IssuedCertificate {
  const attrs = [{ name: "commonName", value: domain }];
  const altNames = [domain, ...sans].map((d) => ({ type: 2, value: d }));
  const pems = selfsigned.generate(attrs, {
    days: 90,
    keySize: 2048,
    extensions: [{ name: "subjectAltName", altNames }]
  });
  const issuedAt = new Date();
  const expiresAt = new Date(issuedAt.getTime() + 90 * 24 * 60 * 60 * 1000);
  return {
    certPem: pems.cert,
    keyPem: pems.private,
    chainPem: pems.cert,
    commonName: domain,
    sans,
    issuedAt: issuedAt.toISOString(),
    expiresAt: expiresAt.toISOString()
  };
}
