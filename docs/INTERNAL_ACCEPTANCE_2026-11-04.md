# YY ASM — internal acceptance checkpoint, 4 November 2026

## Scope

Automated operational tests and source review against the confirmed prototype (Prev/Next and EN/IT/ES/DE), retaining subsequent owner requirements. Tests use disposable databases and a local SMTP sink. No company records or mailboxes are modified; no real supplier messages are sent. Microsoft MFA/Entra is not a prerequisite for these checks.

| Scenario | Result / evidence |
| --- | --- |
| Create and edit yacht; duplicate hull; delivery and 1/2-year expiry; leap day; custom fields/units; hull correction with preserved claims and membership | PASS — test:access |
| Director/staff/representative/supplier/dealer scope and deactivation | PASS — test:access |
| Create claim, approval/rejection gate, assignment/warranty/deadline, close/reopen, history and scoped dashboard filters | PASS — test:access |
| Previous/Next first/middle/last and permission boundaries | PASS — test:access |
| Concurrent claim editing | PASS — newer save preserved, stale editor rejected with 409, refreshed editor can save |
| Director approving stale content | PASS — stale version cannot approve; approval succeeds after reviewing the current version |
| Direct claim links without codes, revocation/expiry, shared-only comments/files and isolated yacht documents | PASS — test:access |
| Fixed invitation sender aftersales@yyachts.de, personal URL in MIME email, failed delivery revokes newly generated link | PASS — local SMTP and hosted tests; real Microsoft sending is not configured |
| Four-language dictionaries, UI label coverage, placeholders, preservation of user text | PASS — test:localization (284 labels); not a complete visual or linguistic review |
| Hosted restart, migration snapshot, persistence and unchanged existing credentials | PASS — test:hosted |
| Consistent backup plus restore of claim and attachment bytes | PASS — test:backup |
| Production compilation and TypeScript | PASS — local webpack build; remote CI verified separately on publication |

## Corrections from this pass

1. Claim edit, state change and director validation controls submit the version the user viewed. The server rejects stale edits/approvals and guards the transaction against a change during the request. The editor provides a translated reload action.
2. Prev/Next navigation clears the previous detail, ignores outdated loads and does not let a late action response replace the current claim. Action controls are reset for the new claim. Unrelated re-fetches with the same revision no longer wipe an edit draft.
3. Supplier portal clears previously displayed details if a subsequent load reports the invitation revoked/expired.

## Still separate from these results

- Full authenticated browser/mobile walkthrough for each role. API and source checks do not establish complete visual acceptance.
- Restore Microsoft account access and authorize the actual sender service; live invitation delivery and inbox verification remain pending.
- Commission off-disk scheduled backups/retention, final domain and operational monitoring.
