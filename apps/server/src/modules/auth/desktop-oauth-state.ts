// 데스크톱(Electron) 앱은 Google OAuth를 시스템 브라우저에서 진행하고,
// 발급된 JWT를 127.0.0.1 루프백 서버로 돌려받는다.
// 루프백 포트와 nonce를 Google OAuth state 파라미터에 실어 왕복시킨다.

const DESKTOP_STATE_PREFIX = 'desktop:';
const NONCE_PATTERN = /^[A-Za-z0-9_-]{16,64}$/;
const MIN_PORT = 1024;
const MAX_PORT = 65535;

export interface DesktopOauthState {
  port: number;
  nonce: string;
}

function parsePort(value: string): number | null {
  if (!/^\d{4,5}$/.test(value)) return null;
  const port = Number(value);
  if (port < MIN_PORT || port > MAX_PORT) return null;
  return port;
}

/** 데스크톱 루프백 콜백 정보를 state 문자열로 인코딩. 값이 유효하지 않으면 null. */
export function encodeDesktopOauthState(
  portValue: string,
  nonceValue: string,
): string | null {
  const port = parsePort(portValue);
  if (port === null || !NONCE_PATTERN.test(nonceValue)) return null;
  return `${DESKTOP_STATE_PREFIX}${port}:${nonceValue}`;
}

/** Google이 돌려준 state에서 데스크톱 콜백 정보를 복원. 데스크톱 로그인이 아니면 null. */
export function decodeDesktopOauthState(
  state: string | undefined,
): DesktopOauthState | null {
  if (!state?.startsWith(DESKTOP_STATE_PREFIX)) return null;

  const separatorIndex = state.indexOf(':', DESKTOP_STATE_PREFIX.length);
  if (separatorIndex < 0) return null;

  const port = parsePort(state.slice(DESKTOP_STATE_PREFIX.length, separatorIndex));
  const nonce = state.slice(separatorIndex + 1);
  if (port === null || !NONCE_PATTERN.test(nonce)) return null;

  return { port, nonce };
}
