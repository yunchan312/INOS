import ReactMarkdown from 'react-markdown';

interface Props {
  text: string;
  isDone: boolean;
}

export function StreamingText({ text, isDone }: Props) {
  return (
    <div className="prose-discussion">
      <ReactMarkdown
        components={{
          ol: ({ children }) => <ol>{children}</ol>,
          h2: ({ children }) => (
            <h2
              style={{ fontFamily: "'Noto Serif KR', Georgia, serif" }}
            >
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3
              className="text-base font-semibold mt-6 mb-2"
              style={{ fontFamily: "'Noto Serif KR', Georgia, serif", color: 'oklch(18% 0.003 80)' }}
            >
              {children}
            </h3>
          ),
          p: ({ children }) => <p>{children}</p>,
          strong: ({ children }) => (
            <strong style={{ fontWeight: 700, color: 'oklch(18% 0.003 80)' }}>
              {children}
            </strong>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
      {!isDone && <span className="cursor-blink" aria-hidden="true" />}
    </div>
  );
}
