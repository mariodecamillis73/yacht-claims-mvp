ALTER TABLE "Claim" ADD COLUMN "yesId" TEXT;
CREATE UNIQUE INDEX "Claim_yesId_key" ON "Claim"("yesId");
