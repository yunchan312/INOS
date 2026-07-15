// 별점 표시/입력 — 디자인 시안의 ★★★★★ 오버레이 방식.
// value 는 서버 저장 단위인 1~10 정수(반 개 = 1)를 그대로 사용한다.

export function formatRating(value: number): string {
  const stars = value / 2;
  return stars % 1 === 0 ? `${stars}.0` : `${stars}`;
}

interface StarRatingProps {
  value: number; // 1~10
  sizePx?: number;
}

export function StarRating({ value, sizePx = 12 }: StarRatingProps) {
  const pct = Math.max(0, Math.min(100, (value / 10) * 100));
  return (
    <span
      className="relative inline-block leading-none tracking-[1px] text-ink/30 select-none"
      style={{ fontSize: sizePx }}
      aria-label={`별점 ${formatRating(value)}점`}
    >
      ★★★★★
      <span
        className="absolute left-0 top-0 overflow-hidden whitespace-nowrap text-ink"
        aria-hidden="true"
        style={{ width: `${pct}%` }}
      >
        ★★★★★
      </span>
    </span>
  );
}

interface StarRatingInputProps {
  value: number; // 0~10
  onChange: (value: number) => void;
  sizePx?: number;
}

export function StarRatingInput({ value, onChange, sizePx = 30 }: StarRatingInputProps) {
  return (
    <div className="flex gap-0.5" role="group" aria-label="별점 선택">
      {[1, 2, 3, 4, 5].map((i) => {
        const fillPct = Math.max(0, Math.min(1, value / 2 - (i - 1))) * 100;
        return (
          <span
            key={i}
            className="relative leading-none text-line select-none"
            style={{ fontSize: sizePx }}
          >
            ★
            <span
              className="absolute left-0 top-0 overflow-hidden whitespace-nowrap"
              aria-hidden="true"
              style={{ width: `${fillPct}%` }}
            >
              <span className="text-ink">★</span>
            </span>
            <button
              type="button"
              onClick={() => onChange((i - 1) * 2 + 1)}
              aria-label={`${i - 0.5}점`}
              className="absolute left-0 top-0 h-full w-1/2 cursor-pointer"
            />
            <button
              type="button"
              onClick={() => onChange(i * 2)}
              aria-label={`${i}점`}
              className="absolute right-0 top-0 h-full w-1/2 cursor-pointer"
            />
          </span>
        );
      })}
    </div>
  );
}
