import { Button } from '@/components/Button';

interface ErrorPageProps {
  /** 큰 제목 (기본: "문제가 발생했어요") */
  title?: string;
  /** 부가 설명 문구 */
  description?: string;
  /** 상단에 표시할 코드/상태 (예: 404, 500) */
  code?: string;
  /** "다시 시도" 버튼 동작. 없으면 버튼 숨김 */
  onRetry?: () => void;
  /** "홈으로" 버튼 표시 여부 (기본 true) */
  showHome?: boolean;
  /** 개발 모드에서만 노출되는 상세 메시지 */
  detail?: string;
}

export function ErrorPage({
  title = '문제가 발생했어요',
  description = '잠시 후 다시 시도해 주세요. 문제가 계속되면 관리자에게 문의해 주세요.',
  code,
  onRetry,
  showHome = true,
  detail,
}: ErrorPageProps) {
  const isDev = import.meta.env.DEV;

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center bg-paper px-6 pt-safe pb-safe">
      <div className="w-full max-w-sm text-center page-enter">
        {code && (
          <p className="text-5xl font-extrabold tracking-tight text-line">
            {code}
          </p>
        )}
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight">
          {title}
        </h1>
        <p className="mt-3 text-sm text-muted">{description}</p>

        {isDev && detail && (
          <pre className="mt-6 max-h-40 overflow-auto border-2 border-ink bg-white p-3 text-left text-xs text-danger whitespace-pre-wrap break-words">
            {detail}
          </pre>
        )}

        <div className="mt-10 flex flex-col gap-3">
          {onRetry && (
            <Button fullWidth size="lg" variant="primary" onClick={onRetry}>
              다시 시도
            </Button>
          )}
          {showHome && (
            <Button
              fullWidth
              size="lg"
              variant="outline"
              onClick={() => {
                window.location.href = '/';
              }}
            >
              홈으로 가기
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}
