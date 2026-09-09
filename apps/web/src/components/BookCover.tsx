interface BookCoverProps {
  url: string | null | undefined;
  alt: string;
  /** 테두리 두께 — 목록의 작은 썸네일은 1px가 자연스럽다 */
  thin?: boolean;
  className?: string;
}

/**
 * 책 표지. 국중도 서지정보는 표지 URL이 비어 있는 경우가 대부분이라
 * 플레이스홀더가 사실상 기본값이다 — 같은 자리를 차지해서 표지 유무로
 * 목록이 흔들리지 않게 한다. (영화 쪽 MoviePoster와 같은 규칙)
 */
export function BookCover({ url, alt, thin = false, className = '' }: BookCoverProps) {
  const frame = [
    'aspect-[2/3] overflow-hidden bg-surface',
    thin ? 'border border-line' : 'border border-line rounded-hair',
    className,
  ]
    .join(' ')
    .trim();

  if (!url) {
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
      <img src={url} alt={alt} loading="lazy" className="h-full w-full object-cover" />
    </div>
  );
}
