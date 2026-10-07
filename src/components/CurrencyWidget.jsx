import { motion } from 'framer-motion';
import { ArrowLeftRight } from 'lucide-react';
import { useStore } from '../store/useStore.js';

function FxRow({ code, rate, delta }) {
  const up = delta >= 0;
  return (
    <div className="flex items-center gap-2">
      <span className="w-8 text-[10px] font-bold tracking-[0.2em] text-bone/90">{code}</span>
      <motion.span
        key={rate}
        initial={{ opacity: 0.2, y: up ? 3 : -3 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="min-w-[64px] text-[12px] font-semibold tabular-nums text-bone"
      >
        {rate.toFixed(4)}
      </motion.span>
      <span className={up ? 'tri-up' : 'tri-down'} title={up ? 'trend up' : 'trend down'} />
      <span className={`text-[10px] tabular-nums ${up ? 'text-toxic' : 'text-blood'}`}>
        {up ? '+' : ''}{delta.toFixed(4)}
      </span>
    </div>
  );
}

/**
 * CurrencyWidget — USD + EUR with minimal trend triangles.
 * Green up / red down. Feed random-walks every few seconds.
 */
export default function CurrencyWidget() {
  const fx = useStore((s) => s.fx);

  return (
    <div className="clip-cut-sm flex h-full items-center gap-3 border border-white/10 bg-black/60 px-3 py-1.5 backdrop-blur-2xl transition-colors hover:border-toxic/60">
      <ArrowLeftRight size={18} strokeWidth={1.5} className="shrink-0 text-chrome" />
      <div className="flex flex-col gap-1.5">
        <FxRow code="USD" rate={fx.USD.rate} delta={fx.USD.delta} />
        <FxRow code="EUR" rate={fx.EUR.rate} delta={fx.EUR.delta} />
      </div>
      <div className="hidden border-l border-white/10 pl-3 text-[9px] leading-relaxed tracking-[0.2em] text-chrome-dim lg:block">
        FX<span className="text-toxic">.FEED</span>
        <br />
        <span className="text-chrome-faint">LIVE /// 3.5S</span>
      </div>
    </div>
  );
}
