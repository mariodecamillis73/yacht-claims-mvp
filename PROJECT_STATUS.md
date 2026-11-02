# YY ASM — current project status (2 November 2026)

This file replaces the accumulated status notes. Historical notes are retained in [docs/PROJECT_HISTORY_2026-11-02.md](docs/PROJECT_HISTORY_2026-11-02.md). The original MVP brief remains on `main` (GitHub blob `599fb27d3af4aef3a94e12d75dbcfa25254cf464`). Source/deployment branch: `feature/staging-ready`; `main` has not been overwritten.

## Requirements traced to the original brief

| Original requirement | Implementation | Verification / limit |
| --- | --- | --- |
| App shell, routes, login | Next.js routes, signed database-backed login, logout | Build, auth and hosted tests; no default demo login |
| Authentication, roles, customer restrictions | Director/staff, representatives assigned to yachts, supplier/dealer claim grants | Role/yacht/claim isolation, deactivation and revocation integration tests |
| Internal operations dashboard / Work Hub | Real claims grouped by yacht, All/My work/Overdue/last-7-day updates, title/description/hull search, yacht/status/priority filters and summary counts | Server filters preserve access scope; due dates end at 23:59:59.999 UTC; recently updated means seven days |
| Claim detail and lifecycle | Create, edit title/description/priority, yard team and supplier assignment, target date, warranty assessment, director approve/reject, status progression, closing/reopening and internal history | Invalid assignments/dates rejected, approval gate enforced, overdue excludes closed/rejected |
| Yacht overview and technical profile | Create/list/detail/edit yachts, hull correction preserves linked records | Yacht/edit integration tests, duplicate and stale-edit conflict checks |
| Customer / My Yacht | Real assigned yachts, links to claims, create claims, shared comments and protected files | Representative access tests; no mock substitution |
| Supplier portal | Specific-email, expiring/revocable per-claim links; guest email-code verification; shared comments and uploads/downloads | Local SMTP integration passes; real delivery requires authorized SMTP configuration |
| Supplier data | Director-maintained supplier directory; yard users can select supplier and responsible team member on a claim | Directory and assignment permissions tested; assignment alone NEVER grants access |
| Localization-ready structure / Localization roadmap | Typed EN/IT/ES/DE dictionaries, app language selector with local preference, translated Work Hub and primary claim management controls | Build checked. Technical yacht forms, some secondary labels and server errors remain English; a fully translated UI is not claimed |
| Styling / UX foundation | Existing app styling retained; responsive dashboard and forms | Build verified; complete authenticated browser/mobile acceptance remains pending |
| Mock data and initial APIs | Production pages use persistent scoped APIs; historical fixtures are not used as a live fallback | Source inspection and integration tests |
| QA and deployment | Next.js CI, build/typecheck, disposable access/hosted/backup suites, Render persistent single-instance deployment | Live rollout must be verified for each source commit; no original Mac records auto-imported |

## Later owner requirements included

- Password policy: at least eight characters with a letter, digit and non-space special character, maximum 72 UTF-8 bytes; existing accounts unchanged.
- Delivery date, 1/2-year yacht warranty and server-calculated expiry; leap-day anniversary clamped to 28 February.
- Engine, genset, bow and stern thrusters, propeller(s), air conditioning, watermaker: brand/model/serial, plus power with unit where applicable.
- Independent hull/deck painting product brand, paint type and color code.
- Administrator may edit registered yacht data, including hull number; yacht links, claims, member access and documents preserved transactionally.
- Authorized participants can use shared photos, documents and comments; internal content remains private to the yard.

## Additional operational safeguards

- `npm run db:backup -- /secure/path/new-backup.db` creates a consistent SQLite snapshot, verifies integrity/FKs and refuses overwrite. Attachment bytes are included.
- Hosted startup creates a verified pre-migration snapshot of a non-empty existing database when new migrations are pending. These snapshots remain on the SAME disk and are supplemental protection only.
- `npm run test:backup` restores a test snapshot into a new database and checks claim and binary attachment recovery. Hosted tests simulate upgrading an existing database and verify a pre-migration snapshot.
- No destructive resets, real seed records, mailbox changes or secret values are committed.

## External prerequisites and release limits

1. Configure an authorized SMTP sender/service using runtime secrets; validate delivery to a controlled real mailbox before inviting suppliers. Current implementation fails closed without SMTP. Invitations are copied for manual sending; automated invitation emailing is not promised.
2. Select and activate an off-disk backup destination, schedule and retention. The snapshot tool and restore test are implemented; recurring/off-site backups are not activated.
3. Complete authenticated browser/mobile acceptance with director, staff, representative, supplier and dealer. Automated API tests are not a substitute for that acceptance.
4. Finalize production domain and operational monitoring. Account self-service activation/password reset and attachment malware scanning/quotas are further release hardening, not features specified by the original MVP brief.

Do not describe this as a fully commissioned production service while these limits remain. See README.md and STAGING_DEPLOYMENT.md for safe operations.
