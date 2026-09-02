-- AlterTable
ALTER TABLE "pull_request" ADD COLUMN IF NOT EXISTS "postedHeadSha" TEXT;
