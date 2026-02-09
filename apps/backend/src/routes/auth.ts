import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { createUser, findUserByEmail, findUserById } from "../services/userService";
import { hashPassword, verifyPassword } from "../utils/password";
import { createRefreshToken, findValidRefreshToken, revokeRefreshToken } from "../services/authService";
import { env } from "../config/env";
import { refreshUserSchedule } from "../services/scheduler";
import { createEmailVerification, verifyEmailToken } from "../services/emailVerificationService";
import { sendVerificationEmail } from "../services/mailer";

const authRoutes: FastifyPluginAsync = async (app) => {
  app.post("/register", async (request, reply) => {
    const body = z
      .object({
        email: z.string().email(),
        name: z.string().min(1),
        password: z.string().min(8)
      })
      .parse(request.body);

    const existing = await findUserByEmail(body.email);
    if (existing) {
      return reply.code(400).send({ message: "Email already exists" });
    }

    const passwordHash = await hashPassword(body.password);
    const user = await createUser({
      email: body.email,
      name: body.name,
      passwordHash
    });

    await refreshUserSchedule(user.id);
    const verification = await createEmailVerification(user.id);
    const originHeader = request.headers.origin;
    const origin = typeof originHeader === "string" ? originHeader : "";
    const baseUrl = origin || "http://localhost:5173";
    const verifyUrl = `${baseUrl}/verify?token=${verification.token}`;

    await sendVerificationEmail({
      to: user.email,
      name: user.name,
      verifyUrl
    });

    reply.code(201);
    return env.NODE_ENV === "test"
      ? { message: "验证邮件已发送", verificationToken: verification.token }
      : { message: "验证邮件已发送" };
  });

  app.post("/login", async (request, reply) => {
    const body = z
      .object({ email: z.string().email(), password: z.string().min(8) })
      .parse(request.body);

    const user = await findUserByEmail(body.email);
    if (!user) {
      return reply.code(401).send({ message: "Invalid credentials" });
    }
    if (!user.email_verified) {
      return reply.code(403).send({ message: "请先完成邮箱验证" });
    }
    const valid = await verifyPassword(body.password, user.password_hash);
    if (!valid) {
      return reply.code(401).send({ message: "Invalid credentials" });
    }

    const { token: refreshToken } = await createRefreshToken(user.id, env.REFRESH_TOKEN_TTL_DAYS);
    const accessToken = await reply.jwtSign({ sub: user.id, email: user.email });
    return {
      user: { id: user.id, email: user.email, name: user.name },
      accessToken,
      refreshToken
    };
  });

  app.post("/refresh", async (request, reply) => {
    const body = z.object({ refreshToken: z.string().min(10) }).parse(request.body);
    const record = await findValidRefreshToken(body.refreshToken);
    if (!record) {
      return reply.code(401).send({ message: "Invalid refresh token" });
    }

    const user = await findUserById(record.user_id);
    if (!user) {
      return reply.code(401).send({ message: "Invalid refresh token" });
    }

    const accessToken = await reply.jwtSign({ sub: user.id, email: user.email });
    return { accessToken };
  });

  app.get("/verify", async (request, reply) => {
    const query = z.object({ token: z.string().min(10) }).parse(request.query ?? {});
    const result = await verifyEmailToken(query.token);
    if (result.status === "verified") {
      return { status: "verified", message: "邮箱验证成功" };
    }
    if (result.status === "used") {
      return reply.code(400).send({ message: "验证链接已使用" });
    }
    if (result.status === "expired") {
      return reply.code(400).send({ message: "验证链接已过期" });
    }
    return reply.code(400).send({ message: "验证链接无效" });
  });

  app.post("/logout", async (request, reply) => {
    const body = z.object({ refreshToken: z.string().min(10) }).parse(request.body);
    await revokeRefreshToken(body.refreshToken);
    return reply.code(204).send();
  });

  app.get("/me", { preHandler: [app.authenticate] }, async (request: any) => {
    return { userId: request.user.sub, email: request.user.email };
  });
};

export default authRoutes;
