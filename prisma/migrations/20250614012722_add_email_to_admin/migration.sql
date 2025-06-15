/*
  Warnings:

  - You are about to drop the `Application` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `username` on the `Admin` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Job` table. All the data in the column will be lost.
  - Added the required column `email` to the `Admin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `benefits` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `positionName` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `skillsRequired` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `theRole` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Application";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Applicant" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "appliedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "_JobApplicants" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_JobApplicants_A_fkey" FOREIGN KEY ("A") REFERENCES "Applicant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_JobApplicants_B_fkey" FOREIGN KEY ("B") REFERENCES "Job" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Admin" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Admin" ("id", "password") SELECT "id", "password" FROM "Admin";
DROP TABLE "Admin";
ALTER TABLE "new_Admin" RENAME TO "Admin";
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");
CREATE TABLE "new_Job" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "positionName" TEXT NOT NULL,
    "theRole" TEXT NOT NULL,
    "skillsRequired" JSONB NOT NULL,
    "benefits" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Job" ("id") SELECT "id" FROM "Job";
DROP TABLE "Job";
ALTER TABLE "new_Job" RENAME TO "Job";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Applicant_email_key" ON "Applicant"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_JobApplicants_AB_unique" ON "_JobApplicants"("A", "B");

-- CreateIndex
CREATE INDEX "_JobApplicants_B_index" ON "_JobApplicants"("B");
