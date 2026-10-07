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

  /** Run `git pull` in the host. Resolves { ok, code }. */
  gitPull: () => ipcRenderer.invoke('sys:git-pull'),

  /** Streamed git-pull log lines: ({ stream: 'out'|'err'|'sys', line }). */
  onGitPullLog: (cb) => on('sys:git-pull:log', cb),

  /** Fired by the Alt+Space global shortcut. */
  onVoiceToggle: (cb) => on('voice:toggle', cb),

  /** Open an https URL in the system browser. */
  openExternal: (url) => ipcRenderer.invoke('sys:open-external', url),

  /** Host diagnostics. */
  sysInfo: () => ipcRenderer.invoke('sys:info'),
});
