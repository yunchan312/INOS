import type { LibraryDto, LibraryItemDto } from '@inos/types';

export interface RecapStats {
  year: number;
  bookCount: number;
  movieCount: number;
  totalCount: number;
  reviewedCount: number;
  avgRating: number | null; // 0~5 (표시용), 리뷰 없으면 null
  topPick: LibraryItemDto | null; // 최고 별점 작품
  topCreator: { name: string; count: number } | null; // 가장 자주 만난 저자/감독
}

function pickTop(items: LibraryItemDto[]): LibraryItemDto | null {
  const rated = items.filter((i) => i.review && i.review.rating > 0);
  if (rated.length === 0) return null;
  return rated.reduce((best, cur) =>
    (cur.review?.rating ?? 0) > (best.review?.rating ?? 0) ? cur : best,
  );
}

function topCreator(items: LibraryItemDto[]): { name: string; count: number } | null {
  const counts = new Map<string, number>();
  for (const i of items) {
    if (!i.creator) continue;
    counts.set(i.creator, (counts.get(i.creator) ?? 0) + 1);
  }
  let best: { name: string; count: number } | null = null;
  for (const [name, count] of counts) {
    if (count >= 2 && (!best || count > best.count)) best = { name, count };
  }
  return best;
}

export function computeRecap(library: LibraryDto, year = new Date().getFullYear()): RecapStats {
  const all = [...library.books, ...library.movies];
  const reviewed = all.filter((i) => i.review && i.review.rating > 0);
  const avgRating =
    reviewed.length > 0
      ? reviewed.reduce((sum, i) => sum + (i.review?.rating ?? 0), 0) /
        reviewed.length /
        2 // 1~10 정수 → 0~5 별점
      : null;

  return {
    year,
    bookCount: library.books.length,
    movieCount: library.movies.length,
    totalCount: all.length,
    reviewedCount: reviewed.length,
    avgRating,
    topPick: pickTop(all),
    topCreator: topCreator(all),
  };
}
