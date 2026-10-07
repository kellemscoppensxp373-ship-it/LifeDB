import { Activity, BarChart3, Flame, Dumbbell, ScanFace, ListChecks } from 'lucide-react';
import GlassPanel from './GlassPanel.jsx';
import Heatmap from './Heatmap.jsx';
import NeonChart from './NeonChart.jsx';
import HoldToBreak from './HoldToBreak.jsx';
import WorkoutModule from './WorkoutModule.jsx';
import Avatar3D from './Avatar3D.jsx';
import { useStore } from '../store/Store.js';

/**
 * Dashboard — main grid.
 * Left rail: activity matrix (heatmap), output chart, negative-habit breakers.
 * Right rail: workout carousel + 3D muscle avatar.
 */
export default function Dashboard() {
  const habits = useStore((s) => s.habits);
  const resetHabit = useStore((s) => s.resetHabit);
  const tasksDone = useStore((s) => s.tasksDone);
  const tasksTotal = useStore((s) => s.tasksTotal);
  const incTasks = useStore((s) => s.incTasks);

  return (
    <div className="mx-auto grid max-w-[1720px] grid-cols-1 gap-3 xl:grid-cols-12">
      {/* ================= LEFT RAIL ================= */}
      <div className="flex min-w-0 flex-col gap-3 xl:col-span-7">
        <GlassPanel
          title="ACTIVITY MATRIX"
          icon={Activity}
          status="LIVE"
          delay={0.05}
          right={
            <span className="text-[10px] tracking-[0.2em] text-chrome-dim">
              LAST 26 WK <span className="text-toxic">///</span> OUTPUT DENSITY
            </span>
          }
        >
          <Heatmap />
        </GlassPanel>

        <GlassPanel
          title="OUTPUT TELEMETRY"
          icon={BarChart3}
          status="30D"
          delay={0.12}
          right={
            <button
              onClick={incTasks}
              className="clip-tag-sm group flex items-center gap-2 border border-white/20 bg-white/[0.04] px-2.5 py-1 text-[10px] tracking-[0.2em] text-bone/80 transition-colors hover:border-toxic/70 hover:text-toxic"
              title="Log a completed task"
            >
              <ListChecks size={12} strokeWidth={1.75} />
              TASKS {tasksDone}/{tasksTotal} <span className="text-toxic">+</span>
            </button>
          }
        >
          <NeonChart />
        </GlassPanel>

        <GlassPanel
          title="NEGATIVE HABITS // HOLD-TO-BREAK"
          icon={Flame}
          status="ARMED"
          delay={0.19}
          right={
            <span className="text-[10px] tracking-[0.2em] text-chrome-dim">
              HOLD <span className="text-blood">1.5S</span> TO SHATTER STREAK
            </span>
          }
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {habits.map((h) => (
              <HoldToBreak
                key={h.id}
                label={h.label}
                streak={h.streak}
                unit={h.unit}
                onReset={() => resetHabit(h.id)}
              />
            ))}
          </div>
        </GlassPanel>
      </div>

      {/* ================= RIGHT RAIL ================= */}
      <div className="flex min-w-0 flex-col gap-3 xl:col-span-5">
        <GlassPanel
          title="WORKOUT // SET CAROUSEL"
          icon={Dumbbell}
          status="TRACKING"
          delay={0.08}
          bodyClassName="p-4 pt-3"
        >
          <WorkoutModule />
        </GlassPanel>

        <GlassPanel
          title="MUSCLE AVATAR // R3F"
          icon={ScanFace}
          status="DEMAND"
          delay={0.15}
          bodyClassName="p-0"
          right={
            <span className="text-[10px] tracking-[0.2em] text-chrome-dim">
              <span className="text-toxic">FRAMELOOP:DEMAND</span> /// SHARP
            </span>
          }
        >
          <Avatar3D />
        </GlassPanel>
      </div>
    </div>
  );
}
