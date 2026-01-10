# Quick Start Guide

## Running Frontend and Backend Together

### Prerequisites
- Node.js 18+
- Python 3.10+
- Virtual environment (will be created automatically)

### Step 1: Set Up Environment Variables

Create a `.env` file in the repository root:

```env
TWELVELABS_API_KEY=your_twelvelabs_api_key_here
```

### Step 2: Start Backend (Terminal 1)

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
API docs at: http://localhost:8000/docs

### Step 3: Start Frontend (Terminal 2)

```bash
npm install
npm run dev
```

Frontend will be available at: http://localhost:3000

## Verify Setup

1. **Backend health check**: Visit http://localhost:8000/health
   - Should return: `{"status": "healthy"}`

2. **Backend API docs**: Visit http://localhost:8000/docs
   - Should show FastAPI interactive documentation

3. **Frontend**: Visit http://localhost:3000
   - Should load the landing page

## Troubleshooting

### Backend Issues

**Import errors:**
- Make sure you're running from repository root
- Ensure virtual environment is activated
- Try: `pip install -r requirements.txt` again

**Missing API key:**
- Create `.env` file in repository root
- Add `TWELVELABS_API_KEY=your_key_here`

**Port already in use:**
- Change port: `uvicorn backend.app.main:app --reload --port 8001`

### Frontend Issues

**Port conflicts:**
- Vite will automatically use next available port (3001, 3002, etc.)

**Module not found:**
- Run `npm install` again
- Check that you're in repository root

## Next Steps

- Backend API endpoints will be added in future updates
- Frontend will connect to backend via `/api/*` endpoints
- See `backend/README.md` for backend-specific documentation
