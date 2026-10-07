/**
 * LIFE DASHBOARD — preload bridge (CommonJS for maximum compat).
 * Exposes a minimal, auditable `window.electronAPI` to the renderer.
 */
const { contextBridge, ipcRenderer } = require('electron');

function on(channel, cb) {
  const listener = (_event, payload) => cb(payload);
  ipcRenderer.on(channel, listener);
  return () => ipcRenderer.removeListener(channel, listener);
}

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,

  /** Run `git pull origin main` in the host. Resolves { ok, code, stdout, stderr }. */
  updateApp: () => ipcRenderer.invoke('update-app'),

  /** Streamed update logs: ({ stream: 'out'|'err'|'sys', line }). */
  onUpdateLog: (cb) => on('update-app:log', cb),

  /** Fired by the Alt+Space global shortcut. */
  onVoiceInputOpen: (cb) => on('voice-input-open', cb),

  /** Frameless window controls. */
  winMinimize: () => ipcRenderer.invoke('win:minimize'),
  winToggleMaximize: () => ipcRenderer.invoke('win:toggle-maximize'),
  winClose: () => ipcRenderer.invoke('win:close'),
  winIsMaximized: () => ipcRenderer.invoke('win:is-maximized'),
  onMaximizeChanged: (cb) => on('win:maximize-changed', cb),

  /** Open an https URL in the system browser. */
  openExternal: (url) => ipcRenderer.invoke('sys:open-external', url),

  /** Host diagnostics. */
  sysInfo: () => ipcRenderer.invoke('sys:info'),
});
