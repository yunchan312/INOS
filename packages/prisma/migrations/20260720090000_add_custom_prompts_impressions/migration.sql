-- CreateTable
CREATE TABLE "discussion_custom_prompts" (
    "id" UUID NOT NULL,
    "discussionId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "promptKind" "PromptKind" NOT NULL,
    "content" VARCHAR(500) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "discussion_custom_prompts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discussion_impressions" (
    "id" UUID NOT NULL,
    "discussionId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "discussion_impressions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "discussion_custom_prompts_discussionId_promptKind_createdAt_idx" ON "discussion_custom_prompts"("discussionId", "promptKind", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "discussion_impressions_discussionId_userId_key" ON "discussion_impressions"("discussionId", "userId");

-- AddForeignKey
ALTER TABLE "discussion_custom_prompts" ADD CONSTRAINT "discussion_custom_prompts_discussionId_fkey" FOREIGN KEY ("discussionId") REFERENCES "discussions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discussion_custom_prompts" ADD CONSTRAINT "discussion_custom_prompts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discussion_impressions" ADD CONSTRAINT "discussion_impressions_discussionId_fkey" FOREIGN KEY ("discussionId") REFERENCES "discussions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discussion_impressions" ADD CONSTRAINT "discussion_impressions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
