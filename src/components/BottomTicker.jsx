import { useEffect } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import { useStore, formatUptime } from '../store/Store.js';

/**
 * BottomTicker — constant marquee pinned to the absolute bottom.
 * Framer-Motion loop (no CSS animations). Pauses on hover.
 */
export default function BottomTicker() {
  const bootedAt = useStore((s) => s.bootedAt);
  const now = useStore((s) => s.now);
  const tasksDone = useStore((s) => s.tasksDone);
  const tasksTotal = useStore((s) => s.tasksTotal);
  const workoutStreak = useStore((s) => s.workoutStreak);
  const habits = useStore((s) => s.habits);
  const lastSyncAt = useStore((s) => s.lastSyncAt);

  const controls = useAnimationControls();

  const start = () =>
    controls.start({
      x: ['0%', '-50%'],
      transition: { duration: 30, ease: 'linear', repeat: Infinity },
    });

  useEffect(() => {
    start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controls]);

  const items = [
    `SYS_UPTIME: ${formatUptime(bootedAt, now)}`,
    `TASKS_DONE: ${tasksDone}/${tasksTotal}`,
    `WORKOUT_STREAK: ${workoutStreak} DAYS`,
    `HABIT_STREAKS: ${habits.map((h) => `${h.label}:${h.streak}`).join(' ')}`,
    `LAST_SYNC: ${lastSyncAt ? new Date(lastSyncAt).toLocaleTimeString('en-GB') : 'NEVER'}`,
    `VOICE: ALT+SPACE`,
    `BUILD: v1.0.0 // GLASS MONOLITH`,
  ];

  const Row = ({ hidden }) => (
    <div className="flex shrink-0 items-center" aria-hidden={hidden}>
      {items.map((it, i) => (
        <span key={i} className="flex items-center whitespace-nowrap">
          <span className="px-5 text-[10px] tracking-[0.25em] text-bone/80">[{it}]</span>
          <span className="text-[10px] text-toxic">///</span>
        </span>
      ))}
    </div>
  );

  return (
    <footer
      className="relative z-20 h-8 shrink-0 overflow-hidden border-t border-white/10 bg-black/70 backdrop-blur-2xl"
      onMouseEnter={() => controls.stop()}
      onMouseLeave={() => start()}
      title="System ticker — hover to pause"
    >
      <div className="hud-divider absolute left-0 right-0 top-0 opacity-60" />
      <motion.div animate={controls} className="flex h-full w-max items-center">
        <Row hidden={false} />
        <Row hidden={true} />
      </motion.div>
      <span className="absolute right-3 top-1/2 hidden -translate-y-1/2 border border-white/10 bg-black/60 px-1.5 py-0.5 text-[8px] tracking-[0.3em] text-chrome-dim sm:block">
        HOVER:PAUSE
      </span>
    </footer>
  );
}
