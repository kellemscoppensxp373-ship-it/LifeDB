/**
 * LIFE DASHBOARD — Electron main process.
 *
 * - Transparent, frameless window (frame: false, transparent: true).
 *   The React shell renders its own drag region + window controls.
 * - IPC `update-app` runs `git pull origin main` via child_process.exec
 *   and streams stdout logs back to the frontend sync terminal.
 * - Global shortcut Alt+Space fires IPC `voice-input-open` to summon
 *   the minimalist voice widget on the React side.
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
    frame: false, // frameless — custom chrome in React
    transparent: true, // transparent shell — glass UI floats over the desktop
    backgroundColor: '#00000000',
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

  mainWindow.on('maximize', () => {
    if (!mainWindow.isDestroyed()) mainWindow.webContents.send('win:maximize-changed', true);
  });
  mainWindow.on('unmaximize', () => {
    if (!mainWindow.isDestroyed()) mainWindow.webContents.send('win:maximize-changed', false);
  });
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/* ------------------------------------------------------------------ */
/* SYNC GITHUB — `git pull origin main` via child_process.exec.        */
/* Streams stdout/stderr back over `update-app:log`.                   */
/* ------------------------------------------------------------------ */
ipcMain.handle('update-app', async (event) => {
  // Dev: repo root (cwd). Packaged: folder next to the executable.
  const cwd = isDev ? process.cwd() : path.dirname(app.getPath('exe'));
  const send = (stream, line) => {
    try {
      event.sender.send('update-app:log', { stream, line });
    } catch {
      /* renderer gone */
    }
  };

  send('sys', '$ git pull origin main');
  send('sys', `(cwd: ${cwd})`);

  return new Promise((resolve) => {
    const child = exec('git pull origin main', {
      cwd,
      timeout: 120000,
      windowsHide: true,
      maxBuffer: 1024 * 1024 * 4,
    });

    let stdout = '';
    let stderr = '';
    child.stdout?.on('data', (d) => {
      stdout += String(d);
      send('out', String(d).trimEnd());
    });
    child.stderr?.on('data', (d) => {
      stderr += String(d);
      send('err', String(d).trimEnd());
    });

    child.on('error', (err) => {
      send('err', `[exec] ${err.message}`);
      resolve({ ok: false, code: -1, stdout, stderr, error: err.message });
    });

    child.on('close', (code) => {
      send(code === 0 ? 'sys' : 'err', `[exit] code ${code}`);
      resolve({ ok: code === 0, code, stdout, stderr });
    });
  });
});

/* ------------------------------------------------------------------ */
/* Frameless window controls (React-rendered traffic lights).          */
/* ------------------------------------------------------------------ */
ipcMain.handle('win:minimize', (e) => {
  BrowserWindow.fromWebContents(e.sender)?.minimize();
});
ipcMain.handle('win:toggle-maximize', (e) => {
  const w = BrowserWindow.fromWebContents(e.sender);
  if (!w) return false;
  if (w.isMaximized()) w.unmaximize();
  else w.maximize();
  return w.isMaximized();
});
ipcMain.handle('win:close', (e) => {
  BrowserWindow.fromWebContents(e.sender)?.close();
});
ipcMain.handle('win:is-maximized', (e) => {
  return BrowserWindow.fromWebContents(e.sender)?.isMaximized() ?? false;
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

  // Voice Shortcut: Alt+Space -> `voice-input-open` on the React side.
  try {
    const ok = globalShortcut.register(VOICE_SHORTCUT, () => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.show();
        mainWindow.focus();
        mainWindow.webContents.send('voice-input-open');
      }
    });
    if (!ok) console.warn(`[main] global shortcut ${VOICE_SHORTCUT} registration failed (likely taken by OS).`);
    else console.log(`[main] global shortcut registered: ${VOICE_SHORTCUT} -> voice-input-open`);
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
