import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CloudSun, Droplets, Wind, CloudRain, Cloud, Sun, CloudLightning } from 'lucide-react';
import { useStore } from '../store/useStore.js';

const COND_ICON = {
  CLEAR: Sun,
  CLOUD: Cloud,
  RAIN: CloudRain,
  WIND: Wind,
  STORM: CloudLightning,
};

/**
 * WeatherWidget — minimalist glass block.
 * Hover drops a highly-blurred 7-day forecast panel.
 */
export default function WeatherWidget() {
  const [open, setOpen] = useState(false);
  const weather = useStore((s) => s.weather);
  const forecast = useStore((s) => s.forecast);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div className="clip-cut-sm flex h-full cursor-default items-center gap-3 border border-white/10 bg-black/60 px-3 py-1.5 backdrop-blur-2xl transition-colors hover:border-toxic/60">
        <CloudSun size={22} strokeWidth={1.5} className="shrink-0 text-bone" />
        <div className="leading-none">
          <div className="text-xl font-bold tracking-tight text-bone">
            {weather.temp}°<span className="text-[10px] font-medium text-chrome-dim">C</span>
          </div>
          <div className="mt-1 text-[9px] tracking-[0.25em] text-chrome-dim">
            {weather.city} <span className="text-toxic">///</span> {weather.cond}
          </div>
        </div>
        <div className="hidden flex-col gap-1 border-l border-white/10 pl-3 text-[9px] tracking-[0.15em] text-chrome-dim md:flex">
          <span className="flex items-center gap-1.5">
            <Droplets size={10} /> {weather.humidity}%
          </span>
          <span className="flex items-center gap-1.5">
            <Wind size={10} /> {weather.wind}KMH
          </span>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -8, filter: 'blur(6px)' }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="clip-cut-sm glass-deep absolute left-0 top-[calc(100%+8px)] z-50 w-64 border border-white/10 shadow-panel"
          >
            <div className="border-b border-white/10 px-3 py-2 text-[9px] tracking-[0.3em] text-chrome-dim">
              7-DAY FORECAST <span className="text-toxic">///</span> {weather.city}
            </div>
            <ul className="p-1.5">
              {forecast.map((f, i) => {
                const Icon = COND_ICON[f.cond] || Cloud;
                return (
                  <motion.li
                    key={f.day}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 * i, duration: 0.25 }}
                    className="flex items-center justify-between px-2 py-1.5 text-[11px] tracking-[0.15em] hover:bg-white/[0.05]"
                  >
                    <span className="w-10 font-bold text-bone/90">{f.day}</span>
                    <Icon size={14} strokeWidth={1.5} className="text-chrome" />
                    <span className="w-20 text-right text-[10px] text-chrome-dim">{f.cond}</span>
                    <span className="w-16 text-right font-bold text-bone">
                      {f.hi}° <span className="font-normal text-chrome-dim">/{f.lo}°</span>
                    </span>
                  </motion.li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
