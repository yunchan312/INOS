import type { RecapStats } from './libraryRecap';
import { StarRating, formatRating } from './StarRating';

// 스크린샷해서 공유하기 좋은 '올해의 서재' 결산 카드.
export function LibraryRecapCard({ stats }: { stats: RecapStats }) {
  return (
    <div className="mx-auto w-full max-w-[420px] border-2 border-ink bg-surface">
      {/* 노랑 헤더 */}
      <div className="bg-point px-6 py-7 text-on-accent">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em]">
          INOS · {stats.year} 결산
        </p>
        <h2 className="mt-2 text-[32px] font-extrabold leading-[1.1] tracking-tight">
          올해의 서재
        </h2>
        <p className="mt-1.5 text-[13px] font-medium opacity-80">
          함께 읽고 본 {stats.totalCount}개의 이야기
        </p>
      </div>

      {/* 숫자 */}
      <div className="grid grid-cols-3 divide-x-2 divide-ink border-b-2 border-ink text-center">
        <div className="px-2 py-5">
          <p className="text-[28px] font-extrabold leading-none">{stats.bookCount}</p>
          <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">책</p>
        </div>
        <div className="px-2 py-5">
          <p className="text-[28px] font-extrabold leading-none">{stats.movieCount}</p>
          <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">영화</p>
        </div>
        <div className="px-2 py-5">
          <p className="text-[28px] font-extrabold leading-none">
            {stats.avgRating != null ? stats.avgRating.toFixed(1) : '—'}
          </p>
          <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">평균 별점</p>
        </div>
      </div>

      {/* 최애 작품 */}
      {stats.topPick && (
        <div className="border-b-2 border-ink px-6 py-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
            올해의 최애
          </p>
          <div className="mt-2 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[18px] font-extrabold">{stats.topPick.title}</p>
              {stats.topPick.creator && (
                <p className="mt-0.5 text-[12px] text-muted">{stats.topPick.creator}</p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <StarRating value={stats.topPick.review?.rating ?? 0} sizePx={13} />
              <span className="text-[12px] font-extrabold">
                {formatRating(stats.topPick.review?.rating ?? 0)}
              </span>
            </div>
          </div>
          {stats.topPick.review?.comment && (
            <p className="mt-2 text-[13px] italic leading-[1.5] text-muted-2">
              “{stats.topPick.review.comment}”
            </p>
          )}
        </div>
      )}

      {/* 최다 저자/감독 + 푸터 */}
      <div className="flex items-center justify-between gap-3 px-6 py-4">
        <span className="text-[12px] text-muted">
          {stats.topCreator
            ? `가장 자주 만난 ${stats.topCreator.name} (${stats.topCreator.count})`
            : '올해도 좋은 이야기와 함께'}
        </span>
        <span className="text-[11px] font-bold uppercase tracking-[0.14em]">INOS</span>
      </div>
    </div>
  );
}
