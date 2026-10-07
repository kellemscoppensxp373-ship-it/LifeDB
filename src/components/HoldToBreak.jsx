import { useRef, useState } from 'react';
import { animate, motion, useAnimationControls, useMotionValue } from 'framer-motion';
import { Flame, Skull } from 'lucide-react';

const HOLD_MS = 1500;

/**
 * Hold-to-Break — streak reset for negative habits.
 * Press and hold: bar shakes, bleeds red; after 1.5s it SHATTERS
 * (Framer Motion scale/opacity glitch) and the streak resets.
 */
export default function HoldToBreak({ label, streak, unit = 'DAYS', onReset }) {
  const controls = useAnimationControls();
  const progress = useMotionValue(0);
  const tweenRef = useRef(null);
  const [holding, setHolding] = useState(false);
  const [shattered, setShattered] = useState(false);
  const [flashMsg, setFlashMsg] = useState('');

  const cancel = () => {
    tweenRef.current?.stop();
    tweenRef.current = null;
    setHolding(false);
    progress.set(0);
    controls.start({
      x: 0,
      rotate: 0,
      backgroundColor: 'rgba(0,0,0,0)',
      borderColor: 'rgba(255,255,255,0.2)',
      transition: { duration: 0.25 },
    });
  };

  const shatter = async () => {
    setHolding(false);
    // Glitch-shatter keyframes: scale + opacity + positional jitter.
    await controls.start({
      scale: [1, 1.12, 0.86, 1.25, 0.7, 0],
      opacity: [1, 1, 0.65, 0.9, 0.45, 0],
      x: [0, 9, -13, 8, -18, 0],
      rotate: [0, 1.2, -2, 2.5, -3, 0],
      transition: { duration: 0.55, ease: 'easeIn' },
    });
    onReset?.();
    setShattered(true);
    setFlashMsg('STREAK SHATTERED');
    // Re-materialize clean.
    controls.set({ scale: 0.92, opacity: 0, x: 0, rotate: 0 });
    progress.set(0);
    await controls.start({
      scale: 1,
      opacity: 1,
      backgroundColor: ['rgba(255,45,85,0.35)', 'rgba(0,0,0,0)'],
      borderColor: 'rgba(255,255,255,0.2)',
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    });
    setTimeout(() => {
      setShattered(false);
      setFlashMsg('');
    }, 1600);
  };

  const startHold = () => {
    if (holding || shattered || streak === 0) return;
    setHolding(true);
    // Shake + bleed red while held.
    controls.start({
      x: [0, -7, 7, -5, 5, -3, 3, 0],
      backgroundColor: 'rgba(255,45,85,0.16)',
      borderColor: '#ff2d55',
      transition: { x: { repeat: Infinity, duration: 0.26 }, duration: 0.3 },
    });
    tweenRef.current = animate(progress, 1, {
      duration: HOLD_MS / 1000,
      ease: 'linear',
      onUpdate: (v) => progress.set(v),
      onComplete: () => {
        tweenRef.current = null;
        shatter();
      },
    });
  };

  return (
    <motion.div
      animate={controls}
      onPointerDown={startHold}
      onPointerUp={cancel}
      onPointerLeave={() => holding && cancel()}
      onContextMenu={(e) => e.preventDefault()}
      className="clip-cut-sm relative cursor-pointer select-none overflow-hidden border border-white/20 bg-black/50 p-3 backdrop-blur-xl"
    >
      {/* Hold progress bleed */}
      <motion.div
        className="absolute inset-y-0 left-0 bg-gradient-to-r from-blood/10 via-blood/30 to-blood/60"
        style={{ scaleX: progress, transformOrigin: 'left', width: '100%' }}
      />

      <div className="relative flex items-center justify-between">
        <span className="flex items-center gap-2 text-[10px] font-bold tracking-[0.25em] text-bone/90">
          {shattered ? <Skull size={13} className="text-blood" /> : <Flame size={13} className="text-blood" />}
          {label}
        </span>
        <span className="text-[9px] tracking-[0.25em] text-chrome-dim">
          {holding ? (
            <span className="font-bold text-blood">BREAKING...</span>
          ) : flashMsg ? (
            <span className="font-bold text-blood">{flashMsg}</span>
          ) : (
            'HOLD 1.5S'
          )}
        </span>
      </div>

      <div className="relative mt-1.5 flex items-baseline gap-2">
        <span className={`text-3xl font-extrabold tabular-nums ${streak === 0 ? 'text-chrome-faint' : 'text-bone'}`}>
          {streak}
        </span>
        <span className="text-[10px] tracking-[0.3em] text-chrome-dim">{unit} CLEAN</span>
      </div>

      {/* Progress hairline */}
      <div className="relative mt-2 h-[3px] w-full bg-white/10">
        <motion.div
          className="h-[3px] bg-blood shadow-glow-red"
          style={{ scaleX: progress, transformOrigin: 'left', width: '100%' }}
        />
      </div>
    </motion.div>
  );
}
