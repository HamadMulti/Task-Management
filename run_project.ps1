# PowerShell script to build & run the project
# Place this file in the workspace root (e.g. d:\Project Management) and run with:
#   powershell -ExecutionPolicy Bypass -File .\run_project.ps1

param()

Set-StrictMode -Version Latest

$root = $PSScriptRoot
if (-not $root) { $root = (Get-Location).ProviderPath }

$confirm = Read-Host "This will build & run the project (creates venv, installs deps). Continue? (Y/N)"
if ($confirm -notin @('Y','y')) {
    Write-Host "Cancelled by user." -ForegroundColor Yellow
    exit 0
}

function Run-DockerCompose {
    Write-Host "docker-compose detected — running docker-compose up --build" -ForegroundColor Cyan
    Push-Location $root
    & docker-compose up --build
    Pop-Location
}

function Start-BackendWindow {
    $backendCmd = @"
cd '$root\backend'
if (-not (Test-Path .venv)) { python -m venv .venv }
. .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
if (Test-Path .env.example -and -not (Test-Path .env)) { Copy-Item .env.example .env }
python manage.py migrate
if (Get-Command python -ErrorAction SilentlyContinue) {
    # attempt to seed data if management command exists
    try { python manage.py setup_data } catch { }
}
python manage.py collectstatic --noinput
python manage.py runserver 8000
"@
    Start-Process -FilePath "powershell" -ArgumentList "-NoExit","-Command",$backendCmd -WorkingDirectory "$root\backend"
}

function Start-FrontendWindow {
    $frontendCmd = @"
cd '$root\frontend'
npm install
if (Test-Path .env.example -and -not (Test-Path .env)) { Copy-Item .env.example .env }
# Ensure REACT_APP_API_URL points to http://localhost:8000/api if needed
npm start
"@
    Start-Process -FilePath "powershell" -ArgumentList "-NoExit","-Command",$frontendCmd -WorkingDirectory "$root\frontend"
}

# prefer docker-compose if available
if (Get-Command docker-compose -ErrorAction SilentlyContinue) {
    Run-DockerCompose
    exit 0
}

# fallback: open two windows for backend and frontend
Write-Host "docker-compose not found — launching backend and frontend in separate PowerShell windows" -ForegroundColor Cyan
Start-BackendWindow
Start-FrontendWindow

Write-Host "Launched backend and frontend. Check the new PowerShell windows for logs." -ForegroundColor Green
