import { tmdbImageUrl } from '@/lib/tmdb';
import type { TmdbPosterSize } from '@inos/types';

interface MoviePosterProps {
  path: string | null | undefined;
  alt: string;
  size?: TmdbPosterSize;
  /** 테두리 두께 — 목록의 작은 썸네일은 1px가 자연스럽다 */
  thin?: boolean;
  className?: string;
}

/**
 * TMDB 포스터. 경로가 없으면 같은 자리를 차지하는 플레이스홀더를 그려
 * 포스터 유무에 따라 레이아웃이 흔들리지 않게 한다.
 */
export function MoviePoster({
  path,
  alt,
  size = 'w185',
  thin = false,
  className = '',
}: MoviePosterProps) {
  const src = tmdbImageUrl(path, size);
  const frame = [
    'aspect-[2/3] overflow-hidden bg-surface',
    thin ? 'border border-line' : 'border border-line rounded-hair',
    className,
  ]
    .join(' ')
    .trim();

  if (!src) {
    return (
      <div className={`${frame} grid place-items-center`} aria-hidden="true">
        <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">
          no image
        </span>
      </div>
    );
  }

  return (
    <div className={frame}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="h-full w-full object-cover"
      />
    </div>
  );
}
