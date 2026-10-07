# LIFE.DASHBOARD // GLASS MONOLITH

A massive, premium **local-first desktop HUD**: Electron + React + Vite +
Tailwind CSS + Framer Motion + React Three Fiber + Zustand + Recharts.

Visual language: **Y2K Cyber-Gothic Glassmorphism** — zinc-950 deep space,
heavy-blur black glass, 1px `border-white/10` chrome hairlines, sharp 45°
cut corners (`rounded-none`, never rounded), monospace type only (JetBrains
Mono / Space Mono), and stark accents (chrome `#E5E7EB`, blood `#DC2626`,
toxic `#10B981`).

## Quick start (Windows)

```bat
setup.bat
npm run electron:dev
```

`setup.bat` scaffolds a Vite React project (if needed), installs every
dependency, creates `src/components`, `src/store`, `src/electron`,
`src/assets/models`, runs `git init`, and writes the Flask + Vosk
`requirements.txt` for future local voice processing.

| Command                  | What it does                                    |
| ------------------------ | ----------------------------------------------- |
| `npm run electron:dev`   | Desktop app with hot reload (Vite + Electron)   |
| `npm run dev`            | Browser-only preview at `http://localhost:5173` |
| `npm run dist`            | Production build + OS installer via electron-builder |
| `npm run ai:serve`       | Start the offline Vosk voice service (`:5151`)  |
| `auto_push.bat`          | One double-click: commit + push everything to `main` |

## DevOps: every push builds the .exe

- `auto_push.bat` — `git add .` → timestamp commit → `git branch -M main` →
  `git push -u origin main`.
- `.github/workflows/build.yml` — on every push to `main`: checkout, Node 20,
  `npm ci`, Vite build, `electron-builder --win`, then uploads `release/` as
  the `LifeDashboard-win-<sha>` artifact. Download your fresh `.exe` from the
  Actions run — no manual packaging.

## Layout

- **Top Bar** — brand/clock block, weather widget (hover → blurred 7-day
  forecast), USD/EUR widget (green ▲ / red ▼ trend triangles), a narrow
  glass music bar with Framer-Motion scrolling track text (click → album art +
  queue card), and custom frameless traffic lights (Electron only — the bar is
  the window drag handle).
- **Main grid** — activity heatmap (sharp neon rhombuses), flat glowing
  Recharts telemetry (target-frame tooltip + typewriter numbers),
  hold-to-break habit breakers, workout set carousel, and the R3F muscle avatar.
- **Bottom ticker** — infinite `SYS_UPTIME /// TASKS_DONE /// ...` marquee,
  pauses on hover.
- **Settings terminal** (gear, bottom-left) — CLI-style **SYSTEM / SYNC** tab
  with a **SYNC GITHUB** button that fires the `update-app` IPC channel
  (`git pull origin main`) and streams stdout into the terminal.
- **Voice widget** — summoned anywhere by the global **Alt+Space** shortcut
  (`voice-input-open` IPC).

## Signature interactions

- **SlideTensionInput** (`src/components/SlideTensionInput.jsx`) — drag-to-enter
  numbers with live tension glow and rapid tick-up; release flashes WHITE and
  saves to Zustand (`tensionValues[id]`). Used for every weight/rep entry.
- **HoldToBreakBar** (`src/components/HoldToBreakBar.jsx`) — press-and-hold a
  habit bar for 1.5 s: it shakes, bleeds red, then shatters (opacity 0,
  scale 1.2) to reset the streak.
- **Avatar dolly-zoom** (`src/components/Avatar3D.jsx`) — clicking an exercise
  flies the camera to that muscle via a Framer Motion tween; the targeted mesh
  (named from the `MESH_TARGETS` registry: Lats/Chest/Shoulders/Biceps/Quads/
  Glutes) goes emissive neon. `frameloop="demand"` (zero idle GPU), hover
  parallax, crystal sharp — no DOF, no blur. Drop a `.glb` in
  `src/assets/models/` and set `VITE_AVATAR_URL` to use your own model.

## Project map

```text
setup.bat                  Windows one-shot setup (Vite, deps, tree, git init)
auto_push.bat              One-click commit + push to main (triggers CI build)
.github/workflows/build.yml  CI: build Windows .exe on every push to main
electron/                  main.js (update-app IPC, Alt+Space, frameless) + preload.cjs
src/
  main.jsx / App.jsx       shell: atmosphere, clocks, IPC listeners
  index.css                Tailwind + mono-only + no-radius + drag regions
  store/useStore.js        Zustand: system, media, activity, workout, habits, tension
  components/
    TopBar, WindowControls, WeatherWidget, CurrencyWidget, MusicPlayer
    Dashboard, GlassPanel, Heatmap, NeonChart
    WorkoutModule, Avatar3D
    SlideTensionInput, HoldToBreakBar
    BottomTicker, SettingsTerminal, VoiceWidget
  electron/                mirror of electron/ (required structure)
  assets/models/           humanoid .glb drop zone
local_ai_service/          Flask + Vosk offline STT (app.py, requirements.txt)
tailwind.config.js         cut-corner clip-paths, neon tokens, glass utilities
```

## Notes

- The Electron shell is transparent + frameless; custom minimize/maximize/close
  controls live in the TopBar and render only when `window.electronAPI` exists.
- All animation is Framer Motion — there are intentionally zero CSS keyframes.
- All data stays local: export/import JSON snapshots from Settings → Data.
- The renderer degrades gracefully in plain browsers (simulated `git pull`
  transcript, `V` key fallback for the voice overlay).
