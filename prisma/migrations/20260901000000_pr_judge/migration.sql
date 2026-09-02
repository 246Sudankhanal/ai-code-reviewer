ALTER TABLE "pull_request" ADD COLUMN IF NOT EXISTS "judgeScore" INTEGER;
ALTER TABLE "pull_request" ADD COLUMN IF NOT EXISTS "judgeVerdict" TEXT;
ALTER TABLE "pull_request" ADD COLUMN IF NOT EXISTS "judgeRationale" TEXT;
