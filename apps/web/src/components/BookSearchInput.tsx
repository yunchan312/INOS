import { useEffect, useId, useRef, useState } from 'react';
import type { SeojiBookSearchItemDto } from '@inos/types';
import { useBookSearch } from '@/hooks/useBookSearch';
import { BookCover } from '@/components/BookCover';

/** 국립중앙도서관에서 고른 책, 또는 거기 없어서 직접 적은 책 */
export type BookSelection =
  | {
      kind: 'seoji';
      isbn13: string;
      title: string;
      author: string | null;
      publisher: string | null;
      publishYear: number | null;
      coverUrl: string | null;
    }
  | { kind: 'manual'; title: string; author: string };

interface BookSearchInputProps {
  value: BookSelection | null;
  onChange: (value: BookSelection | null) => void;
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

/** 목록에 한 줄로 붙이는 부가 정보 */
function subtitleOf(item: {
  author: string | null;
  publisher: string | null;
  publishYear: number | null;
}): string {
  return (
    [item.author, item.publisher, item.publishYear].filter(Boolean).join(' · ') ||
    '정보 없음'
  );
}

export function BookSearchInput({
  value,
  onChange,
  variant = 'underline',
  label = '제목',
  placeholder = '예: 데미안',
}: BookSearchInputProps) {
  const [query, setQuery] = useState('');
  // 같은 제목의 판본이 수백 건씩 잡혀서, 저자·출판사로 좁힐 수 있게 열어둔다
  const [author, setAuthor] = useState('');
  const [publisher, setPublisher] = useState('');
  const [refineOpen, setRefineOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(-1);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const { data, isSearching, isTooShort, isError } = useBookSearch(
    { title: query, author, publisher },
    open && !value,
  );
  const results = data ?? [];
  const inputClass = variant === 'underline' ? UNDERLINE : BOXED;
  // 서버와 같은 기준 — 어느 한 항목이라도 2글자를 넘기면 검색이 돈다
  const hasCriteria = [query, author, publisher].some(
    (v) => v.trim().length >= 2,
  );

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
  useEffect(() => setCursor(-1), [results.length, query, author, publisher]);

  // 목록에 최대 높이가 생긴 뒤로는 화살표 커서가 보이지 않는 곳으로 갈 수 있다
  useEffect(() => {
    if (cursor < 0) return;
    listRef.current
      ?.querySelector(`[data-idx="${cursor}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [cursor]);

  const select = (item: SeojiBookSearchItemDto) => {
    onChange({
      kind: 'seoji',
      isbn13: item.isbn13,
      title: item.title,
      author: item.author,
      publisher: item.publisher,
      publishYear: item.publishYear,
      coverUrl: item.coverUrl,
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
            placeholder="예: 어느 소책자"
            onChange={(e) => onChange({ ...value, title: e.target.value })}
          />
        </div>
        <div>
          <label className={LABEL}>저자</label>
          <input
            type="text"
            className={inputClass}
            value={value.author}
            placeholder="예: 헤르만 헤세"
            onChange={(e) => onChange({ ...value, author: e.target.value })}
          />
          <button
            type="button"
            className="mt-1.5 text-xs text-muted underline underline-offset-2 hover:text-ink"
            onClick={() => onChange(null)}
          >
            도서 검색으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // ── 선택 완료 ──────────────────────────────────────────────
  if (value?.kind === 'seoji') {
    return (
      <div>
        <label className={LABEL}>{label}</label>
        <div className="flex items-center gap-3 border border-line rounded-card bg-surface p-3">
          <BookCover
            url={value.coverUrl}
            alt={`${value.title} 표지`}
            thin
            className="w-12 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold">{value.title}</p>
            <p className="mt-0.5 truncate text-xs text-muted">{subtitleOf(value)}</p>
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

      <div className="mt-1 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <p className="text-xs text-muted">
          {isTooShort
            ? '두 글자 이상 입력해주세요'
            : isSearching
              ? '검색 중…'
              : author.trim() || publisher.trim()
                ? '저자·출판사로 좁히는 중'
                : '제목을 입력하면 후보가 나와요'}
        </p>
        <button
          type="button"
          onClick={() => setRefineOpen((v) => !v)}
          className="text-xs text-muted underline underline-offset-2 hover:text-ink"
        >
          {refineOpen ? '상세 조건 접기' : '저자·출판사로 좁히기'}
        </button>
      </div>

      {refineOpen && (
        <div className="mt-2.5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className={LABEL}>저자 (선택)</label>
            <input
              type="text"
              className={inputClass}
              value={author}
              placeholder="예: 헤르만 헤세"
              onChange={(e) => {
                setAuthor(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <div>
            <label className={LABEL}>출판사 (선택)</label>
            <input
              type="text"
              className={inputClass}
              value={publisher}
              placeholder="예: 민음사"
              onChange={(e) => {
                setPublisher(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>
      )}

      {open && hasCriteria && (
        <div
          id={listboxId}
          role="listbox"
          className="popover-shadow absolute z-20 mt-1 w-full overflow-hidden border border-line rounded-ui bg-surface"
        >
          {/* 후보가 열 건까지 나오면 화면 밖으로 흘러서, 목록만 안에서 굴린다.
              "직접 입력하기"는 스크롤 밖에 두어 언제나 손이 닿게 한다. */}
          <div
            ref={listRef}
            className="max-h-[min(52vh,340px)] overflow-y-auto overscroll-contain"
          >
            {isError ? (
              <p className="p-3 text-xs text-danger">
                검색에 실패했어요. 아래에서 직접 입력할 수 있어요.
              </p>
            ) : results.length === 0 ? (
              <p className="p-3 text-xs text-muted">
                {isSearching
                  ? '검색 중…'
                  : author || publisher
                    ? '검색 결과가 없어요. 저자·출판사를 지우고 다시 찾아보세요'
                    : '검색 결과가 없어요'}
              </p>
            ) : (
              results.map((item, i) => (
                <button
                  key={item.isbn13}
                  type="button"
                  role="option"
                  aria-selected={i === cursor}
                  data-idx={i}
                  onMouseEnter={() => setCursor(i)}
                  onClick={() => select(item)}
                  className={`flex w-full items-center gap-3 border-b border-line p-2.5 text-left last:border-b-0 ${
                    i === cursor ? 'bg-surface' : 'bg-paper'
                  }`}
                >
                  <BookCover url={item.coverUrl} alt="" thin className="w-9 shrink-0" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">
                      {item.title}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-muted">
                      {subtitleOf(item)}
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              onChange({
                kind: 'manual',
                title: query.trim(),
                author: author.trim(),
              });
              setOpen(false);
            }}
            className="w-full border-t border-line bg-surface p-2.5 text-left text-xs font-semibold text-muted hover:text-ink"
          >
            찾는 책이 없나요? 직접 입력하기
          </button>
        </div>
      )}
    </div>
  );
}

/** 선택값을 모임 API 페이로드로 바꾼다 */
export function toBookPayload(value: BookSelection | null): {
  bookIsbn?: string;
  bookTitle?: string;
  bookAuthor?: string;
} {
  if (!value) return {};
  if (value.kind === 'seoji') return { bookIsbn: value.isbn13 };
  const title = value.title.trim();
  const author = value.author.trim();
  if (!title || !author) return {};
  return { bookTitle: title, bookAuthor: author };
}

/** 이미 저장된 모임을 편집할 때 초기값을 만든다 */
export function bookSelectionFromMeeting(meeting: {
  bookTitle: string | null;
  bookAuthor: string | null;
  bookWork: {
    isbn13: string;
    title: string;
    author: string | null;
    publisher: string | null;
    publishDate: string | null;
    coverUrl: string | null;
  } | null;
}): BookSelection | null {
  if (meeting.bookWork) {
    const w = meeting.bookWork;
    return {
      kind: 'seoji',
      isbn13: w.isbn13,
      title: w.title,
      author: w.author,
      publisher: w.publisher,
      publishYear: w.publishDate ? Number(w.publishDate.slice(0, 4)) : null,
      coverUrl: w.coverUrl,
    };
  }
  if (meeting.bookTitle) {
    return {
      kind: 'manual',
      title: meeting.bookTitle,
      author: meeting.bookAuthor ?? '',
    };
  }
  return null;
}
