import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { buildApp } from "../app.js";

let app: Awaited<ReturnType<typeof buildApp>>;

beforeAll(async () => {
  app = await buildApp();
});

afterAll(async () => {
  await app.close();
});

describe("auth flow", () => {
  it("registers, logs in, refreshes, logs out", async () => {
    const register = await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: {
        email: "test@example.com",
        name: "Test",
        password: "password123"
      }
    });

    expect(register.statusCode).toBe(201);
    const registerBody = register.json();
    expect(registerBody.accessToken).toBeDefined();
    expect(registerBody.refreshToken).toBeDefined();

    const login = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: {
        email: "test@example.com",
        password: "password123"
      }
    });

    expect(login.statusCode).toBe(200);
    const loginBody = login.json();
    expect(loginBody.accessToken).toBeDefined();
    expect(loginBody.refreshToken).toBeDefined();

    const refresh = await app.inject({
      method: "POST",
      url: "/auth/refresh",
      payload: {
        refreshToken: loginBody.refreshToken
      }
    });
    expect(refresh.statusCode).toBe(200);
    expect(refresh.json().accessToken).toBeDefined();

    const logout = await app.inject({
      method: "POST",
      url: "/auth/logout",
      payload: { refreshToken: loginBody.refreshToken }
    });
    expect(logout.statusCode).toBe(204);
  });
});
