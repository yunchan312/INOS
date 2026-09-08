-- AlterTable
ALTER TABLE "meetings" ADD COLUMN     "bookWorkId" UUID;

-- CreateTable
CREATE TABLE "book_works" (
    "id" UUID NOT NULL,
    "isbn13" VARCHAR(13) NOT NULL,
    "setIsbn" VARCHAR(13),
    "title" TEXT NOT NULL,
    "seriesTitle" TEXT,
    "author" TEXT,
    "publisher" TEXT,
    "publishDate" DATE,
    "page" INTEGER,
    "kdc" VARCHAR(32),
    "subject" TEXT,
    "coverUrl" TEXT,
    "introductionUrl" TEXT,
    "tocUrl" TEXT,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "book_works_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "book_works_isbn13_key" ON "book_works"("isbn13");

-- AddForeignKey
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_bookWorkId_fkey" FOREIGN KEY ("bookWorkId") REFERENCES "book_works"("id") ON DELETE SET NULL ON UPDATE CASCADE;
