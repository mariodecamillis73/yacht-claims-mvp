# Current milestone — staging preparation (2 November 2026)

Prepared on `feature/staging-ready`, stacked on the access-control branch. Supersedes overlapping runtime/deployment notes below.

- Updated Next.js to 16.4.3, React to 19.3.1, Nodemailer to 10.3.1 and Zod to 4.6.7; adjusted async route parameters and client useParams. Removed unused UI dependencies.
- Runtime dependency audit: zero known vulnerabilities. Full audit still has moderate findings in ESLint's development dependencies; these are pruned from the hosted installation.
- Added Render staging Blueprint with a paid single-instance service, persistent SQLite disk, generated signing secret, first-director bootstrap, HTTPS-origin validation and health check. No resources created and no costs activated.
- Build/typecheck, access integration tests and hosted bootstrap/restart/persistence tests passed locally.
- Replaced unrelated Deno workflow with Node application CI; remote CI result is pending.
- Waiting for Render connection before actual service creation. Provider price/plan must be reviewed before provisioning. Real SMTP and browser/mobile QA remain pending. Do not claim a live staging URL yet.
- Deployment/runbook: STAGING_DEPLOYMENT.md. No original database or secrets are published.

---

# Current milestone — authenticated claim sharing (2 November 2026)

Implemented on `feature/claim-access-control`, based on the recovery branch. This section supersedes the older recovery limitations below where they overlap.

- Database-backed password login; signed HttpOnly sessions; active-account checks and throttling. Removed the unused browser identity registry and demo-login behavior.
- Roles: director, staff, representative, supplier, dealer. Director manages users and yacht assignments through `/users` and validates claims; staff cannot approve. Representatives are restricted to assigned yachts. Supplier/dealer access is restricted to individual grants.
- Director can create expiring claim invitations for an email, copy the link and revoke access. Guest verifies a single-use email code through SMTP before opening a claim. A link alone cannot disclose data.
- Shared comments, photo/document upload and protected downloads work for guests and signed-in participants. Internal content is excluded from external responses. Old comments/documents default to internal during migration. Existing metadata-only attachments still need file import.
- Fresh-install migrations and a tested baseline path for the original Mac schema. Director bootstrap script and configuration/runbook in README.
- Production build, TypeScript and access integration tests passed. Integration tests use a disposable migrated database and local SMTP sink; no real messages were sent. The baseline migration was also tested against existing records.
- Browser visual QA could not run: Chromium is absent and its download was unavailable. The optional `YY_UI_TEST=1` test path requires Playwright with Chromium installed.

Next release work: browser/mobile QA, dependency security upgrades, account activation/password reset, remaining claim creation/status UI, comprehensive audit logging, upload scanning/quotas, backup/restore and hosting/domain/SMTP setup. Not deployed; no changes merged into main. SQLite requires a persistent disk and one application instance. No real SMTP configuration is included.

---

# Yacht Claims MVP - Session Summary

## Repository
- GitHub repo: https://github.com/mariodecamillis73/yacht-claims-mvp
- Default branch: main

## Project status
The project was initialized as a Next.js MVP for a yacht claims management app and evolved beyond the initial scaffold. The current GitHub history shows concrete application work, not just a starter template.

## Confirmed GitHub activity
Recent commit history on the repo includes:
- Fix claim creation API to use hullNumber instead of removed yachtId field
- Use hullNumber as the natural identifier for yacht and related claim records
- Remove unused yacht fields and technical sections to match the simplified After Sales data model
- Create claim listing and creation API endpoints for the After Sales workflow
- Create claim validation route so director approval/rejection gates goal workflow as second step
- Add workflow validation fields to Claim so claim lifecycle can include approval and rejection as a required stage
- Fix invalid clsx version in package.json to allow npm install to resolve dependencies
- Add Deno workflow for linting and testing
- Redirect the root route to the login page for the working app entry point
- Initialize Next.js MVP scaffold for yacht claims management system with demo routes and UI pages

This indicates the project is progressing toward a real MVP, with claim workflow logic and data model adjustments already in the repository.

## What was built
The project includes:
- app shell and routing
- login page
- Work Hub page
- yacht overview page
- claim detail page
- customer page (My Yacht)
- supplier portal page
- mock data for yachts, claims, comments, documents, suppliers
- styling and UX foundation
- initial route and API structure for auth, claims, yachts, and public supplier access

## Important note
The GitHub repo state and the local workspace state may differ if there are pending uncommitted changes or if Copilot edited files locally without syncing them to the repo.

## How to keep the project aligned
Use this process:
1. Backup the current work
2. Check repo state with:
   - git status
   - git log --oneline
   - git branch
3. Create a feature branch before continuing
   - git checkout -b feature/mvp-foundation
4. Pull the latest repo version
   - git fetch origin
   - git checkout main
   - git pull origin main
5. Continue only on a clean branch

## Recommended development path
1. Auth + roles
2. Work Hub
3. Claim detail workflow
4. Yacht overview and technical profile
5. My Yacht customer flow
6. Supplier portal
7. Localization
8. QA and deployment

## Local run commands
From the project folder:
- npm install
- cp .env.example .env
- npm run dev

Then open:
- http://localhost:3000

Demo login:
- admin@marine.com / password123

## Key recommendation
Do not work directly on main if Copilot or local files may diverge. Always use a dedicated feature branch and commit small logical chunks.

## Shared working principle
The goal is to keep the web repo and local workspace aligned, avoid accidental overwrites, and continue the real product work without losing earlier progress.

## Current recommendation
- keep using the GitHub repo as the source of truth
- use a feature branch for all new work
- take a backup before any reset or overwrite
- verify git status before and after each session

## Project objective
Build a functional MVP for yacht After Sales and claims management, including:
- internal operations dashboard
- yacht technical profile
- claim lifecycle management
- customer access restrictions
- supplier claim portal
- localization-ready structure

This file is intended to be a shareable summary of the current project session and working context.

## Recovery checkpoint — 2 November 2026

Recovered selected Mac changes on feature/recover-local-mvp. The Mac Work Hub layout now reads persistent claims, shows real yacht names, links to claim details and reports fetch failures instead of substituting demo claims. Recovered yacht list/create endpoints, persistent claim detail/update and validation decision checks. Kept list/create API at /api/claims; excluded misplaced duplicate routes. Yacht detail reads by hull number. Added dependency lock and missing bcrypt types.

Original uploaded ZIP and database preserved separately; database and environment are not committed. Existing Mac database contains one yacht and one claim. For a fresh setup run npm ci, npm run prisma:generate and npm run prisma:push with DATABASE_URL configured. No seed script currently exists.

Validation: production build and TypeScript passed; HTTP checks confirmed database claim list/detail, yacht detail, invalid decision (400), missing claim (404), Work Hub/login (200), root redirect (307). Browser visual verification remains pending.

Limitations: authentication/authorization remain prototype-only; supplier portal and My Yacht still use demo sources. Action buttons and workflow enforcement require further work. This recovery does not make the application production-ready. Existing Next.js dependency needs a separate security update.
