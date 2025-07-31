@echo off
echo Installing tsx globally...
npm install -g tsx

echo.
echo Setting environment variables...
set NODE_ENV=development
set REPLIT_DOMAINS=localhost:5000
set REPL_ID=local-development
set SESSION_SECRET=development-secret-key-change-in-production

echo.
echo Starting Terraform Automation System...
echo Frontend will be available at: http://localhost:5173
echo Backend will be available at: http://localhost:5000
echo.

tsx server/index.ts