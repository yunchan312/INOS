-- AlterTable
ALTER TABLE "groups" ADD COLUMN "libraryShareId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "groups_libraryShareId_key" ON "groups"("libraryShareId");
