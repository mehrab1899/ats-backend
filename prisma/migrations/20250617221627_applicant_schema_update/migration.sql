/*
  Warnings:

  - You are about to drop the column `name` on the `Applicant` table. All the data in the column will be lost.
  - Added the required column `coverLetter` to the `Applicant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cv` to the `Applicant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `Applicant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `Applicant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `Applicant` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Applicant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "stage" TEXT NOT NULL DEFAULT 'APPLIED',
    "jobId" TEXT NOT NULL,
    "cv" TEXT NOT NULL,
    "coverLetter" TEXT NOT NULL,
    "message" TEXT,
    "appliedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Applicant_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Applicant" ("appliedAt", "email", "id", "jobId", "stage") SELECT "appliedAt", "email", "id", "jobId", "stage" FROM "Applicant";
DROP TABLE "Applicant";
ALTER TABLE "new_Applicant" RENAME TO "Applicant";
CREATE UNIQUE INDEX "Applicant_email_key" ON "Applicant"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
