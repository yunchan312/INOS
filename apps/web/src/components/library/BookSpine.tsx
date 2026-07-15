import type { LibraryItemDto } from '@inos/types';
import { formatRating } from './StarRating';
import { pickSpineColor, pickSpineHeight, pickSpineWidth } from './libraryPalette';

// 세로쓰기 글자당 높이(px)와 패딩+별점 배지 영역 — 디자인 시안의 상수
const PER_CHAR = 15;
const CHROME = 52;
const MAX_HEIGHT = 300;

interface BookSpineProps {
  item: LibraryItemDto;
  isEditing: boolean;
  onClick: () => void;
}

export function BookSpine({ item, isEditing, onClick }: BookSpineProps) {
  const color = pickSpineColor(item.meetingId);
  const width = pickSpineWidth(item.meetingId);

  // 제목이 길면 책등을 키우고, 그래도 넘치면 말줄임
  let height = pickSpineHeight(item.meetingId);
  const needed = item.title.length * PER_CHAR + CHROME;
  if (needed > height) height = Math.min(MAX_HEIGHT, needed);
  const availChars = Math.floor((height - CHROME) / PER_CHAR);

  let spineTitle = item.title;
  let spineAuthor = item.creator ? ` — ${item.creator}` : '';
  if (spineTitle.length > availChars) {
    spineTitle = spineTitle.slice(0, Math.max(1, availChars - 1)) + '…';
    spineAuthor = '';
  } else if (spineTitle.length + spineAuthor.length > availChars) {
    const room = availChars - spineTitle.length;
    spineAuthor = room >= 5 ? spineAuthor.slice(0, room - 1) + '…' : '';
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'relative flex shrink-0 cursor-pointer flex-col items-center justify-end box-border px-1 pt-3.5 pb-2.5',
        'border-2 border-ink text-ink transition-[transform,box-shadow] duration-150',
        'hover:-translate-y-2.5 hover:shadow-[0_6px_0_rgba(32,30,29,0.18)]',
        isEditing ? '-translate-y-2.5 shadow-[0_6px_0_rgba(32,30,29,0.18)]' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ width, height, backgroundColor: color }}
    >
      <span className="[writing-mode:vertical-rl] flex-1 min-h-0 overflow-hidden whitespace-nowrap text-[13px] font-bold tracking-[0.01em]">
        {spineTitle}
        {spineAuthor && <span className="font-normal opacity-70">{spineAuthor}</span>}
      </span>
      <span className="mt-2 shrink-0 whitespace-nowrap text-[10px] font-extrabold">
        {item.review ? `★${formatRating(item.review.rating)}` : '—'}
      </span>
    </button>
  );
}
