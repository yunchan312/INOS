import { isRouteErrorResponse, useRouteError } from 'react-router-dom';
import { ErrorPage } from './ErrorPage';

/**
 * react-router 의 errorElement 로 사용된다.
 * 라우트 렌더링 / lazy 로딩 / loader 에서 발생한 에러를 표시한다.
 */
export default function RouteErrorPage() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <ErrorPage
        code={String(error.status)}
        title={error.status === 404 ? '페이지를 찾을 수 없어요' : '문제가 발생했어요'}
        description={
          error.status === 404
            ? '요청하신 페이지가 존재하지 않거나 이동되었어요.'
            : error.statusText || '잠시 후 다시 시도해 주세요.'
        }
        onRetry={() => window.location.reload()}
      />
    );
  }

  const detail =
    error instanceof Error ? `${error.name}: ${error.message}` : undefined;

  return (
    <ErrorPage
      onRetry={() => window.location.reload()}
      detail={detail}
    />
  );
}
