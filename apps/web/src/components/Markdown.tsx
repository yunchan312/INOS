import { type ReactNode } from 'react';

// 게시판용 경량 마크다운 렌더러 — 외부 의존성 없이 서비스가 지원하는 문법만 처리.
// 지원: # ## ### 헤더, - 불릿, 1. 번호 목록, > 콜아웃, **굵게**, *기울임*,
// ==하이라이트(포인트 색)==, [텍스트](http/https 링크)
// 원문을 React 노드로만 변환하므로 raw HTML 삽입(XSS)이 불가능하다.

const INLINE_PATTERN =
  /(\*\*[^*\n]+\*\*|\*[^*\n]+\*|==[^=\n]+==|\[[^\]\n]+\]\(https?:\/\/[^)\s]+\))/g;

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let i = 0;

  for (const m of text.matchAll(INLINE_PATTERN)) {
    const index = m.index ?? 0;
    if (index > last) nodes.push(text.slice(last, index));
    const token = m[0];
    const key = `${keyPrefix}-${i++}`;

    if (token.startsWith('**')) {
      nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith('==')) {
      nodes.push(
        <mark key={key} className="bg-point px-0.5 text-on-accent">
          {token.slice(2, -2)}
        </mark>,
      );
    } else if (token.startsWith('[')) {
      const label = token.slice(1, token.indexOf(']'));
      const url = token.slice(token.indexOf('(') + 1, -1);
      nodes.push(
        <a
          key={key}
          href={url}
          target="_blank"
          rel="noreferrer noopener"
          className="font-semibold underline decoration-2 underline-offset-2 hover:text-muted-2"
        >
          {label}
        </a>,
      );
    } else {
      nodes.push(<em key={key}>{token.slice(1, -1)}</em>);
    }
    last = index + token.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function Markdown({ content }: { content: string }) {
  const lines = content.split('\n');
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;

  const collectWhile = (test: (line: string) => boolean): string[] => {
    const out: string[] = [];
    while (i < lines.length && test(lines[i])) {
      out.push(lines[i]);
      i++;
    }
    return out;
  };

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i++;
      continue;
    }

    if (line.startsWith('### ')) {
      blocks.push(
        <h3 key={key} className="mt-4 text-lg font-bold tracking-tight break-keep">
          {renderInline(line.slice(4), `h3-${key}`)}
        </h3>,
      );
      i++;
    } else if (line.startsWith('## ')) {
      blocks.push(
        <h2 key={key} className="mt-5 text-xl font-extrabold tracking-tight break-keep">
          {renderInline(line.slice(3), `h2-${key}`)}
        </h2>,
      );
      i++;
    } else if (line.startsWith('# ')) {
      blocks.push(
        <h1 key={key} className="mt-5 text-2xl font-extrabold tracking-tight break-keep">
          {renderInline(line.slice(2), `h1-${key}`)}
        </h1>,
      );
      i++;
    } else if (/^[-*] /.test(line)) {
      const items = collectWhile((l) => /^[-*] /.test(l));
      blocks.push(
        <ul key={key} className="list-disc space-y-1 pl-5 marker:text-ink">
          {items.map((item, j) => (
            <li key={j}>{renderInline(item.slice(2), `ul-${key}-${j}`)}</li>
          ))}
        </ul>,
      );
    } else if (/^\d+\. /.test(line)) {
      const items = collectWhile((l) => /^\d+\. /.test(l));
      blocks.push(
        <ol key={key} className="list-decimal space-y-1 pl-5 marker:font-bold marker:text-ink">
          {items.map((item, j) => (
            <li key={j}>
              {renderInline(item.replace(/^\d+\. /, ''), `ol-${key}-${j}`)}
            </li>
          ))}
        </ol>,
      );
    } else if (line.startsWith('> ')) {
      const rows = collectWhile((l) => l.startsWith('> '));
      blocks.push(
        <div
          key={key}
          className="border-2 border-ink bg-surface px-4 py-3 text-sm leading-relaxed"
        >
          {rows.map((row, j) => (
            <p key={j} className={j > 0 ? 'mt-1.5' : ''}>
              {renderInline(row.slice(2), `q-${key}-${j}`)}
            </p>
          ))}
        </div>,
      );
    } else {
      const rows = collectWhile(
        (l) =>
          !!l.trim() &&
          !l.startsWith('# ') &&
          !l.startsWith('## ') &&
          !l.startsWith('### ') &&
          !/^[-*] /.test(l) &&
          !/^\d+\. /.test(l) &&
          !l.startsWith('> '),
      );
      blocks.push(
        <p key={key} className="leading-relaxed break-keep">
          {rows.map((row, j) => (
            <span key={j}>
              {j > 0 && <br />}
              {renderInline(row, `p-${key}-${j}`)}
            </span>
          ))}
        </p>,
      );
    }
    key++;
  }

  return <div className="space-y-3 text-[15px]">{blocks}</div>;
}
