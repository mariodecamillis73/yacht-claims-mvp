# YY ASM staging deployment

## Prepared, not deployed

The `feature/staging-ready` branch contains the tested Node application and a Render Blueprint (`render.yaml`). No Render service, disk, account, charge or deployed URL has been created from this workspace. The connection to the user's Render account is required to continue.

This configuration uses a paid `starter` service in Frankfurt, one instance, and a 1 GB persistent disk mounted at `/var/data`. Review the actual account price before creating the service. Free/ephemeral storage is unsuitable for this SQLite application. Automatic deployment is disabled; publishing remains a deliberate action.

## Deployment procedure

1. Connect Render and authorize access to `mariodecamillis73/yacht-claims-mvp`.
2. Select the Blueprint from `feature/staging-ready`. Verify service plan, region, disk and the price presented by Render before resource creation.
3. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` through Render's secret/environment controls. Use at least 16 characters and a password unique to this staging environment. Do not paste passwords into issues, PRs or source code.
4. Render generates `JWT_SECRET`. `DATABASE_URL` points to the persistent disk. Build installs locked dependencies, generates Prisma, builds Next.js and removes development dependencies. The Prisma migration CLI remains a runtime dependency.
5. On startup `start:hosted` checks configuration, creates an empty SQLite file only when needed, applies migrations and provisions the first director if none exists. It never resets an existing director's password. `APP_URL` is derived from Render's external HTTPS URL for origin validation.
6. Wait for the `/api/health` check to pass, open the deployed HTTPS URL and sign in. Remove `ADMIN_EMAIL` and `ADMIN_PASSWORD` from the service after initial provisioning; they are no longer needed on restart.
7. Add real SMTP settings in runtime secrets (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM`) before testing guest verification. The application refuses verification when email cannot be delivered. Test with a mailbox you control before inviting any real supplier. Invitation links are copied for manual delivery; the application sends verification codes only.

No original Mac database, real yacht records, uploaded files or existing credentials are imported automatically. Create clearly fictional test yachts/claims using the protected API until the creation UI is finished. The staging database starts empty; the Work Hub reports this honestly instead of substituting demo data.

## Verification performed locally

- Next.js 16.4.3, React 19.3.1, Nodemailer 10.3.1 and Zod 4.6.7 installed and locked.
- Production build/type check passed after migrating route params to the async API and client pages to `useParams`.
- `npm audit --omit=dev` reports zero known runtime dependency vulnerabilities at this checkpoint. Full audit still reports moderate development-tool findings from minimatch in ESLint dependencies; do not represent the entire dependency tree as vulnerability-free. Recheck before publishing.
- Access suite passed on the upgraded runtime, including password login, grants, SMTP verification using a local sink, internal visibility, file authorization and revocation.
- Hosted-start suite passed: fail-closed secret checks, migrations on a fresh volume, first-director provisioning, database persistence across restarts, unchanged existing password and canonical-origin validation.
- Real Render deployment, real mailbox delivery, browser/mobile QA and provider-side Blueprint validation are pending. GitHub CI is configured but its remote result must be checked after the PR is opened.

## Backup and rollback

For this single-instance SQLite staging service, schedule a consistent database backup and verify restore before admitting real records. Render disk snapshots are a supplemental recovery mechanism, not a substitute for a tested application backup. Stop writes or use SQLite's backup API; do not copy a live database file blindly. Database and attachments live in the same file.

Before schema upgrades, preserve a database backup. Rolling application code back does not automatically reverse a database migration. Restore a matching database snapshot if necessary. Never run reset/db-push commands against the hosted disk. An existing unversioned Mac database requires the separately documented baseline procedure and must not be substituted into staging silently.

## Remaining release work

Browser/mobile QA; final claim creation/status UI; account activation/password reset; full mutation auditing; upload scanning/quotas; tested backups; monitoring; SMTP deliverability. The staging release is for controlled evaluation, not final customer operations.

## Provider references

- https://render.com/docs/deploy-nextjs-app
- https://render.com/docs/disks
- https://render.com/docs/blueprint-spec
- https://nextjs.org/blog/nextjs-security-update-october-14-2026
