#!/bin/bash
# Bash script to run the backend server
# Usage: ./run_backend.sh

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "Warning: .env file not found. Please create one with your API keys."
    echo "Required: TWELVELABS_API_KEY"
fi

# Install/update dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Run the server
echo "Starting FastAPI server..."
echo "API will be available at: http://localhost:8000"
echo "Docs will be available at: http://localhost:8000/docs"
echo ""
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
