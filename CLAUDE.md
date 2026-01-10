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
- Next.js 14 (TypeScript) built by separate team
- You provide REST API endpoints marked in their code as `// BACKEND_HOOK:`
- All responses must match TypeScript interfaces defined in frontend

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
/app
  /main.py                  # FastAPI app entry
  /routers
    /videos.py              # Upload, status, results endpoints
  /services
    /twelvelabs.py          # Video indexing & semantic queries
    /deepgram.py            # Audio transcription & metrics
    /gemini.py              # Multimodal synthesis
    /analysis.py            # Coherence score calculation
  /models
    /schemas.py             # Pydantic models matching TS interfaces
  /utils
    /video_processing.py    # FFmpeg wrapper
    /cache.py               # In-memory result storage
/tests
  /test_api.py              # Endpoint tests
  /test_analysis.py         # Logic tests
/mock_data
  /sample_results.json      # Pre-generated analysis
  /videos/                  # Demo videos
```

---

## 🔌 API Endpoints (Frontend Contract)

### 1. Upload Video
```
POST /api/videos/upload
Content-Type: multipart/form-data

Request:
  - video: File (MP4/MOV, max 500MB)

Response:
  {
    "videoId": "uuid",
    "status": "processing",
    "estimatedTime": 45
  }
```

### 2. Check Status
```
GET /api/videos/{videoId}/status

Response:
  {
    "status": "processing" | "complete" | "error",
    "progress": 0-100,
    "message": "Analyzing speech patterns..."
  }
```

### 3. Get Results
```
GET /api/videos/{videoId}/results

Response: AnalysisResult (matches TypeScript interface)
  {
    "videoId": "uuid",
    "coherenceScore": 67,
    "metrics": {
      "eyeContact": 85,
      "fillerWords": 8,
      "fidgeting": 6,
      "speakingPace": 142
    },
    "dissonanceFlags": [
      {
        "timestamp": 15.5,
        "type": "EMOTIONAL_MISMATCH",
        "severity": "HIGH",
        "description": "...",
        "coaching": "..."
      }
    ],
    "videoUrl": "/videos/{videoId}.mp4"
  }
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

**Inputs:**
1. Deepgram transcript (text + timestamps)
2. TwelveLabs semantic results (JSON)
3. FFmpeg slide screenshots (images)

**Outputs:**
- Dissonance flags with timestamps
- Coaching recommendations
- Coherence score justification

**Prompt Strategy:**
```python
prompt = f"""
Analyze this presentation for visual-verbal dissonance.

TRANSCRIPT: {transcript}
BODY LANGUAGE: {twelvelabs_results}
SLIDE IMAGES: [attached]

Detect:
1. EMOTIONAL_MISMATCH: Positive words + negative expressions
2. MISSING_GESTURE: "Look at this" without pointing
3. PACING_MISMATCH: Dense slides shown too briefly

Return JSON with dissonanceFlags array.
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