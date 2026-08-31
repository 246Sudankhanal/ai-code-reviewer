-- AlterTable
ALTER TABLE "user" ADD COLUMN "stripeCustomerId" TEXT;
ALTER TABLE "user" ADD COLUMN "stripeSubscriptionId" TEXT;

UPDATE "user"
SET "stripeSubscriptionId" = "razorpaySubscriptionId"
WHERE "razorpaySubscriptionId" IS NOT NULL;

ALTER TABLE "user" DROP COLUMN "razorpaySubscriptionId";
