import type { MeetingDto } from '@inos/types';
import { tmdbImageUrl } from '@/lib/tmdb';

interface WorkCoverProps {
  meeting: MeetingDto;
  /** 너비만 지정한다 — 높이는 2:3 비율로 따라온다 */
  className?: string;
  rounded?: string;
}

/**
 * 모임 작품의 표지. 영화 포스터 > 책 표지 > 빈 판 순으로 고른다.
 * 2안의 "색은 작품에만" 규칙에 따라, 여기가 화면에서 색을 갖는 유일한 자리다.
 * 이미지가 없어도 같은 자리를 차지해 목록의 세로선이 흔들리지 않는다.
 */
export function WorkCover({
  meeting,
  className = 'w-[76px]',
  rounded = 'rounded-hair',
}: WorkCoverProps) {
  const src =
    tmdbImageUrl(meeting.movieWork?.posterPath, 'w185') ??
    meeting.bookWork?.coverUrl ??
    null;
  const alt = meeting.movieWork
    ? `${meeting.movieWork.title} 포스터`
    : meeting.bookWork
      ? `${meeting.bookWork.title} 표지`
      : '';

  const frame = `aspect-[2/3] shrink-0 overflow-hidden border border-line bg-surface-2 ${rounded} ${className}`;

  if (!src) return <div className={frame} aria-hidden="true" />;

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
