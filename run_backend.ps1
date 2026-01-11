# PowerShell script to run the Coherence backend server
# Usage: .\run_backend.ps1

Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "  Coherence Backend Startup" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan

# Check if virtual environment exists
if (-not (Test-Path "venv")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Green
& ".\venv\Scripts\Activate.ps1"

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host ""
    Write-Host "Warning: .env file not found!" -ForegroundColor Yellow
    Write-Host "Create .env in repository root with:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  TWELVELABS_API_KEY=your_key" -ForegroundColor Gray
    Write-Host "  DEEPGRAM_API_KEY=your_key" -ForegroundColor Gray
    Write-Host "  GEMINI_API_KEY=your_key" -ForegroundColor Gray
    Write-Host ""
}

# Install/update dependencies
Write-Host "Installing dependencies..." -ForegroundColor Green
pip install -r requirements.txt --quiet

# Run the server
Write-Host ""
Write-Host "Starting FastAPI server..." -ForegroundColor Green
Write-Host "API: http://localhost:8000" -ForegroundColor Cyan
Write-Host "Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
