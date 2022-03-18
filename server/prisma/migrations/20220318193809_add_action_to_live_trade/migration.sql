/*
  Warnings:

  - Added the required column `action` to the `LiveTrade` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LiveTrade" ADD COLUMN     "action" TEXT NOT NULL;
