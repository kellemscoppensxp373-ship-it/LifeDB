import { motion } from 'framer-motion';
import { Mic, MicOff, X, AudioWaveform } from 'lucide-react';
import { useStore } from '../store/Store.js';

const BARS = [10, 18, 26, 34, 26, 18, 10];

/**
 * VoiceWidget — minimalist glass recorder overlay.
 * Summoned by the Electron global shortcut Alt+Space (IPC `voice:toggle`).
 */
export default function VoiceWidget() {
  const voice = useStore((s) => s.voice);
  const toggleVoice = useStore((s) => s.toggleVoice);
  const setRecording = useStore((s) => s.setVoiceRecording);
  const pushTranscript = useStore((s) => s.pushTranscript);

  if (!voice.open) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -30, scale: 0.96, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -30, scale: 0.96, filter: 'blur(6px)' }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className="clip-cut glass-deep fixed left-1/2 top-20 z-40 w-[min(440px,calc(100vw-3rem))] -translate-x-1/2 border border-white/20 shadow-panel"
    >
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
        <span className="flex items-center gap-2 text-[10px] tracking-[0.3em] text-chrome-dim">
          <AudioWaveform size={13} className="text-toxic" />
          VOICE CAPTURE
        </span>
        <div className="flex items-center gap-2">
          <kbd className="border border-white/15 bg-white/[0.04] px-1.5 py-0.5 text-[9px] tracking-[0.2em] text-chrome-dim">
            ALT+SPACE
          </kbd>
          <button
            onClick={toggleVoice}
            className="p-1 text-chrome-dim transition-colors hover:text-blood"
            title="Close voice widget"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 p-4">
        <motion.button
          onClick={() => {
            const next = !voice.recording;
            setRecording(next);
            pushTranscript(next ? '> REC ...' : '> CAPTURE SEALED.');
          }}
          whileTap={{ scale: 0.9 }}
          animate={voice.recording ? { scale: [1, 1.08, 1] } : { scale: 1 }}
          transition={voice.recording ? { duration: 1.1, repeat: Infinity } : { duration: 0.2 }}
          className={`clip-quad flex h-14 w-14 shrink-0 items-center justify-center border ${
            voice.recording
              ? 'border-blood/70 bg-blood/15 text-blood shadow-glow-red'
              : 'border-toxic/60 bg-toxic/10 text-toxic shadow-glow-green'
          }`}
          title={voice.recording ? 'Stop recording' : 'Start recording'}
        >
          {voice.recording ? <MicOff size={20} /> : <Mic size={20} />}
        </motion.button>

        <div className="min-w-0 flex-1">
          {/* Waveform — Framer Motion bars, alive only while recording */}
          <div className="flex h-8 items-center gap-1">
            {BARS.map((h, i) => (
              <motion.span
                key={i}
                className={`w-1 ${voice.recording ? 'bg-blood' : 'bg-white/15'}`}
                style={{ height: h }}
                animate={voice.recording ? { scaleY: [1, 0.25, 1.5, 0.6, 1] } : { scaleY: 1 }}
                transition={
                  voice.recording
                    ? { duration: 0.9, repeat: Infinity, delay: i * 0.08, ease: 'easeInOut' }
                    : { duration: 0.2 }
                }
              />
            ))}
            <span className="ml-2 text-[10px] tracking-[0.3em] text-chrome-dim">
              {voice.recording ? (
                <span className="font-bold text-blood">● REC</span>
              ) : (
                'STANDBY'
              )}
            </span>
          </div>
          <div className="mt-1 truncate text-[10px] tracking-[0.15em] text-bone/70">
            {voice.transcript[voice.transcript.length - 1]}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-2 text-[9px] leading-relaxed tracking-[0.15em] text-chrome-faint">
        LOCAL PIPELINE ARMED — audio routes to local_ai_service (vosk) when the model is
        installed. Nothing streams to the cloud.
      </div>
    </motion.div>
  );
}
