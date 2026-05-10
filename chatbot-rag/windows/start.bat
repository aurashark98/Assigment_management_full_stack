@echo off
setlocal

REM ============================================================
REM   Chatbot RAG - Production Server (Windows Native)
REM ============================================================

cd /d "%~dp0\.."

set NODE_ENV=production

echo.
echo ============================================================
echo   Chatbot RAG - Production Server (Windows Native)
echo ============================================================
echo   Working directory : %CD%
echo   NODE_ENV          : %NODE_ENV%
echo   URL               : http://localhost:8000
echo ============================================================
echo.

REM Cek apakah Ollama merespons
curl -s -o nul -w "%%{http_code}" http://localhost:11434/api/tags > "%TEMP%\ollama_ping.txt" 2>nul
set /p OLLAMA_STATUS=<"%TEMP%\ollama_ping.txt"
del "%TEMP%\ollama_ping.txt" 2>nul

if not "%OLLAMA_STATUS%"=="200" (
  echo [WARNING] Ollama service tidak merespons di port 11434.
  echo           Server tetap akan start, tetapi /api/chat akan gagal.
  echo           Untuk start Ollama manual: ollama serve
  echo.
)

REM Cek apakah port 8000 sudah dipakai
netstat -ano | findstr ":8000 " | findstr "LISTENING" >nul 2>nul
if not errorlevel 1 (
  echo [ERROR] Port 8000 sudah dipakai oleh proses lain.
  echo.
  echo Kemungkinan penyebab:
  echo   - Server chatbot-rag native masih berjalan
  echo     Solusi: jalankan windows\stop.bat
  echo   - Aplikasi lain pakai port 8000
  echo     Solusi: cek dengan: netstat -ano ^| findstr :8000
  echo.
  pause
  exit /b 1
)

call npm start

endlocal
