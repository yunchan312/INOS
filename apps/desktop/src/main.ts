import { app, BrowserWindow, shell } from 'electron';
import path from 'node:path';
import { startDesktopGoogleLogin } from './google-login';

const APP_URL = 'https://inos-web.vercel.app';
const ICON_PATH = path.join(__dirname, '../assets/icon.png');

// 일반 사이트 호환성을 위해 UA에서 Electron/앱 이름 토큰을 제거한다.
// (Google 로그인은 UA와 무관하게 시스템 브라우저에서 진행 — google-login.ts 참고)
function cleanUserAgent(userAgent: string): string {
  return userAgent
    .split(' ')
    .filter(
      (part) =>
        !part.startsWith('Electron/') &&
        !part.toLowerCase().includes(app.getName().toLowerCase()),
    )
    .join(' ');
}

// 웹앱이 Google 로그인 시 이동하는 서버 엔드포인트(`${apiBase}/auth/google`) 여부
function isGoogleLoginUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      (parsed.protocol === 'https:' || parsed.protocol === 'http:') &&
      parsed.pathname.endsWith('/auth/google')
    );
  } catch {
    return false;
  }
}

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 420,
    minHeight: 600,
    backgroundColor: '#f3f2f2',
    icon: ICON_PATH,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  // target=_blank / window.open 은 기본 브라우저로
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      void shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  win.webContents.on('will-navigate', (event, url) => {
    // mailto: 링크(푸터 Contact 등)는 기본 메일 클라이언트로
    if (url.startsWith('mailto:')) {
      event.preventDefault();
      void shell.openExternal(url);
      return;
    }
    // Google 로그인은 시스템 브라우저 + 루프백 콜백으로 진행
    if (isGoogleLoginUrl(url)) {
      event.preventDefault();
      startDesktopGoogleLogin(url, win, APP_URL);
    }
  });

  void win.loadURL(APP_URL);
}

app.setName('INOS');
app.userAgentFallback = cleanUserAgent(app.userAgentFallback);

void app.whenReady().then(() => {
  if (process.platform === 'darwin' && app.dock) {
    app.dock.setIcon(ICON_PATH);
  }

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
