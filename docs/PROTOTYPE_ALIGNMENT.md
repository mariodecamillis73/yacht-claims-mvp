# Prototype alignment — 3 November 2026

Owner update 4 November: external claim links now open their one shared claim directly, without codes. Automatic invitations use aftersales@yyachts.de as fixed sender/reply address; authorized SMTP is required. This supersedes the earlier email-code flow.

## Authority and preserved source

Mario confirmed that the reference is the prototype containing Previous/Next and the four languages EN/IT/ES/DE. This takes precedence over an assistant-written status summary. Sources inspected: original `origin/main` through commit `88cd161`, all prototype pages/APIs/types/mock settings and relevant history, plus the supplied Mac ZIP under `upload` and recovered Mac source. Original sources and previous checkpoint remain preserved. No original database is imported or replaced.

Later explicit owner requests (delivery/warranty, engine/paint data, admin editing and individual supplier/dealer access) remain in force. Removed schema fields are not silently reinstated based solely on stale mock fixtures.

| Prototype element | Correction / current behavior |
| --- | --- |
| Previous / Next in claim detail | Real adjacent claims across the actor's authorized claim list, ordered by createdAt then id ascending; endpoints disabled. No inaccessible IDs in navigation. Guests remain restricted to their invited claim. |
| EN / IT / ES / DE | Complete source-label dictionary wiring across login, Work Hub, yacht creation/edit/detail, My Yacht, claim creation/detail/actions, users, supplier directory and supplier portal. Labels, statuses, roles, validation messages, interpolation and dates use selected language. User-authored titles/comments, custom field names/values, companies and files remain unchanged. Preference persists in the browser. |
| Yacht cards and claim rows | Work Hub and My Yacht use prototype card/list-row pattern with status, priority, responsible person where authorized, and update date. Functional filters are preserved. |
| Technical profile Field / Value / Unit and + New field | Yacht profile tables restored; administrator can add/edit/remove custom fields with units in the existing equipment/painting sections. Persisted in the existing validated profile JSON; no destructive migration. |
| Yacht Add document action | Protected yacht-level document upload/list/download, with shared/internal visibility; yard uploads, assigned representatives see shared files, supplier/dealer grants do not expose yacht files. |
| Claim actions | Status, assignment, notes/comments, upload and director validation remain connected to persistent APIs. |
| Customer and supplier flows | Existing role scoping, individual grants and fail-closed email verification preserved. |

## Validation boundaries

Automated checks cover localization dictionary completeness, interpolation and static labels; first/middle/last and permission-scoped navigation; custom technical field persistence; yacht-document isolation and visibility; existing auth/claims; hosted persistence and backups. Local production compilation also uses the webpack option because the local Turbopack persistence cache returned an invalid-cache error; remote CI/build remains independently verified.

A prototype comparison is not a claim that the original Copilot conversation text was recovered. Original mock language settings define the four languages; no additional languages or original default-language requirement were found. Complete authenticated browser/mobile acceptance, actual SMTP deliverability and off-disk backup commissioning remain separate release checks.
