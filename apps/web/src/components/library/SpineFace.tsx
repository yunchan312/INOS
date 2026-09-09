import type { ReactNode } from 'react';
import { textureLayer, type SpineRule, type SpineStyle } from './spineStyles';

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

interface SpineFaceProps {
  style: SpineStyle;
  /** 이미 잘라 넣은 제목 — 자르는 규칙은 선반마다 높이가 달라서 호출 쪽이 가진다 */
  title: string;
  /** 제목 뒤에 이어 붙는 저자 등 (세로쓰기 같은 줄) */
  trailing?: ReactNode;
  /** 바닥에 놓을 것. 없으면 출판사 마크가 들어간다 */
  foot?: ReactNode;
  className?: string;
}

/**
 * 책등의 겉면. 랜딩 미리보기와 실제 서재가 이걸 같이 쓴다 —
 * 한쪽만 손보면 두 서가가 다르게 보이던 문제를 여기서 막는다.
 *
 * 크기(width/height)와 클릭 동작은 바깥이 정한다. 이 컴포넌트는 면만 그린다.
 */
export function SpineFace({ style, title, trailing, foot, className }: SpineFaceProps) {
  const texture = textureLayer(style.texture);

  return (
    <span
      className={[
        'relative flex h-full w-full flex-col items-center justify-between',
        'box-border overflow-hidden border border-line px-1 pt-2 pb-1.5',
        style.round ? 'rounded-t-ui rounded-b-hair' : 'rounded-hair',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ backgroundColor: style.bg, color: style.ink }}
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
          style.rule === 'panel' ? { borderColor: style.ink, opacity: 0.95 } : undefined
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
          {trailing}
        </span>
      </span>

      {/* 아래쪽 띠와 바닥 자리 — 서재는 여기에 별점이 들어간다 */}
      {style.rule !== 'top' && style.rule !== 'band' && (
        <SpineRules rule={style.rule} ink={style.ink} />
      )}
      {foot ?? (
        <span
          className="relative mt-1 shrink-0 text-[9px] leading-none"
          style={{ opacity: 0.55 }}
          aria-hidden="true"
        >
          {style.foot}
        </span>
      )}
    </span>
  );
}
