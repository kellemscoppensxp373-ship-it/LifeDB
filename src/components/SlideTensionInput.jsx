import { useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, useAnimationControls } from 'framer-motion';
import { ChevronsRight } from 'lucide-react';
import { useStore } from '../store/useStore.js';

/**
 * SlideTensionInput — numeric entry without text inputs.
 * Drag the handle right: the bar fills with visual tension while numbers
 * tick up rapidly. Release: the component flashes WHITE and the value
 * is saved to Zustand (keyed by `id`).
 */
export default function SlideTensionInput({
  id,
  label,
  unit = '',
  min = 0,
  max = 100,
  step = 1,
  value,
  onChange,
  onConfirm,
  trackPx = 190,
  compact = false,
}) {
  const setTensionValue = useStore((s) => s.setTensionValue);
  const [val, setVal] = useState(value ?? min);
  const x = useMotionValue(0);
  const flash = useAnimationControls();
  const trackRef = useRef(null);

  const progress = useTransform(x, [0, trackPx], [0, 1]);
  const tensionGlow = useTransform(
    progress,
    [0, 0.5, 1],
    [
      '0 0 0px rgba(16,185,129,0)',
      '0 0 14px rgba(16,185,129,0.45)',
      '0 0 26px rgba(16,185,129,0.9)',
    ],
  );

  const snap = (v) => {
    const s = Math.round(v / step) * step;
    return Math.min(max, Math.max(min, +s.toFixed(2)));
  };

  const handleDrag = (_, info) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    // Pointer position relative to track start (handle is 34px wide).
    const px = Math.min(Math.max(info.point.x - rect.left - 17, 0), trackPx);
    const v = snap(min + (px / trackPx) * (max - min));
    setVal(v);
    onChange?.(v);
  };

  const handleRelease = () => {
    // Flash WHITE to confirm + persist to Zustand.
    flash.start({
      backgroundColor: ['rgba(255,255,255,0.85)', 'rgba(255,255,255,0)'],
      transition: { duration: 0.5, ease: 'easeOut' },
    });
    if (id) setTensionValue(id, val);
    onConfirm?.(val);
  };

  const pct = (val - min) / (max - min || 1);

  return (
    <motion.div
      animate={flash}
      className={`clip-cut-sm select-none rounded-none border border-white/10 bg-black/50 backdrop-blur-xl ${
        compact ? 'p-2' : 'p-3'
      }`}
    >
      <div className="flex items-baseline justify-between">
        <span className="text-[9px] tracking-[0.3em] text-chrome-dim">{label}</span>
        <span className={`font-bold tabular-nums text-bone ${compact ? 'text-lg' : 'text-2xl'}`}>
          {val}
          <span className="ml-1 text-[10px] font-normal tracking-[0.2em] text-toxic">{unit}</span>
        </span>
      </div>

      {/* Tension track */}
      <div
        ref={trackRef}
        className="relative mt-2 h-9 overflow-hidden border border-white/10 bg-white/[0.03]"
      >
        {/* Tick marks */}
        <div className="absolute inset-0 flex items-center justify-between px-1">
          {Array.from({ length: 24 }).map((_, i) => (
            <span
              key={i}
              className={`w-px ${i % 6 === 0 ? 'h-4 bg-white/25' : 'h-2 bg-white/10'}`}
            />
          ))}
        </div>
        {/* Tension fill */}
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-toxic/5 via-toxic/25 to-toxic/60"
          style={{ width: `${pct * 100}%` }}
        />
        {/* Drag handle */}
        <motion.div
          drag="x"
          dragConstraints={trackRef}
          dragElastic={0.04}
          dragMomentum={false}
          style={{ x, boxShadow: tensionGlow }}
          onDrag={handleDrag}
          onDragEnd={handleRelease}
          whileHover={{ scale: 1.04 }}
          whileDrag={{ scale: 1.1, cursor: 'grabbing' }}
          className="absolute left-0 top-0 flex h-9 w-[34px] cursor-grab items-center justify-center border border-toxic/70 bg-black/90 text-toxic"
        >
          <ChevronsRight size={16} strokeWidth={2} />
        </motion.div>
        {/* Ghost hint */}
        {pct === 0 && (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[9px] tracking-[0.35em] text-chrome-faint">
            DRAG →
          </span>
        )}
      </div>

      <div className="mt-1.5 flex justify-between text-[8px] tracking-[0.25em] text-chrome-faint tabular-nums">
        <span>{min}{unit}</span>
        <span className="text-toxic/70">TENSION {Math.round(pct * 100)}%</span>
        <span>{max}{unit}</span>
      </div>
    </motion.div>
  );
}
