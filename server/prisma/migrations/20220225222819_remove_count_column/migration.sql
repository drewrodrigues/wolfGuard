/*
  Warnings:

  - You are about to drop the column `count` on the `Bar` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[symbol,time,type]` on the table `Bar` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Bar" DROP COLUMN "count";

-- CreateIndex
CREATE UNIQUE INDEX "Bar_symbol_time_type_key" ON "Bar"("symbol", "time", "type");
