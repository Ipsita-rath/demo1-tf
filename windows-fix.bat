@echo off
echo === Terraform Automation System - Windows Fix ===
echo.

echo Step 1: Installing tsx locally...
call npm install tsx
if %errorlevel% neq 0 (
    echo Failed to install tsx locally, trying globally...
    call npm install -g tsx
)

echo.
echo Step 2: Setting environment variables...
set NODE_ENV=development
set REPLIT_DOMAINS=localhost:5000
set REPL_ID=local-development
set SESSION_SECRET=development-secret-key

echo.
echo Step 3: Starting the application...
echo Frontend: http://localhost:5173
echo Backend: http://localhost:5000
echo.

echo Trying local tsx first...
call npx tsx server/index.ts
if %errorlevel% neq 0 (
    echo Local tsx failed, trying global...
    call tsx server/index.ts
)