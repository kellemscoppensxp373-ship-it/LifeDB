import { create } from 'zustand';

/* ================================================================
   LIFE DASHBOARD — global store (Zustand)
   Single source of truth for system stats, media, activity,
   workouts, habits, voice overlay and settings.
   ================================================================ */

// Deterministic PRNG so demo data is stable between reloads.
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(1337);

// ---------- Heatmap: 26 weeks x 7 days ----------
function buildHeatmap() {
  const weeks = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Align to Monday-start weeks.
  const dayIdx = (today.getDay() + 6) % 7;
  const thisMonday = new Date(today);
  thisMonday.setDate(today.getDate() - dayIdx);

  for (let w = 25; w >= 0; w--) {
    const days = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(thisMonday);
      date.setDate(thisMonday.getDate() - w * 7 + d);
      const future = date > today;
      // Wave-shaped activity + noise.
      const wave = Math.sin((25 - w) / 25 * Math.PI * 3 + d * 0.7) * 0.5 + 0.5;
      const roll = rng();
      let level = 0;
      if (!future) {
        const score = wave * 0.65 + roll * 0.55;
        level = score > 1.02 ? 4 : score > 0.82 ? 3 : score > 0.6 ? 2 : score > 0.38 ? 1 : 0;
      }
      days.push({
        iso: date.toISOString().slice(0, 10),
        label: date.toLocaleDateString('en-GB', { day: '2-digit', mon: 'short' }).toUpperCase(),
        level,
        count: level === 0 ? 0 : Math.round(level * (2 + rng() * 4)),
        future,
      });
    }
    weeks.push(days);
  }
  return weeks;
}

// ---------- Activity series: 30 days ----------
function buildSeries() {
  const pts = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const t = (29 - i) / 29;
    const base = 42 + Math.sin(t * Math.PI * 4) * 18 + t * 26;
    pts.push({
      d: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase(),
      output: Math.max(4, Math.round(base + (rng() - 0.5) * 16)),
      baseline: Math.round(44 + t * 14),
    });
  }
  return pts;
}

const TRACKS = [
  { title: 'CHROME REQUIEM', artist: 'MONOLITH CHOIR', album: 'GLASS//GOTHIC', duration: '04:12', hue: 140 },
  { title: 'NEON LITURGY', artist: 'COLD CIRCUIT', album: 'GLASS//GOTHIC', duration: '03:47', hue: 200 },
  { title: 'BLOOD FREQUENCY', artist: 'VANTABLACK VESPERS', album: 'Y2K REQUIEM', duration: '05:03', hue: 350 },
  { title: 'STATIC CATHEDRAL', artist: 'MONOLITH CHOIR', album: 'Y2K REQUIEM', duration: '04:31', hue: 90 },
  { title: 'TOXIC PSALM 066', artist: 'COLD CIRCUIT', album: 'TENSION//HOLD', duration: '03:58', hue: 160 },
];

const FORECAST = [
  { day: 'TUE', hi: 14, lo: 7, cond: 'CLEAR' },
  { day: 'WED', hi: 12, lo: 6, cond: 'WIND' },
  { day: 'THU', hi: 11, lo: 5, cond: 'RAIN' },
  { day: 'FRI', hi: 13, lo: 6, cond: 'CLOUD' },
  { day: 'SAT', hi: 15, lo: 8, cond: 'CLEAR' },
  { day: 'SUN', hi: 16, lo: 9, cond: 'CLEAR' },
  { day: 'MON', hi: 14, lo: 7, cond: 'STORM' },
];

function freshSet(w, r) {
  return { w, r, done: false, id: Math.random().toString(36).slice(2, 9) };
}

const EXERCISES = [
  {
    id: 'pullups', name: 'PULLUPS', muscle: 'lats', muscleLabel: 'BACK / LATS',
    sets: [freshSet(0, 10), freshSet(0, 8), freshSet(0, 8)],
  },
  {
    id: 'bench', name: 'BENCH PRESS', muscle: 'chest', muscleLabel: 'CHEST',
    sets: [freshSet(60, 8), freshSet(70, 6), freshSet(70, 6)],
  },
  {
    id: 'squat', name: 'BACK SQUAT', muscle: 'quads', muscleLabel: 'QUADS',
    sets: [freshSet(80, 8), freshSet(100, 5), freshSet(100, 5)],
  },
  {
    id: 'ohp', name: 'OVERHEAD PRESS', muscle: 'shoulders', muscleLabel: 'DELTS / TRAPS',
    sets: [freshSet(40, 8), freshSet(45, 6), freshSet(45, 6)],
  },
  {
    id: 'curls', name: 'CURLS', muscle: 'biceps', muscleLabel: 'BICEPS',
    sets: [freshSet(16, 12), freshSet(18, 10), freshSet(18, 10)],
  },
  {
    id: 'rdl', name: 'ROMANIAN DEADLIFT', muscle: 'glutes', muscleLabel: 'GLUTES / HAMS',
    sets: [freshSet(70, 10), freshSet(80, 8), freshSet(80, 8)],
  },
];

export const useStore = create((set, get) => ({
  // ---------- System ----------
  bootedAt: Date.now() - 48 * 3600 * 1000 - 14 * 60 * 1000, // ~48h uptime
  now: Date.now(),
  tickClock: () => set({ now: Date.now() }),
  tasksDone: 12,
  tasksTotal: 18,
  workoutStreak: 4,
  incTasks: () => set((s) => ({ tasksDone: Math.min(s.tasksTotal, s.tasksDone + 1) })),
  lastSyncAt: null,
  setLastSync: (t) => set({ lastSyncAt: t }),

  // ---------- Weather ----------
  weather: { temp: 13, cond: 'CLEAR NIGHT', humidity: 41, wind: 18, city: 'SECTOR 07' },
  forecast: FORECAST,

  // ---------- Currency (random-walk demo feed) ----------
  fx: {
    USD: { rate: 1.0842, delta: +0.0012 },
    EUR: { rate: 0.9224, delta: -0.0008 },
  },
  tickFx: () =>
    set((s) => {
      const walk = (r) => (Math.random() - 0.5) * 0.0016;
      const dUsd = walk(); const dEur = walk();
      return {
        fx: {
          USD: { rate: +(s.fx.USD.rate + dUsd).toFixed(4), delta: +dUsd.toFixed(4) },
          EUR: { rate: +(s.fx.EUR.rate + dEur).toFixed(4), delta: +dEur.toFixed(4) },
        },
      };
    }),

  // ---------- Music ----------
  music: { playing: true, trackIndex: 0, progress: 0.34 },
  tracks: TRACKS,
  togglePlay: () => set((s) => ({ music: { ...s.music, playing: !s.music.playing } })),
  nextTrack: () =>
    set((s) => ({
      music: { ...s.music, trackIndex: (s.music.trackIndex + 1) % s.tracks.length, progress: 0 },
    })),
  prevTrack: () =>
    set((s) => ({
      music: {
        ...s.music,
        trackIndex: (s.music.trackIndex - 1 + s.tracks.length) % s.tracks.length,
        progress: 0,
      },
    })),
  tickProgress: () =>
    set((s) => {
      if (!s.music.playing) return s;
      const p = s.music.progress + 0.004;
      if (p >= 1) {
        return { music: { ...s.music, trackIndex: (s.music.trackIndex + 1) % s.tracks.length, progress: 0 } };
      }
      return { music: { ...s.music, progress: p } };
    }),

  // ---------- Activity ----------
  heatmap: buildHeatmap(),
  series: buildSeries(),

  // ---------- Workout ----------
  exercises: EXERCISES,
  activeExerciseId: 'pullups',
  avatarTarget: 'default', // camera target muscle for the 3D avatar
  selectExercise: (id) =>
    set((s) => {
      const ex = s.exercises.find((e) => e.id === id);
      return { activeExerciseId: id, avatarTarget: ex ? ex.muscle : 'default' };
    }),
  resetAvatarTarget: () => set({ avatarTarget: 'default' }),
  confirmSet: (exerciseId, setId, w, r) =>
    set((s) => ({
      exercises: s.exercises.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        const sets = ex.sets.map((st) => (st.id === setId ? { ...st, w, r, done: true } : st));
        // Bring in a fresh empty capsule once every set is confirmed.
        const allDone = sets.every((st) => st.done);
        return { ...ex, sets: allDone ? [...sets, freshSet(w, r)] : sets };
      }),
    })),
  resetExercise: (exerciseId) =>
    set((s) => ({
      exercises: s.exercises.map((ex) =>
        ex.id === exerciseId
          ? { ...ex, sets: ex.sets.map((st) => ({ ...st, done: false })) }
          : ex,
      ),
    })),

  // ---------- Negative habits (Hold-to-Break) ----------
  habits: [
    { id: 'nicotine', label: 'NICOTINE', streak: 12, unit: 'DAYS' },
    { id: 'sugar', label: 'SUGAR', streak: 4, unit: 'DAYS' },
    { id: 'doomscroll', label: 'DOOMSCROLL', streak: 7, unit: 'DAYS' },
  ],
  resetHabit: (id) =>
    set((s) => ({ habits: s.habits.map((h) => (h.id === id ? { ...h, streak: 0 } : h)) })),

  // ---------- Settings ----------
  settingsOpen: false,
  settingsTab: 'sync',
  setSettingsOpen: (open) => set({ settingsOpen: open }),
  setSettingsTab: (tab) => set({ settingsTab: tab }),
  accent: 'toxic',
  setAccent: (accent) => set({ accent }),

  // ---------- SlideTensionInput registry (numeric entries persist here) ----------
  tensionValues: {},
  setTensionValue: (id, value) =>
    set((s) => ({ tensionValues: { ...s.tensionValues, [id]: value } })),

  // ---------- Voice overlay (Alt+Space global shortcut) ----------
  voice: { open: false, recording: false, transcript: ['> AWAITING INPUT...'] },
  toggleVoice: () => set((s) => ({ voice: { ...s.voice, open: !s.voice.open } })),
  setVoiceRecording: (recording) => set((s) => ({ voice: { ...s.voice, recording } })),
  pushTranscript: (line) =>
    set((s) => ({ voice: { ...s.voice, transcript: [...s.voice.transcript.slice(-5), line] } })),

  // Export / import whole dashboard state (settings > data).
  exportState: () => {
    const s = get();
    return JSON.stringify(
      { tasksDone: s.tasksDone, workoutStreak: s.workoutStreak, habits: s.habits, exercises: s.exercises, lastSyncAt: s.lastSyncAt },
      null,
      2,
    );
  },
  importState: (json) => {
    try {
      const p = JSON.parse(json);
      set((s) => ({
        tasksDone: p.tasksDone ?? s.tasksDone,
        workoutStreak: p.workoutStreak ?? s.workoutStreak,
        habits: p.habits ?? s.habits,
        exercises: p.exercises ?? s.exercises,
        lastSyncAt: p.lastSyncAt ?? s.lastSyncAt,
      }));
      return true;
    } catch {
      return false;
    }
  },
}));

export function formatUptime(bootedAt, now) {
  const s = Math.max(0, Math.floor((now - bootedAt) / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, '0')}H:${String(m).padStart(2, '0')}M:${String(sec).padStart(2, '0')}S`;
}
