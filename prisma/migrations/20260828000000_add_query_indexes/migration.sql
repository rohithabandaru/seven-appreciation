-- CreateIndex
CREATE INDEX "AppreciationMessage_status_idx" ON "AppreciationMessage"("status");

-- CreateIndex
CREATE INDEX "AppreciationMessage_memberId_idx" ON "AppreciationMessage"("memberId");

-- CreateIndex
CREATE INDEX "Letter_visibility_idx" ON "Letter"("visibility");

-- CreateIndex
CREATE INDEX "Letter_memberId_idx" ON "Letter"("memberId");

-- CreateIndex
CREATE INDEX "Letter_userId_idx" ON "Letter"("userId");

-- CreateIndex
CREATE INDEX "Post_status_idx" ON "Post"("status");

-- CreateIndex
CREATE INDEX "Post_memberId_idx" ON "Post"("memberId");

-- CreateIndex
CREATE INDEX "Post_userId_idx" ON "Post"("userId");
