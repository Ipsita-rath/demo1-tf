#!/usr/bin/env pwsh

Write-Host ""
Write-Host "==========================================="
Write-Host "  Terraform Automation System - Windows"
Write-Host "==========================================="
Write-Host ""

Write-Host "[1/4] Installing tsx globally..." -ForegroundColor Green
try {
    npm install -g tsx
    if ($LASTEXITCODE -ne 0) {
        throw "npm install failed"
    }
}
catch {
    Write-Host ""
    Write-Host "ERROR: Failed to install tsx. Trying with npx instead..." -ForegroundColor Yellow
    $useNpx = $true
}

Write-Host ""
Write-Host "[2/4] Setting environment variables..." -ForegroundColor Green
$env:NODE_ENV = "development"
$env:REPLIT_DOMAINS = "localhost:5000"
$env:REPL_ID = "local-development"
$env:SESSION_SECRET = "development-secret-key-change-in-production"

Write-Host ""
Write-Host "[3/4] Starting Terraform Automation System..." -ForegroundColor Green
Write-Host "Frontend will be available at: http://localhost:5173"
Write-Host "Backend will be available at: http://localhost:5000"
Write-Host ""

if ($useNpx) {
    Write-Host "[4/4] Starting server with npx..." -ForegroundColor Green
    npx tsx server/index.ts
}
else {
    Write-Host "[4/4] Starting server..." -ForegroundColor Green
    tsx server/index.ts
}

Write-Host ""
Write-Host "Application stopped. Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")