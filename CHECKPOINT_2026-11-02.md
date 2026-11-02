# YY ASM — saved checkpoint, 2 November 2026

Source commit: `2b47e0c4894a7c146f4072d95dfd7312b833778a` on `feature/staging-ready`.

Live staging: https://yy-asm-staging.onrender.com
Render service: `srv-dbk68oe7bikc7399cql0`; verified live deployment: `dep-dbk806ss728c73ccmo00`.

## Completed
- Database-backed login, role and yacht/claim access controls, director-managed users.
- Individual claim invitations, shared/internal comments and protected attachments; guest email-code flow implemented.
- Yacht registration, claim submission with attachments, director validation, approval-gated status changes and internal history.
- Delivery date and 1/2-year yacht warranty with calculated expiry.
- Engine, genset, bow/stern thruster, propeller(s), air-conditioning and watermaker technical fields.
- Separate hull/deck paint brand, paint type and color code.
- Administrator editing of all yacht fields, including hull correction with linked claims and membership preserved; stale-save conflict checks.
- Persistent Render SQLite disk, additive migrations, one-time director credential maintenance; existing credentials preserved.

## Verification
Production build/type checking, access/profile/workflow/edit integration tests and hosted persistence/authentication tests passed. GitHub checks passed for source commit. Live health endpoint and edit route responded successfully. Local committed source tree matched GitHub source tree at checkpoint.

## Resume next
Configure authorized transactional SMTP for external claim access; perform full authenticated browser/mobile QA; complete operational backup/restore and remaining production-readiness review. No original Mac database records have been imported. Do not seed, reset or overwrite live data. Do not rotate credentials during routine deployment. Auto-deploy is off; source branch remains feature/staging-ready. Main is unchanged.

This checkpoint preserves source and handover notes. It is not an export or backup of the live database, attachments or secret environment variables. Original migration/recovery notes remain in PROJECT_STATUS.md and STAGING_DEPLOYMENT.md. Never commit credentials or database files.
