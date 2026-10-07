/**
 * LIFE DASHBOARD — Electron main process.
 *
 * - Frameless-feel dark window loading Vite (dev) or dist/ (prod).
 * - IPC `sys:git-pull` runs `git pull` via child_process.exec so the app
 *   updates itself locally without manual downloading.
 * - Global shortcut Alt+Space fires IPC `voice:toggle` to summon the
 *   minimalist voice-recording widget on the React side.
 */
import { app, BrowserWindow, ipcMain, globalShortcut, shell } from 'electron';
import { exec } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = !app.isPackaged;
const VITE_URL = process.env.ELECTRON_START_URL || 'http://127.0.0.1:5173';
const VOICE_SHORTCUT = 'Alt+Space';

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 1000,
    minWidth: 1180,
    minHeight: 760,
    backgroundColor: '#030304',
    autoHideMenuBar: true,
    title: 'LIFE.DASHBOARD',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  if (isDev) {
    mainWindow.loadURL(VITE_URL).catch((err) => {
      console.error(`[main] failed to load ${VITE_URL}:`, err.message);
    });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/* ------------------------------------------------------------------ */
/* SYNC GITHUB — `git pull` executed locally via child_process.        */
/* Streams stdout/stderr back over `sys:git-pull:log`.                 */
/* ------------------------------------------------------------------ */
ipcMain.handle('sys:git-pull', async (event) => {
  // Dev: repo root (cwd). Packaged: folder next to the executable.
  const cwd = isDev ? process.cwd() : path.dirname(app.getPath('exe'));
  const send = (stream, line) => {
    try {
      event.sender.send('sys:git-pull:log', { stream, line });
    } catch {
      /* renderer gone */
    }
  };

  send('sys', `$ git pull --ff-only  (cwd: ${cwd})`);

  return new Promise((resolve) => {
    const child = exec('git pull --ff-only', {
      cwd,
      timeout: 120000,
      windowsHide: true,
      maxBuffer: 1024 * 1024 * 4,
    });

    child.stdout?.on('data', (d) => send('out', String(d).trimEnd()));
    child.stderr?.on('data', (d) => send('err', String(d).trimEnd()));

    child.on('error', (err) => {
      send('err', `[exec] ${err.message}`);
      resolve({ ok: false, code: -1, error: err.message });
    });

    child.on('close', (code) => {
      send(code === 0 ? 'sys' : 'err', `[exit] code ${code}`);
      resolve({ ok: code === 0, code });
    });
  });
});

/* ------------------------------------------------------------------ */
/* Misc helpers                                                        */
/* ------------------------------------------------------------------ */
ipcMain.handle('sys:open-external', async (_event, url) => {
  if (typeof url === 'string' && /^https?:\/\//.test(url)) {
    await shell.openExternal(url);
    return true;
  }
  return false;
});

ipcMain.handle('sys:info', () => ({
  platform: process.platform,
  arch: process.arch,
  versions: { ...process.versions },
  packaged: app.isPackaged,
}));

/* ------------------------------------------------------------------ */
/* App lifecycle + global voice shortcut                               */
/* ------------------------------------------------------------------ */
app.whenReady().then(() => {
  createWindow();

  // Voice Shortcut: Alt+Space -> React voice widget.
  try {
    const ok = globalShortcut.register(VOICE_SHORTCUT, () => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.show();
        mainWindow.focus();
        mainWindow.webContents.send('voice:toggle');
      }
    });
    if (!ok) console.warn(`[main] global shortcut ${VOICE_SHORTCUT} registration failed (likely taken by OS).`);
    else console.log(`[main] global shortcut registered: ${VOICE_SHORTCUT} -> voice:toggle`);
  } catch (err) {
    console.warn('[main] globalShortcut error:', err.message);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
