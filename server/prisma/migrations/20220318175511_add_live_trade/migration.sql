-- CreateTable
CREATE TABLE "LiveTrade" (
    "id" SERIAL NOT NULL,
    "symbol" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,
    "open" DOUBLE PRECISION NOT NULL,
    "high" DOUBLE PRECISION NOT NULL,
    "low" DOUBLE PRECISION NOT NULL,
    "close" DOUBLE PRECISION NOT NULL,
    "volume" DOUBLE PRECISION NOT NULL,
    "exchange" TEXT NOT NULL,
    "strategy" TEXT NOT NULL,
    "signalReasoning" TEXT NOT NULL,
    "orderDetails" TEXT NOT NULL,
    "orderSendTime" TIMESTAMP(3) NOT NULL,
    "orderAcceptedTime" TIMESTAMP(3) NOT NULL,
    "orderExecutedTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LiveTrade_pkey" PRIMARY KEY ("id")
);
