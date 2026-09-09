import type { LibraryItemDto } from '@inos/types';
import { formatRating } from './StarRating';
import { pickSpineHeight, pickSpineWidth } from './libraryPalette';
import { SpineFace } from './SpineFace';
import type { SpineStyle } from './spineStyles';

// 세로쓰기 글자당 높이(px)와 패딩+별점 배지 영역 — 디자인 시안의 상수
const PER_CHAR = 15;
const CHROME = 52;
const MAX_HEIGHT = 300;

interface BookSpineProps {
  item: LibraryItemDto;
  /** 선반이 정해준 30벌 중 한 벌 — 이웃과 겹치지 않게 골라서 내려온다 */
  style: SpineStyle;
  isEditing: boolean;
  onClick: () => void;
}

export function BookSpine({ item, style, isEditing, onClick }: BookSpineProps) {
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

  // 버튼(히트 영역)은 고정하고 내부만 움직여서, hover 시 요소가 커서를 벗어나며
  // hover가 풀렸다 걸렸다 반복하는 끊김(지터)을 방지한다.
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative shrink-0 cursor-pointer"
      style={{ width, height }}
    >
      <SpineFace
        style={style}
        title={spineTitle}
        trailing={
          spineAuthor ? (
            <span className="font-normal opacity-70">{spineAuthor}</span>
          ) : undefined
        }
        foot={
          // 바닥은 출판사 마크 대신 별점이 가진다 — 서재에서 제일 자주 보는 값이다
          <span className="relative mt-1 shrink-0 whitespace-nowrap text-[10px] leading-none font-bold">
            {item.review ? `★${formatRating(item.review.rating)}` : '—'}
          </span>
        }
        className={[
          'transition-transform duration-150 ease-out will-change-transform',
          'group-hover:-translate-y-2.5',
          isEditing ? '-translate-y-2.5' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      />
    </button>
  );
}
