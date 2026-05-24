@echo off
REM Launches a local HTTP server inside web/ and opens the production page in the browser.
REM Required because browsers block FFmpeg / MediaInfo / Workers on the file:// origin.
REM
REM Tries Python 3 first, then Node (npx serve), then errors out with install instructions.

setlocal
set "PORT=8765"
set "PAGE=index.html"
set "ROOT=%~dp0web"

cd /d "%ROOT%"

REM Try Python (most Windows users with Python 3 installed)
where python >nul 2>nul
if %errorlevel% == 0 (
  echo Starting http://localhost:%PORT%/ via python -m http.server ...
  start "" "http://localhost:%PORT%/%PAGE%"
  python -m http.server %PORT%
  goto :eof
)

REM Try `py` launcher (Windows Python launcher)
where py >nul 2>nul
if %errorlevel% == 0 (
  echo Starting http://localhost:%PORT%/ via py -m http.server ...
  start "" "http://localhost:%PORT%/%PAGE%"
  py -m http.server %PORT%
  goto :eof
)

REM Fall back to Node + npx serve
where npx >nul 2>nul
if %errorlevel% == 0 (
  echo Starting http://localhost:%PORT%/ via npx serve ...
  start "" "http://localhost:%PORT%/%PAGE%"
  npx --yes serve -l %PORT% .
  goto :eof
)

echo.
echo [ERROR] Neither Python nor Node was found on PATH.
echo.
echo Install one of these and re-run start-comparer.cmd:
echo   - Python 3:  https://www.python.org/downloads/
echo   - Node.js :  https://nodejs.org/
echo.
pause
endlocal
