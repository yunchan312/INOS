import { useRef, useState } from 'react';
import { Markdown } from './Markdown';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
}

interface ToolbarAction {
  label: string;
  title: string;
  /** 선택 영역을 감싸기 (앞, 뒤, 선택 없을 때 넣을 예시 텍스트) */
  wrap?: [string, string, string];
  /** 선택된 각 줄 앞에 붙이기 (번호 목록은 'number') */
  linePrefix?: string | 'number';
}

const ACTIONS: ToolbarAction[] = [
  { label: 'H1', title: '큰 제목', linePrefix: '# ' },
  { label: 'H2', title: '중간 제목', linePrefix: '## ' },
  { label: 'H3', title: '작은 제목', linePrefix: '### ' },
  { label: 'B', title: '굵게', wrap: ['**', '**', '굵은 글씨'] },
  { label: 'I', title: '기울임', wrap: ['*', '*', '기울인 글씨'] },
  { label: '형광', title: '하이라이트 (포인트 색)', wrap: ['==', '==', '강조할 문구'] },
  { label: '•', title: '불릿 목록', linePrefix: '- ' },
  { label: '1.', title: '번호 목록', linePrefix: 'number' },
  { label: '❝', title: '콜아웃', linePrefix: '> ' },
  { label: '🔗', title: '링크', wrap: ['[', '](https://)', '링크 텍스트'] },
];

// 마크다운을 몰라도 버튼으로 스타일을 적용할 수 있는 에디터 (작성/미리보기 탭)
export function MarkdownEditor({
  value,
  onChange,
  placeholder,
  maxLength = 10000,
}: MarkdownEditorProps) {
  const [tab, setTab] = useState<'write' | 'preview'>('write');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const applyAction = (action: ToolbarAction) => {
    const el = textareaRef.current;
    if (!el) return;
    const { selectionStart: start, selectionEnd: end } = el;
    let next = value;
    let cursorStart = start;
    let cursorEnd = end;

    if (action.wrap) {
      const [before, after, fallback] = action.wrap;
      const selected = value.slice(start, end) || fallback;
      next = value.slice(0, start) + before + selected + after + value.slice(end);
      cursorStart = start + before.length;
      cursorEnd = cursorStart + selected.length;
    } else if (action.linePrefix) {
      // 선택 영역이 걸친 줄 전체에 접두사 적용
      const lineStart = value.lastIndexOf('\n', start - 1) + 1;
      const lineEndIdx = value.indexOf('\n', end);
      const lineEnd = lineEndIdx === -1 ? value.length : lineEndIdx;
      const segment = value.slice(lineStart, lineEnd);
      const prefixed = segment
        .split('\n')
        .map((line, idx) =>
          action.linePrefix === 'number' ? `${idx + 1}. ${line}` : `${action.linePrefix}${line}`,
        )
        .join('\n');
      next = value.slice(0, lineStart) + prefixed + value.slice(lineEnd);
      cursorStart = lineStart;
      cursorEnd = lineStart + prefixed.length;
    }

    onChange(next.slice(0, maxLength));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(cursorStart, cursorEnd);
    });
  };

  return (
    <div className="border-2 border-ink">
      {/* 탭 + 툴바 */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-ink bg-surface px-2 py-1.5">
        <div className="flex items-center gap-1">
          {ACTIONS.map((a) => (
            <button
              key={a.label}
              type="button"
              title={a.title}
              aria-label={a.title}
              onClick={() => applyAction(a)}
              disabled={tab === 'preview'}
              className="flex h-7 min-w-7 items-center justify-center px-1.5 text-xs font-bold text-ink hover:bg-point/40 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {a.label}
            </button>
          ))}
        </div>
        <div className="flex items-center">
          {(['write', 'preview'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={[
                'px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.1em]',
                tab === t ? 'bg-ink text-paper' : 'text-muted hover:text-ink',
              ].join(' ')}
            >
              {t === 'write' ? '작성' : '미리보기'}
            </button>
          ))}
        </div>
      </div>

      {tab === 'write' ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
          placeholder={placeholder}
          rows={12}
          className="block w-full box-border resize-y bg-paper px-3.5 py-3 text-[15px] leading-relaxed outline-none"
        />
      ) : (
        <div className="min-h-[288px] px-3.5 py-3">
          {value.trim() ? (
            <Markdown content={value} />
          ) : (
            <p className="text-sm text-muted">미리볼 내용이 없어요.</p>
          )}
        </div>
      )}

      <div className="border-t border-line px-3 py-1.5 text-right text-[11px] text-muted">
        {value.length.toLocaleString()}/{maxLength.toLocaleString()}
      </div>
    </div>
  );
}
