# YYachts After Sales claims

Next.js application with persistent claims and server-enforced access controls.

## Setup

Use Node.js 22 or 24 and a persistent SQLite database (single application instance).

1. `npm ci`
2. Copy `.env.example` to `.env` and configure `DATABASE_URL` and a random `JWT_SECRET` of at least 32 characters. Generate the secret with `openssl rand -hex 48`.
3. `npm run prisma:generate`
4. For a new empty database: `npm run db:deploy`.
5. Create the first director using `ADMIN_EMAIL` and `ADMIN_PASSWORD` environment variables, then `npm run admin:create`. Password minimum: 16 characters. Never put credentials in source control. No default/demo account is enabled.
6. `npm run dev` for local development. For deployment: `npm run build` then `npm start`, behind HTTPS.

New accounts created through `/users` require at least 8 characters, including a letter, a number and a non-whitespace special character; uppercase is optional. Passwords are limited to 72 UTF-8 bytes for bcrypt. Existing credentials are not changed by this rule. The browser and server use the same policy.\n\nThe director creates other accounts and assigns representatives to yachts at `/users`. Supplier/dealer accounts are optional: invited people can use email-code access without an account. Account passwords must be delivered through an appropriate private channel; automated account activation/password reset is not implemented yet.

## Existing Mac database

Back up the SQLite file before modifying it. If it has the **original recovery schema** with no migration history, record the existing baseline using:

```
npx prisma migrate resolve --applied 202611020001_baseline
npm run db:deploy
```

Do not use this procedure on an arbitrary or already-updated database. Inspect its schema first. Original Mac database and uploaded ZIP are kept out of Git. Existing comments/documents default to `internal` during migration. Existing document metadata without binary contents is preserved, but its files must be imported separately before download works.

## Access model

- `director`: all claims; validates/rejects; manages users and claim invitations.
- `staff`: all claims and internal content; cannot validate or issue invitations.
- `representative`: assigned yachts and their claims; shared content only.
- `supplier` / `dealer`: only unexpired, unrevoked claim grants issued to their account email; shared content only.
- Invited guest: only the invited claim after email verification; no yacht listing or internal API access.

Sessions use signed HttpOnly cookies (Secure in production). The server reloads the account and grant on every protected request. Deactivation, membership removal and grant revocation take effect without waiting for session expiry. Old demo IDs are not valid invitation tokens. Direct links do not bypass API permissions.

## Supplier/dealer sharing

Open a claim as director. Create an invitation for a specific email and role, with an expiry of 1–90 days. Copy the generated link and send it to that address. Only the token hash is stored; the original link is displayed once. Revoke or create a new invitation if needed.

The recipient requests a six-digit code delivered through configured SMTP. Codes expire after ten minutes, can be requested once per minute, allow at most five attempts and can be consumed once. After verification the recipient can read shared claim details, comments, photos/documents, add comments and upload files up to 5 MB. Documents are authorized on every download, not exposed from public storage. Only validated PNG/JPEG headers are rendered inline; other formats download as attachments. Upload malware scanning/storage quotas are not implemented yet.

Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM` before trying guest access. Without SMTP, verification fails closed; no code is printed or returned. Real email delivery has not been tested in this workspace.

## Validation

```
npm run build
npm run test:access
```

The access test creates a disposable database through migrations and a local SMTP sink. It tests authentication, user provisioning and yacht assignment, role and claim isolation, internal content filtering, email verification, upload/download authorization, revocation and expired grants. It sends no external emails and does not touch the real database. Optional browser checks can be enabled with `YY_UI_TEST=1` when Playwright and Chromium are installed; `YY_QA_DIR` optionally selects the screenshot directory. Browser QA has not yet passed in this workspace. Ports 3525 and 3526 must be free.

## Before production deployment

This is a staging-preparation milestone, not the final release. See [STAGING_DEPLOYMENT.md](STAGING_DEPLOYMENT.md) for the Render configuration and publication prerequisites. Remaining work includes browser/mobile verification, account activation/password reset, full claim creation/status UI, audit coverage for all mutations, malware scanning/quotas, automated backups/restore tests, operational monitoring and an agreed hosting/domain/SMTP configuration. Use one instance with a persistent disk for SQLite; multiple instances require a shared database and storage design. Configure request-size limits at the reverse proxy. Do not deploy the development database or test credentials.
