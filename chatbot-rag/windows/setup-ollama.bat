@echo off
setlocal enabledelayedexpansion

REM ============================================================
REM   Chatbot RAG - Windows Native Setup (Ollama Local)
REM   Untuk LLM_PROVIDER=ollama di .env
REM ============================================================

cd /d "%~dp0\.."

echo.
echo ============================================================
echo   Chatbot RAG - Setup (Ollama Local)
echo ============================================================
echo   Working directory: %CD%
echo ============================================================
echo.

echo [1/4] Checking prerequisites...
echo.

REM Cek Node.js
where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js tidak ditemukan.
  echo.
  echo Silakan install Node.js 20+ dari https://nodejs.org
  echo Setelah install, jalankan ulang setup-ollama.bat
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

REM Cek Ollama
where ollama >nul 2>nul
if errorlevel 1 (
  echo.
  echo [ERROR] Ollama tidak ditemukan.
  echo.
  echo Silakan install Ollama dari salah satu sumber berikut:
  echo   - File installer: %USERPROFILE%\Downloads\OllamaSetup.exe
  echo   - Download web   : https://ollama.com/download/windows
  echo.
  echo Setelah install selesai, jalankan ulang setup-ollama.bat
  echo.
  pause
  exit /b 1
)
for /f "tokens=*" %%v in ('ollama --version 2^>^&1') do set OLLAMA_VER=%%v
echo   [OK] Ollama: !OLLAMA_VER!

echo.
echo [2/4] Verifying Ollama service...
echo.

curl -s -o nul -w "%%{http_code}" http://localhost:11434/api/tags > "%TEMP%\ollama_check.txt" 2>nul
set /p OLLAMA_STATUS=<"%TEMP%\ollama_check.txt"
del "%TEMP%\ollama_check.txt" 2>nul

if "!OLLAMA_STATUS!"=="200" (
  echo   [OK] Ollama service running di http://localhost:11434
) else (
  echo   [WARN] Ollama service tidak merespons.
  echo          Pastikan Ollama berjalan sebelum lanjut.
  echo          Biasanya Ollama auto-start setelah install,
  echo          atau jalankan manual: ollama serve
  echo.
  pause
)

echo.
echo ============================================================
echo   [3/4] Installing npm dependencies
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
echo   [4/4] Pulling Ollama model (llama3.2:3b)
echo ============================================================
echo   Ukuran ~2GB, durasi tergantung kecepatan internet.
echo ============================================================
echo.

call ollama pull llama3.2:3b
if errorlevel 1 (
  echo.
  echo [ERROR] Gagal pull model. Pastikan Ollama service berjalan.
  echo Cek dengan: ollama list
  pause
  exit /b 1
)

echo.
echo ============================================================
echo   Setup Complete (Ollama)
echo ============================================================
echo.
echo Selanjutnya:
echo   - Pastikan LLM_PROVIDER=ollama di .env
echo   - Jalankan server: windows\start.bat
echo.
echo Server akan listen di: http://localhost:8000
echo.
pause

endlocal
