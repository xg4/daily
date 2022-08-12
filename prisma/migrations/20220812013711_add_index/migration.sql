-- CreateIndex
CREATE INDEX "accounts_author_id_idx" ON "accounts"("author_id");

-- CreateIndex
CREATE INDEX "projects_domain_idx" ON "projects"("domain");

-- CreateIndex
CREATE INDEX "records_account_id_idx" ON "records"("account_id");
