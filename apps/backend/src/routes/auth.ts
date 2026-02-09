import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { createUser, findUserByEmail, findUserById } from "../services/userService";
import { hashPassword, verifyPassword } from "../utils/password";
import { createRefreshToken, findValidRefreshToken, revokeRefreshToken } from "../services/authService";
import { env } from "../config/env";

const authRoutes: FastifyPluginAsync = async (app) => {
  app.post("/register", async (request, reply) => {
    const body = z
      .object({
        email: z.string().email(),
        name: z.string().min(1),
        password: z.string().min(8)
      })
      .parse(request.body);

    const existing = findUserByEmail(body.email);
    if (existing) {
      return reply.code(400).send({ message: "Email already exists" });
    }

    const passwordHash = await hashPassword(body.password);
    const user = createUser({
      email: body.email,
      name: body.name,
      passwordHash
    });

    const { token: refreshToken } = createRefreshToken(user.id, env.REFRESH_TOKEN_TTL_DAYS);
    const accessToken = await reply.jwtSign({ sub: user.id, email: user.email });

    reply.code(201);
    return {
      user: { id: user.id, email: user.email, name: user.name },
      accessToken,
      refreshToken
    };
  });

  app.post("/login", async (request, reply) => {
    const body = z
      .object({ email: z.string().email(), password: z.string().min(8) })
      .parse(request.body);

    const user = findUserByEmail(body.email);
    if (!user) {
      return reply.code(401).send({ message: "Invalid credentials" });
    }
    const valid = await verifyPassword(body.password, user.password_hash);
    if (!valid) {
      return reply.code(401).send({ message: "Invalid credentials" });
    }

    const { token: refreshToken } = createRefreshToken(user.id, env.REFRESH_TOKEN_TTL_DAYS);
    const accessToken = await reply.jwtSign({ sub: user.id, email: user.email });
    return {
      user: { id: user.id, email: user.email, name: user.name },
      accessToken,
      refreshToken
    };
  });

  app.post("/refresh", async (request, reply) => {
    const body = z.object({ refreshToken: z.string().min(10) }).parse(request.body);
    const record = findValidRefreshToken(body.refreshToken);
    if (!record) {
      return reply.code(401).send({ message: "Invalid refresh token" });
    }

    const user = findUserById(record.user_id);
    if (!user) {
      return reply.code(401).send({ message: "Invalid refresh token" });
    }

    const accessToken = await reply.jwtSign({ sub: user.id, email: user.email });
    return { accessToken };
  });

  app.post("/logout", async (request, reply) => {
    const body = z.object({ refreshToken: z.string().min(10) }).parse(request.body);
    revokeRefreshToken(body.refreshToken);
    return reply.code(204).send();
  });

  app.get("/me", { preHandler: [app.authenticate] }, async (request: any) => {
    return { userId: request.user.sub, email: request.user.email };
  });
};

export default authRoutes;
