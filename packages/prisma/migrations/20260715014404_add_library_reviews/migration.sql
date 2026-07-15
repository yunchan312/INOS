-- CreateTable
CREATE TABLE "personal_library_reviews" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "meetingId" UUID NOT NULL,
    "kind" "PromptKind" NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "personal_library_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_library_reviews" (
    "id" UUID NOT NULL,
    "meetingId" UUID NOT NULL,
    "kind" "PromptKind" NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" VARCHAR(100),
    "updatedById" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "group_library_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "personal_library_reviews_meetingId_kind_idx" ON "personal_library_reviews"("meetingId", "kind");

-- CreateIndex
CREATE UNIQUE INDEX "personal_library_reviews_userId_meetingId_kind_key" ON "personal_library_reviews"("userId", "meetingId", "kind");

-- CreateIndex
CREATE UNIQUE INDEX "group_library_reviews_meetingId_kind_key" ON "group_library_reviews"("meetingId", "kind");

-- AddForeignKey
ALTER TABLE "personal_library_reviews" ADD CONSTRAINT "personal_library_reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personal_library_reviews" ADD CONSTRAINT "personal_library_reviews_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_library_reviews" ADD CONSTRAINT "group_library_reviews_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_library_reviews" ADD CONSTRAINT "group_library_reviews_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
