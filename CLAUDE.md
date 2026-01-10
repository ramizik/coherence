# CLAUDE.md - Coherence AI Presentation Coach

You are assisting backend development for **Coherence**, an AI-powered presentation coaching platform built during a **24-hour hackathon**. Your role is to help build a demo-optimized MVP that integrates video analysis, speech processing, and multimodal AI.

---

## 🎯 Mission & Constraints

**Goal:** Build an impressive, demo-stable backend that processes presentation videos and detects visual-verbal dissonance.

**Time:** 24 hours of build time

**Optimize for:**
- Demo reliability (must work on stage)
- Sponsor API integration depth (TwelveLabs, Deepgram, Gemini)
- Fast implementation
- Clear integration points for frontend

**Do NOT optimize for:**
- Production scalability
- Perfect architecture
- Database persistence
- Comprehensive error handling

---

## 🏗️ Technology Stack (Fixed)

### Backend
- **Framework:** FastAPI (Python 3.10+)
- **Processing:** Async background tasks (in-memory queue)
- **Storage:** Local filesystem + in-memory cache (no MongoDB for hackathon)
- **Video Processing:** FFmpeg for frame extraction

### AI Services (Core Integration)
1. **TwelveLabs** - Video understanding (semantic search for body language)
2. **Deepgram** - Speech transcription and audio analysis
3. **Gemini 1.5 Pro** - Multimodal synthesis (dissonance detection)

### Frontend Contract
- Vite + React 18 (TypeScript) - runs from repository root
- Frontend code lives in `frontend/` folder, config files in root
- You provide REST API endpoints marked in their code as `// BACKEND_HOOK:`
- All responses must match TypeScript interfaces defined in frontend
- Frontend runs on http://localhost:3000, backend on http://localhost:8000

---

## 🔑 Core Development Principles

### 1. Hackathon Speed Rules
- **Monolith over microservices** - Single FastAPI app
- **In-memory over database** - Dict/list caching, no persistence
- **Parallel over sequential** - Run TwelveLabs + Deepgram simultaneously
- **Pre-cached over live** - Index demo videos beforehand
- **Hardcoded over config** - Fast iteration, no environment complexity

### 2. Demo-First Engineering
- Every endpoint must have a **cached fallback** for demo day
- Processing time target: **<60 seconds** per video
- **Pre-index** 3 sample videos the night before
- Implement **offline mode** for bad venue WiFi
- Test with **5+ demo rehearsals**

### 3. Lightweight Testing
- Focus on **critical path only**: upload → process → results
- Use `pytest` with fixtures for API testing
- Mock external APIs for unit tests
- Integration tests for end-to-end flow
- Tests live in: `/tests/`

### 4. Integration Contract
- Match **exact TypeScript interfaces** from frontend
- Mark all external API calls with clear comments
- Provide **mock data generators** for frontend development
- Include **status polling** mechanism

---

## 📁 File Structure

```
backend/
├── __init__.py
├── cli.py                     # CLI tool for testing modules
├── app/
│   ├── __init__.py
│   ├── main.py                # FastAPI app entry (CORS, router includes)
│   ├── routers/
│   │   ├── __init__.py
│   │   └── videos.py          # Upload, status, results, stream endpoints ✅
│   ├── services/
│   │   ├── __init__.py
│   │   └── video_service.py   # Video processing, in-memory cache ✅
│   └── models/
│       ├── __init__.py
│       └── schemas.py         # Pydantic models (12 schemas) ✅
├── twelvelabs/
│   ├── __init__.py
│   ├── twelvelabs_client.py   # TwelveLabs SDK client ✅
│   ├── indexing.py            # Video indexing operations ✅
│   ├── analysis.py            # Video analysis operations ✅
│   └── app.py                 # Standalone test script
├── data/
│   └── videos/                # Uploaded video storage ✅
└── README.md                  # Backend setup + CLI docs
```

**API Endpoints Implemented:**
- `POST /api/videos/upload` - Upload video, start processing
- `GET /api/videos/{id}/status` - Poll processing status
- `GET /api/videos/{id}/results` - Get analysis results
- `GET /api/videos/samples/{id}` - Load sample video
- `GET /api/videos/{id}/stream` - Stream video file

---

## 🔌 API Endpoints (Frontend Contract)

### 1. Upload Video
```
POST /api/videos/upload
Content-Type: multipart/form-data

Request:
  - video: File (MP4/MOV/WebM, max 500MB, max 5 minutes)

Response:
  {
    "videoId": "abc-123-uuid",
    "status": "processing",
    "estimatedTime": 45,
    "durationSeconds": 183
  }
```

### 2. Check Status (Poll every 3 seconds)
```
GET /api/videos/{videoId}/status

Response:
  {
    "videoId": "abc-123-uuid",
    "status": "queued" | "processing" | "complete" | "error",
    "progress": 0-100,
    "stage": "Analyzing body language...",
    "etaSeconds": 25,
    "error": null  // Error message if status === "error"
  }
```

**Stage Messages** (for UX):
- `"Extracting audio..."` (0-15%)
- `"Transcribing speech..."` (15-30%)
- `"Analyzing body language..."` (30-60%)
- `"Detecting dissonance..."` (60-85%)
- `"Generating insights..."` (85-100%)

### 3. Get Results
```
GET /api/videos/{videoId}/results

Response: AnalysisResult (matches TypeScript interface)
  {
    "videoId": "abc-123-uuid",
    "videoUrl": "/videos/abc-123-uuid.mp4",
    "durationSeconds": 183,
    "coherenceScore": 67,
    "scoreTier": "Good Start",  // "Needs Work" | "Good Start" | "Strong"

    "metrics": {
      "eyeContact": 62,         // Percentage (0-100)
      "fillerWords": 12,        // Count
      "fidgeting": 8,           // Count
      "speakingPace": 156,      // WPM (target: 140-160)
      "speakingPaceTarget": "140-160"
    },

    "dissonanceFlags": [
      {
        "id": "flag-1",
        "timestamp": 45.2,
        "endTimestamp": 48.0,
        "type": "EMOTIONAL_MISMATCH",
        "severity": "HIGH",
        "description": "Said 'thrilled' but facial expression showed anxiety",
        "coaching": "Practice saying this line while smiling. Your face should match your excitement.",
        "visualEvidence": "TwelveLabs: 'person looking anxious' at 0:43-0:48",
        "verbalEvidence": "Deepgram: 'thrilled' (positive sentiment)"
      }
    ],

    "timelineHeatmap": [
      {"timestamp": 12, "severity": "LOW"},
      {"timestamp": 45, "severity": "HIGH"},
      {"timestamp": 83, "severity": "MEDIUM"}
    ],

    "strengths": ["Clear voice projection", "Logical structure"],
    "priorities": ["Reduce nervous fidgeting", "Increase eye contact", "Match emotions to words"]
  }
```

### 4. Serve Video (for playback)
```
GET /videos/{videoId}.mp4

Response: Video file stream with Range request support
```

---

## 🤖 AI Integration Guidelines

### TwelveLabs (Deep Integration Required)
**Purpose:** Semantic video search for body language analysis

**Key Queries to Run:**
- Emotion: `"person smiling"`, `"person frowning"`, `"person showing anxiety"`
- Engagement: `"person looking at camera"`, `"person looking away"`
- Gestures: `"person pointing"`, `"person fidgeting hands"`
- Posture: `"person standing straight"`, `"person slouching"`

**Run 10-15 queries per video** to showcase API depth

**Implementation Pattern:**
```python
# Index video first
index_response = await twelvelabs.index_video(video_path)

# Run parallel semantic queries
queries = [
    "person smiling",
    "person frowning",
    "person looking at camera",
    "person pointing"
]
results = await asyncio.gather(*[
    twelvelabs.search(index_id, query)
    for query in queries
])
```

### Deepgram (Medium Integration)
**Purpose:** Real-time transcription and speech metrics

**Extract:**
- Full transcript with word-level timestamps
- Filler word detection (um, uh, like, you know)
- Speaking pace (WPM calculation)
- Pause detection

**Implementation Pattern:**
```python
# Get transcript with timestamps
transcript = await deepgram.transcribe(audio_path)

# Calculate derived metrics
filler_words = count_fillers(transcript.words)
wpm = calculate_pace(transcript.words, duration)
```

### Gemini (Deep Integration)
**Purpose:** Multimodal orchestration and dissonance detection

**Inputs (Bundle):**
```python
synthesis_input = {
    "transcript": deepgram_data["transcript"],
    "transcript_words": deepgram_data["words"],  # With timestamps
    "visual_events": twelvelabs_data,            # Query results
    "slide_images": [base64_encode(img) for img in slide_paths],
    "metrics": {
        "filler_count": 12,
        "wpm": 156,
        "eye_contact_pct": 62,
        "fidget_count": 8
    }
}
```

**Outputs:**
- Dissonance flags with timestamps, severity, coaching
- Coherence score with breakdown
- Strengths and top 3 priorities

**Prompt Strategy:**
```python
prompt = f"""
You are an expert presentation coach. Analyze this presentation for
visual-verbal dissonance. You have:

1. Full transcript with word-level timestamps
2. Visual analysis showing facial expressions, gestures, eye contact
3. Slide screenshots with text content

Detect these critical issues:

A) EMOTIONAL_MISMATCH: Speech sentiment contradicts facial expression
   Example: Saying "excited" at 00:45 but detected "anxious face" at 00:43-00:48

B) MISSING_GESTURE: Deictic phrases without corresponding pointing
   Example: "Look at this chart" at 01:23 but no "pointing" gesture detected ±3s

C) PACING_MISMATCH: Dense slides shown too briefly for comprehension
   Example: Slide has 127 words but only shown for 18 seconds (need ~45s)

TRANSCRIPT: {transcript}
BODY LANGUAGE EVENTS: {twelvelabs_results}
METRICS: {metrics}
SLIDE IMAGES: [attached]

Return JSON matching this exact schema:
{{
  "dissonance_flags": [
    {{
      "type": "EMOTIONAL_MISMATCH" | "MISSING_GESTURE" | "PACING_MISMATCH",
      "timestamp": 45.2,
      "end_timestamp": 48.0,
      "severity": "HIGH" | "MEDIUM" | "LOW",
      "description": "What was detected",
      "coaching": "Specific actionable fix"
    }}
  ],
  "strengths": ["List of things done well"],
  "priorities": ["Top 3 improvement areas"]
}}
"""
```

---

## 📊 Analysis Logic

### Coherence Score Algorithm
```python
def calculate_coherence(metrics, flags):
    """
    Weighted scoring (0-100):
    - Eye contact: 30%
    - Filler words: 25%
    - Fidgeting: 20%
    - Speaking pace: 15%
    - Dissonance penalties: -10 each
    """
    score = (
        (metrics.eye_contact / 100) * 30 +
        max(0, (20 - metrics.filler_words) / 20) * 25 +
        max(0, (15 - metrics.fidgeting) / 15) * 20 +
        calculate_pace_score(metrics.speaking_pace) * 15
    )

    # Deduct for critical flags
    critical_flags = [f for f in flags if f.severity == "HIGH"]
    score -= len(critical_flags) * 10

    return max(0, min(100, score))
```

### Dissonance Detection Patterns

**1. Emotional Mismatch**
- Transcript sentiment (Gemini) vs facial expressions (TwelveLabs)
- Flag if: Positive words + anxious/neutral face

**2. Missing Gesture**
- Deictic phrases ("this", "here", "look") in transcript
- Check TwelveLabs for pointing/gesturing at timestamp
- Flag if: Deictic phrase + no gesture detected

**3. Pacing Mismatch**
- OCR slide text (Gemini Vision)
- Compare word count to speech duration
- Flag if: 100+ words shown <20 seconds

---

## 🎪 Demo Requirements

### Pre-Demo Preparation
1. **Index 3 sample videos** in TwelveLabs night before
2. **Cache all results** in memory (instant load)
3. **Test offline mode** - serve cached results if APIs fail
4. **Validate processing time** - all samples <45 seconds
5. **Rehearse 5+ times** with timer

### Live Demo Flow
```python
# Stage 1: Show cached result (instant)
GET /api/videos/sample-c/results  # Pre-indexed

# Stage 2: Local upload (live processing)
POST /api/videos/upload  # Real-time, max 60s
```

### Fallback Strategy
```python
# If live upload times out
if processing_time > 60:
    return cached_results["sample-c"]  # Pivot to backup
```

---

## 🚨 Risk Mitigation

### High-Priority Risks

**Risk:** TwelveLabs indexing >60 seconds
- **Mitigation:** Pre-index demo videos, cache results
- **Fallback:** Show Sample C if processing times out

**Risk:** API rate limits during demo
- **Mitigation:** Separate API keys for testing vs demo
- **Fallback:** Cached results for all demos

**Risk:** Bad venue WiFi
- **Mitigation:** Offline mode with pre-loaded results
- **Test:** Load dashboard before going on stage

**Risk:** Poor quality uploaded video
- **Mitigation:** Client-side validation (lighting check)
- **Fallback:** "Let's use this prepared example"

---

## ✅ Quality Standards

### API Response Requirements
- Match **exact TypeScript interfaces** from frontend
- Include **clear error messages** with retry guidance
- Provide **progress updates** during processing
- Return **timestamps in seconds** (not milliseconds)

### Code Quality
- **Type hints** on all functions
- **Docstrings** for complex logic
- **Clear variable names** (no abbreviations)
- **Error handling** for API failures only (happy path first)

### Integration Points
- Mark all external API calls: `# API_CALL: TwelveLabs.search()`
- Mark frontend integration: `# FRONTEND_CONTRACT: matches AnalysisResult interface`
- Mark demo hooks: `# DEMO_CACHE: pre-load this on startup`

---

## 🎬 Development Workflow

### Hour 0-8: Foundation
- FastAPI skeleton with upload endpoint
- Deepgram transcription working
- TwelveLabs video indexing working
- **Milestone:** Can upload video, get transcript

### Hour 8-16: Core Analysis
- Gemini multimodal synthesis
- Dissonance detection logic
- Coherence score calculation
- **Milestone:** End-to-end analysis pipeline

### Hour 16-22: Demo Prep
- Cache 3 sample analyses
- Status polling optimization
- Error handling for demo scenarios
- **Milestone:** Demo-ready with backups

### Hour 22-24: Integration & Polish
- Wire frontend to backend
- Test full user flow
- Rehearse demo 4+ times
- **Milestone:** Local environment ready

---

## 🔗 Frontend Integration

### Integration Process
1. Frontend team provides TypeScript interfaces
2. You generate matching Pydantic models
3. Frontend marks integration points with `// BACKEND_HOOK:`
4. You implement endpoints matching those hooks
5. Test with mock data first, then live APIs

### Mock Data Strategy
```python
# Provide generators for frontend dev
def generate_mock_result(score: int) -> AnalysisResult:
    """Generate realistic mock data for testing"""
    return AnalysisResult(
        videoId="mock-" + str(uuid.uuid4()),
        coherenceScore=score,
        # ... populate with realistic data
    )
```

---

## 📝 Guidance Style

When assisting:
- **Be direct** - no long preambles
- **Show tradeoffs** - "This is faster but less accurate"
- **Prioritize demo** - "This won't improve the demo, skip it"
- **Flag risks** - "This could fail during demo, add fallback"
- **Cut scope** - "This feature doesn't improve demo, remove it"

**Success metric:** Demo runs smoothly 5 times in a row without API failures.

---

## 🎯 Acceptance Criteria

Backend is complete when:
- ✅ All 3 endpoints return correct response shapes
- ✅ Can process video in <60 seconds
- ✅ 3 sample videos cached and load instantly
- ✅ Frontend can integrate without refactoring
- ✅ Demo rehearsed 5+ times successfully
- ✅ Offline mode works (cached results)
- ✅ All sponsor APIs integrated with 10+ calls each

**Your mission:** Enable a flawless 3-minute demo that wins the hackathon.

## Non-Negotiable Design Principles
See AGENTS.md for detailed principles.


## Documentation Policy (Important)

Do **NOT** generate new documentation `.md` files after every task.
Only create documentation at **milestones** and **only when I explicitly prompt for it**.
All documentation must be stored in 'documentation' folder

## "Role" mental models (map to existing Claude agents available in .claude/agents folder)

Use these specializations as needed (even if Cursor doesn't literally "switch agents"):

- architect-reviewer: sanity-check structure, boundaries, and long-term maintainability.
- backend-developer: API/data model/auth/server logic; validate error handling and contracts.
- frontend-developer: page composition, state management, UX, responsive behavior.
- fullstack-developer: end-to-end features spanning client and server; API routes, server actions, data fetching patterns, and frontend-backend integration.
- react-specialist: component architecture, hooks, memoization, React best practices.
- typescript-pro: types, generics, inference, avoiding unsafe casts.
- ui-designer: layout, spacing, typography, a11y, and shadcn-consistent UI.
- code-reviewer: PR-level feedback; keep suggestions actionable and prioritized.

## Subagent usage

Use Claude Code subagents from `.claude/agents/` when it improves quality or parallelizes work; pick the smallest set of agents needed for the task. The project contains these agents:

- architect-reviewer
- backend-developer
- code-reviewer
- frontend-developer
- fullstack-developer
- react-specialist
- typescript-pro
- ui-designer

Guidelines:

- Use `architect-reviewer` for big refactors, routing/data boundaries, and maintainability checks.
- Use `frontend-developer` + `ui-designer` for UI/UX, page layout, and responsive behavior.
- Use `fullstack-developer` for end-to-end features spanning client and server; API routes, server actions, data fetching patterns, and frontend-backend integration.
- Use `react-specialist` for component patterns, hooks, state, and performance pitfalls.
- Use `typescript-pro` whenever adding/changing types, API contracts, or complex props.
- Use `backend-developer` for server/API/data/auth logic and error-handling.
- Use `code-reviewer` at the end for a "PR review" pass before final output.

## Finding library/API documentation

Always use context7 when I need code generation, setup or configuration steps, or
library/API documentation. This means you should automatically use the Context7 MCP
tools to resolve library id and get library docs without me having to explicitly ask.