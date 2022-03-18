-- AlterTable
ALTER TABLE "LiveTrade" ALTER COLUMN "orderDetails" DROP NOT NULL,
ALTER COLUMN "orderAcceptedTime" DROP NOT NULL,
ALTER COLUMN "orderExecutedTime" DROP NOT NULL;
