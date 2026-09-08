-- AlterTable
ALTER TABLE "meetings" ADD COLUMN     "movieWorkId" UUID;

-- CreateTable
CREATE TABLE "movie_works" (
    "id" UUID NOT NULL,
    "tmdbId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "originalTitle" TEXT,
    "director" TEXT,
    "releaseDate" DATE,
    "runtime" INTEGER,
    "overview" TEXT,
    "genres" TEXT[],
    "posterPath" TEXT,
    "backdropPath" TEXT,
    "certification" VARCHAR(16),
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movie_works_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "movie_works_tmdbId_key" ON "movie_works"("tmdbId");

-- AddForeignKey
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_movieWorkId_fkey" FOREIGN KEY ("movieWorkId") REFERENCES "movie_works"("id") ON DELETE SET NULL ON UPDATE CASCADE;

