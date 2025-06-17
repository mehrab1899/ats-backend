/*
  Warnings:

  - You are about to drop the `_JobApplicants` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `positionName` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `theRole` on the `Job` table. All the data in the column will be lost.
  - Added the required column `jobId` to the `Applicant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "_JobApplicants_B_index";

-- DropIndex
DROP INDEX "_JobApplicants_AB_unique";

-- AlterTable
ALTER TABLE "Admin" ADD COLUMN "firstName" TEXT;
ALTER TABLE "Admin" ADD COLUMN "lastName" TEXT;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_JobApplicants";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Applicant" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "stage" TEXT NOT NULL DEFAULT 'APPLIED',
    "jobId" INTEGER NOT NULL,
    "appliedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Applicant_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Applicant" ("appliedAt", "email", "id", "name") SELECT "appliedAt", "email", "id", "name" FROM "Applicant";
DROP TABLE "Applicant";
ALTER TABLE "new_Applicant" RENAME TO "Applicant";
CREATE UNIQUE INDEX "Applicant_email_key" ON "Applicant"("email");
CREATE TABLE "new_Job" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "skillsRequired" JSONB NOT NULL,
    "benefits" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Job" ("benefits", "createdAt", "id", "skillsRequired", "updatedAt") SELECT "benefits", "createdAt", "id", "skillsRequired", "updatedAt" FROM "Job";
DROP TABLE "Job";
ALTER TABLE "new_Job" RENAME TO "Job";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
