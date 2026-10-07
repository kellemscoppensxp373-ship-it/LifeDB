import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore.js';

const LEVEL_STYLE = [
  'border border-white/10 bg-white/[0.02]',
  'bg-toxic/25 shadow-[0_0_6px_rgba(16,185,129,0.35)]',
  'bg-toxic/50 shadow-[0_0_8px_rgba(16,185,129,0.5)]',
  'bg-toxic/80 shadow-glow-green',
  'bg-[#eafff0] shadow-glow-green',
];

/**
 * Heatmap — sharp rhombuses (never squares).
 * Empty days: dark + 1px border. Active days: bright neon.
 */
export default function Heatmap() {
  const weeks = useStore((s) => s.heatmap);
  const [hover, setHover] = useState(null);

  const total = weeks.flat().reduce((a, d) => a + d.count, 0);
  const active = weeks.flat().filter((d) => d.level > 0).length;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-[10px] tracking-[0.2em]">
        <span className="text-chrome-dim">
          {hover ? (
            <>
              <span className="font-bold text-bone">{hover.label}</span>
              <span className="text-toxic"> /// </span>
              <span className="text-toxic">{hover.count} PTS</span>
              <span className="text-chrome-faint"> LV.{hover.level}</span>
            </>
          ) : (
            <span className="text-chrome-faint">HOVER A CELL FOR READOUT</span>
          )}
        </span>
        <span className="text-chrome-dim">
          ACTIVE <span className="font-bold text-bone">{active}</span>
          <span className="text-toxic"> /// </span>
          TOTAL <span className="font-bold text-toxic">{total}</span>
        </span>
      </div>

      <div className="overflow-x-auto pb-1">
        <div className="flex min-w-max gap-[7px]">
          {weeks.map((days, wi) => (
            <div key={wi} className="flex flex-col gap-[7px]">
              {days.map((d, di) => (
                <motion.div
                  key={d.iso}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: d.future ? 0.25 : 1, scale: 1 }}
                  transition={{
                    delay: Math.min((wi * 7 + di) * 0.004, 1.1),
                    duration: 0.3,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  whileHover={d.future ? {} : { scale: 1.45, zIndex: 5 }}
                  onMouseEnter={() => !d.future && setHover(d)}
                  onMouseLeave={() => setHover((h) => (h?.iso === d.iso ? null : h))}
                  title={`${d.label} — ${d.count} pts`}
                  className={`clip-diamond h-[13px] w-[13px] cursor-crosshair ${d.future ? 'bg-white/[0.04]' : LEVEL_STYLE[d.level]}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between text-[9px] tracking-[0.25em] text-chrome-dim">
        <span>MON {"<"} DAYS {"<"} SUN</span>
        <span className="flex items-center gap-1.5">
          LESS
          {[0, 1, 2, 3, 4].map((l) => (
            <span key={l} className={`clip-diamond inline-block h-2.5 w-2.5 ${LEVEL_STYLE[l]}`} />
          ))}
          MORE
        </span>
      </div>
    </div>
  );
}
