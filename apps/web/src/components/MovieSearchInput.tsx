import { useEffect, useId, useRef, useState } from 'react';
import type { TmdbMovieSearchItemDto } from '@inos/types';
import { useMovieSearch } from '@/hooks/useMovieSearch';
import { MoviePoster } from '@/components/MoviePoster';

/** TMDB에서 고른 영화, 또는 TMDB에 없어서 직접 적은 영화 */
export type MovieSelection =
  | {
      kind: 'tmdb';
      tmdbId: number;
      title: string;
      director: string | null;
      releaseYear: number | null;
      posterPath: string | null;
    }
  | { kind: 'manual'; title: string; director: string };

interface MovieSearchInputProps {
  value: MovieSelection | null;
  onChange: (value: MovieSelection | null) => void;
  /** 호스트 화면의 인풋 스타일에 맞춘다 */
  variant?: 'underline' | 'boxed';
  label?: string;
  placeholder?: string;
}

const UNDERLINE = 'input-underline text-sm';
const BOXED =
  'w-full box-border border border-line rounded-ui bg-surface px-3 py-2 text-sm outline-none focus:border-ink';
const LABEL =
  'block text-[11px] font-semibold uppercase tracking-[0.1em] text-muted mb-1.5';

export function MovieSearchInput({
  value,
  onChange,
  variant = 'underline',
  label = '제목',
  placeholder = '예: 오펜하이머',
}: MovieSearchInputProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(-1);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const { data, isSearching, isTooShort, isError } = useMovieSearch(
    query,
    open && !value,
  );
  const results = data ?? [];
  const inputClass = variant === 'underline' ? UNDERLINE : BOXED;

  // 바깥을 클릭하면 후보 목록을 닫는다
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  // 결과가 바뀌면 키보드 커서를 처음으로 되돌린다
  useEffect(() => setCursor(-1), [results.length, query]);

  const select = (item: TmdbMovieSearchItemDto) => {
    onChange({
      kind: 'tmdb',
      tmdbId: item.tmdbId,
      title: item.title,
      director: item.director,
      releaseYear: item.releaseYear,
      posterPath: item.posterPath,
    });
    setQuery('');
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCursor((c) => (c + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCursor((c) => (c <= 0 ? results.length - 1 : c - 1));
    } else if (e.key === 'Enter' && cursor >= 0) {
      e.preventDefault();
      select(results[cursor]);
    }
  };

  // ── 직접 입력 모드 ──────────────────────────────────────────
  if (value?.kind === 'manual') {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className={LABEL}>제목 (직접 입력)</label>
          <input
            type="text"
            className={inputClass}
            value={value.title}
            placeholder="예: 어느 독립영화"
            onChange={(e) => onChange({ ...value, title: e.target.value })}
          />
        </div>
        <div>
          <label className={LABEL}>감독</label>
          <input
            type="text"
            className={inputClass}
            value={value.director}
            placeholder="예: 홍길동"
            onChange={(e) => onChange({ ...value, director: e.target.value })}
          />
          <button
            type="button"
            className="mt-1.5 text-xs text-muted underline underline-offset-2 hover:text-ink"
            onClick={() => onChange(null)}
          >
            TMDB에서 검색하기
          </button>
        </div>
      </div>
    );
  }

  // ── 선택 완료 ──────────────────────────────────────────────
  if (value?.kind === 'tmdb') {
    return (
      <div>
        <label className={LABEL}>{label}</label>
        <div className="flex items-center gap-3 border border-line rounded-card bg-surface p-3">
          <MoviePoster
            path={value.posterPath}
            alt={`${value.title} 포스터`}
            size="w92"
            thin
            className="w-12 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold">{value.title}</p>
            <p className="mt-0.5 truncate text-xs text-muted">
              {[value.director, value.releaseYear].filter(Boolean).join(' · ') ||
                '정보 없음'}
            </p>
          </div>
          <button
            type="button"
            className="shrink-0 text-xs font-semibold text-muted underline underline-offset-2 hover:text-ink"
            onClick={() => onChange(null)}
          >
            변경
          </button>
        </div>
      </div>
    );
  }

  // ── 검색 모드 ──────────────────────────────────────────────
  return (
    <div ref={wrapRef} className="relative">
      <label className={LABEL}>{label}</label>
      <input
        type="text"
        role="combobox"
        aria-expanded={open && results.length > 0}
        aria-controls={listboxId}
        aria-autocomplete="list"
        className={inputClass}
        value={query}
        placeholder={placeholder}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
      />

      <p className="mt-1 text-xs text-muted">
        {isTooShort
          ? '두 글자 이상 입력해주세요'
          : isSearching
            ? '검색 중…'
            : '제목을 입력하면 후보가 나와요'}
      </p>

      {open && query.trim().length >= 2 && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute z-20 mt-1 w-full overflow-hidden border border-line rounded-ui bg-surface"
        >
          {isError ? (
            <p className="p-3 text-xs text-danger">
              검색에 실패했어요. 아래에서 직접 입력할 수 있어요.
            </p>
          ) : results.length === 0 ? (
            <p className="p-3 text-xs text-muted">
              {isSearching ? '검색 중…' : '검색 결과가 없어요'}
            </p>
          ) : (
            results.map((item, i) => (
              <button
                key={item.tmdbId}
                type="button"
                role="option"
                aria-selected={i === cursor}
                onMouseEnter={() => setCursor(i)}
                onClick={() => select(item)}
                className={`flex w-full items-center gap-3 border-b border-line p-2.5 text-left last:border-b-0 ${
                  i === cursor ? 'bg-surface' : 'bg-paper'
                }`}
              >
                <MoviePoster
                  path={item.posterPath}
                  alt=""
                  size="w92"
                  thin
                  className="w-9 shrink-0"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">
                    {item.title}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-muted">
                    {[item.director, item.releaseYear]
                      .filter(Boolean)
                      .join(' · ') || '정보 없음'}
                  </span>
                </span>
              </button>
            ))
          )}
          <button
            type="button"
            onClick={() => {
              onChange({ kind: 'manual', title: query.trim(), director: '' });
              setOpen(false);
            }}
            className="w-full border-t border-line bg-surface p-2.5 text-left text-xs font-semibold text-muted hover:text-ink"
          >
            찾는 영화가 없나요? 직접 입력하기
          </button>
        </div>
      )}
    </div>
  );
}

/** 선택값을 모임 API 페이로드로 바꾼다 */
export function toMoviePayload(value: MovieSelection | null): {
  movieTmdbId?: number;
  movieTitle?: string;
  movieDirector?: string;
} {
  if (!value) return {};
  if (value.kind === 'tmdb') return { movieTmdbId: value.tmdbId };
  const title = value.title.trim();
  const director = value.director.trim();
  if (!title || !director) return {};
  return { movieTitle: title, movieDirector: director };
}

/** 이미 저장된 모임을 편집할 때 초기값을 만든다 */
export function movieSelectionFromMeeting(meeting: {
  movieTitle: string | null;
  movieDirector: string | null;
  movieWork: {
    tmdbId: number;
    title: string;
    director: string | null;
    releaseDate: string | null;
    posterPath: string | null;
  } | null;
}): MovieSelection | null {
  if (meeting.movieWork) {
    const w = meeting.movieWork;
    return {
      kind: 'tmdb',
      tmdbId: w.tmdbId,
      title: w.title,
      director: w.director,
      releaseYear: w.releaseDate ? Number(w.releaseDate.slice(0, 4)) : null,
      posterPath: w.posterPath,
    };
  }
  if (meeting.movieTitle) {
    return {
      kind: 'manual',
      title: meeting.movieTitle,
      director: meeting.movieDirector ?? '',
    };
  }
  return null;
}
