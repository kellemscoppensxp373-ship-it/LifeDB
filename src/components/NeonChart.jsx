import { useEffect, useRef, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { animate } from 'framer-motion';
import { useStore } from '../store/Store.js';

/** Typewriter-effect number: tweens to each new value via Framer Motion. */
function TypewriterNumber({ value }) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);

  useEffect(() => {
    const controls = animate(prev.current, value, {
      duration: 0.45,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(v),
    });
    prev.current = value;
    return () => controls.stop();
  }, [value]);

  return (
    <span className="tabular-nums">
      {String(Math.round(display)).padStart(4, '0')}
      <motionCaret />
    </span>
  );
}

function motionCaret() {
  return <span className="text-toxic">▌</span>;
}

/** Target-frame tooltip: corner brackets around a typewriter readout. */
function TargetTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const v = payload[0].value;
  return (
    <div className="relative border border-toxic/50 bg-black/85 px-4 py-2.5 backdrop-blur-2xl">
      <span className="absolute -left-px -top-px h-2.5 w-2.5 border-l-2 border-t-2 border-toxic" />
      <span className="absolute -right-px -top-px h-2.5 w-2.5 border-r-2 border-t-2 border-toxic" />
      <span className="absolute -bottom-px -left-px h-2.5 w-2.5 border-b-2 border-l-2 border-toxic" />
      <span className="absolute -bottom-px -right-px h-2.5 w-2.5 border-b-2 border-r-2 border-toxic" />
      <div className="text-[9px] tracking-[0.3em] text-chrome-dim">TARGET LOCK /// {label}</div>
      <div className="text-glow-green mt-0.5 text-xl font-bold tracking-[0.1em] text-toxic">
        <TypewriterNumber value={v} />
      </div>
      <div className="text-[9px] tracking-[0.3em] text-chrome-dim">OUTPUT.PTS</div>
    </div>
  );
}

/**
 * NeonChart — absolutely flat Recharts surface.
 * Thick glowing neon cord + gradient fading to the bottom.
 */
export default function NeonChart() {
  const series = useStore((s) => s.series);
  const peak = Math.max(...series.map((p) => p.output));

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[10px] tracking-[0.2em] text-chrome-dim">
        <span>
          PEAK <span className="font-bold text-toxic">{peak}</span> PTS
        </span>
        <span className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-[3px] w-5 bg-toxic shadow-glow-green" /> OUTPUT
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-px w-5 bg-chrome-dim" /> BASELINE
          </span>
        </span>
      </div>
      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
            <defs>
              <linearGradient id="neonFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00ff66" stopOpacity={0.5} />
                <stop offset="55%" stopColor="#00ff66" stopOpacity={0.12} />
                <stop offset="100%" stopColor="#00ff66" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="baseFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7d838c" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#7d838c" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              dataKey="d"
              tick={{ fill: '#5a5f5c', fontSize: 9, fontFamily: 'JetBrains Mono, monospace' }}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255,255,255,0.14)' }}
              interval={4}
            />
            <YAxis
              tick={{ fill: '#5a5f5c', fontSize: 9, fontFamily: 'JetBrains Mono, monospace' }}
              tickLine={false}
              axisLine={false}
              width={40}
            />
            <Tooltip content={<TargetTooltip />} cursor={{ stroke: '#00ff66', strokeOpacity: 0.35, strokeDasharray: '3 3' }} />
            <Area
              type="monotone"
              dataKey="baseline"
              stroke="#7d838c"
              strokeWidth={1}
              fill="url(#baseFill)"
              dot={false}
              activeDot={false}
            />
            <Area
              type="monotone"
              dataKey="output"
              stroke="#00ff66"
              strokeWidth={3}
              fill="url(#neonFill)"
              dot={false}
              activeDot={{ r: 4, fill: '#030304', stroke: '#00ff66', strokeWidth: 2 }}
              style={{ filter: 'drop-shadow(0 0 7px rgba(0,255,102,0.9))' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
