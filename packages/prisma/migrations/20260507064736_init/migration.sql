-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateEnum
CREATE TYPE "OAuthProvider" AS ENUM ('GOOGLE');

-- CreateEnum
CREATE TYPE "GroupMode" AS ENUM ('GROUP', 'SOLO');

-- CreateEnum
CREATE TYPE "GroupRole" AS ENUM ('LEADER', 'MEMBER');

-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('MOVIE', 'BOOK');

-- CreateEnum
CREATE TYPE "ContentSource" AS ENUM ('TMDB', 'KAKAO', 'GOOGLE_BOOKS', 'USER_ADDED');

-- CreateEnum
CREATE TYPE "GroupContentStatus" AS ENUM ('VOTING', 'SELECTED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "UserContentStatus" AS ENUM ('COMPLETED', 'IN_PROGRESS', 'WISHLIST');

-- CreateEnum
CREATE TYPE "MeetingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'DONE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DiscussionStatus" AS ENUM ('GENERATING', 'GENERATED', 'PUBLISHED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "profileImageUrl" TEXT,
    "oauthProvider" "OAuthProvider" NOT NULL,
    "oauthId" TEXT NOT NULL,
    "tasteProfile" JSONB,
    "embedding" vector(1536),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "groups" (
    "id" UUID NOT NULL,
    "ownerId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "inviteCode" TEXT NOT NULL,
    "mode" "GroupMode" NOT NULL DEFAULT 'GROUP',
    "tasteProfile" JSONB,
    "groupEmbedding" vector(1536),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_members" (
    "id" UUID NOT NULL,
    "groupId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "role" "GroupRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "group_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contents" (
    "id" UUID NOT NULL,
    "type" "ContentType" NOT NULL,
    "title" TEXT NOT NULL,
    "creator" TEXT NOT NULL,
    "releaseYear" INTEGER,
    "thumbnailUrl" TEXT,
    "synopsis" TEXT,
    "metadata" JSONB,
    "source" "ContentSource" NOT NULL DEFAULT 'USER_ADDED',
    "sourceId" TEXT,
    "isSeeded" BOOLEAN NOT NULL DEFAULT false,
    "embedding" vector(1536),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_contents" (
    "id" UUID NOT NULL,
    "groupId" UUID NOT NULL,
    "contentId" UUID NOT NULL,
    "status" "GroupContentStatus" NOT NULL DEFAULT 'VOTING',
    "selectedBy" UUID,
    "selectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "group_contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_votes" (
    "id" UUID NOT NULL,
    "groupContentId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "score" INTEGER NOT NULL,
    "votedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_contents" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "contentId" UUID NOT NULL,
    "status" "UserContentStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meetings" (
    "id" UUID NOT NULL,
    "groupId" UUID NOT NULL,
    "groupContentId" UUID NOT NULL,
    "confirmedDate" TIMESTAMP(3),
    "location" TEXT,
    "status" "MeetingStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meetings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meeting_availabilities" (
    "id" UUID NOT NULL,
    "meetingId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "availableDates" JSONB NOT NULL,
    "respondedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meeting_availabilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discussions" (
    "id" UUID NOT NULL,
    "meetingId" UUID NOT NULL,
    "groupId" UUID NOT NULL,
    "groupContentId" UUID NOT NULL,
    "webSearchContext" TEXT,
    "ragContext" TEXT,
    "generatedBody" TEXT,
    "editedBody" TEXT,
    "status" "DiscussionStatus" NOT NULL DEFAULT 'GENERATING',
    "generatedAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "discussions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discussion_notes" (
    "id" UUID NOT NULL,
    "discussionId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "discussion_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meeting_summaries" (
    "id" UUID NOT NULL,
    "meetingId" UUID NOT NULL,
    "transcriptRaw" TEXT,
    "summary" TEXT,
    "keyInsights" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meeting_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "archives" (
    "id" UUID NOT NULL,
    "meetingId" UUID NOT NULL,
    "groupId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "body" TEXT,
    "photoUrls" JSONB,
    "archivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "archives_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_oauthProvider_oauthId_key" ON "users"("oauthProvider", "oauthId");

-- CreateIndex
CREATE UNIQUE INDEX "groups_inviteCode_key" ON "groups"("inviteCode");

-- CreateIndex
CREATE INDEX "groups_inviteCode_idx" ON "groups"("inviteCode");

-- CreateIndex
CREATE UNIQUE INDEX "group_members_groupId_userId_key" ON "group_members"("groupId", "userId");

-- CreateIndex
CREATE INDEX "contents_type_idx" ON "contents"("type");

-- CreateIndex
CREATE INDEX "contents_title_idx" ON "contents"("title");

-- CreateIndex
CREATE UNIQUE INDEX "contents_source_sourceId_key" ON "contents"("source", "sourceId");

-- CreateIndex
CREATE INDEX "group_contents_groupId_status_idx" ON "group_contents"("groupId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "group_contents_groupId_contentId_key" ON "group_contents"("groupId", "contentId");

-- CreateIndex
CREATE UNIQUE INDEX "content_votes_groupContentId_userId_key" ON "content_votes"("groupContentId", "userId");

-- CreateIndex
CREATE INDEX "user_contents_userId_status_idx" ON "user_contents"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "user_contents_userId_contentId_key" ON "user_contents"("userId", "contentId");

-- CreateIndex
CREATE INDEX "meetings_groupId_status_idx" ON "meetings"("groupId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "meeting_availabilities_meetingId_userId_key" ON "meeting_availabilities"("meetingId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "discussions_meetingId_key" ON "discussions"("meetingId");

-- CreateIndex
CREATE INDEX "discussions_groupId_idx" ON "discussions"("groupId");

-- CreateIndex
CREATE INDEX "discussion_notes_discussionId_userId_idx" ON "discussion_notes"("discussionId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "meeting_summaries_meetingId_key" ON "meeting_summaries"("meetingId");

-- CreateIndex
CREATE INDEX "archives_groupId_archivedAt_idx" ON "archives"("groupId", "archivedAt");

-- AddForeignKey
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_contents" ADD CONSTRAINT "group_contents_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_contents" ADD CONSTRAINT "group_contents_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "contents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_contents" ADD CONSTRAINT "group_contents_selectedBy_fkey" FOREIGN KEY ("selectedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_votes" ADD CONSTRAINT "content_votes_groupContentId_fkey" FOREIGN KEY ("groupContentId") REFERENCES "group_contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_votes" ADD CONSTRAINT "content_votes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_contents" ADD CONSTRAINT "user_contents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_contents" ADD CONSTRAINT "user_contents_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "contents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_groupContentId_fkey" FOREIGN KEY ("groupContentId") REFERENCES "group_contents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_availabilities" ADD CONSTRAINT "meeting_availabilities_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_availabilities" ADD CONSTRAINT "meeting_availabilities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discussions" ADD CONSTRAINT "discussions_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discussions" ADD CONSTRAINT "discussions_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discussions" ADD CONSTRAINT "discussions_groupContentId_fkey" FOREIGN KEY ("groupContentId") REFERENCES "group_contents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discussion_notes" ADD CONSTRAINT "discussion_notes_discussionId_fkey" FOREIGN KEY ("discussionId") REFERENCES "discussions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discussion_notes" ADD CONSTRAINT "discussion_notes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_summaries" ADD CONSTRAINT "meeting_summaries_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "archives" ADD CONSTRAINT "archives_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "archives" ADD CONSTRAINT "archives_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "archives" ADD CONSTRAINT "archives_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
