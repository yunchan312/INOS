-- CreateTable
CREATE TABLE "manual_library_entries" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "kind" "PromptKind" NOT NULL,
    "title" TEXT NOT NULL,
    "creator" TEXT,
    "finishedAt" TIMESTAMP(3),
    "rating" INTEGER,
    "comment" VARCHAR(100),
    "discussionText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "manual_library_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "manual_library_entries_userId_idx" ON "manual_library_entries"("userId");

-- AddForeignKey
ALTER TABLE "manual_library_entries" ADD CONSTRAINT "manual_library_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
