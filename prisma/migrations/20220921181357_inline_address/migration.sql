/*
  Warnings:

  - You are about to drop the `StringAddress` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN "address" TEXT;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "StringAddress";
PRAGMA foreign_keys=on;
