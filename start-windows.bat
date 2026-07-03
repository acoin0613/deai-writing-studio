@echo off
setlocal
cd /d "%~dp0"

if exist ".env" (
  for /f "usebackq tokens=1,* delims==" %%A in (".env") do (
    if not "%%A"=="" set "%%A=%%B"
  )
)

where node >nul 2>nul
if %errorlevel% neq 0 (
  echo Node.js was not found. Please install Node.js first.
  pause
  exit /b 1
)

node server.js
pause
