# YY ASM continuity and saving

Mario requests that work remain recoverable if the session is interrupted.

- Read PROJECT_STATUS.md and STAGING_DEPLOYMENT.md before resuming. Check the actual GitHub branch head and Render live commit; local changes, pushed code, deployed code and imported live data are different states.
- Commit and push meaningful implementation checkpoints to the project repository. Update PROJECT_STATUS.md with completed changes, validation evidence, live deployment/import state, current blockers and the precise next action.
- Do not claim a deployment or import completed until its live outcome is verified. Preserve failed-attempt details when they matter for safely resuming; check idempotency/audit markers before retrying an interrupted import.
- YES System is the official source for the migration. Preserve original global YES IDs, source yacht associations, GENERAL Date of Delivery, Engine, Generator, Hull Paint and claim comments/history. Do not invent missing values or infer warranty approval from a YES status.
- Keep private exports and backups out of Git. The original source archive is saved as YES-export-2026-11-16.zip in Mario's saved files. It contains 39 yachts, 878 claims and 2,027 comments/history entries, with checksums. Retrieve that archive if local scratch files are missing.
- Never save plaintext passwords, tokens, connection secrets, private customer exports or database files in this repository. Use secure authentication and configured secret storage.
- Keep the four UI languages (EN/IT/ES/DE), Prev/Next navigation and access isolation. Login branding is centered YY ASM, with centered subtitle YYachts After Sales Management.
