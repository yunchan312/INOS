import * as Sentry from '@sentry/node';

// SENTRY_DSN이 없으면 init을 건너뛴다 → 모든 Sentry 호출이 안전한 no-op이 됨.
// main.ts의 최상단에서 import 되어 앱 생성 전에 실행되어야 한다.
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV ?? 'development',
    tracesSampleRate: 0.1,
  });
}
