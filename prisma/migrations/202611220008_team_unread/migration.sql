ALTER TABLE "Claim" ADD COLUMN "teamUnread" BOOLEAN NOT NULL DEFAULT true;
UPDATE "Claim" SET "teamUnread" = false WHERE id IN (SELECT claimId FROM ActivityLog WHERE action = 'Imported from YES' AND entityType = 'claim') OR status <> 'new';
