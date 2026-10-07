import { motion } from 'framer-motion';

/**
 * GlassPanel — signature GLASS MONOLITH container.
 * Cut corners (clip-path), dark translucent glass, 1px chrome border,
 * HUD corner ticks, staggered Framer Motion entrance.
 */
export default function GlassPanel({
  title,
  icon: Icon,
  status,
  right,
  clip = 'clip-cut',
  delay = 0,
  className = '',
  bodyClassName = 'p-4',
  children,
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`${clip} glass relative rounded-none border border-white/10 shadow-panel ${className}`}
    >
      {/* HUD corner ticks */}
      <span className="pointer-events-none absolute left-0 top-0 h-3 w-3 border-l-2 border-t-2 border-toxic/80" />
      <span className="pointer-events-none absolute bottom-0 right-0 h-3 w-3 border-b-2 border-r-2 border-toxic/80" />

      {(title || right) && (
        <header className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2.5">
          <div className="flex min-w-0 items-center gap-2.5">
            {Icon && <Icon size={14} className="shrink-0 text-toxic" strokeWidth={1.75} />}
            {title && (
              <h2 className="truncate text-[11px] font-bold tracking-[0.28em] text-bone/90">
                {title}
              </h2>
            )}
            {status && (
              <span className="hidden items-center gap-1.5 border border-white/10 bg-white/[0.03] px-1.5 py-0.5 text-[9px] tracking-[0.2em] text-chrome-dim sm:flex">
                <span className="inline-block h-1.5 w-1.5 bg-toxic shadow-glow-green" />
                {status}
              </span>
            )}
          </div>
          {right && <div className="flex shrink-0 items-center gap-2">{right}</div>}
        </header>
      )}
      <div className={bodyClassName}>{children}</div>
    </motion.section>
  );
}
