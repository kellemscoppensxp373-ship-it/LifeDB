import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Settings, Terminal, Github, X, Palette, Database, Download, Upload, Trash2 } from 'lucide-react';
import { useStore } from '../store/Store.js';

const TABS = [
  { id: 'sync', label: 'SYSTEM / SYNC', icon: Terminal },
  { id: 'appearance', label: 'APPEARANCE', icon: Palette },
  { id: 'data', label: 'DATA', icon: Database },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * SettingsTerminal — minimalist gear bottom-left opening a settings module.
 * The SYSTEM/SYNC tab mimics a CLI terminal; SYNC GITHUB runs
 * `git pull` in the Electron host via IPC (no manual downloading).
 */
export default function SettingsTerminal() {
  const open = useStore((s) => s.settingsOpen);
  const setOpen = useStore((s) => s.setSettingsOpen);
  const tab = useStore((s) => s.settingsTab);
  const setTab = useStore((s) => s.setSettingsTab);
  const setLastSync = useStore((s) => s.setLastSync);

  const [lines, setLines] = useState([
    { stream: 'sys', text: 'LIFE.DASHBOARD shell — v1.0.0 // GLASS MONOLITH' },
    { stream: 'sys', text: 'type-free zone: press SYNC GITHUB to fast-forward this app.' },
  ]);
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef(null);

  const push = (stream, text) =>
    setLines((prev) => [...prev.slice(-120), { stream, text }]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines, open, tab]);

  const runGitPull = async () => {
    if (busy) return;
    setBusy(true);
    push('cmd', '$ git pull --ff-only');

    try {
      if (window.electronAPI?.gitPull) {
        // ---- Real path: Electron main runs child_process.exec('git pull') ----
        const detach = window.electronAPI.onGitPullLog?.(({ stream, line }) => {
          String(line)
            .split('\n')
            .filter(Boolean)
            .forEach((l) => push(stream === 'err' ? 'err' : 'out', l));
        });
        const res = await window.electronAPI.gitPull();
        if (typeof detach === 'function') detach();
        if (res?.ok) {
          push('ok', `[SYNC OK] exit code ${res.code} — already homogeneous.`);
          setLastSync(Date.now());
        } else {
          push('err', `[SYNC FAIL] exit code ${res?.code ?? '?'} — see output above.`);
        }
      } else {
        // ---- Browser preview fallback: simulated pull transcript ----
        const script = [
          ['out', 'remote: Enumerating objects: 14, done.'],
          ['out', 'remote: Counting objects: 100% (14/14), done.'],
          ['out', 'Unpacking objects: 100% (9/9), done.'],
          ['out', 'From github.com:lifedb/life-dashboard'],
          ['out', '   a20ed95..9f31c44  main -> origin/main'],
          ['out', 'Updating a20ed95..9f31c44'],
          ['ok', 'Fast-forward // 6 files changed, 214 insertions(+)'],
          ['ok', '[SYNC OK] exit code 0 — restart recommended.'],
        ];
        for (const [stream, text] of script) {
          await sleep(260);
          push(stream, text);
        }
        setLastSync(Date.now());
      }
    } catch (e) {
      push('err', `[SYNC FAIL] ${String(e?.message || e)}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {/* Gear — minimalist, bottom-left above the ticker */}
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className={`clip-cut-sm fixed bottom-11 left-4 z-30 border bg-black/70 p-2.5 backdrop-blur-2xl transition-colors ${
          open ? 'border-toxic/70 text-toxic' : 'border-white/20 text-chrome hover:border-toxic/50 hover:text-toxic'
        }`}
        title="Settings"
      >
        <motion.span
          animate={open ? { rotate: 90 } : { rotate: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="block"
        >
          <Settings size={17} strokeWidth={1.75} />
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: -26, filter: 'blur(6px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: -26, filter: 'blur(6px)' }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="clip-cut glass-deep fixed bottom-11 left-14 z-30 flex h-[380px] w-[min(560px,calc(100vw-5rem))] flex-col border border-white/20 shadow-panel"
          >
            {/* Header + tabs */}
            <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
              <div className="flex gap-1.5">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`clip-tag-sm flex items-center gap-1.5 border px-2.5 py-1.5 text-[10px] tracking-[0.2em] transition-colors ${
                      tab === t.id
                        ? 'border-toxic/60 bg-toxic/10 text-toxic'
                        : 'border-transparent text-chrome-dim hover:border-white/20 hover:text-bone'
                    }`}
                  >
                    <t.icon size={12} strokeWidth={1.75} />
                    {t.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 text-chrome-dim transition-colors hover:text-blood"
                title="Close settings"
              >
                <X size={15} strokeWidth={1.75} />
              </button>
            </div>

            {/* SYNC TAB */}
            {tab === 'sync' && (
              <div className="flex min-h-0 flex-1 flex-col">
                <div
                  ref={scrollRef}
                  className="min-h-0 flex-1 overflow-y-auto bg-black/80 p-3 text-[11px] leading-relaxed"
                >
                  {lines.map((l, i) => (
                    <div
                      key={i}
                      className={
                        l.stream === 'err'
                          ? 'text-blood'
                          : l.stream === 'ok'
                            ? 'text-toxic text-glow-green'
                            : l.stream === 'cmd'
                              ? 'font-bold text-bone'
                              : l.stream === 'sys'
                                ? 'text-chrome-dim'
                                : 'text-bone/85'
                      }
                    >
                      {l.stream === 'cmd' ? l.text : <span><span className="text-toxic">›</span> {l.text}</span>}
                    </div>
                  ))}
                  {busy && (
                    <motion.div
                      animate={{ opacity: [1, 0.2, 1] }}
                      transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
                      className="text-toxic"
                    >
                      ▌
                    </motion.div>
                  )}
                </div>
                <div className="flex items-center gap-2 border-t border-white/10 p-2.5">
                  <motion.button
                    onClick={runGitPull}
                    disabled={busy}
                    whileTap={{ scale: 0.96 }}
                    className={`clip-cut-sm flex flex-1 items-center justify-center gap-2 border px-3 py-2.5 text-[11px] font-bold tracking-[0.3em] transition-colors ${
                      busy
                        ? 'cursor-wait border-toxic/30 bg-toxic/5 text-toxic/60'
                        : 'border-toxic/60 bg-toxic/10 text-toxic hover:bg-toxic/25 hover:shadow-glow-green'
                    }`}
                  >
                    <Github size={14} strokeWidth={1.75} />
                    {busy ? 'PULLING...' : 'SYNC GITHUB'}
                  </motion.button>
                  <span className="hidden px-1 text-[9px] tracking-[0.2em] text-chrome-dim sm:block">
                    {window.electronAPI ? 'IPC:LIVE' : 'IPC:PREVIEW'}
                  </span>
                </div>
              </div>
            )}

            {tab === 'appearance' && <AppearanceTab />}
            {tab === 'data' && <DataTab push={push} setTab={setTab} />}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function AppearanceTab() {
  const accent = useStore((s) => s.accent);
  const setAccent = useStore((s) => s.setAccent);
  const options = [
    { id: 'toxic', label: 'TOXIC GREEN', swatch: 'bg-toxic' },
    { id: 'blood', label: 'BLOOD RED', swatch: 'bg-blood' },
    { id: 'chrome', label: 'CHROME SILVER', swatch: 'bg-chrome' },
  ];
  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="text-[10px] tracking-[0.3em] text-chrome-dim">ACCENT CHANNEL</div>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {options.map((o) => (
          <button
            key={o.id}
            onClick={() => setAccent(o.id)}
            className={`clip-cut-sm flex items-center gap-2 border px-2.5 py-2.5 text-[10px] tracking-[0.18em] transition-colors ${
              accent === o.id
                ? 'border-toxic/70 bg-toxic/10 text-bone'
                : 'border-white/15 text-chrome-dim hover:border-white/30 hover:text-bone'
            }`}
          >
            <span className={`h-3 w-3 ${o.swatch}`} />
            {o.label}
          </button>
        ))}
      </div>
      <p className="mt-3 text-[10px] leading-relaxed tracking-[0.12em] text-chrome-dim">
        MONOSPACE LOCK: JetBrains Mono / Space Mono. No rounded corners. Glass stays at 60–78%
        black with 32–48px blur. Accent channel tints HUD ticks and confirmations.
      </p>
    </div>
  );
}

function DataTab({ push, setTab }) {
  const exportState = useStore((s) => s.exportState);
  const importState = useStore((s) => s.importState);
  const fileRef = useRef(null);

  const doExport = () => {
    const blob = new Blob([exportState()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `lifedb-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const doImport = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const rd = new FileReader();
    rd.onload = () => {
      const ok = importState(String(rd.result || ''));
      setTab('sync');
      push(ok ? 'ok' : 'err', ok ? '[DATA] backup restored.' : '[DATA] invalid backup file.');
    };
    rd.readAsText(f);
    e.target.value = '';
  };

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="text-[10px] tracking-[0.3em] text-chrome-dim">LOCAL VAULT</div>
      <div className="mt-2 flex gap-2">
        <button
          onClick={doExport}
          className="clip-cut-sm flex flex-1 items-center justify-center gap-2 border border-white/20 bg-white/[0.04] px-3 py-2.5 text-[10px] tracking-[0.25em] text-bone transition-colors hover:border-toxic/60 hover:text-toxic"
        >
          <Download size={13} /> EXPORT JSON
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="clip-cut-sm flex flex-1 items-center justify-center gap-2 border border-white/20 bg-white/[0.04] px-3 py-2.5 text-[10px] tracking-[0.25em] text-bone transition-colors hover:border-toxic/60 hover:text-toxic"
        >
          <Upload size={13} /> IMPORT JSON
        </button>
        <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={doImport} />
      </div>
      <p className="mt-3 flex items-start gap-2 text-[10px] leading-relaxed tracking-[0.12em] text-chrome-dim">
        <Trash2 size={12} className="mt-0.5 shrink-0 text-blood" />
        ALL DATA STAYS LOCAL. Export writes a single JSON snapshot; import restores tasks,
        streaks, habits and workout history. Nothing leaves this machine.
      </p>
    </div>
  );
}
