/*
  Warnings:

  - Added the required column `type` to the `Bar` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Bar" ADD COLUMN     "type" TEXT NOT NULL;
