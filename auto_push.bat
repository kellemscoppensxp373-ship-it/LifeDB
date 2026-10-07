@echo off
REM ================================================================
REM  LIFE DASHBOARD :: AUTO-PUSH
REM  Double-click to instantly commit and push everything to main.
REM  Every push to main triggers .github/workflows/build.yml,
REM  which compiles the Windows .exe automatically.
REM ================================================================
setlocal
title LIFE DASHBOARD // AUTO-PUSH

echo.
echo  [AUTO-PUSH] staging, committing and pushing to main...
echo.

git add .
git commit -m "Auto-commit: %date% %time%"
git branch -M main
git push -u origin main

echo.
if errorlevel 1 (
  echo  [AUTO-PUSH] FAILED - check that 'origin' exists and you are logged in:
  echo              git remote -v
  echo              gh auth login
) else (
  echo  [AUTO-PUSH] OK - build.yml is now compiling your .exe on GitHub Actions.
)
echo.
pause
endlocal
