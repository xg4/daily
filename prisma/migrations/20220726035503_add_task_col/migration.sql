/*
  Warnings:

  - Added the required column `task_id` to the `records` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_records" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "account_id" INTEGER NOT NULL,
    "task_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    CONSTRAINT "records_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "records_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_records" ("account_id", "content", "created_at", "id", "updated_at") SELECT "account_id", "content", "created_at", "id", "updated_at" FROM "records";
DROP TABLE "records";
ALTER TABLE "new_records" RENAME TO "records";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
