import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useAnimationControls } from 'framer-motion';
import { Play, Pause, SkipForward, SkipBack, Disc3, ListMusic } from 'lucide-react';
import { useStore } from '../store/useStore.js';

/**
 * MusicPlayer — narrow glass bar (cut corners per the no-radius rule)
 * with Framer-Motion scrolling track text. Click the track to drop
 * the album-art + queue card.
 */
export default function MusicPlayer() {
  const music = useStore((s) => s.music);
  const tracks = useStore((s) => s.tracks);
  const togglePlay = useStore((s) => s.togglePlay);
  const nextTrack = useStore((s) => s.nextTrack);
  const prevTrack = useStore((s) => s.prevTrack);
  const [open, setOpen] = useState(false);

  const track = tracks[music.trackIndex];
  const marquee = useAnimationControls();

  // Scrolling monospace text — driven strictly by Framer Motion.
  useEffect(() => {
    if (music.playing) {
      marquee.start({
        x: ['8%', '-62%'],
        transition: { duration: 9, ease: 'linear', repeat: Infinity },
      });
    } else {
      marquee.stop();
    }
  }, [music.playing, music.trackIndex, marquee]);

  const upcoming = [1, 2, 3].map((o) => tracks[(music.trackIndex + o) % tracks.length]);

  return (
    <div className="relative w-full">
      <div className="clip-cut-sm flex h-full w-full items-center gap-2 border border-white/10 bg-black/60 py-1.5 pl-2 pr-3 backdrop-blur-2xl transition-colors hover:border-toxic/60">
        {/* Transport */}
        <div className="flex shrink-0 items-center">
          <button
            onClick={prevTrack}
            className="p-1.5 text-chrome-dim transition-colors hover:text-toxic"
            title="Previous track"
          >
            <SkipBack size={14} strokeWidth={1.75} />
          </button>
          <button
            onClick={togglePlay}
            className="clip-tag-sm border border-toxic/50 bg-toxic/10 p-1.5 text-toxic transition-colors hover:bg-toxic/25"
            title={music.playing ? 'Pause' : 'Play'}
          >
            {music.playing ? (
              <Pause size={14} strokeWidth={2} />
            ) : (
              <Play size={14} strokeWidth={2} />
            )}
          </button>
          <button
            onClick={nextTrack}
            className="p-1.5 text-chrome-dim transition-colors hover:text-toxic"
            title="Next track"
          >
            <SkipForward size={14} strokeWidth={1.75} />
          </button>
        </div>

        {/* Scrolling track readout (click to expand queue) */}
        <button
          onClick={() => setOpen((o) => !o)}
          className="group relative min-w-0 flex-1 overflow-hidden text-left"
          title="Open queue"
        >
          <motion.div animate={marquee} className="flex w-max whitespace-nowrap">
            {[0, 1].map((k) => (
              <span
                key={k}
                className="pr-10 text-[11px] tracking-[0.22em] text-bone/90"
                aria-hidden={k === 1}
              >
                <span className="font-bold text-toxic">▶ {track.title}</span>
                <span className="text-chrome-dim"> /// {track.artist} /// {track.album}</span>
              </span>
            ))}
          </motion.div>
          {/* progress hairline */}
          <div className="mt-1 h-px w-full bg-white/10">
            <motion.div
              className="h-px bg-toxic shadow-glow-green"
              animate={{ scaleX: music.progress }}
              style={{ transformOrigin: 'left' }}
              transition={{ duration: 0.6, ease: 'linear' }}
            />
          </div>
        </button>

        <span className="hidden shrink-0 text-[10px] tabular-nums tracking-[0.15em] text-chrome-dim md:block">
          {track.duration}
        </span>
      </div>

      {/* Dropdown: album art + queue */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -8, filter: 'blur(6px)' }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="clip-cut-sm glass-deep absolute right-0 top-[calc(100%+8px)] z-50 w-80 border border-white/10 shadow-panel"
          >
            <div className="flex gap-3 p-3">
              {/* Album art: chrome disc, spins only while playing (Framer Motion). */}
              <div
                className="clip-quad relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden border border-white/10"
                style={{
                  background: `conic-gradient(from 40deg, hsl(${track.hue} 60% 8%), hsl(${track.hue} 90% 22%), hsl(${track.hue} 60% 8%))`,
                }}
              >
                <motion.div
                  animate={music.playing ? { rotate: 360 } : { rotate: 0 }}
                  transition={
                    music.playing
                      ? { duration: 7, repeat: Infinity, ease: 'linear' }
                      : { duration: 0.4 }
                  }
                >
                  <Disc3 size={54} strokeWidth={1} className="text-bone/85" />
                </motion.div>
                <span className="absolute bottom-1 right-1 bg-black/70 px-1 text-[8px] tracking-[0.2em] text-toxic">
                  {track.duration}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[9px] tracking-[0.3em] text-chrome-dim">NOW PLAYING</div>
                <div className="text-glow-green mt-1 truncate text-[13px] font-bold tracking-[0.12em] text-toxic">
                  {track.title}
                </div>
                <div className="truncate text-[10px] tracking-[0.2em] text-bone/80">{track.artist}</div>
                <div className="truncate text-[10px] tracking-[0.2em] text-chrome-dim">{track.album}</div>
                <div className="mt-2 h-1 w-full bg-white/10">
                  <motion.div
                    className="h-1 bg-toxic"
                    animate={{ scaleX: music.progress }}
                    style={{ transformOrigin: 'left' }}
                    transition={{ duration: 0.6, ease: 'linear' }}
                  />
                </div>
              </div>
            </div>
            <div className="border-t border-white/10 px-3 py-2 text-[9px] tracking-[0.3em] text-chrome-dim">
              <ListMusic size={11} className="mr-1.5 inline text-toxic" />
              UP NEXT
            </div>
            <ul className="px-1.5 pb-2">
              {upcoming.map((t, i) => (
                <motion.li
                  key={`${t.title}-${i}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.25 }}
                  className="flex items-center gap-2 px-2 py-1.5 text-[10px] tracking-[0.15em] hover:bg-white/[0.05]"
                >
                  <span className="text-toxic">0{i + 1}</span>
                  <span className="flex-1 truncate font-bold text-bone/85">{t.title}</span>
                  <span className="truncate text-chrome-dim">{t.artist}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
