-- CreateTable
CREATE TABLE "VisitLog" (
    "id" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "path" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VisitLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VisitLog_fingerprint_day_key" ON "VisitLog"("fingerprint", "day");

-- CreateIndex
CREATE INDEX "VisitLog_day_idx" ON "VisitLog"("day");

-- CreateIndex
CREATE INDEX "VisitLog_createdAt_idx" ON "VisitLog"("createdAt");