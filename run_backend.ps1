# PowerShell script to run the backend server
# Usage: .\run_backend.ps1

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
    Write-Host "Warning: .env file not found. Please create one with your API keys." -ForegroundColor Yellow
    Write-Host "Required: TWELVELABS_API_KEY" -ForegroundColor Yellow
}

# Install/update dependencies
Write-Host "Installing dependencies..." -ForegroundColor Green
pip install -r requirements.txt

# Run the server
Write-Host "Starting FastAPI server..." -ForegroundColor Green
Write-Host "API will be available at: http://localhost:8000" -ForegroundColor Cyan
Write-Host "Docs will be available at: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
