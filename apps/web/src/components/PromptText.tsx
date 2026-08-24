// 발제문 본문 렌더러 — 문장 단위로 줄을 나눠 읽기 쉽게 보여준다.
// 문장 끝(.?! 및 전각) 뒤에서 끊되, 소수점(3.5)·연속 문장부호(...)·
// 닫는 따옴표 앞에서는 끊지 않는다.
const SENTENCE_BREAK = /(?<=[.?!。？！])(?![.?!。？！"'”’)\]])(?!\d)\s*/;

export function toPromptLines(content: string): string[] {
  return content
    .split('\n') // 사용자가 직접 넣은 줄바꿈이 우선
    .flatMap((line) => line.split(SENTENCE_BREAK))
    .map((line) => line.trim())
    .filter(Boolean);
}

interface PromptTextProps {
  content: string;
  /** 크기·색 등 표시 스타일 (개행 처리는 이 컴포넌트가 담당) */
  className?: string;
}

export function PromptText({ content, className = '' }: PromptTextProps) {
  const lines = toPromptLines(content);

  return (
    <p className={`break-keep break-words ${className}`}>
      {lines.map((line, i) => (
        // p 안에서도 유효하도록 div가 아닌 span에 block 적용
        <span key={i} className="block">
          {line}
        </span>
      ))}
    </p>
  );
}
