import nodemailer from "nodemailer";
import { HttpError } from "./auth";
export const CLAIM_SENDER = "aftersales@yyachts.de";
export async function sendClaimInvitation(
  email: string,
  title: string,
  url: string,
  expiresAt: Date,
) {
  const subject = "YY ASM — claim invitation";
  const text = `YYachts After Sales has shared a claim with you.\n\nClaim: ${title}\n\nOpen this claim directly, without a password or verification code:\n${url}\n\nThis personal link gives access only to the shared claim and its shared comments, photos and documents.\nValid until ${expiresAt.toISOString().slice(0, 10)} (UTC), unless revoked earlier.\n\nYYachts After Sales\n${CLAIM_SENDER}`;
  if (process.env.MAIL_PROVIDER === "microsoft-graph") {
    await sendWithMicrosoftGraph(email, subject, text);
    return;
  }
  if (!process.env.SMTP_HOST)
    throw new HttpError(503, "Email delivery is not configured");
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    connectionTimeout: 15_000,
    greetingTimeout: 15_000,
    socketTimeout: 30_000,
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
      subject,
      text,
    });
    if (!result.accepted?.length) throw new Error("Recipient not accepted");
  } catch {
    throw new HttpError(503, "Unable to send invitation email");
  } finally {
    transport.close();
  }
}

async function sendWithMicrosoftGraph(email: string, subject: string, text: string) {
  const tenantId = process.env.GRAPH_TENANT_ID;
  const clientId = process.env.GRAPH_CLIENT_ID;
  const clientSecret = process.env.GRAPH_CLIENT_SECRET;
  const guid = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
  if (!tenantId || !guid.test(tenantId) || !clientId || !guid.test(clientId) || !clientSecret)
    throw new HttpError(503, "Email delivery is not configured");

  try {
    const tokenResponse = await fetch(
      `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
      {
        method: "POST",
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          scope: "https://graph.microsoft.com/.default",
          grant_type: "client_credentials",
        }),
        redirect: "error",
        signal: AbortSignal.timeout(10_000),
      },
    );
    if (!tokenResponse.ok) throw new Error("Token request failed");
    const { access_token: token } = await tokenResponse.json();
    if (typeof token !== "string" || !token) throw new Error("Token missing");
    const sendResponse = await fetch(
      `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(CLAIM_SENDER)}/sendMail`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: {
            subject,
            body: { contentType: "Text", content: text },
            toRecipients: [{ emailAddress: { address: email } }],
            replyTo: [{ emailAddress: { address: CLAIM_SENDER } }],
          },
        }),
        redirect: "error",
        signal: AbortSignal.timeout(15_000),
      },
    );
    if (sendResponse.status !== 202) throw new Error("Microsoft did not accept the email");
  } catch {
    throw new HttpError(503, "Unable to send invitation email");
  }
}
