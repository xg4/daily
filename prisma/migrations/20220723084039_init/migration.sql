-- CreateTable
CREATE TABLE "tasks" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "env_prefix" TEXT NOT NULL,
    "domain" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "cookie" TEXT NOT NULL,
    "pptr_cookie" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "task_id" INTEGER NOT NULL,
    CONSTRAINT "accounts_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "tasks_name_key" ON "tasks"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tasks_env_prefix_key" ON "tasks"("env_prefix");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_cookie_key" ON "accounts"("cookie");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_pptr_cookie_key" ON "accounts"("pptr_cookie");
