#!/bin/bash
# Bash script to run the Coherence backend server
# Usage: ./run_backend.sh

set -e

echo "=============================================="
echo "  Coherence Backend Startup"
echo "=============================================="

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
    echo ""
    echo "⚠️  Warning: .env file not found!"
    echo "   Create .env in repository root with:"
    echo ""
    echo "   TWELVELABS_API_KEY=your_key"
    echo "   DEEPGRAM_API_KEY=your_key"
    echo "   GEMINI_API_KEY=your_key"
    echo ""
fi

# Install/update dependencies
echo "Installing dependencies..."
pip install -r requirements.txt --quiet

# Run the server
echo ""
echo "Starting FastAPI server..."
echo "API: http://localhost:8000"
echo "Docs: http://localhost:8000/docs"
echo ""
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
