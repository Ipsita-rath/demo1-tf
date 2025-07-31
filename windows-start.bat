@echo off
echo.
echo ===========================================
echo   Terraform Automation System - Windows
echo ===========================================
echo.

echo [1/4] Installing tsx globally...
call npm install -g tsx

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to install tsx. Trying with npx instead...
    goto :use_npx
)

echo.
echo [2/4] Setting environment variables...
set NODE_ENV=development
set REPLIT_DOMAINS=localhost:5000
set REPL_ID=local-development
set SESSION_SECRET=development-secret-key-change-in-production

echo.
echo [3/4] Starting Terraform Automation System...
echo Frontend will be available at: http://localhost:5173
echo Backend will be available at: http://localhost:5000
echo.
echo [4/4] Starting server...

tsx server/index.ts
goto :end

:use_npx
echo.
echo [2/4] Setting environment variables for npx...
set NODE_ENV=development
set REPLIT_DOMAINS=localhost:5000
set REPL_ID=local-development
set SESSION_SECRET=development-secret-key-change-in-production

echo.
echo [3/4] Starting with npx (no global installation)...
echo Frontend will be available at: http://localhost:5173
echo Backend will be available at: http://localhost:5000
echo.
echo [4/4] Starting server with npx...

npx tsx server/index.ts

:end
echo.
echo Application stopped. Press any key to exit...
pause >nul