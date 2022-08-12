/*
  Warnings:

  - You are about to drop the column `project_id` on the `accounts` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_project_id_fkey";

-- AlterTable
ALTER TABLE "accounts" DROP COLUMN "project_id";

-- CreateTable
CREATE TABLE "ProjectsOnAccounts" (
    "account_id" INTEGER NOT NULL,
    "project_id" INTEGER NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectsOnAccounts_pkey" PRIMARY KEY ("account_id","project_id")
);

-- AddForeignKey
ALTER TABLE "ProjectsOnAccounts" ADD CONSTRAINT "ProjectsOnAccounts_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectsOnAccounts" ADD CONSTRAINT "ProjectsOnAccounts_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
