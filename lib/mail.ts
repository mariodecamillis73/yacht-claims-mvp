import nodemailer from "nodemailer";
import { HttpError } from "./auth";
export async function sendCode(email: string, code: string) {
  if (!process.env.SMTP_HOST || !process.env.MAIL_FROM)
    throw new HttpError(503, "Email delivery is not configured");
  const t = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_PORT === "465",
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
      : undefined,
  });
  await t.sendMail({
    from: process.env.MAIL_FROM,
    to: email,
    subject: "YYachts claim access verification",
    text: `Your verification code is ${code}. It expires in 10 minutes. If you did not request access, ignore this email.`,
  });
}
