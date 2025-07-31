@echo off
echo Installing tsx locally...
npm install tsx
echo.
echo Setting environment variables...
set NODE_ENV=development
set REPLIT_DOMAINS=localhost:5000
set REPL_ID=local-development
set SESSION_SECRET=development-secret-key
echo.
echo Starting server...
npx tsx server/index.ts