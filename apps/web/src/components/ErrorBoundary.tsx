import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ErrorPage } from '@/pages/error/ErrorPage';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * 렌더링 중 발생한 예외를 잡아 에러 화면을 보여준다.
 * React 에러 바운더리는 클래스 컴포넌트로만 구현할 수 있다.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // TODO: 프로덕션 로깅 서비스(Sentry 등) 연동 지점
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary]', error, info.componentStack);
    }
  }

  private handleRetry = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    const { error } = this.state;
    if (error) {
      return (
        <ErrorPage
          onRetry={this.handleRetry}
          detail={`${error.name}: ${error.message}`}
        />
      );
    }
    return this.props.children;
  }
}
