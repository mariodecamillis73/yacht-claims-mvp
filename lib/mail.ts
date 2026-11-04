import nodemailer from "nodemailer";
import { HttpError } from "./auth";
export const CLAIM_SENDER = "aftersales@yyachts.de";
export async function sendClaimInvitation(
  email: string,
  title: string,
  url: string,
  expiresAt: Date,
) {
  if (!process.env.SMTP_HOST)
    throw new HttpError(503, "Email delivery is not configured");
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_PORT === "465",
    requireTLS:
      process.env.NODE_ENV === "production" &&
      !["localhost", "127.0.0.1", "::1"].includes(process.env.SMTP_HOST) &&
      process.env.SMTP_PORT !== "465",
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
      : undefined,
  });
  try {
    const result = await transport.sendMail({
      from: { name: "YYachts After Sales · YY ASM", address: CLAIM_SENDER },
      replyTo: CLAIM_SENDER,
      to: email,
      subject: "YY ASM — claim invitation",
      text: `YYachts After Sales has shared a claim with you.\n\nClaim: ${title}\n\nOpen this claim directly, without a password or verification code:\n${url}\n\nThis personal link gives access only to the shared claim and its shared comments, photos and documents.\nValid until ${expiresAt.toISOString().slice(0, 10)} (UTC), unless revoked earlier.\n\nYYachts After Sales\n${CLAIM_SENDER}`,
    });
    if (!result.accepted?.length) throw new Error("Recipient not accepted");
  } catch {
    throw new HttpError(503, "Unable to send invitation email");
  } finally {
    transport.close();
  }
}
