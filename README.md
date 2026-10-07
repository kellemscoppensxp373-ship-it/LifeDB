# LIFE.DASHBOARD // GLASS MONOLITH

A massive, premium **local-first desktop HUD**: Electron + React + Vite +
Tailwind CSS + Framer Motion + React Three Fiber + Zustand + Recharts.

Visual language: **Y2K Cyber-Gothic Glassmorphism** — deep void backgrounds,
heavy-blur black glass, 1px chrome borders, sharp 45° cut corners (never
rounded), monospace type only (JetBrains Mono / Space Mono), and stark neon
accents (cold white, chrome silver, blood red, toxic green).

## Quick start (Windows)

```bat
setup.bat
npm run electron:dev
```

`setup.bat` scaffolds a Vite React project (if needed), installs every
dependency, creates `src/components`, `src/store`, `src/electron`,
`src/assets`, `local_ai_service`, and writes the Flask + Vosk
`requirements.txt` for future local voice processing.

| Command                  | What it does                                    |
| ------------------------ | ----------------------------------------------- |
| `npm run electron:dev`   | Desktop app with hot reload (Vite + Electron)   |
| `npm run dev`            | Browser-only preview at `http://localhost:5173` |
| `npm run dist`            | Production build + OS installer via electron-builder |
| `npm run ai:serve`       | Start the offline Vosk voice service (`:5151`)  |

## Layout

- **Top Bar** — brand/clock block, weather widget (hover → blurred 7-day
  forecast), USD/EUR widget (green ▲ / red ▼ trend triangles), and a narrow
  glass music bar with Framer-Motion scrolling track text (click → album art +
  queue card).
- **Main grid** — activity heatmap (sharp neon rhombuses), flat glowing
  Recharts telemetry (target-frame tooltip + typewriter numbers), hold-to-break
  habit breakers, workout set carousel, and the R3F muscle avatar.
- **Bottom ticker** — infinite `SYS_UPTIME /// TASKS_DONE /// ...` marquee,
  pauses on hover.
- **Settings terminal** (gear, bottom-left) — CLI-style **SYSTEM / SYNC** tab
  with a **SYNC GITHUB** button that runs `git pull` inside Electron via IPC.
- **Voice widget** — summoned anywhere by the global **Alt+Space** shortcut.

## Signature interactions

- **Slide-to-Tension** (`src/components/SlideToTension.jsx`) — drag-to-enter
  numbers with live tension glow; release flashes to confirm. Used for every
  weight/rep entry. No text inputs.
- **Hold-to-Break** (`src/components/HoldToBreak.jsx`) — press-and-hold a habit
  bar for 1.5 s: it shakes, bleeds red, then glitch-shatters to reset the
  streak.
- **Avatar dolly-zoom** (`src/components/Avatar3D.jsx`) — clicking an exercise
  flies the camera to that muscle; the targeted mesh goes emissive neon.
  `frameloop="demand"` (zero idle GPU), hover parallax, crystal sharp — no DOF,
  no blur. Drop a `.glb` in and set `VITE_AVATAR_URL` to use your own model.

## Project map

```text
setup.bat                  Windows one-shot setup script
electron/                  main.js (git-pull IPC, Alt+Space) + preload.cjs bridge
src/
  main.jsx / App.jsx       shell: atmosphere, clocks, IPC listeners
  index.css                Tailwind + mono-only + no-radius enforcement
  store/Store.js           Zustand: system, media, activity, workout, habits
  components/
    TopBar, WeatherWidget, CurrencyWidget, MusicPlayer
    Dashboard, GlassPanel, Heatmap, NeonChart
    WorkoutModule, Avatar3D
    SlideToTension, HoldToBreak
    BottomTicker, SettingsTerminal, VoiceWidget
  electron/                mirror of electron/ (required structure)
  assets/                  avatar model notes
local_ai_service/          Flask + Vosk offline STT (app.py, requirements.txt)
tailwind.config.js         cut-corner clip-paths, neon tokens, glass utilities
```

## Notes

- All animation is Framer Motion — there are intentionally zero CSS keyframes.
- All data stays local: export/import JSON snapshots from Settings → Data.
- The renderer degrades gracefully in plain browsers (simulated `git pull`
  transcript, `V` key fallback for the voice overlay).
