-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Job" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "skillsRequired" JSONB NOT NULL,
    "benefits" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "type" TEXT NOT NULL DEFAULT 'FULL_TIME',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Job" ("benefits", "createdAt", "description", "id", "skillsRequired", "status", "title", "updatedAt") SELECT "benefits", "createdAt", "description", "id", "skillsRequired", "status", "title", "updatedAt" FROM "Job";
DROP TABLE "Job";
ALTER TABLE "new_Job" RENAME TO "Job";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
