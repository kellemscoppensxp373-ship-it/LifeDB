import { motion } from 'framer-motion';
import { Hexagon } from 'lucide-react';
import WeatherWidget from './WeatherWidget.jsx';
import CurrencyWidget from './CurrencyWidget.jsx';
import MusicPlayer from './MusicPlayer.jsx';
import { useStore } from '../store/Store.js';

/**
 * TopBar — system + media command strip.
 * Brand block | Weather | Currency | Music capsule.
 */
export default function TopBar() {
  const now = useStore((s) => s.now);
  const clock = new Date(now).toLocaleTimeString('en-GB', { hour12: false });

  return (
    <motion.header
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-20 flex flex-wrap items-stretch gap-2 border-b border-white/10 bg-black/60 px-3 py-2 backdrop-blur-2xl sm:px-4"
    >
      {/* Brand block */}
      <div className="clip-cut-sm flex min-w-[210px] flex-1 items-center gap-3 border border-white/20 bg-black/60 px-3 py-1.5 sm:flex-none">
        <span className="relative flex items-center justify-center">
          <Hexagon size={26} className="text-toxic" strokeWidth={1.5} />
          <span className="absolute h-1.5 w-1.5 bg-toxic shadow-glow-green" />
        </span>
        <div className="leading-tight">
          <div className="text-[13px] font-extrabold tracking-[0.24em] text-bone">
            LIFE<span className="text-toxic">.</span>DASHBOARD
          </div>
          <div className="flex items-center gap-2 text-[9px] tracking-[0.3em] text-chrome-dim">
            <motion.span
              animate={{ opacity: [1, 0.25, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
              className="inline-block h-1.5 w-1.5 bg-toxic shadow-glow-green"
            />
            SYS.ONLINE <span className="text-chrome-faint">///</span> {clock}
          </div>
        </div>
      </div>

      {/* Widgets */}
      <WeatherWidget />
      <CurrencyWidget />

      {/* Music capsule takes remaining width */}
      <div className="flex min-w-[260px] flex-1 basis-full sm:basis-auto">
        <MusicPlayer />
      </div>
    </motion.header>
  );
}
