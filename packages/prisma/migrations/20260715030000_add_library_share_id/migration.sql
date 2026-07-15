-- AlterTable
ALTER TABLE "users" ADD COLUMN "libraryShareId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_libraryShareId_key" ON "users"("libraryShareId");
