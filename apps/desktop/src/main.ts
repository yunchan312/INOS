import { app, BrowserWindow, shell } from 'electron';
import path from 'node:path';

const APP_URL = 'https://inos-web.vercel.app';
const ICON_PATH = path.join(__dirname, '../assets/icon.png');

// Google OAuth는 임베디드 브라우저(UA에 Electron 토큰 포함)를 차단하므로
// 표준 Chrome UA처럼 보이도록 Electron/앱 이름 토큰을 제거한다.
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

  win.webContents.userAgent = cleanUserAgent(win.webContents.userAgent);

  // target=_blank / window.open 은 기본 브라우저로
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      void shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  // mailto: 링크(푸터 Contact 등)는 기본 메일 클라이언트로
  win.webContents.on('will-navigate', (event, url) => {
    if (url.startsWith('mailto:')) {
      event.preventDefault();
      void shell.openExternal(url);
    }
  });

  void win.loadURL(APP_URL);
}

app.setName('INOS');

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
