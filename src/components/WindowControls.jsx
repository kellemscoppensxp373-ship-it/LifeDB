import { useEffect, useState } from 'react';
import { Minus, Square, Copy, X } from 'lucide-react';

/**
 * WindowControls — custom traffic lights for the frameless Electron shell
 * (frame: false). Renders ONLY inside Electron; invisible in browsers.
 */
export default function WindowControls() {
  const api = typeof window !== 'undefined' ? window.electronAPI : undefined;
  const [maxed, setMaxed] = useState(false);

  useEffect(() => {
    if (!api?.winIsMaximized) return undefined;
    api.winIsMaximized().then((v) => setMaxed(!!v)).catch(() => {});
    const detach = api.onMaximizeChanged?.((v) => setMaxed(!!v));
    return () => {
      if (typeof detach === 'function') detach();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!api?.winClose) return null;

  const btn =
    'flex h-8 w-10 items-center justify-center text-chrome-dim transition-colors hover:bg-white/10 hover:text-bone';

  return (
    <div className="flex shrink-0 items-stretch border border-white/10 bg-black/60 backdrop-blur-2xl">
      <button onClick={() => api.winMinimize()} className={btn} title="Minimize">
        <Minus size={14} strokeWidth={1.75} />
      </button>
      <button onClick={() => api.winToggleMaximize()} className={btn} title={maxed ? 'Restore' : 'Maximize'}>
        {maxed ? <Copy size={12} strokeWidth={1.75} /> : <Square size={12} strokeWidth={1.75} />}
      </button>
      <button
        onClick={() => api.winClose()}
        className={`${btn} hover:bg-blood/80 hover:text-white`}
        title="Close"
      >
        <X size={14} strokeWidth={1.75} />
      </button>
    </div>
  );
}
