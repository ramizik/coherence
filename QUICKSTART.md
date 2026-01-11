# Quick Start Guide

Get Coherence running locally in 5 minutes.

## Prerequisites

- Node.js 18+
- Python 3.10+
- API keys for TwelveLabs, Deepgram, and Gemini

## Step 1: Set Up Environment Variables

Create a `.env` file in the repository root:

```env
TWELVELABS_API_KEY=your_twelvelabs_key
DEEPGRAM_API_KEY=your_deepgram_key
GEMINI_API_KEY=your_gemini_key
```

## Step 2: Start Backend (Terminal 1)

**Windows (PowerShell):**
```powershell
.\run_backend.ps1
```

**Linux/Mac:**
```bash
chmod +x run_backend.sh
./run_backend.sh
```

**Manual (if scripts don't work):**
```bash
# Create and activate venv
python -m venv venv
# Windows: .\venv\Scripts\Activate.ps1
# Linux/Mac: source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run server
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: http://localhost:8000

On startup, you should see:
```
============================================================
Coherence API Starting...
============================================================
✓ TwelveLabs: AVAILABLE
✓ Deepgram: AVAILABLE
✓ Gemini: AVAILABLE
============================================================
API ready at http://localhost:8000
============================================================
```

## Step 3: Start Frontend (Terminal 2)

```bash
npm install
npm run dev
```

Frontend will be available at: http://localhost:3000

## Verify Setup

1. **Backend health check**: http://localhost:8000/health
   - Should return: `{"status": "healthy"}`

2. **Backend API docs**: http://localhost:8000/docs
   - Interactive API documentation

3. **Frontend**: http://localhost:3000
   - Upload page should load

## Test the Full Flow

1. Open http://localhost:3000
2. Upload a short video (MP4/MOV/WebM, <5 minutes)
3. Watch processing status (takes ~45-60 seconds)
4. View results dashboard with:
   - Coherence score
   - Dissonance flags with coaching
   - Interactive timeline
   - AI coaching summary

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /api/videos/upload` | Upload video for analysis |
| `GET /api/videos/{id}/status` | Poll processing status |
| `GET /api/videos/{id}/results` | Get analysis results |
| `GET /api/videos/{id}/stream` | Stream video for playback |

## Troubleshooting

### Backend Issues

**Service marked as "NOT AVAILABLE":**
- Check that API key is set in `.env`
- Restart the backend after modifying `.env`

**Import errors:**
- Run from repository root (not `backend/` folder)
- Ensure virtual environment is activated
- Try: `pip install -r requirements.txt`

**Port already in use:**
```powershell
# Kill process on port 8000 (Windows)
Stop-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess -Force
```

### Frontend Issues

**API calls failing:**
- Check backend is running on port 8000
- Check browser console for CORS errors

**Port conflicts:**
- Vite will auto-use next available port (3001, 3002, etc.)

## Documentation

- [README.md](README.md) - Project overview
- [backend/README.md](backend/README.md) - Backend modules and CLI
- [AGENTS.md](AGENTS.md) - AI assistant guidelines
- [CLAUDE.md](CLAUDE.md) - Backend development guidelines
