<#
.SYNOPSIS
    Campus Lost & Found - One-click Environment Setup
.DESCRIPTION
    Check Node.js, download locally if missing, then install deps.
#>

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Campus Lost & Found - One-click Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
$LOCAL_NODE = Join-Path $PSScriptRoot "nodejs"
$LOCAL_NODE_EXE = Join-Path $LOCAL_NODE "node.exe"
function Test-NodeAvailable {
    try {
        $v = node -v 2>$null
        return $v -match "v(\d+)" -and [int]$Matches[1] -ge 16
    } catch { return $false }
}
$useLocal = $false

if (Test-NodeAvailable) {
    $ver = node -v
    Write-Host "[OK] System Node.js found: $ver" -ForegroundColor Green
} elseif (Test-Path $LOCAL_NODE_EXE) {
    Write-Host "[OK] Local Node.js found: $(& $LOCAL_NODE_EXE -v)" -ForegroundColor Green
    $useLocal = $true
} else {
    Write-Host "[...] Node.js not found, downloading to project folder ..." -ForegroundColor Yellow
    Write-Host ""
    $url = "https://nodejs.org/dist/v20.18.0/node-v20.18.0-win-x64.zip"
    $zipFile = Join-Path $PSScriptRoot "node-v20.18.0-win-x64.zip"
    Write-Host "  [1/3] Downloading Node.js ..." -ForegroundColor Yellow
    try {
        Invoke-WebRequest -Uri $url -OutFile $zipFile -UseBasicParsing
        Write-Host "  [OK] Download complete" -ForegroundColor Green
    } catch {
        Write-Host "  [X] Download failed. Manual: https://nodejs.org" -ForegroundColor Red
        Read-Host "  Press Enter to exit"
        exit 1
    }
    Write-Host "  [2/3] Extracting ..." -ForegroundColor Yellow
    try {
        Expand-Archive -Path $zipFile -DestinationPath $PSScriptRoot -Force
        Rename-Item -Path (Join-Path $PSScriptRoot "node-v20.18.0-win-x64") -NewName "nodejs" -Force
        Remove-Item $zipFile -Force
        Write-Host "  [OK] Extract complete" -ForegroundColor Green
    } catch {
        Write-Host "  [X] Extract failed: $_" -ForegroundColor Red
        Read-Host "  Press Enter to exit"
        exit 1
    }
    if (Test-Path $LOCAL_NODE_EXE) {
        Write-Host "  [3/3] Node.js ready: $(& $LOCAL_NODE_EXE -v)" -ForegroundColor Green
        $useLocal = $true
    } else {
        Write-Host "  [X] Setup failed. Manual: https://nodejs.org" -ForegroundColor Red
        Read-Host "  Press Enter to exit"
        exit 1
    }
}

Write-Host "[2/4] Installing backend dependencies ..." -ForegroundColor Yellow
Set-Location (Join-Path $PSScriptRoot "backend")
if ($useLocal) {
    $env:Path = "$LOCAL_NODE;$env:Path"
    npm install
} else {
    npm install
}
if ($LASTEXITCODE -ne 0) {
    Write-Host "[X] Backend install failed" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "[OK] Backend dependencies installed" -ForegroundColor Green

Write-Host "[3/4] Installing frontend dependencies ..." -ForegroundColor Yellow
Set-Location (Join-Path $PSScriptRoot "frontend")
if ($useLocal) {
    $env:Path = "$LOCAL_NODE;$env:Path"
    npm install
} else {
    npm install
}
if ($LASTEXITCODE -ne 0) {
    Write-Host "[X] Frontend install failed" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "[OK] Frontend dependencies installed" -ForegroundColor Green

Set-Location $PSScriptRoot

if ($useLocal) {
    $userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
    if ($userPath -notlike "*$LOCAL_NODE*") {
        [Environment]::SetEnvironmentVariable('Path', "$LOCAL_NODE;$userPath", 'User')
        Write-Host "[OK] Node.js added to user PATH (permanent)" -ForegroundColor Green
        Write-Host "      Restart your terminal to use npm directly" -ForegroundColor Yellow
    } else {
        Write-Host "[OK] Node.js already in user PATH" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Setup Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "How to start (two terminals):" -ForegroundColor White
Write-Host ""
Write-Host "  [Terminal 1 - Backend]" -ForegroundColor Yellow
Write-Host "    cd backend" -ForegroundColor White
Write-Host "    npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "  [Terminal 2 - Frontend]" -ForegroundColor Yellow
Write-Host "    cd frontend" -ForegroundColor White
Write-Host "    npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "  Backend:  http://localhost:3000" -ForegroundColor White
Write-Host "  Test account: testuser / 123456" -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to exit"
