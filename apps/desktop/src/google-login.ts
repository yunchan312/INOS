// Google은 임베디드 브라우저(Electron 포함)에서의 OAuth를 차단하므로(disallowed_useragent),
// 로그인은 시스템 기본 브라우저에서 진행하고 JWT는 127.0.0.1 루프백 서버로 돌려받는다.
// 흐름: 앱 → 시스템 브라우저(/auth/google?desktop_port&nonce) → Google → 서버 콜백
//       → 302 http://127.0.0.1:{port}/auth/callback?token&nonce → 앱이 토큰 수신
import { randomBytes } from 'node:crypto';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import { app, BrowserWindow, shell } from 'electron';

const LOOPBACK_HOST = '127.0.0.1';
const CALLBACK_PATH = '/auth/callback';
const LOGIN_TIMEOUT_MS = 5 * 60 * 1000;

interface ActiveLogin {
  server: http.Server;
  timeout: NodeJS.Timeout;
}

let activeLogin: ActiveLogin | null = null;

function cancelActiveLogin(): void {
  if (!activeLogin) return;
  clearTimeout(activeLogin.timeout);
  activeLogin.server.close();
  activeLogin = null;
}

function resultPage(title: string, message: string): string {
  return `<!doctype html>
<html lang="ko">
<head><meta charset="utf-8"><title>${title}</title></head>
<body style="font-family:-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0">
  <div style="text-align:center">
    <h1 style="font-size:1.25rem">${title}</h1>
    <p style="color:#666">${message}</p>
  </div>
</body>
</html>`;
}

function respondHtml(res: http.ServerResponse, status: number, html: string): void {
  res.writeHead(status, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}

function focusWindow(win: BrowserWindow): void {
  if (win.isMinimized()) win.restore();
  win.show();
  app.focus({ steal: true });
}

/**
 * 웹앱의 Google 로그인 이동을 가로채 시스템 브라우저에서 로그인을 진행시키고,
 * 루프백 콜백으로 받은 토큰을 웹앱의 /auth/callback 라우트로 전달한다.
 */
export function startDesktopGoogleLogin(
  loginUrl: string,
  win: BrowserWindow,
  appUrl: string,
): void {
  cancelActiveLogin();

  const nonce = randomBytes(24).toString('base64url');

  const server = http.createServer((req, res) => {
    const url = new URL(req.url ?? '/', `http://${LOOPBACK_HOST}`);
    if (url.pathname !== CALLBACK_PATH) {
      respondHtml(res, 404, resultPage('찾을 수 없음', '잘못된 경로입니다.'));
      return;
    }

    const token = url.searchParams.get('token');
    if (!token || url.searchParams.get('nonce') !== nonce) {
      respondHtml(
        res,
        400,
        resultPage('로그인 실패', '앱에서 로그인을 다시 시도해 주세요.'),
      );
      return;
    }

    respondHtml(
      res,
      200,
      resultPage('로그인 완료', '이 창을 닫고 INOS 앱으로 돌아가세요.'),
    );
    cancelActiveLogin();

    void win.loadURL(
      `${appUrl}/auth/callback?token=${encodeURIComponent(token)}`,
    );
    focusWindow(win);
  });

  server.once('error', cancelActiveLogin);

  server.listen(0, LOOPBACK_HOST, () => {
    const { port } = server.address() as AddressInfo;
    const externalUrl = new URL(loginUrl);
    externalUrl.searchParams.set('desktop_port', String(port));
    externalUrl.searchParams.set('nonce', nonce);
    void shell.openExternal(externalUrl.toString());
  });

  activeLogin = {
    server,
    timeout: setTimeout(cancelActiveLogin, LOGIN_TIMEOUT_MS),
  };
}
