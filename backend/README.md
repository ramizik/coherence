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
   TWELVELABS_API_KEY=your_twelvelabs_api_key_here
   ```

   For other API keys (Deepgram, Gemini), add them as needed:
   ```env
   DEEPGRAM_API_KEY=your_deepgram_api_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

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

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   └── main.py              # FastAPI application entry point
├── twelvelabs/
│   ├── __init__.py
│   ├── twelvelabs_client.py # TwelveLabs client initialization
│   ├── indexing.py          # Video indexing operations
│   ├── analysis.py          # Video analysis operations
│   └── app.py               # Legacy standalone script (use cli.py instead)
├── deepgram/
│   ├── __init__.py          # Module exports
│   ├── deepgram_client.py   # Deepgram SDK v5.x client initialization
│   ├── transcription.py     # Audio transcription with speech metrics
│   └── app.py               # Standalone test script for Deepgram
├── gemini/
│   ├── __init__.py          # Module exports
│   ├── gemini_client.py     # Gemini 1.5 Pro client initialization
│   └── synthesis.py         # Dissonance detection and coherence scoring
├── cli.py                   # CLI tool for testing backend modules
└── README.md
```

## Testing Backend Modules (CLI Tool)

Backend developers can test backend functionality independently without running the frontend using the CLI tool. This allows you to test different modules with videos from your local filesystem.

**Important:** Always run CLI commands from the **repository root** with the **virtual environment activated**.

### Quick Start

From repository root (with virtual environment activated):

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

#### 1. Index a Video

Index a video file to TwelveLabs (required before analysis):

```bash
python -m backend.cli index --video ./my-presentation.mp4
```

Options:
- `--video` (required): Path to video file (MP4, MOV, WebM)
- `--index-name`: Index name (default: "presentation-analysis")

**Output:** Returns a `video_id` that you can use for subsequent operations.

#### 2. Get Video Chapters

Extract chapters/sections from a video:

```bash
# Using existing video ID (faster, no re-indexing)
python -m backend.cli chapters --video-id abc123def456

# Or index a new video first
python -m backend.cli chapters --video ./my-presentation.mp4

# Save output to file
python -m backend.cli chapters --video-id abc123 --output chapters.txt
```

Options:
- `--video-id`: Use existing indexed video (recommended if already indexed)
- `--video`: Path to video file (will index first if needed)
- `--output`: Save results to a text file

#### 3. Run Full Analysis

Perform complete presentation analysis:

```bash
# Using existing video ID
python -m backend.cli analyze --video-id abc123def456

# Or index a new video first
python -m backend.cli analyze --video ./my-presentation.mp4

# Save output to file
python -m backend.cli analyze --video-id abc123 --output analysis.txt
```

Options:
- `--video-id`: Use existing indexed video (recommended)
- `--video`: Path to video file (will index first if needed)
- `--output`: Save results to a text file

#### 4. Analyze Specific Section

Analyze a specific time range of a video:

```bash
python -m backend.cli section \
  --video-id abc123def456 \
  --start-time "00:15" \
  --end-time "01:30" \
  --title "Introduction" \
  --output section-analysis.txt
```

Options:
- `--video-id` (required): Video ID
- `--start-time` (required): Start timestamp (MM:SS format)
- `--end-time` (required): End timestamp (MM:SS format)
- `--title` (required): Section title/name
- `--output`: Save results to a file

#### 5. Complete Workflow

Run the complete workflow (index + chapters + analysis) in one command:

```bash
python -m backend.cli workflow --video ./my-presentation.mp4
```

Options:
- `--video` (required): Path to video file
- `--index-name`: Index name (default: "presentation-analysis")
- `--skip-chapters`: Skip chapter extraction step
- `--skip-analysis`: Skip full analysis step
- `--output-chapters`: Save chapters to file
- `--output-analysis`: Save analysis to file

### Common Workflows

#### First Time Testing a Video

```bash
# Step 1: Index the video (save the video_id from output)
python -m backend.cli index --video ./test-video.mp4

# Step 2: Use the video_id for faster operations
python -m backend.cli chapters --video-id <video_id_from_step1>
python -m backend.cli analyze --video-id <video_id_from_step1>
```

#### Quick Testing (Video Already Indexed)

```bash
# If you already have a video_id, use it directly
python -m backend.cli analyze --video-id abc123def456
```

#### Testing Different Videos

```bash
# Test multiple videos
python -m backend.cli workflow --video ./video1.mp4 --output-analysis results1.txt
python -m backend.cli workflow --video ./video2.mp4 --output-analysis results2.txt
python -m backend.cli workflow --video ./video3.mp4 --output-analysis results3.txt
```

#### Save All Outputs

```bash
python -m backend.cli workflow \
  --video ./presentation.mp4 \
  --output-chapters chapters.txt \
  --output-analysis full-analysis.txt
```

### Tips for Backend Development

1. **Reuse Video IDs**: Once a video is indexed, save the `video_id` to avoid re-indexing (saves time and API calls).

2. **Test Individual Modules**: Use specific commands (`chapters`, `analyze`, `section`) to test individual functionality.

3. **Save Outputs**: Use `--output` flags to save results for comparison or debugging.

4. **Video Paths**: Use absolute or relative paths. Relative paths are resolved from repository root.

5. **Error Handling**: The CLI provides clear error messages if files are missing or API calls fail.

### Example Session

```bash
# Activate virtual environment
.\venv\Scripts\Activate.ps1  # Windows
# or
source venv/bin/activate     # Linux/Mac

# Test with a local video
python -m backend.cli workflow --video C:\Users\You\Videos\presentation.mp4

# Output:
# ============================================================
# RUNNING FULL WORKFLOW
# ============================================================
# Video: C:\Users\You\Videos\presentation.mp4
# 
# ============================================================
# STEP 1: INDEXING VIDEO
# ============================================================
# ...
# Video indexed with ID: abc123def456
# 
# ============================================================
# STEP 2: GETTING VIDEO CHAPTERS
# ============================================================
# ...
# 
# ============================================================
# STEP 3: RUNNING FULL ANALYSIS
# ============================================================
# ...
# 
# ============================================================
# FULL WORKFLOW COMPLETE
# ============================================================
# Video ID: abc123def456
```

### Command Reference

| Command | Purpose | Example |
|---------|---------|---------|
| `index` | Index a video file | `python -m backend.cli index --video ./video.mp4` |
| `chapters` | Get video chapters | `python -m backend.cli chapters --video-id abc123` |
| `analyze` | Run full analysis | `python -m backend.cli analyze --video-id abc123` |
| `section` | Analyze specific section | `python -m backend.cli section --video-id abc123 --start-time "00:15" --end-time "01:30" --title "Intro"` |
| `workflow` | Complete workflow | `python -m backend.cli workflow --video ./video.mp4` |

### Troubleshooting

**"ModuleNotFoundError" or "No module named 'dotenv'"**:
- Ensure virtual environment is activated: `.\venv\Scripts\Activate.ps1` (Windows) or `source venv/bin/activate` (Linux/Mac)
- Install dependencies: `pip install -r requirements.txt`
- Run commands from repository root, not from `backend/` directory

**"Video file not found"**: 
- Check the path is correct
- Use absolute paths if relative paths don't work: `python -m backend.cli index --video "C:\Users\You\Videos\presentation.mp4"`
- Ensure the file exists and is readable

**"TWELVELABS_API_KEY not set"**:
- Ensure `.env` file exists in repository root (not in `backend/` folder)
- Check that `TWELVELABS_API_KEY=your_key` is set in `.env`
- Restart your terminal after creating/modifying `.env`

**"Cannot find module 'backend.cli'"**:
- Make sure you're running from repository root (where `backend/` folder is located)
- Use `python -m backend.cli` not `python backend/cli.py`

## Deepgram Module

The Deepgram module provides audio transcription with intelligent speech analysis for presentation coaching.

### Features

- **Full Transcription**: Word-level timestamps with confidence scores
- **Two-Tier Filler Word Detection**:
  - **Tier 1 (Vocal Disfluencies)**: Deepgram's built-in detection of "um", "uh", "mhmm", etc. - always classified as fillers
  - **Tier 2 (Contextual Fillers)**: Gemini-powered detection of words like "like", "you know", "basically" - only when used as verbal tics, not for semantic meaning
- **Speaking Pace**: Words-per-minute (WPM) calculation excluding filler words
- **Pause Detection**: Identifies gaps >2 seconds between words

### API Functions

```python
from backend.deepgram import transcribe_audio, transcribe_audio_fast, transcribe_audio_with_cache

# Full transcription with Gemini filler detection
result = await transcribe_audio("video.mp4", use_llm_filler_detection=True)

# Fast transcription (Deepgram only, no Gemini)
result = await transcribe_audio_fast("video.mp4")

# Transcription with caching for video processing pipeline
result = await transcribe_audio_with_cache("video.mp4", cache, video_id)
```

### Output Format

```json
{
  "transcript": "Hello everyone, um, today I'm, uh, thrilled to present...",
  "words": [
    {"word": "Hello", "start": 0.5, "end": 0.8},
    {"word": "um", "start": 1.2, "end": 1.4}
  ],
  "confidence": 0.94,
  "metrics": {
    "filler_analysis": {
      "total_count": 12,
      "vocal_disfluency_count": 8,
      "contextual_filler_count": 4,
      "filler_rate_per_minute": 3.5
    },
    "speaking_pace_wpm": 156,
    "pause_count": 2,
    "total_words": 245,
    "content_words": 233
  }
}
```

### Testing the Deepgram Module

Run the standalone test script from repository root:

```bash
# Test with auto-detected video
python -m backend.deepgram.app

# Test with specific video file
python -m backend.deepgram.app /path/to/video.mp4

# Fast mode (skip Gemini filler detection)
python -m backend.deepgram.app --fast
python -m backend.deepgram.app /path/to/video.mp4 --fast
```

**Example Output:**

```
============================================================
  DEEPGRAM TRANSCRIPTION TEST
============================================================

Video: /path/to/video.mp4
Gemini Filler Detection: Enabled

============================================================
  TRANSCRIPT
============================================================

Hello everyone, um, today I'm, uh, thrilled to present...

============================================================
  SPEECH METRICS
============================================================

  Total Words:           245
  Content Words:         233
  Duration:              02:45.00
  Speaking Pace:         156 WPM
  Confidence:            94.00%

============================================================
  FILLER WORD ANALYSIS
============================================================

  Total Fillers:         12
  Vocal Disfluencies:    8 (um, uh, etc.)
  Contextual Fillers:    4 (like, you know, etc.)
  Filler Rate:           4.4 per minute

  Filler Words Detected:
    [00:01.20] "um" (vocal_disfluency)
    [00:05.80] "like" (contextual)
    ...
```

### Data Classes

| Class | Description |
|-------|-------------|
| `TranscriptionResult` | Complete transcription with transcript, words, confidence, and metrics |
| `WordInfo` | Individual word with start/end timestamps, confidence, and filler classification |
| `SpeechMetrics` | Derived metrics including filler analysis, WPM, and pause detection |
| `FillerAnalysis` | Detailed filler word breakdown by type |
| `PauseInfo` | Information about detected pauses between words |
| `FillerType` | Enum: `VOCAL_DISFLUENCY` or `CONTEXTUAL` |

## Gemini Module

The Gemini module provides multimodal synthesis for visual-verbal dissonance detection and coherence scoring.

### Features

- **Dissonance Detection**: Identifies mismatches between speech and body language
  - **EMOTIONAL_MISMATCH**: Speech sentiment contradicts facial expression (e.g., saying "thrilled" with anxious face)
  - **MISSING_GESTURE**: Deictic phrases without corresponding pointing (e.g., "look at this" without gesturing)
  - **PACING_MISMATCH**: Speaking too fast/slow for content complexity
- **Coherence Scoring**: Weighted algorithm (0-100) based on presentation metrics
- **Coaching Insights**: Actionable feedback with strengths and priorities
- **Demo Fallback**: Automatic mock results when API is unavailable

### Input Formats

**TwelveLabs Data** (visual analysis):
```json
[
  {
    "query": "person fidgeting with hands",
    "clips": [
      {"start": 12.3, "end": 15.7, "confidence": 0.82},
      {"start": 45.1, "end": 48.9, "confidence": 0.91}
    ]
  }
]
```

**Deepgram Data** (transcription):
```json
{
  "transcript": "Hello everyone, um, today I'm, uh, thrilled to present...",
  "words": [
    {"word": "Hello", "start": 0.5, "end": 0.8},
    {"word": "um", "start": 1.2, "end": 1.4}
  ],
  "confidence": 0.94,
  "metrics": {
    "filler_analysis": {"total_count": 12},
    "speaking_pace_wpm": 156
  }
}
```

### API Functions

```python
from backend.gemini import (
    synthesize_analysis,
    synthesize_analysis_with_cache,
    calculate_coherence_score,
    is_available
)

# Check if Gemini is configured
if is_available():
    print("Gemini API ready")

# Synthesize TwelveLabs + Deepgram data
result = await synthesize_analysis(twelvelabs_data, deepgram_data)

# With caching for video processing pipeline
result = await synthesize_analysis_with_cache(
    twelvelabs_data, deepgram_data, cache, video_id
)

# Calculate coherence score directly
score, breakdown = calculate_coherence_score(
    eye_contact_pct=62,
    filler_count=12,
    fidget_count=8,
    speaking_pace_wpm=156,
    critical_flag_count=1
)
```

### Output Format

```json
{
  "dissonance_flags": [
    {
      "id": "flag-abc123",
      "type": "EMOTIONAL_MISMATCH",
      "timestamp": 45.2,
      "endTimestamp": 48.0,
      "severity": "HIGH",
      "description": "Said 'thrilled to present' but facial expression showed anxiety",
      "coaching": "Practice saying this line while smiling. Your face should match your excitement.",
      "visualEvidence": "Detected at 43.0s - 48.0s",
      "verbalEvidence": "We're thrilled to present our solution..."
    }
  ],
  "overall_coherence_score": 67,
  "score_breakdown": {
    "eye_contact": 18,
    "filler_words": 15,
    "fidgeting": 12,
    "pacing": 14,
    "dissonance_penalty": -10
  },
  "strengths": ["Clear voice projection", "Logical structure"],
  "top_3_priorities": [
    "Reduce nervous fidgeting (8 instances)",
    "Increase eye contact with camera (currently 62%, target 80%)",
    "Match facial expressions to emotional language"
  ],
  "metrics": {
    "eyeContact": 62,
    "fillerWords": 12,
    "fidgeting": 8,
    "speakingPace": 156,
    "speakingPaceTarget": "140-160"
  }
}
```

### Coherence Score Algorithm

Weighted scoring (0-100):
- **Eye Contact**: 30% (higher is better, 80%+ = full points)
- **Filler Words**: 25% (fewer is better, <5 = full points)
- **Fidgeting**: 20% (fewer is better, <3 = full points)
- **Speaking Pace**: 15% (140-160 WPM optimal)
- **Dissonance Penalty**: -10 points per HIGH severity flag

Score tiers:
- **Strong**: 80-100
- **Good Start**: 50-79
- **Needs Work**: 0-49

### Data Classes

| Class | Description |
|-------|-------------|
| `SynthesisResult` | Complete analysis with flags, score, strengths, and priorities |
| `DissonanceFlag` | Individual dissonance detection with timestamp and coaching |
| `ScoreBreakdown` | Component scores for eye contact, fillers, fidgeting, pacing |
| `DissonanceType` | Enum: `EMOTIONAL_MISMATCH`, `MISSING_GESTURE`, `PACING_MISMATCH` |
| `Severity` | Enum: `HIGH`, `MEDIUM`, `LOW` |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `TWELVELABS_API_KEY` | Yes | TwelveLabs API key for video analysis |
| `DEEPGRAM_API_KEY` | Yes | Deepgram API key for audio transcription |
| `GEMINI_API_KEY` | Yes* | Gemini API key for dissonance detection and contextual filler detection (*falls back to mock data if not set) |

## Notes

- The backend is configured to accept CORS requests from `http://localhost:3000` (Vite dev server)
- All API endpoints will be prefixed with `/api/` when routers are added
- Video files will be stored in `backend/data/videos/` (create this directory if needed)
