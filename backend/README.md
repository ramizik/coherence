# Coherence Backend

FastAPI backend for the Coherence AI Presentation Coach platform.

## Setup

### Prerequisites

- Python 3.10+
- Virtual environment (recommended)

### Installation

1. **Create and activate virtual environment** (from repository root):

   ```powershell
   # Windows PowerShell
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```

   ```bash
   # Linux/Mac
   python -m venv venv
   source venv/bin/activate
   ```

2. **Install dependencies**:

   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**:

   Create a `.env` file in the repository root:

   ```env
   # Supabase Configuration
   SUPABASE_URL=https://xxx.supabase.co
   SUPABASE_KEY=your_service_role_key_here  # Service role key (NOT anon key)

   # AI Service Keys
   TWELVELABS_API_KEY=your_twelvelabs_api_key_here
   DEEPGRAM_API_KEY=your_deepgram_api_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

   **Important:** Get Supabase keys from: Supabase Dashboard → Settings → API
   - `SUPABASE_URL`: Project URL
   - `SUPABASE_KEY`: Service role key (has full access, keep secret)

## Running the Backend

### Development Server

From the repository root (with virtual environment activated):

```bash
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

Or using FastAPI CLI:

```bash
fastapi dev backend/app/main.py
```

The API will be available at:
- API: http://localhost:8000
- Docs: http://localhost:8000/docs
- Health check: http://localhost:8000/health

### Production Server

```bash
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000
```

## API Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `GET /api/auth/me` | GET | Get current authenticated user info | Yes |
| `POST /api/videos/upload` | POST | Upload video (MP4/MOV/WebM, max 500MB) | Yes |
| `GET /api/videos/{id}/status` | GET | Poll processing status (0-100%) | Yes |
| `GET /api/videos/{id}/results` | GET | Fetch complete analysis results | Yes |
| `GET /api/videos/{id}/stream` | GET | Stream video file for playback | Yes |
| `GET /api/videos/samples/{id}` | GET | Load pre-cached sample video | No |
| `GET /health` | GET | Health check endpoint | No |

**Authentication:** Protected endpoints require JWT token in `Authorization: Bearer <token>` header. Tokens are verified using Supabase's JWT verification.

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app + CORS + startup logging
│   ├── config.py            # Configuration management (Supabase, AI services)
│   ├── dependencies.py      # Supabase client, auth dependencies
│   ├── routers/
│   │   ├── auth.py          # Authentication endpoints
│   │   └── videos.py        # Video API endpoints
│   ├── services/
│   │   ├── video_service.py     # Processing orchestration
│   │   ├── deepgram_service.py  # Async Deepgram wrapper
│   │   ├── twelvelabs_service.py # Async TwelveLabs wrapper
│   │   └── gemini_service.py    # Coaching report generator
│   └── models/
│       └── schemas.py       # Pydantic schemas (camelCase output)
├── deepgram/
│   ├── __init__.py          # Module exports
│   ├── deepgram_client.py   # Deepgram SDK v3 client
│   └── transcription.py     # Audio transcription + filler detection
├── twelvelabs/
│   ├── __init__.py
│   ├── twelvelabs_client.py # TwelveLabs SDK client
│   ├── indexing.py          # Video indexing operations
│   └── analysis.py          # Video analysis operations
├── gemini/
│   ├── __init__.py          # Module exports
│   ├── gemini_client.py     # Gemini 1.5 Pro client
│   └── synthesis.py         # Dissonance detection + scoring
├── cli.py                   # CLI tool for testing modules
├── data/
│   └── videos/              # Uploaded video storage
└── README.md
```

## Processing Pipeline

The backend runs TwelveLabs and Deepgram in **parallel** for faster processing:

```
Upload Video ─┬─► Deepgram (5-10s)    ─┬─► Merge Results ─► Gemini Report ─► Store
              │   └─► Transcript       │   └─► Score Calculation
              │   └─► Filler words     │
              │   └─► Speaking pace    │
              │                        │
              └─► TwelveLabs (20-40s) ─┘
                  └─► Video indexing
                  └─► Semantic analysis
                  └─► Dissonance flags
```

**Fallback Behavior:**
- If TwelveLabs is unavailable: Uses Deepgram-only analysis (speech metrics)
- If Deepgram is unavailable: Uses TwelveLabs-only analysis (visual metrics)
- If both unavailable: Returns mock data for demo reliability

## Pydantic Schemas

All schemas use **camelCase** output to match frontend TypeScript interfaces.

| Schema | Description |
|--------|-------------|
| `UploadResponse` | Response from `/api/videos/upload` |
| `StatusResponse` | Response from `/api/videos/{id}/status` |
| `AnalysisResult` | Complete analysis from `/api/videos/{id}/results` |
| `AnalysisMetrics` | Eye contact, filler words, fidgeting, pace |
| `DissonanceFlag` | Individual dissonance detection |
| `TimelinePoint` | Point on timeline heatmap |
| `TranscriptSegment` | Speech transcript with timestamps |
| `GeminiReport` | Natural language coaching advice |
| `ApiError` | Standardized error response |

## Testing Backend Modules (CLI Tool)

Backend developers can test backend functionality independently without running the frontend using the CLI tool.

**Important:** Always run CLI commands from the **repository root** with the **virtual environment activated**.

### Quick Start

```bash
# Activate virtual environment first
.\venv\Scripts\Activate.ps1  # Windows PowerShell
# or
source venv/bin/activate     # Linux/Mac

# Then run CLI commands
python -m backend.cli --help

# Run complete workflow (index + chapters + analysis)
python -m backend.cli workflow --video ./path/to/your/video.mp4
```

### Available Commands

| Command | Purpose | Example |
|---------|---------|---------|
| `index` | Index a video file | `python -m backend.cli index --video ./video.mp4` |
| `chapters` | Get video chapters | `python -m backend.cli chapters --video-id abc123` |
| `analyze` | Run full analysis | `python -m backend.cli analyze --video-id abc123` |
| `section` | Analyze specific section | `python -m backend.cli section --video-id abc123 --start-time "00:15" --end-time "01:30" --title "Intro"` |
| `workflow` | Complete workflow | `python -m backend.cli workflow --video ./video.mp4` |

### Tips

1. **Reuse Video IDs**: Once a video is indexed, save the `video_id` to avoid re-indexing.
2. **Save Outputs**: Use `--output` flags to save results for debugging.
3. **Run from repo root**: Always run CLI from repository root, not `backend/` directory.

### Troubleshooting

**"ModuleNotFoundError"**:
- Ensure virtual environment is activated
- Run `pip install -r requirements.txt`
- Run from repository root

**"API_KEY not set"**:
- Ensure `.env` file exists in repository root
- Restart terminal after modifying `.env`

## Deepgram Module

The Deepgram module provides audio transcription with speech analysis.

### Features

- **Full Transcription**: Word-level timestamps with confidence scores
- **Filler Word Detection**: "um", "uh", "like", "you know", "basically"
- **Speaking Pace**: Words-per-minute (WPM) calculation
- **Pause Detection**: Identifies gaps >2 seconds between words

### Service Wrapper

The `backend/app/services/deepgram_service.py` provides async wrapper for the pipeline:

```python
from backend.app.services.deepgram_service import transcribe_video, extract_metrics_from_transcription

# Transcribe video file
result = await transcribe_video(video_path, use_llm_filler_detection=False)

# Extract metrics for analysis
metrics = extract_metrics_from_transcription(result)
# Returns: filler_word_count, speaking_pace_wpm, total_words, etc.
```

### Output Format

```json
{
  "transcript": "Hello everyone, um, today I'm thrilled to present...",
  "words": [
    {"word": "Hello", "start": 0.5, "end": 0.8, "confidence": 0.95}
  ],
  "confidence": 0.94,
  "metrics": {
    "filler_analysis": {
      "total_count": 12,
      "filler_rate_per_minute": 3.5
    },
    "speaking_pace_wpm": 156,
    "total_words": 245
  }
}
```

## TwelveLabs Module

The TwelveLabs module provides video indexing and semantic analysis using the Pegasus 1.2 model.

### Features

- **Video Indexing**: Upload and index videos for analysis
- **Semantic Analysis**: Structured JSON response with:
  - Eye contact percentage
  - Fidgeting count
  - Speaking pace estimation
  - Dissonance flag detection
- **Coherence Score Calculation**: Weighted scoring algorithm

### Service Wrapper

The `backend/app/services/twelvelabs_service.py` provides async wrapper:

```python
from backend.app.services.twelvelabs_service import (
    get_or_create_index,
    upload_and_index_video,
    analyze_presentation,
    calculate_coherence_score
)

# Get or create index
index_id = await get_or_create_index("coherence-presentation-analysis")

# Upload and index video
video_id = await upload_and_index_video(index_id, video_path)

# Run presentation analysis
analysis = await analyze_presentation(video_id)

# Calculate score
score = calculate_coherence_score(analysis["metrics"], analysis["dissonance_flags"])
```

## Gemini Module

The Gemini module generates **natural language coaching advice** from TwelveLabs + Deepgram data.

### Features

- **Coaching Report Generation**: Warm, conversational feedback
- **Headline Generation**: Short summary like "Solid foundation to build on"
- **Fallback Support**: Works even if Gemini API unavailable

### Service Wrapper

The `backend/app/services/gemini_service.py` generates coaching reports:

```python
from backend.app.services.gemini_service import generate_coaching_report

# Generate natural language coaching
report = await generate_coaching_report(
    deepgram_data=deepgram_result,
    twelvelabs_data=twelvelabs_result,
    video_duration=120.0
)
# Returns: GeminiReport with coachingAdvice, headline, generatedAt
```

### Output Format

```json
{
  "coachingAdvice": "Great job on your presentation! You did a wonderful job maintaining eye contact with the camera. One area to focus on: reducing filler words...",
  "headline": "Strong delivery with room to shine",
  "generatedAt": "2025-01-11T01:00:00Z",
  "modelUsed": "gemini-1.5-pro"
}
```

## Coherence Score Algorithm

Weighted scoring (0-100):
- **Eye Contact**: 30% (higher is better, 80%+ = full points)
- **Filler Words**: 25% (fewer is better, <5 = full points)
- **Fidgeting**: 20% (fewer is better, <3 = full points)
- **Speaking Pace**: 15% (140-160 WPM optimal)
- **Dissonance Penalty**: -10 per HIGH, -5 per MEDIUM severity flag

**Score Tiers:**
- 76-100: "Strong"
- 51-75: "Good Start"
- 0-50: "Needs Work"

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | Yes | Supabase project URL (from Dashboard → Settings → API) |
| `SUPABASE_KEY` | Yes | Supabase service role key (NOT anon key - has full access) |
| `TWELVELABS_API_KEY` | Yes | TwelveLabs API key for video indexing + analysis |
| `DEEPGRAM_API_KEY` | Yes | Deepgram API key for audio transcription |
| `GEMINI_API_KEY` | Yes* | Gemini API key for coaching reports (*fallback to template if missing) |

## Startup Logging

When the backend starts, it logs the availability of each service:

```
============================================================
Coherence API Starting...
============================================================
✓ TwelveLabs: AVAILABLE
✓ Deepgram: AVAILABLE
✓ Gemini: AVAILABLE
✓ Supabase: CONFIGURED
------------------------------------------------------------
✓ Sample Cache: ALL CACHED (3/3)
============================================================
API ready at http://localhost:8000
============================================================
```

## Authentication

Authentication is handled via Supabase JWT tokens. The backend verifies tokens using `supabase.auth.get_claims(jwt=token)` for local JWT verification (faster than server round-trip).

**Key Files:**
- `backend/app/config.py` - Loads Supabase configuration from environment variables
- `backend/app/dependencies.py` - Supabase client singleton and `get_current_user` dependency
- `backend/app/routers/auth.py` - Test endpoint `/api/auth/me` for verifying authentication

**Usage in Endpoints:**
```python
from backend.app.dependencies import get_current_user

@router.get("/protected")
async def protected_endpoint(user: dict = Depends(get_current_user)):
    # user contains: id, email, email_verified, aud, role
    return {"user_id": user["id"]}
```

## Notes

- CORS configured for `http://localhost:3000` and `http://127.0.0.1:3000`
- Video files stored in `backend/data/videos/` (will migrate to Supabase Storage)
- Database: Supabase PostgreSQL (videos and analyses tables)
- Parallel processing of TwelveLabs + Deepgram for faster results
