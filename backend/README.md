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

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `TWELVELABS_API_KEY` | Yes | TwelveLabs API key for video analysis |
| `DEEPGRAM_API_KEY` | No | Deepgram API key (for future integration) |
| `GEMINI_API_KEY` | No | Gemini API key (for future integration) |

## Notes

- The backend is configured to accept CORS requests from `http://localhost:3000` (Vite dev server)
- All API endpoints will be prefixed with `/api/` when routers are added
- Video files will be stored in `backend/data/videos/` (create this directory if needed)
