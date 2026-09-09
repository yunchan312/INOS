import type { ShowcaseBookDto, ShowcaseMovieDto } from '@inos/types';
import { useShowcase } from '@/hooks/useShowcase';
import { tmdbImageUrl } from '@/lib/tmdb';
import { pickSpineHeight, pickSpineWidth } from '@/components/library/libraryPalette';
import {
  spineStyleAt,
  textureLayer,
  type SpineRule,
} from '@/components/library/spineStyles';
import { useShelfFonts } from '@/hooks/useShelfFonts';

// 랜딩에서는 실제 서가보다 한 뼘 낮게 세운다 — 섹션 안에 들어가야 하므로
const SHELF_SCALE = 0.78;
const PER_CHAR = 14;
const CHROME = 34;

/** 실제 서가와 같은 두 줄 선반 — 위는 판, 아래는 그림자 */
function ShelfBoard() {
  return (
    <>
      <div className="h-px bg-shelf" />
      <div className="mx-1.5 h-px bg-shelf-shadow" />
    </>
  );
}

/** 책등을 가로지르는 장정 띠 — 스타일마다 개수와 위치가 다르다 */
function SpineRules({ rule, ink }: { rule: SpineRule; ink: string }) {
  if (rule === 'none' || rule === 'panel' || rule === 'band') return null;
  const line = (
    <span
      className="block h-px w-full shrink-0"
      style={{ backgroundColor: ink, opacity: 0.5 }}
    />
  );
  return (
    <span className="flex w-full shrink-0 flex-col gap-[3px] px-1.5">
      {line}
      {rule === 'double' && line}
    </span>
  );
}

/**
 * 랜딩용 책등. 30벌의 스타일 프리셋 중 제목 해시로 하나를 골라 입힌다 —
 * 서체·명도·장정 띠·질감·바닥 마크가 전부 달라서, 선반에 꽂아두면
 * 같은 틀에서 찍어낸 블록이 아니라 제각각인 책으로 읽힌다.
 *
 * 여기 꽂힌 책은 누군가의 기록이 아니라 "이렇게 생겼어요"라는 예시라
 * 클릭도 별점도 없다.
 */
function ShowcaseSpine({ book, index }: { book: ShowcaseBookDto; index: number }) {
  const seed = book.title;
  const style = spineStyleAt(index);
  const width = Math.round(pickSpineWidth(seed) * SHELF_SCALE);
  const base = Math.round(pickSpineHeight(seed) * SHELF_SCALE);
  const needed = book.title.length * PER_CHAR + CHROME;
  const height = Math.max(base, Math.min(240, needed));

  const availChars = Math.floor((height - CHROME) / PER_CHAR);
  const title =
    book.title.length > availChars
      ? `${book.title.slice(0, Math.max(1, availChars - 1))}…`
      : book.title;

  const texture = textureLayer(style.texture);

  return (
    <div
      className={`relative flex shrink-0 flex-col items-center justify-between box-border overflow-hidden border border-line px-1 pt-2 pb-1.5 ${
        style.round ? 'rounded-t-ui rounded-b-hair' : 'rounded-hair'
      }`}
      style={{ width, height, backgroundColor: style.bg, color: style.ink }}
      title={book.author ? `${book.title} — ${book.author}` : book.title}
    >
      {texture && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ backgroundImage: texture }}
        />
      )}

      {/* 위쪽 장정 띠. band는 띠 대신 면으로 채운다 */}
      {style.rule === 'band' ? (
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-5"
          style={{ backgroundColor: style.ink, opacity: 0.14 }}
        />
      ) : (
        <SpineRules rule={style.rule} ink={style.ink} />
      )}

      {/* 제목 판(panel)이면 안쪽에 테두리를 두른다 */}
      <span
        className={`relative flex min-h-0 flex-1 items-center justify-center ${
          style.rule === 'panel' ? 'my-1.5 w-full border px-0.5' : ''
        }`}
        style={
          style.rule === 'panel'
            ? { borderColor: style.ink, opacity: 0.95 }
            : undefined
        }
      >
        <span
          className="[writing-mode:vertical-rl] overflow-hidden whitespace-nowrap"
          style={{
            fontFamily: style.font,
            fontWeight: style.weight,
            fontSize: style.size,
            letterSpacing: style.tracking,
            lineHeight: 1,
          }}
        >
          {title}
        </span>
      </span>

      {/* 아래쪽 띠와 출판사 마크 자리 */}
      {style.rule !== 'top' && style.rule !== 'band' && (
        <SpineRules rule={style.rule} ink={style.ink} />
      )}
      <span
        className="relative mt-1 shrink-0 text-[9px] leading-none"
        style={{ opacity: 0.55 }}
        aria-hidden="true"
      >
        {style.foot}
      </span>
    </div>
  );
}

/** 포스터가 없으면 제목을 앉힌 활자 액자로 — 깨진 이미지 대신 읽히는 면 */
function ShowcasePoster({ movie }: { movie: ShowcaseMovieDto }) {
  const src = tmdbImageUrl(movie.posterPath, 'w342');

  return (
    <figure className="w-[104px] shrink-0 sm:w-[124px]">
      <div className="flex aspect-[2/3] items-end overflow-hidden rounded-ui border border-line bg-surface-2">
        {src ? (
          <img
            src={src}
            alt={`${movie.title} 포스터`}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          // 액자는 작품이 아니라 UI 면이다 — on-art(고정 검정)를 쓰면 다크에서 사라진다
          <span className="p-3 text-[15px] leading-[1.35] font-bold tracking-[-0.02em] break-keep text-muted-2">
            {movie.title}
          </span>
        )}
      </div>
      <figcaption className="mt-2.5 flex items-baseline gap-2">
        {/* 포스터가 없을 때는 액자가 이미 제목을 말한다 — 캡션에서 한 번 더 쓰지 않는다 */}
        {src && (
          <p className="min-w-0 truncate text-[13px] font-semibold">
            {movie.title}
          </p>
        )}
        {movie.releaseYear && (
          <p className="shrink-0 text-[11px] tabular-nums text-muted">
            {movie.releaseYear}
          </p>
        )}
      </figcaption>
    </figure>
  );
}

/**
 * 랜딩 한가운데의 서가 미리보기.
 * 책은 큐레이션 목록이 그대로 서고, 영화만 서버에서 받아온다(실패하면 폴백).
 */
export function ShelfShowcase() {
  const { books, movies, isMovieFallback } = useShowcase();
  // 서가가 화면에 들어올 때 책등 서체 30벌을 불러온다
  const shelfRef = useShelfFonts(books.map((b) => b.title));

  return (
    <div>
      <p className="text-[11px] font-semibold tracking-[0.16em] text-muted">
        03 · 서가
      </p>
      <h2 className="mt-4 max-w-[20ch] text-[clamp(26px,4vw,40px)] font-bold leading-[1.18] tracking-[-0.035em] break-keep">
        읽고 본 것이 그대로 서가가 돼요
      </h2>
      <p className="mt-4 max-w-[46ch] text-[15px] leading-[1.75] font-light text-muted-2 break-keep">
        모임이 끝나면 그날의 작품이 서가에 한 권씩 꽂혀요. 별점과 한 줄 평을
        남기면 내 서가와 모임의 서가가 함께 쌓이고, 링크 하나로 서가를 통째로
        보여줄 수도 있어요.
      </p>

      {/* 책 — 실제 서가 화면과 같은 책등·선반 */}
      <div
        ref={shelfRef}
        className="mt-10 rounded-card border border-line bg-surface px-5 pt-6 pb-5 sm:px-7"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-muted">
            서가 미리보기
          </p>
          <p className="text-[11px] text-muted">
            인문학 모임이 자주 고르는 책
          </p>
        </div>

        <div className="-mx-1 mt-7 overflow-x-auto overflow-y-hidden pb-1">
          <div className="min-w-max">
            <div className="flex items-end gap-1.5 px-3">
              {books.map((book, i) => (
                <ShowcaseSpine key={book.title} book={book} index={i} />
              ))}
            </div>
            <ShelfBoard />
          </div>
        </div>

        <p className="mt-3 px-1 text-xs font-light text-muted break-keep">
          책등을 누르면 그때 남긴 별점과 한 줄 평이 열려요.
        </p>
      </div>

      {/* 영화 — 표지와 포스터만이 색을 갖는다 */}
      <div className="mt-4 rounded-card border border-line bg-surface px-5 pt-6 pb-6 sm:px-7">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-muted">
            함께 본 영화
          </p>
          <p className="text-[11px] text-muted">
            {isMovieFallback
              ? '모임에서 자주 고르는 영화'
              : '요즘 가장 많이 보는 영화'}
          </p>
        </div>

        <div className="-mx-1 mt-6 overflow-x-auto pb-1">
          <ul className="flex min-w-max gap-3 px-1">
            {movies.map((movie) => (
              <li key={`${movie.tmdbId}-${movie.title}`}>
                <ShowcasePoster movie={movie} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
