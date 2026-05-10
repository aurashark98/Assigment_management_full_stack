@echo off
setlocal enabledelayedexpansion

REM ============================================================
REM   Chatbot RAG - Windows Native Setup (Anthropic API)
REM   Untuk LLM_PROVIDER=anthropic di .env
REM ============================================================

cd /d "%~dp0\.."

echo.
echo ============================================================
echo   Chatbot RAG - Setup (Anthropic API)
echo ============================================================
echo   Working directory: %CD%
echo ============================================================
echo.

echo [1/3] Checking prerequisites...
echo.

REM Cek Node.js
where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js tidak ditemukan.
  echo.
  echo Silakan install Node.js 20+ dari https://nodejs.org
  echo Setelah install, jalankan ulang setup-anthropic.bat
  echo.
  pause
  exit /b 1
)
for /f "tokens=*" %%v in ('node --version') do set NODE_VER=%%v
echo   [OK] Node.js: !NODE_VER!

REM Cek npm
where npm >nul 2>nul
if errorlevel 1 (
  echo [ERROR] npm tidak ditemukan.
  pause
  exit /b 1
)
for /f "tokens=*" %%v in ('npm --version') do set NPM_VER=%%v
echo   [OK] npm: !NPM_VER!

echo.
echo ============================================================
echo   [2/3] Checking .env configuration
echo ============================================================
echo.

if not exist ".env" (
  echo [ERROR] File .env tidak ditemukan di root project.
  echo.
  echo Silakan copy .env.sample jadi .env, lalu edit:
  echo   - LLM_PROVIDER=anthropic
  echo   - ANTHROPIC_API_KEY=sk-ant-...
  echo.
  pause
  exit /b 1
)

findstr /B /C:"ANTHROPIC_API_KEY=" .env >nul 2>nul
if errorlevel 1 (
  echo   [WARN] ANTHROPIC_API_KEY belum di-set di .env
  echo          Server akan start, tetapi endpoint /api/chat akan return 503
  echo          sampai key di-set. Edit .env sebelum jalankan start.bat.
  echo.
) else (
  echo   [OK] .env file ditemukan dan ANTHROPIC_API_KEY sudah ada
)

echo.
echo ============================================================
echo   [3/3] Installing npm dependencies
echo ============================================================
echo.

call npm install
if errorlevel 1 (
  echo.
  echo [ERROR] npm install gagal. Cek error di atas.
  pause
  exit /b 1
)

echo.
echo ============================================================
echo   Setup Complete (Anthropic)
echo ============================================================
echo.
echo Selanjutnya:
echo   - Pastikan LLM_PROVIDER=anthropic di .env
echo   - Pastikan ANTHROPIC_API_KEY sudah di-set di .env
echo   - Jalankan server: windows\start.bat
echo.
echo Server akan listen di: http://localhost:8000
echo.
pause

endlocal
