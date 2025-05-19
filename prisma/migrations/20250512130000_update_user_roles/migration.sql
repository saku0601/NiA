-- CreateEnum
CREATE TABLE "new_UserRole" (
    "value" TEXT NOT NULL PRIMARY KEY
);
INSERT INTO "new_UserRole" ("value") VALUES ('ADMIN'), ('MANAGER'), ('STAFF'), ('REQUESTER');

-- CreateTable
CREATE TABLE "task_status_transitions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fromStatus" TEXT NOT NULL,
    "toStatus" TEXT NOT NULL,
    "allowedRoles" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "task_status_transitions_fromStatus_toStatus_key" UNIQUE ("fromStatus", "toStatus")
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'STAFF',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "users_email_key" UNIQUE ("email")
);
INSERT INTO "new_users" ("createdAt", "email", "id", "name", "password", "role", "updatedAt") SELECT "createdAt", "email", "id", "name", "password", "REQUESTER", "updatedAt" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "task_status_transitions_fromStatus_toStatus_idx" ON "task_status_transitions"("fromStatus", "toStatus"); 