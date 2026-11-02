## Subsequent owner-requested account update

The initial director account was updated in place using owner-supplied runtime secrets. The initial generated password is no longer the active login credential. No plaintext password is committed to this repository. Credential maintenance is executed once using a durable database marker; subsequent restarts do not replay it. Existing sessions are invalidated when the password hash changes. Deployment `dep-dbk6cqdg1s2s739egin0` (commit `4fa0e19434547eed9b41fa812f69e55ffc8e5fd5`) is verified live. Local build, access tests, rotation/restart tests and GitHub CI passed.

---

# YY ASM staging deployment

## Live staging checkpoint — 2 November 2026

The staging application is deployed and verified live at https://yy-asm-staging.onrender.com/login. Render workspace: `tea-dbk46gou01pc7390gkbg`; service: `srv-dbk68oe7bikc7399cql0`; disk: `dsk-dbk68om7bikc7399crb0`; Blueprint: `exs-dbk4g00473hc73fjo970`. First successful deployment: `dep-dbk68pm7bikc7399ctg0`, commit `f17083fddc79908d79bb9a04fcb40180b8b8480a`. Render reported `live`; both migrations and initial director provisioning succeeded. Login page was visually verified. SMTP is not configured; no guest codes can be delivered yet.

This configuration uses a paid `starter` service in Frankfurt, one instance, and a 1 GB persistent disk mounted at `/var/data`. Review the actual account price before creating the service. Free/ephemeral storage is unsuitable for this SQLite application. Automatic deployment is disabled; publishing remains a deliberate action.

## Deployment procedure

1. Connect Render and authorize access to `mariodecamillis73/yacht-claims-mvp`.
2. Select the Blueprint from `feature/staging-ready`. Verify service plan, region, disk and the price presented by Render before resource creation.
3. Set `ADMIN_EMAIL` through Render's secret/environment controls. Render generates `ADMIN_PASSWORD` automatically using `generateValue: true`. The account owner retrieves this initial password privately from the service's Environment screen and saves it in their password manager. No password was read by the assistant. Do not paste it into issues, chat, PRs or source code.
4. Render generates `JWT_SECRET`. `DATABASE_URL` points to the persistent disk. Build installs locked dependencies, generates Prisma, builds Next.js and removes development dependencies. The Prisma migration CLI remains a runtime dependency.
5. On startup `start:hosted` checks configuration, creates an empty SQLite file only when needed, applies migrations and provisions the first director if none exists. It never resets an existing director's password. `APP_URL` is derived from Render's external HTTPS URL for origin validation.
6. Wait for the `/api/health` check to pass, open the deployed HTTPS URL and sign in. After retrieving and securely saving the initial password, bootstrap variables are no longer needed on restart. Coordinate their removal with the Blueprint: re-generating an environment value does not reset an already-created account password.
7. Add real SMTP settings in runtime secrets (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM`) before testing guest verification. The application refuses verification when email cannot be delivered. Test with a mailbox you control before inviting any real supplier. Invitation links are copied for manual delivery; the application sends verification codes only.

No original Mac database, real yacht records, uploaded files or existing credentials are imported automatically. Create clearly fictional test yachts/claims using the protected API until the creation UI is finished. The staging database starts empty; the Work Hub reports this honestly instead of substituting demo data.

## Verification performed locally

- Next.js 16.4.3, React 19.3.1, Nodemailer 10.3.1 and Zod 4.6.7 installed and locked.
- Production build/type check passed after migrating route params to the async API and client pages to `useParams`.
- `npm audit --omit=dev` reports zero known runtime dependency vulnerabilities at this checkpoint. Full audit still reports moderate development-tool findings from minimatch in ESLint dependencies; do not represent the entire dependency tree as vulnerability-free. Recheck before publishing.
- Access suite passed on the upgraded runtime, including password login, grants, SMTP verification using a local sink, internal visibility, file authorization and revocation.
- Hosted-start suite passed: fail-closed secret checks, migrations on a fresh volume, first-director provisioning, database persistence across restarts, unchanged existing password and canonical-origin validation.
- Render Blueprint validation and deployment succeeded. Production dependencies were pruned and Render reported zero package vulnerabilities. The login screen was visually verified on the live HTTPS URL. Full authenticated browser/mobile QA and real mailbox delivery are still pending.

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
