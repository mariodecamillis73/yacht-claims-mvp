## 22 novembre — chiusura claim YES

Lo State YES al 100% determina la chiusura anche per i claim già importati. Restano chiusi anche i claim con status YES Closed.

## Shared navigation and branding — 16 November 2026

- A single root-layout header shows YY ASM on every route, including loading/error states. Signed-in internal users get Work Hub, Yachts, Suppliers and (director only) Users, plus Logout. Representatives see only their permitted navigation. Login/recovery and supplier-token pages retain the brand without internal navigation.
- Removed legacy Yacht Claims MVP headings and duplicate page headers. Existing four-language labels and Prev/Next remain.
- Production build/typecheck, localization and access/isolation tests passed. Commit 7335d0c7e56f83d7466d612ab53a5fdcaeae4633 deployed live at 2026-11-16 16:44:15 UTC (Render deploy dep-dbtj51mk1f9s73crvpgg). Browser verification confirmed the Italian navigation and Logout on importer, yacht list, yacht detail and claim detail; screenshot checked. No legacy MVP branding remains in app/components/lib.
- Continuity instructions and account-transfer guide saved in AGENTS.md and MIGRATION_HANDOFF.md.

## Confirmed YES import — 16 November 2026

- Live importer confirmed 39 yachts, 878 claims and 2,027 comments/history entries at 16:30:25 UTC, after verifying its pre-import backup. Four previous test claims preserved (882 total); two conflicting YES references resolved and three yacht identities corrected.
- Binary historical attachments were not imported. Email configuration remains outstanding.

## Verifica runtime 16 novembre 2026

## YES migration preparation — 2026-11-16

- Official source: authenticated YES System export, 39 yachts, 878 unique claims, 2,027 comments/system-history entries. Private source archive saved separately; no customer export is committed to Git.
- Director-only `/admin/import-yes` previews and imports validated source exports, with a verified SQLite backup before any mutation and a single atomic transaction. Exact-snapshot retries are no-ops; changed snapshots require explicit reconciliation.
- Original YES IDs, yacht associations, GENERAL delivery date, Engine, Generator and hull paint are retained. Model/slot determines standard hull identifiers; original GENERAL values are retained alongside structured fields. Unknown delivery/technical values and warranty duration are not invented.
- Existing non-imported records conflicting on YES ID are preserved with their original data in the audit trail; their old grants are revoked before assigning official IDs to new imported records. Yacht identity corrections remove stale representative memberships; original data remains in the verified backup and audit.
- Imported comments are INTERNAL by default. No invitations are sent. Historical attachment filenames are retained in notes, but binary attachments are NOT part of this export/import.
- Original YES status/state is retained. Only explicitly Closed maps to closed; Confirmed does not imply a new YY ASM director approval or closure. All imported records require their own YY ASM validation workflow.
- Delivery dates without a known 1/2-year warranty duration are now supported, including later administrative editing.
- Verified locally: full-source rehearsal 39/878/2027; idempotency, backup recovery, collision/grant isolation and rollback; production build and access/localization tests.
- Preparation checkpoint superseded by the confirmed live import above.
- First live apply was interrupted by a service restart; observed Work Hub still showed 4 original records. Optimized to bulk writes and isolated readiness checks from the write transaction. Retry subsequently succeeded; see confirmed import above.
- Added global Work Hub Search across claim title/description, YES ID, hull/yacht name and authorized comments, with matching comment excerpts. Server-side yacht/grant scope and shared/internal visibility remain enforced.
- Added Forgot password / Reset password: registered-email delivery, 30-minute hashed single-use tokens, rate limits, atomic concurrent redemption, expiry, credential-version checks and session invalidation. All UI labels in EN/IT/ES/DE. Live email recovery remains unavailable until mail delivery is configured; the UI reports this explicitly.
- Login branding: centered YY ASM and exact subtitle YYachts After Sales Management.
- Local production HTTP rehearsal, search privacy, reset email via local SMTP, token replay/race/expiry, old-session invalidation, hosted migration/backup/restart and localization tests passed.


- Render conferma: nessun provider email configurato; invio reale indisponibile. Non è evidenza di un rifiuto Microsoft.
- Risposte HTML/non JSON gestite con messaggio comprensibile, senza mostrare eccezioni di parsing.

## Aggiornamento 16 novembre 2026 — conferma invio inviti

- Stato di invio, errore e conferma accanto al pulsante. La conferma contiene destinatario e ora e appare solo dopo accettazione del servizio email, non prova di consegna.
- Diagnostica di avvio distingue Graph e SMTP senza esporre credenziali; timeout SMTP per evitare attese indefinite.
- Consegna reale alla casella di prova ancora da validare.

## Aggiornamento 16 novembre 2026 — titolo portale supplier

- Intestazione della pagina e titolo della scheda browser: YY ASM.
- Prossimo collaudo: invio dal pulsante dedicato a mariodecamillis@gmail.com dal claim di prova #YES ID 930. La consegna reale non è ancora validata.

## Aggiornamento 16 novembre 2026 — identificazione yacht per supplier

- Il portale del singolo claim mostra nome yacht, numero di scafo e data del Protocol of Delivery (data di consegna registrata), oltre a #YES ID. L’anno di costruzione non viene mostrato nel portale supplier.
- I dati provengono dallo yacht associato al claim; non vengono esposti proprietario, comandante o altri claim.

## Aggiornamento 16 novembre 2026 — riferimento visibile dei claim

- Centro operativo, schede yacht, dettaglio claim e accesso supplier mostrano solo il numero YES. I codici tecnici interni non sono più usati come riferimento visibile.
- Per i claim storici senza numero YES viene mostrato un trattino; il numero originale va inserito dalla modifica claim. Nessuna numerazione autonoma viene generata.

# YY ASM — stato operativo

## Versione verificata su staging

Il commit [`c2551be`](https://github.com/mariodecamillis73/yacht-claims-mvp/commit/c2551bed548f34b58f09c2b483bc511717e7a665) è live su [Render staging](https://yy-asm-staging.onrender.com/login) dal 15 novembre 2026. I [controlli GitHub](https://github.com/mariodecamillis73/yacht-claims-mvp/actions/runs/43695052657) sono passati. Il ramo di lavoro e deploy è `feature/staging-ready`.

- **YES ID#** è obbligatorio per i nuovi claim, ricercabile nel Centro operativo e univoco per tutta la flotta. Durante la coesistenza, si registra il claim in YES SYSTEM e si riporta in YY ASM il Request ID assegnato. Il 15 novembre il massimo osservato in YES era 990. Per i claim già presenti, il personale interno può aggiungere il riferimento dalla schermata di modifica.
- **Safari.** Pubblicata la correzione che uniforma l'altezza del campo Cerca e dei menu Yacht, Stato e Priorità. Resta da confermare il risultato sulle schermate interne in Safari.
- **Inviti.** Il link apre direttamente il singolo claim autorizzato, senza login o codici. La creazione e la copia manuale del link sono disponibili. L'invio da **aftersales@yyachts.de** è implementato tramite Microsoft Graph e verificato con risposte simulate. L'invio reale attende l'autorizzazione dell'app Microsoft 365 sulla sola casella After Sales e la configurazione protetta in Render.

## Prossimi passi

1. Ottenere da IT l'autorizzazione Microsoft 365 per l'app YY ASM. Configurare Graph in Render e verificare la ricezione di un invito di prova e l'apertura del solo claim autorizzato.
2. Completare il collaudo visivo in Safari su Centro operativo, schede yacht e dettaglio claim. Verificare anche le quattro lingue e Prev/Next, secondo il prototipo concordato.

Le note precedenti qui sotto documentano la cronologia. Per inviti e numerazione si applica lo stato operativo sopra.

---

## Collaudo casi limite — 4 novembre 2026

Superati test automatici su salvataggi e decisioni simultanee, limite allegati di 5 MB, download sicuro di SVG e letture/scritture negate dopo scadenza o revoca dei link. Corretta la visibilità non valida degli allegati (ora rifiutata invece di diventare condivisa) e la gestione delle risposte asincrone/link non più validi nel portale supplier. Build e controllo EN/IT/ES/DE superati. Dettagli e limiti in `docs/INTERNAL_ACCEPTANCE_2026-11-04.md`; collaudo visuale completo e invio Microsoft reale restano da completare.

# Internal acceptance progress — 4 November 2026

Automated internal acceptance completed; [detailed cases and limits](docs/INTERNAL_ACCEPTANCE_2026-11-04.md). Fixed stale claim edits/approvals and detail loading while navigating Prev/Next; newer data is preserved. Source-label checks cover 284 UI labels across EN/IT/ES/DE. Real Microsoft email authorization and full authenticated visual acceptance remain separate. Original prototype and subsequent owner requests remain authoritative.

---

# Owner update — direct claim invitations (4 November 2026)

Supplier/dealer invitations open the single authorized claim directly, with NO login, password, emailed code or OTP step. A 256-bit personal token is stored only as a hash; expiration, revocation and shared/internal filtering are enforced on every request. Existing unrevoked links follow this behavior too. The verification endpoint is retired (410). Guest links do not enable yacht browsing, Prev/Next or internal API access.

The director can send the invitation from **aftersales@yyachts.de**, the fixed From/Reply-To identity. The SMTP service must authorize that sender. A failed send is reported and the newly created grant is revoked. Manual link creation/copy remains available. Live SMTP configuration is still absent; the application does not claim a real invitation was delivered without provider acceptance. Local SMTP tests verify sender, recipient, direct URL and claim isolation. These owner instructions supersede older code-verification notes below.

---

# Prototype is the primary reference — 3 November 2026

The owner confirmed the version containing Prev/Next and EN/IT/ES/DE as authoritative. See [docs/PROTOTYPE_ALIGNMENT.md](docs/PROTOTYPE_ALIGNMENT.md) for the source comparison, restored controls and verification boundaries. Previous summaries must not substitute for the prototype. Current corrections include authorized Prev/Next navigation, four-language UI label wiring throughout the application, prototype card/list-row layouts, technical custom fields with units and protected yacht-level documents. User-authored content and existing data are preserved.

---

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
| Supplier portal | Specific-email, expiring/revocable direct per-claim links; shared comments and uploads/downloads | Local SMTP integration passes; live Microsoft Graph delivery requires mailbox authorization and Render configuration |
| Supplier data | Director-maintained supplier directory; yard users can select supplier and responsible team member on a claim | Directory and assignment permissions tested; assignment alone NEVER grants access |
| Localization-ready structure / Localization roadmap | Typed EN/IT/ES/DE dictionaries, app language selector with local preference, translated Work Hub and primary claim management controls | Build checked. Superseded by prototype alignment: translations are wired across application screens; user-authored text is unchanged |
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
