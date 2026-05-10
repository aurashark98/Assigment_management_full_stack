@echo off
setlocal

REM ============================================================
REM   Chatbot RAG - Stop Server (Windows Native)
REM   Mencari proses node yang listen di port 8000 dan kill
REM ============================================================

echo.
echo Mencari proses Node.js yang listen di port 8000...
echo.

set PID=
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8000 " ^| findstr "LISTENING"') do (
  set PID=%%a
  goto :found
)

echo Tidak ada proses yang listen di port 8000.
echo Server mungkin sudah berhenti.
goto :end

:found
echo Process ditemukan dengan PID: %PID%
echo.

tasklist /FI "PID eq %PID%" /FO LIST | findstr /C:"Image Name"
echo.

choice /M "Hentikan proses ini"
if errorlevel 2 goto :end

taskkill /PID %PID% /F
if errorlevel 1 (
  echo [ERROR] Gagal menghentikan proses.
) else (
  echo Proses %PID% berhasil dihentikan.
)

:end
echo.
pause
endlocal
