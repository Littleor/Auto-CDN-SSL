import nodemailer from "nodemailer";
import { env } from "../config/env.js";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASSWORD
    }
  });
  return transporter;
}

export async function sendVerificationEmail(params: {
  to: string;
  name: string;
  verifyUrl: string;
}) {
  if (env.NODE_ENV === "test") return;
  const transport = getTransporter();
  const subject = "请验证你的邮箱";
  const text = `Hi ${params.name},\n\n请点击以下链接完成邮箱验证：\n${params.verifyUrl}\n\n如果不是你本人操作，请忽略此邮件。`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <p>Hi ${params.name},</p>
      <p>请点击以下链接完成邮箱验证：</p>
      <p><a href="${params.verifyUrl}">${params.verifyUrl}</a></p>
      <p>如果不是你本人操作，请忽略此邮件。</p>
    </div>
  `;

  await transport.sendMail({
    from: `Auto CDN SSL <${env.FROM_EMAIL}>`,
    to: params.to,
    subject,
    text,
    html
  });
}
