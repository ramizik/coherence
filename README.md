# 🎯 Coherence - AI Presentation Coach

**Win your next presentation with AI-powered body language feedback.**

Coherence is an AI platform that detects **visual-verbal dissonance** — when your body language contradicts what you're saying. Built for students, professionals, and anyone who wants to present with confidence.

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

## 🏗️ Architecture

```
┌─────────────────┐
│   Vite + React  │  ← Frontend (TypeScript + TailwindCSS)
│   (Mobile-First)│
└────────┬────────┘
         │ REST API
┌────────▼────────┐
│    FastAPI      │  ← Backend (Python, async)
│   PostgreSQL    │  ← Database
│   Redis/Celery  │  ← Background Jobs
└────────┬────────┘
         │ AI Services
    ┌────┼─────────────────┐
    ▼    ▼                 ▼
┌───────┐ ┌──────────┐ ┌─────────┐
│Video  │ │ Speech   │ │Coaching │
│Analysis│ │Transcribe│ │Synthesis│
└───────┘ └──────────┘ └─────────┘
```

### Technology Stack

**Frontend**
- Vite 6+ with React 18 - Build tool and UI framework
- TypeScript - Type safety
- TailwindCSS v4 - Mobile-first responsive design
- shadcn/ui - Pre-built Radix UI components
- Lucide React - Icon system
- Progressive Web App (PWA) - Mobile app-like experience

**Backend**
- FastAPI - Python async web framework
- PostgreSQL - Relational database
- Celery/RQ - Background job processing
- Redis - Caching and sessions
- Cloud Storage (S3/GCS) - Video file storage
- Pydantic - Request/response validation

**AI Services (Flexible - Evaluate Best Options)**
- **Video Analysis:** TwelveLabs (current) or alternatives (OpenAI Vision, custom models)
- **Speech Transcription:** Deepgram (current) or alternatives (Whisper, AssemblyAI)
- **Coaching Synthesis:** Gemini (current) or alternatives (Claude, GPT-4)

**Note:** AI services are evaluated based on cost, accuracy, and features. The architecture supports swapping providers without changing business logic.

---

## 🎯 Key Features

### 1. Visual-Verbal Dissonance Detection
Our AI pipeline analyzes video in parallel:
- **Video Analysis:** Eye contact, fidgeting, gestures, facial expressions
- **Speech Analysis:** Transcription, filler words ("um", "uh", "like"), speaking pace
- **Coaching Synthesis:** Natural language coaching advice

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
- **Coaching Summary** - Natural language AI coaching advice

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

### 5. Mobile-First Design
- Responsive layout for all screen sizes
- Camera integration for mobile recording
- Touch-optimized interactions
- Progressive Web App (PWA) support

---

## 📡 API Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `POST /api/auth/register` | POST | User registration | No |
| `POST /api/auth/login` | POST | User login | No |
| `POST /api/videos/upload` | POST | Upload video (MP4/MOV/WebM, max 500MB) | Yes |
| `GET /api/videos/{id}/status` | GET | Poll processing status (0-100%) | Yes |
| `GET /api/videos/{id}/results` | GET | Fetch complete analysis results | Yes |
| `GET /api/videos/{id}/stream` | GET | Stream video file for playback | Yes |
| `GET /api/users/me/videos` | GET | List user's videos | Yes |
| `GET /health` | GET | Health check endpoint | No |

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
      "visualEvidence": "Detected 'anxious face' at 0:43-0:48",
      "verbalEvidence": "'thrilled' (positive sentiment)"
    }
  ],
  "transcript": [
    {"text": "Hello everyone, today I'm thrilled...", "start": 0.5, "end": 3.2}
  ],
  "coachingReport": {
    "headline": "Solid foundation to build on",
    "advice": "Great job on your presentation! You did a wonderful job maintaining eye contact..."
  }
}
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- PostgreSQL (or MongoDB)
- Redis (for background jobs)
- API keys for AI services (TwelveLabs, Deepgram, Gemini - or alternatives)

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

# Set up database
alembic upgrade head

# Create .env file in repository root with:
# DATABASE_URL=postgresql://user:pass@localhost/coherence
# REDIS_URL=redis://localhost:6379
# TWELVELABS_API_KEY=your_key (or alternative)
# DEEPGRAM_API_KEY=your_key (or alternative)
# GEMINI_API_KEY=your_key (or alternative)
# SECRET_KEY=your_secret_key
# CLOUD_STORAGE_BUCKET=your_bucket

# Run backend server
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000

# Run background worker (separate terminal)
celery -A backend.app.tasks.celery_app worker --loglevel=info
```

### Environment Variables (`.env` in repository root)

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost/coherence

# Redis
REDIS_URL=redis://localhost:6379

# AI Services (flexible - use alternatives if preferred)
TWELVELABS_API_KEY=your_twelvelabs_key
DEEPGRAM_API_KEY=your_deepgram_key
GEMINI_API_KEY=your_gemini_key

# Security
SECRET_KEY=your_secret_key_for_jwt

# Storage
CLOUD_STORAGE_BUCKET=your_bucket_name
CLOUD_STORAGE_PROVIDER=s3  # or gcs, azure

# Optional: Service selection
VIDEO_ANALYSIS_PROVIDER=twelvelabs  # or openai, custom
SPEECH_PROVIDER=deepgram  # or whisper, assemblyai
COACHING_PROVIDER=gemini  # or claude, gpt4
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
│   ├── App.tsx             # Root component with routing
│   ├── components/
│   │   ├── ui/             # shadcn/ui components
│   │   ├── auth/           # Authentication components
│   │   ├── upload/         # Upload page components
│   │   ├── results/        # Results dashboard components
│   │   ├── profile/        # User profile components
│   │   └── mobile/         # Mobile-specific components
│   ├── lib/
│   │   ├── api.ts          # API service layer
│   │   ├── auth.ts         # Authentication utilities
│   │   └── hooks/          # Custom React hooks
│   └── types/
│       └── api.ts          # TypeScript API types
│
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app + CORS
│   │   ├── config.py            # Configuration
│   │   ├── routers/
│   │   │   ├── auth.py          # Authentication endpoints
│   │   │   ├── users.py         # User management
│   │   │   └── videos.py        # Video endpoints
│   │   ├── services/
│   │   │   ├── auth_service.py  # Authentication logic
│   │   │   ├── video_service.py # Video processing
│   │   │   ├── storage_service.py # Cloud storage
│   │   │   └── ai/              # AI service abstraction
│   │   ├── models/
│   │   │   ├── database.py     # SQLAlchemy models
│   │   │   └── schemas.py      # Pydantic schemas
│   │   ├── middleware/
│   │   │   ├── auth.py         # Auth middleware
│   │   │   └── error_handler.py # Error handling
│   │   └── tasks/
│   │       └── video_processing.py # Background jobs
│   ├── alembic/            # Database migrations
│   ├── tests/              # Test suite
│   └── cli.py              # CLI testing tool
│
├── documentation/
│   ├── ROADMAP.md          # Development phases
│   └── FIGMA_GUIDELINES.md # Frontend spec
├── AGENTS.md               # AI assistant guidelines
├── CLAUDE.md               # Backend guidelines
└── README.md
```

---

## 🔄 Processing Pipeline

```
Upload Video ─┬─► Speech Analysis (5-10s)    ─┬─► Merge Results ─► Coaching Report ─► Store
              │   └─► Transcript              │   └─► Score Calculation
              │   └─► Filler words            │
              │   └─► Speaking pace           │
              │                               │
              └─► Video Analysis (20-40s)     ─┘
                  └─► Video indexing
                  └─► Visual analysis
                  └─► Dissonance flags
```

**Processing Time:** ~30-45 seconds for 2-minute video (target: <30s)

---

## 🎯 Development Roadmap

See [ROADMAP.md](documentation/ROADMAP.md) for detailed development phases:

- **Phase 1:** Foundation & Infrastructure (Auth, Database, Storage)
- **Phase 2:** User Experience & Mobile (Mobile-first design, UX improvements)
- **Phase 3:** Advanced Features (Enhanced AI, personalized coaching)
- **Phase 4:** Scale & Optimization (Performance, scalability)
- **Phase 5:** Launch Preparation (Deployment, billing, go-to-market)

---

## 🐛 Current Status

**✅ Completed (Hackathon MVP):**
- Core video analysis pipeline
- Visual-verbal dissonance detection
- Interactive results dashboard
- Basic API endpoints

**🚧 In Progress (Production):**
- User authentication system
- Database persistence
- Cloud storage migration
- Background job system
- Mobile-first responsive design

**⏳ Planned:**
- Advanced AI features
- Team/group features
- Integration with presentation tools
- Production deployment

---

## 📚 Documentation

- [Roadmap](documentation/ROADMAP.md) - Development phases and milestones
- [Frontend Guidelines](FIGMA_GUIDELINES.md) - Frontend generation spec and mobile-first design
- [Backend Guidelines](CLAUDE.md) - Backend development and API contracts
- [Agent Guidelines](AGENTS.md) - AI assistant integration patterns
- [Backend README](backend/README.md) - Backend module documentation

---

## 🤝 Contributing

This is a production startup project. For contributions, please:
1. Check the current phase in [ROADMAP.md](documentation/ROADMAP.md)
2. Follow code quality standards in [CLAUDE.md](CLAUDE.md) and [AGENTS.md](AGENTS.md)
3. Write tests for new features
4. Update documentation as needed

---

## 🙏 Acknowledgments

- **AI Service Providers** - Video understanding, speech transcription, and coaching synthesis
- **Open Source Community** - Vite, React, FastAPI, and all other open-source tools
- **Early Users** - Feedback and support during development

---

**Built with ❤️ | Making confident presentation skills accessible to everyone**
