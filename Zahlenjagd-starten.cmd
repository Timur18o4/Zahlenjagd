@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 (
    echo Node.js wurde nicht gefunden. Benoetigt wird Node.js 22 oder neuer.
    pause
    exit /b 1
)
powershell.exe -NoProfile -Command "try { if ((Invoke-RestMethod 'http://127.0.0.1:8793/health' -TimeoutSec 2).service -eq 'Zahlenjagd') { Start-Process 'http://127.0.0.1:8793/'; exit 0 } } catch {}; exit 1"
if not errorlevel 1 exit /b 0
start "" /min powershell.exe -NoProfile -Command "for ($attempt = 0; $attempt -lt 30; $attempt++) { try { if ((Invoke-RestMethod 'http://127.0.0.1:8793/health' -TimeoutSec 1).service -eq 'Zahlenjagd') { Start-Process 'http://127.0.0.1:8793/'; exit } } catch {}; Start-Sleep -Milliseconds 500 }"
node "%~dp0server.mjs"
if errorlevel 1 pause
