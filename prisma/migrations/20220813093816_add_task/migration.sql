/*
  Warnings:

  - You are about to drop the column `project_id` on the `records` table. All the data in the column will be lost.
  - You are about to drop the `ProjectsOnAccounts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `projects` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `name` on table `accounts` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `task_id` to the `records` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ProjectsOnAccounts" DROP CONSTRAINT "ProjectsOnAccounts_account_id_fkey";

-- DropForeignKey
ALTER TABLE "ProjectsOnAccounts" DROP CONSTRAINT "ProjectsOnAccounts_project_id_fkey";

-- DropForeignKey
ALTER TABLE "records" DROP CONSTRAINT "records_project_id_fkey";

-- AlterTable
ALTER TABLE "accounts" ALTER COLUMN "name" SET NOT NULL;

-- AlterTable
ALTER TABLE "records" DROP COLUMN "project_id",
ADD COLUMN     "task_id" INTEGER NOT NULL;

-- DropTable
DROP TABLE "ProjectsOnAccounts";

-- DropTable
DROP TABLE "projects";

-- CreateTable
CREATE TABLE "tasks" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "domain" TEXT NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TasksOnAccounts" (
    "account_id" INTEGER NOT NULL,
    "task_id" INTEGER NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TasksOnAccounts_pkey" PRIMARY KEY ("account_id","task_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tasks_name_key" ON "tasks"("name");

-- CreateIndex
CREATE INDEX "tasks_name_idx" ON "tasks"("name");

-- AddForeignKey
ALTER TABLE "TasksOnAccounts" ADD CONSTRAINT "TasksOnAccounts_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TasksOnAccounts" ADD CONSTRAINT "TasksOnAccounts_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "records" ADD CONSTRAINT "records_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
