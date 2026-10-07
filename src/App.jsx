import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import TopBar from './components/TopBar.jsx';
import Dashboard from './components/Dashboard.jsx';
import BottomTicker from './components/BottomTicker.jsx';
import SettingsTerminal from './components/SettingsTerminal.jsx';
import VoiceWidget from './components/VoiceWidget.jsx';
import { useStore } from './store/Store.js';

export default function App() {
  const tickClock = useStore((s) => s.tickClock);
  const tickFx = useStore((s) => s.tickFx);
  const tickProgress = useStore((s) => s.tickProgress);
  const toggleVoice = useStore((s) => s.toggleVoice);

  // Live clocks: system uptime (1s), FX random-walk (3.5s), track progress (1s).
  useEffect(() => {
    const t1 = setInterval(tickClock, 1000);
    const t2 = setInterval(tickFx, 3500);
    const t3 = setInterval(tickProgress, 1000);
    return () => {
      clearInterval(t1);
      clearInterval(t2);
      clearInterval(t3);
    };
  }, [tickClock, tickFx, tickProgress]);

  // Voice overlay: driven by the Electron global shortcut (Alt+Space)
  // via IPC `voice:toggle`. Browser fallback: press "V".
  useEffect(() => {
    let detach;
    if (window.electronAPI?.onVoiceToggle) {
      detach = window.electronAPI.onVoiceToggle(() => toggleVoice());
    }
    const onKey = (e) => {
      if ((e.key === 'v' || e.key === 'V') && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const tag = document.activeElement?.tagName;
        if (tag !== 'INPUT' && tag !== 'TEXTAREA') toggleVoice();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      if (typeof detach === 'function') detach();
      window.removeEventListener('keydown', onKey);
    };
  }, [toggleVoice]);

  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-void-950 font-mono text-bone">
      {/* ---- Atmosphere layers ---- */}
      <div className="bg-blueprint-grid pointer-events-none absolute inset-0 opacity-70" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 55% 45% at 15% 0%, rgba(0,255,102,0.07), transparent 70%), radial-gradient(ellipse 50% 45% at 90% 100%, rgba(255,45,85,0.06), transparent 70%), radial-gradient(ellipse 60% 50% at 50% 50%, transparent 30%, rgba(0,0,0,0.5) 100%)',
        }}
      />
      <div className="bg-scanlines pointer-events-none absolute inset-0 opacity-60" />
      <div className="bg-vignette pointer-events-none absolute inset-0" />

      {/* ---- Shell ---- */}
      <TopBar />
      <main className="relative z-10 min-h-0 flex-1 overflow-y-auto px-3 pb-3 pt-3 sm:px-4">
        <Dashboard />
      </main>
      <BottomTicker />

      {/* ---- Overlays ---- */}
      <SettingsTerminal />
      <AnimatePresence>
        <VoiceWidget key="voice" />
      </AnimatePresence>
    </div>
  );
}
