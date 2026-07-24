-- CreateTable
CREATE TABLE "group_posts" (
    "id" UUID NOT NULL,
    "groupId" UUID NOT NULL,
    "authorId" UUID NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "group_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_post_likes" (
    "id" UUID NOT NULL,
    "postId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "group_post_likes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "group_posts_groupId_createdAt_idx" ON "group_posts"("groupId", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "group_post_likes_postId_userId_key" ON "group_post_likes"("postId", "userId");

-- AddForeignKey
ALTER TABLE "group_posts" ADD CONSTRAINT "group_posts_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_posts" ADD CONSTRAINT "group_posts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_post_likes" ADD CONSTRAINT "group_post_likes_postId_fkey" FOREIGN KEY ("postId") REFERENCES "group_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_post_likes" ADD CONSTRAINT "group_post_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
