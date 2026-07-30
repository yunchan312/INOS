-- AlterEnum
ALTER TYPE "OAuthProvider" ADD VALUE 'LOCAL';

-- AlterTable
ALTER TABLE "users" ADD COLUMN "passwordHash" TEXT;

-- CreateTable
CREATE TABLE "group_invite_links" (
    "id" UUID NOT NULL,
    "groupId" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "createdById" UUID NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "useCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "group_invite_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "group_invite_links_token_key" ON "group_invite_links"("token");

-- CreateIndex
CREATE INDEX "group_invite_links_groupId_createdAt_idx" ON "group_invite_links"("groupId", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "group_invite_links" ADD CONSTRAINT "group_invite_links_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_invite_links" ADD CONSTRAINT "group_invite_links_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
