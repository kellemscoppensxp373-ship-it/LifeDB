import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, RotateCcw, Crosshair } from 'lucide-react';
import SlideToTension from './SlideToTension.jsx';
import { useStore } from '../store/Store.js';

/**
 * WorkoutModule — horizontal carousel of set capsules.
 * Confirming a set presses it into the background, glows it, slides it
 * left, and brings in a new empty capsule. Selecting an exercise also
 * fires the 3D avatar dolly-zoom to the targeted muscle.
 */
export default function WorkoutModule() {
  const exercises = useStore((s) => s.exercises);
  const activeId = useStore((s) => s.activeExerciseId);
  const selectExercise = useStore((s) => s.selectExercise);
  const confirmSet = useStore((s) => s.confirmSet);
  const resetExercise = useStore((s) => s.resetExercise);

  const ex = exercises.find((e) => e.id === activeId) || exercises[0];
  const doneCount = ex.sets.filter((s) => s.done).length;
  const volume = ex.sets.filter((s) => s.done).reduce((a, s) => a + s.w * s.r, 0);

  return (
    <div>
      {/* Exercise selector */}
      <div className="flex flex-wrap gap-1.5">
        {exercises.map((e) => {
          const active = e.id === ex.id;
          return (
            <motion.button
              key={e.id}
              onClick={() => selectExercise(e.id)}
              whileTap={{ scale: 0.95 }}
              className={`clip-tag-sm border px-2.5 py-1.5 text-[10px] font-bold tracking-[0.18em] transition-colors ${
                active
                  ? 'border-toxic/70 bg-toxic/10 text-toxic shadow-glow-green'
                  : 'border-white/15 bg-white/[0.02] text-chrome-dim hover:border-white/30 hover:text-bone'
              }`}
              title={`Target ${e.muscleLabel} on the avatar`}
            >
              {active && <Crosshair size={10} className="mr-1 inline" />}
              {e.name}
            </motion.button>
          );
        })}
      </div>

      {/* Active exercise header */}
      <div className="mt-3 flex items-center justify-between border-y border-white/10 py-2">
        <div>
          <div className="text-[13px] font-extrabold tracking-[0.2em] text-bone">{ex.name}</div>
          <div className="text-[9px] tracking-[0.3em] text-chrome-dim">
            TARGET <span className="font-bold text-toxic">{ex.muscleLabel}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] tracking-[0.2em] text-chrome-dim tabular-nums">
            {doneCount}/{ex.sets.length} <span className="text-toxic">///</span> {volume} KG.VOL
          </span>
          <button
            onClick={() => resetExercise(ex.id)}
            className="flex items-center gap-1 border border-white/15 px-2 py-1 text-[9px] tracking-[0.2em] text-chrome-dim transition-colors hover:border-blood/60 hover:text-blood"
            title="Reset sets"
          >
            <RotateCcw size={11} /> RST
          </button>
        </div>
      </div>

      {/* Set carousel */}
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        <AnimatePresence initial={false} mode="popLayout">
          {ex.sets.map((set, idx) =>
            set.done ? (
              <DoneCapsule key={set.id} set={set} index={idx} />
            ) : (
              <ActiveCapsule
                key={set.id}
                set={set}
                index={idx}
                isNext={ex.sets.slice(0, idx).every((s) => s.done)}
                onConfirm={(w, r) => confirmSet(ex.id, set.id, w, r)}
              />
            ),
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/** Confirmed set: pressed into the background, glowing, slid left. */
function DoneCapsule({ set, index }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 90, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 0.96, y: 3 }}
      exit={{ opacity: 0, x: -90, scale: 0.85 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="clip-cut-sm flex w-[118px] shrink-0 flex-col items-center gap-1 border border-toxic/60 bg-toxic/[0.07] px-2 py-3 shadow-glow-green"
    >
      <span className="flex h-6 w-6 items-center justify-center border border-toxic/70 bg-toxic/20 text-toxic">
        <Check size={13} strokeWidth={2.5} />
      </span>
      <span className="text-[9px] tracking-[0.3em] text-toxic">SET {index + 1}</span>
      <span className="text-[11px] font-bold tabular-nums text-bone">
        {set.w}<span className="text-[9px] text-chrome-dim">KG</span>
        <span className="mx-1 text-toxic">×</span>
        {set.r}<span className="text-[9px] text-chrome-dim">R</span>
      </span>
      <span className="text-[8px] tracking-[0.3em] text-toxic/70">LOGGED</span>
    </motion.div>
  );
}

/** Pending set: Slide-to-Tension entry + confirm. Only the next one is editable. */
function ActiveCapsule({ set, index, isNext, onConfirm }) {
  const [w, setW] = useState(set.w);
  const [r, setR] = useState(set.r);

  if (!isNext) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, x: 90 }}
        animate={{ opacity: 0.45, x: 0 }}
        exit={{ opacity: 0, x: -90 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="clip-cut-sm flex w-[118px] shrink-0 flex-col items-center justify-center gap-1 border border-white/10 bg-black/40 px-2 py-3"
      >
        <span className="text-[9px] tracking-[0.3em] text-chrome-faint">SET {index + 1}</span>
        <span className="text-[10px] tracking-[0.25em] text-chrome-faint">QUEUED</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 90, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -110, scale: 0.85, y: 6 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="clip-cut w-[248px] shrink-0 border border-white/25 bg-black/60 p-2.5 backdrop-blur-xl"
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-bold tracking-[0.3em] text-bone">SET {index + 1}</span>
        <span className="flex items-center gap-1 text-[9px] tracking-[0.25em] text-toxic">
          <motion.span
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
            className="inline-block h-1.5 w-1.5 bg-toxic shadow-glow-green"
          />
          LIVE ENTRY
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <SlideToTension label="W" unit="KG" min={0} max={200} step={2.5} value={w} onChange={setW} trackPx={64} compact />
        <SlideToTension label="R" unit="REPS" min={1} max={50} step={1} value={r} onChange={setR} trackPx={64} compact />
      </div>
      <motion.button
        onClick={() => onConfirm(w, r)}
        whileTap={{ scale: 0.96, y: 2 }}
        className="clip-tag-sm mt-2 flex w-full items-center justify-center gap-2 border border-toxic/60 bg-toxic/10 py-2 text-[11px] font-bold tracking-[0.35em] text-toxic transition-colors hover:bg-toxic/25 hover:shadow-glow-green"
      >
        <Check size={14} strokeWidth={2.5} /> CONFIRM
      </motion.button>
    </motion.div>
  );
}
