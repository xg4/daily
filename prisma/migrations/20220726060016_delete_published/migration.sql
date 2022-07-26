/*
  Warnings:

  - You are about to drop the column `published` on the `accounts` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_accounts" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "cookie" TEXT NOT NULL,
    "pptr_cookie" TEXT,
    "task_id" INTEGER NOT NULL,
    CONSTRAINT "accounts_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_accounts" ("cookie", "created_at", "id", "pptr_cookie", "task_id", "updated_at") SELECT "cookie", "created_at", "id", "pptr_cookie", "task_id", "updated_at" FROM "accounts";
DROP TABLE "accounts";
ALTER TABLE "new_accounts" RENAME TO "accounts";
CREATE UNIQUE INDEX "accounts_cookie_key" ON "accounts"("cookie");
CREATE UNIQUE INDEX "accounts_pptr_cookie_key" ON "accounts"("pptr_cookie");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
