# 🎯 Coherence - AI Presentation Coach

**Win your next presentation with AI-powered body language feedback.**

Coherence is the first AI platform that detects **visual-verbal dissonance** — when your body language contradicts what you're saying. Built for students, professionals, and anyone who wants to present with confidence.

---

## 🚀 The Problem

- **75% of people** fear public speaking more than death
- **90% of presentation anxiety** stems from lack of objective feedback
- Existing tools (Yoodli, PowerPoint Coach) only analyze audio
- **55% of communication is non-verbal**, yet no tool catches body language mistakes

### What We Catch

❌ **Emotional Mismatch** - Saying "I'm thrilled" with an anxious face
❌ **Missing Gestures** - Saying "look at this chart" without pointing
❌ **Pacing Issues** - Showing dense slides too briefly for comprehension

---

## 🎥 Demo Video

[![Coherence](https://img.youtube.com/vi/TbkoovSZkW0/0.jpg)](https://youtu.be/TbkoovSZkW0)

**Local Setup:** Run frontend and backend locally for development and testing

---

## 🏗️ Architecture

```
┌─────────────────┐
│   Vite + React  │  ← Frontend (TypeScript + TailwindCSS)
│  localhost:3000 │
└────────┬────────┘
         │ REST API
┌────────▼────────┐
│    FastAPI      │  ← Backend (Python, async)
│  localhost:8000 │
└────────┬────────┘
         │ Parallel Processing
    ┌────┼─────────────────┐
    ▼    ▼                 ▼
┌───────┐ ┌──────────┐ ┌─────────┐
│Twelve │ │ Deepgram │ │ Gemini  │
│ Labs  │ │  (Audio) │ │ (Coach) │
│(Video)│ └──────────┘ └─────────┘
└───────┘
```

### Technology Stack

**Frontend**
- Vite 6+ with React 18 - Build tool and UI framework
- TypeScript - Type safety
- TailwindCSS v4 - Glassmorphic dark theme UI
- shadcn/ui - Pre-built Radix UI components
- Lucide React - Icon system

**Backend**
- FastAPI - Python async web framework with CORS
- Async background tasks - Non-blocking video processing
- In-memory caching - Dict-based storage (no database)
- Pydantic - Request/response validation with camelCase output

**AI Services (All Integrated ✅)**
- **TwelveLabs** - Video indexing + semantic analysis (Pegasus 1.2 model)
- **Deepgram** - Audio transcription with filler word detection
- **Gemini 1.5 Pro** - Natural language coaching report generation

---

## 🎯 Key Features (All Implemented ✅)

### 1. Visual-Verbal Dissonance Detection
Our AI pipeline analyzes video in parallel:
- **TwelveLabs**: Eye contact, fidgeting, gestures, facial expressions
- **Deepgram**: Speech transcription, filler words ("um", "uh", "like"), speaking pace
- **Gemini**: Synthesizes all data into natural coaching advice

### 2. Three Types of Dissonance Flags
| Type | Description | Example |
|------|-------------|---------|
| `EMOTIONAL_MISMATCH` | Positive words with anxious/flat expression | Saying "thrilled" while frowning |
| `MISSING_GESTURE` | Deictic phrases without pointing | "Look at this" without gesturing |
| `PACING_MISMATCH` | Speaking too fast/slow for content | Rushing through dense material |

### 3. Interactive Results Dashboard
- **Video Player** with custom controls and seek functionality
- **Dissonance Timeline** - Click severity markers to jump to timestamps
- **Coaching Cards** - Dismissible insights with "Jump to Moment" buttons
- **Transcript Panel** - Word-level transcript with filler word highlighting
- **Gemini Summary Card** - Natural language coaching advice

### 4. Coherence Score (0-100)
Weighted algorithm:
- Eye contact percentage: 30%
- Filler word count: 25% (fewer = better)
- Fidgeting frequency: 20% (fewer = better)
- Speaking pace: 15% (140-160 WPM optimal)
- Dissonance penalties: -10 per HIGH, -5 per MEDIUM severity flag

**Score Tiers:**
- 76-100: "Strong"
- 51-75: "Good Start"
- 0-50: "Needs Work"

---

## 📡 API Endpoints (All Implemented ✅)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `POST /api/videos/upload` | POST | Upload video (MP4/MOV/WebM, max 500MB) |
| `GET /api/videos/{id}/status` | GET | Poll processing status (0-100%) |
| `GET /api/videos/{id}/results` | GET | Fetch complete analysis results |
| `GET /api/videos/{id}/stream` | GET | Stream video file for playback |
| `GET /api/videos/samples/{id}` | GET | Load pre-cached sample video |
| `GET /health` | GET | Health check endpoint |

### Sample API Response

```json
{
  "videoId": "abc-123",
  "videoUrl": "/api/videos/abc-123/stream",
  "durationSeconds": 183.0,
  "coherenceScore": 67,
  "scoreTier": "Good Start",
  "metrics": {
    "eyeContact": 62,
    "fillerWords": 12,
    "fidgeting": 8,
    "speakingPace": 156,
    "speakingPaceTarget": "140-160"
  },
  "dissonanceFlags": [
    {
      "id": "flag-1",
      "timestamp": 45.2,
      "endTimestamp": 48.0,
      "type": "EMOTIONAL_MISMATCH",
      "severity": "HIGH",
      "description": "Said 'thrilled to present' but facial expression showed anxiety",
      "coaching": "Practice saying this line while smiling in a mirror.",
      "visualEvidence": "TwelveLabs: 'person looking anxious' at 0:43-0:48",
      "verbalEvidence": "Deepgram: 'thrilled' (positive sentiment)"
    }
  ],
  "transcript": [
    {"text": "Hello everyone, today I'm thrilled...", "start": 0.5, "end": 3.2}
  ],
  "geminiReport": {
    "headline": "Solid foundation to build on",
    "coachingAdvice": "Great job on your presentation! You did a wonderful job maintaining eye contact..."
  }
}
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- API keys for TwelveLabs, Deepgram, Gemini

### Frontend Setup
```bash
# From repository root
npm install
npm run dev
# Opens at http://localhost:3000
```

### Backend Setup
```bash
# From repository root
python -m venv venv
.\venv\Scripts\Activate.ps1   # Windows PowerShell
# or: source venv/bin/activate  # Linux/Mac

pip install -r requirements.txt

# Create .env file in repository root with:
# TWELVELABS_API_KEY=your_key
# DEEPGRAM_API_KEY=your_key
# GEMINI_API_KEY=your_key

# Run backend server
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

### Environment Variables (`.env` in repository root)

```env
TWELVELABS_API_KEY=your_twelvelabs_key
DEEPGRAM_API_KEY=your_deepgram_key
GEMINI_API_KEY=your_gemini_key
```

---

## 📁 Project Structure

```
coherence/
├── index.html              # Vite entry point
├── package.json            # Frontend dependencies
├── requirements.txt        # Python dependencies
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
│
├── frontend/               # React frontend
│   ├── main.tsx            # Entry point
│   ├── App.tsx             # Root component with navigation
│   ├── index.css           # TailwindCSS styles
│   ├── components/
│   │   ├── ui/             # shadcn/ui components
│   │   ├── upload/
│   │   │   ├── UploadPage.tsx       # Main upload page
│   │   │   ├── UploadZone.tsx       # Drag-and-drop area
│   │   │   ├── ProcessingView.tsx   # Status polling UI
│   │   │   └── SampleVideos.tsx     # Pre-cached samples
│   │   ├── results/
│   │   │   ├── ResultsPage.tsx      # Main results dashboard
│   │   │   ├── VideoPlayer.tsx      # Custom video player
│   │   │   ├── ScoreBadge.tsx       # Circular score indicator
│   │   │   ├── CompactMetrics.tsx   # Metrics bar
│   │   │   ├── CoachingCard.tsx     # Dismissible coaching cards
│   │   │   ├── DissonanceTimeline.tsx  # Interactive timeline
│   │   │   ├── TranscriptPanel.tsx  # Word-level transcript
│   │   │   └── GeminiSummaryCard.tsx   # AI coaching summary
│   │   └── landing/        # Landing page components
│   ├── lib/
│   │   ├── api.ts          # API service layer
│   │   └── mock-data.ts    # Mock data for fallback
│   └── types/
│       └── api.ts          # TypeScript API types
│
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app + CORS
│   │   ├── routers/
│   │   │   └── videos.py        # API endpoints
│   │   ├── services/
│   │   │   ├── video_service.py    # Processing orchestration
│   │   │   ├── deepgram_service.py # Deepgram wrapper
│   │   │   ├── twelvelabs_service.py  # TwelveLabs wrapper
│   │   │   └── gemini_service.py   # Gemini wrapper
│   │   └── models/
│   │       └── schemas.py       # Pydantic schemas
│   ├── deepgram/
│   │   ├── deepgram_client.py   # SDK client
│   │   └── transcription.py     # Audio transcription
│   ├── twelvelabs/
│   │   ├── twelvelabs_client.py # SDK client
│   │   ├── indexing.py          # Video indexing
│   │   └── analysis.py          # Semantic analysis
│   ├── gemini/
│   │   ├── gemini_client.py     # SDK client
│   │   └── synthesis.py         # Dissonance detection
│   ├── cli.py                   # CLI testing tool
│   └── data/videos/             # Uploaded video storage
│
├── documentation/
│   ├── ROADMAP.md          # Build plan
│   └── FIGMA_GUIDELINES.md # Frontend spec
├── AGENTS.md               # AI assistant guidelines
├── CLAUDE.md               # Backend guidelines
└── README.md
```

---

## 🔄 Processing Pipeline

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

**Processing Time:** ~45-60 seconds for 2-minute video

---

## 🐛 Known Limitations

- ❌ No user authentication
- ❌ No database persistence (in-memory cache only)
- ❌ No mobile app (web-only, desktop-first design)
- ❌ Processing limited to 5-minute videos
- ❌ No video editing/trimming
- ✅ All AI services integrated (TwelveLabs, Deepgram, Gemini)

---

## 📚 Documentation

- [Roadmap](documentation/ROADMAP.md) - Build plan, milestones, and progress
- [Frontend Guidelines](documentation/FIGMA_GUIDELINES.md) - Frontend generation spec
- [Backend Guidelines](CLAUDE.md) - Backend development and API contracts
- [Agent Guidelines](AGENTS.md) - AI assistant integration patterns
- [Backend README](backend/README.md) - Module documentation and CLI tool

---

## 🙏 Acknowledgments

- **TwelveLabs** - Semantic video understanding API
- **Deepgram** - Real-time speech transcription
- **Google** - Gemini 1.5 Pro multimodal AI
- **Vite** - Frontend build tool
- **React** - UI framework
- **FastAPI** - Backend framework

---

**Built with ❤️ in 24 hours | SBHacks 2025**
