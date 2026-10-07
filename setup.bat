@echo off
REM ================================================================
REM  LIFE DASHBOARD :: SETUP
REM  Glass Monolith // Y2K Cyber-Gothic // Electron + React + Vite
REM
REM  Usage: double-click setup.bat from the project root.
REM  Scaffolds Vite, installs deps, creates the tree, inits Git,
REM  and prepares the local AI voice service.
REM ================================================================
setlocal EnableDelayedExpansion
title LIFE DASHBOARD // SETUP

echo.
echo  ======================================================
echo   LIFE DASHBOARD // SETUP
echo   Glass Monolith // Y2K Cyber-Gothic
echo  ======================================================
echo.

REM --- 0. Sanity checks ------------------------------------------------
where node >nul 2>nul
if errorlevel 1 (
  echo  [FATAL] Node.js not found. Install Node 18+ LTS, then re-run setup.bat.
  pause
  exit /b 1
)
where npm >nul 2>nul
if errorlevel 1 (
  echo  [FATAL] npm not found. Reinstall Node.js LTS, then re-run setup.bat.
  pause
  exit /b 1
)
for /f "tokens=*" %%v in ('node --version') do echo  [OK] Node %%v detected.

REM --- 1. Initialize a Vite React project -------------------------------
if not exist package.json (
  echo.
  echo  [1/6] Scaffolding Vite React project...
  call npm create vite@latest . -- --template react
  if errorlevel 1 (
    echo  [FATAL] Vite scaffold failed.
    pause
    exit /b 1
  )
) else (
  echo.
  echo  [1/6] package.json found - skipping Vite scaffold.
)

REM --- 2. Install all dependencies --------------------------------------
echo.
echo  [2/6] Installing runtime dependencies...
call npm install electron react react-dom tailwindcss framer-motion @react-three/fiber @react-three/drei zustand recharts lucide-react concurrently wait-on cross-env three
if errorlevel 1 (
  echo  [FATAL] Runtime dependency install failed.
  pause
  exit /b 1
)
REM NOTE: `three` rides along as the required peer of @react-three/fiber + drei.

echo.
echo  [2/6] Installing dev/tooling dependencies...
call npm install -D vite @vitejs/plugin-react autoprefixer postcss electron-builder
if errorlevel 1 (
  echo  [FATAL] Dev dependency install failed.
  pause
  exit /b 1
)
echo  [OK] All dependencies installed.

REM --- 3. Create directory tree ------------------------------------------
echo.
echo  [3/6] Creating directory tree...
if not exist src\components mkdir src\components
if not exist src\store mkdir src\store
if not exist src\electron mkdir src\electron
if not exist src\assets\models mkdir src\assets\models
if not exist electron mkdir electron
if not exist local_ai_service mkdir local_ai_service
echo  [OK] src\components, src\store, src\electron, src\assets\models ^(+ electron, local_ai_service^)

REM --- 4. Initialize Git repository ---------------------------------------
echo.
echo  [4/6] Initializing Git repository...
where git >nul 2>nul
if errorlevel 1 (
  echo  [WARN] git not found - skipping git init. Install Git, then run: git init
) else (
  if not exist .git (
    call git init
    call git branch -M main
    echo  [OK] git init complete on branch main.
  ) else (
    echo  [OK] .git already exists - skipping git init.
  )
)

REM --- 5. Local AI service (future local voice processing) ----------------
echo.
echo  [5/6] Writing local_ai_service\requirements.txt ...
(
  echo flask^>=3.0.0
  echo vosk^>=0.3.22
) > local_ai_service\requirements.txt
echo  [OK] requirements.txt written with flask + vosk.
where python >nul 2>nul
if not errorlevel 1 (
  echo  [INFO] Python detected - installing AI service deps ^(optional^)...
  call python -m pip install -r local_ai_service\requirements.txt
  if errorlevel 1 echo  [WARN] pip install failed - run manually later: python -m pip install -r local_ai_service\requirements.txt
) else (
  echo  [WARN] Python not found - skipping pip install. Run manually later:
  echo         python -m pip install -r local_ai_service\requirements.txt
)

REM --- 6. Tailwind + env bootstrap ----------------------------------------
echo.
echo  [6/6] Bootstrapping Tailwind config and env...
if not exist tailwind.config.js (
  call npx tailwindcss init -p
  if errorlevel 1 echo  [WARN] tailwind init failed - config may already exist or network blocked.
) else (
  echo  [OK] tailwind.config.js already exists.
)
if not exist .env (
  echo # LIFE DASHBOARD environment > .env
  echo # Optional: URL to a generic humanoid .glb for the 3D avatar. >> .env
  echo # Leave empty to use the built-in procedural muscle model. >> .env
  echo # VITE_AVATAR_URL=/models/humanoid.glb >> .env
  echo  [OK] .env stub created.
) else (
  echo  [OK] .env already exists.
)

echo.
echo  ======================================================
echo   SETUP COMPLETE.
echo.
echo   Run the desktop app:  npm run electron:dev
echo   Web-only preview:     npm run dev
echo   Build installer:      npm run dist
echo   Push to GitHub:       auto_push.bat
echo  ======================================================
echo.
pause
endlocal
