# CLAUDE.md - Coherence Backend Development Guidelines

You are assisting backend development for **Coherence**, an AI-powered presentation coaching platform. This is a **production-ready startup** building a scalable SaaS product that helps users improve their presentation skills through visual-verbal dissonance detection.

---

## 🎯 Mission & Constraints

**Goal:** Build a scalable, maintainable backend that processes presentation videos and provides actionable coaching insights.

**Context:** Transitioning from hackathon MVP to production SaaS

**Optimize for:**
- Production scalability and reliability
- Code maintainability and testability
- Cost efficiency (AI service usage)
- User experience (fast processing, clear errors)
- Security and data privacy

**Do NOT optimize for:**
- Premature optimization (measure first)
- Over-engineering (start simple, scale when needed)
- Vendor lock-in (use abstraction layers)

---

## 🏗️ Technology Stack

### Backend Framework
- **Framework:** FastAPI (Python 3.10+)
- **Database & Auth:** Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Queue:** Celery + Redis (Upstash) for background jobs
- **Storage:** Supabase Storage (built-in, replaces S3/GCS)
- **Cache:** Redis for caching and sessions

### AI Services (Flexible - Evaluate Best Options)

**Current MVP Stack:**
- TwelveLabs - Video understanding
- Deepgram - Speech transcription
- Gemini 1.5 Pro - Multimodal synthesis

**Note:** AI services are **not fixed**. Evaluate alternatives based on:
- Cost per analysis
- Accuracy and latency
- API reliability
- Feature set

**Service Abstraction Pattern:**
```python
# backend/app/services/ai/base.py
class VideoAnalysisProvider(ABC):
    @abstractmethod
    async def analyze_video(self, video_path: str) -> VideoAnalysis:
        pass

# backend/app/services/ai/twelvelabs_provider.py
class TwelveLabsProvider(VideoAnalysisProvider):
    # Implementation

# backend/app/services/ai/openai_provider.py
class OpenAIProvider(VideoAnalysisProvider):
    # Alternative implementation
```

### Frontend Contract
- Vite + React 18 (TypeScript)
- Frontend code in `frontend/` folder
- REST API endpoints marked with `// BACKEND_HOOK:`
- All responses match TypeScript interfaces
- Production: Frontend deployed separately (Vercel/Netlify)

---

## 🔑 Core Development Principles

### 1. Production-Ready Architecture
- **Database over in-memory:** Persistent storage for all data
- **Queue over sync:** Background jobs for video processing
- **Cloud storage over local:** Scalable file storage
- **Monitoring over guessing:** Logging, metrics, error tracking
- **Security by default:** Authentication, authorization, input validation

### 2. Scalability First
- Design for horizontal scaling
- Stateless API design
- Efficient database queries
- Caching strategies
- Rate limiting per user

### 3. Cost Consciousness
- Monitor AI service costs
- Cache expensive operations
- Optimize API calls
- Consider alternatives when costs are high

### 4. Code Quality
- Type hints on all functions
- Comprehensive docstrings
- Unit and integration tests
- Clear error messages
- Structured logging

---

## 📁 File Structure

```
backend/
├── __init__.py
├── cli.py                     # CLI tool for testing
├── app/
│   ├── __init__.py
│   ├── main.py                # FastAPI app entry
│   ├── config.py              # Configuration management (Supabase keys)
│   ├── dependencies.py        # Dependency injection (Supabase client, auth)
│   ├── middleware/
│   │   ├── auth.py            # Supabase JWT verification middleware
│   │   ├── error_handler.py   # Error handling
│   │   └── rate_limit.py      # Rate limiting
│   ├── routers/
│   │   ├── auth.py            # Auth endpoints (optional, Supabase handles most)
│   │   ├── users.py           # User management
│   │   ├── videos.py          # Video endpoints
│   │   └── analytics.py        # Analytics endpoints
│   ├── services/
│   │   ├── auth_service.py    # Authentication logic
│   │   ├── video_service.py   # Video processing
│   │   ├── storage_service.py # Supabase Storage integration
│   │   └── ai/                # AI service abstraction
│   │       ├── base.py         # Abstract base classes
│   │       ├── twelvelabs_provider.py
│   │       ├── deepgram_provider.py
│   │       └── gemini_provider.py
│   ├── models/
│   │   ├── database.py        # Supabase table schemas (reference only)
│   │   └── schemas.py         # Pydantic schemas
│   ├── tasks/
│   │   └── video_processing.py # Celery tasks
│   └── utils/
│       ├── logging.py         # Logging setup
│       └── exceptions.py      # Custom exceptions
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
└── README.md
```

---

## 🔌 API Endpoints

### Authentication

**Note:** Supabase handles authentication on the frontend. Backend only verifies JWT tokens.

```
GET  /api/auth/me              # Get current user (JWT verification)
```

**Frontend uses Supabase SDK:**
- `supabase.auth.signUp()` - Registration
- `supabase.auth.signInWithPassword()` - Login
- `supabase.auth.signOut()` - Logout
- `supabase.auth.getSession()` - Get current session

### Users

```
GET    /api/users/me
PUT    /api/users/me
DELETE /api/users/me
GET    /api/users/me/videos
```

### Videos

```
POST   /api/videos/upload
GET    /api/videos
GET    /api/videos/{id}
GET    /api/videos/{id}/status
GET    /api/videos/{id}/results
DELETE /api/videos/{id}
GET    /api/videos/{id}/stream
```

### Analytics

```
GET /api/analytics/overview
GET /api/analytics/progress
```

---

## 🤖 AI Service Integration

### Service Abstraction Pattern

**Always use abstraction layer for AI services:**

```python
# backend/app/services/ai/base.py
from abc import ABC, abstractmethod

class VideoAnalysisProvider(ABC):
    """Abstract base class for video analysis providers."""

    @abstractmethod
    async def analyze_video(
        self,
        video_path: str,
        options: AnalysisOptions
    ) -> VideoAnalysis:
        """Analyze video and return structured results."""
        pass

class SpeechTranscriptionProvider(ABC):
    """Abstract base class for speech transcription."""

    @abstractmethod
    async def transcribe(
        self,
        audio_path: str
    ) -> Transcription:
        """Transcribe audio and return transcript with timestamps."""
        pass

class CoachingSynthesisProvider(ABC):
    """Abstract base class for coaching report generation."""

    @abstractmethod
    async def generate_coaching(
        self,
        analysis_data: AnalysisData
    ) -> CoachingReport:
        """Generate personalized coaching report."""
        pass
```

### Path 1: Optimize Current Stack (Recommended Initial Approach)

We start by **optimizing the existing TwelveLabs + Deepgram + Gemini stack** and make it production-ready:

1. **Temporal clustering & smoothing (TwelveLabs)**
   - After receiving raw events from TwelveLabs, run a temporal clustering step:
     - Group contiguous high-similarity frames into coherent clips.
     - Apply temporal smoothing to merge adjacent high-scoring segments and suppress isolated spikes.
   - Use this clustered representation as the source of:
     - Dissonance flags.
     - Timeline heatmap.
   - Goal: reduce irrelevant/isolated detections and improve perceived quality of flags.

2. **Confidence score filtering**
   - TwelveLabs returns similarity/confidence scores.
   - Apply configurable thresholds per query type (e.g., stricter for EMOTIONAL_MISMATCH).
   - Drop low-confidence events before clustering.
   - Expose thresholds via configuration so we can tune them without redeploying.

3. **Query optimization (Pegasus 1.2)**
   - Use Pegasus 1.2 model with **more specific semantic queries**, for example:
     - “nervous fidgeting near podium while speaking”
     - “presenter looking away from camera while talking”
   - Iterate on query set based on internal evaluation and user feedback.

4. **Cost optimization for AI calls**
   - Cache repeated analysis patterns (e.g., same video re-analyzed, similar video segments).
   - Memoize intermediate results when possible (e.g., transcription, segmentation).
   - Support batching of non-urgent jobs (e.g., practice library) in off-peak windows.
   - Instrument and track cost per analysis per provider.

5. **Service abstraction timeline**
   - Implement the service abstraction layer early (aligned with ROADMAP `AI-3.1`).
   - Launch with the current providers behind the abstraction.
   - Later A/B test alternative providers on 10–20% of traffic by swapping implementations.

### Implementation Example

```python
# backend/app/services/ai/twelvelabs_provider.py
from .base import VideoAnalysisProvider

class TwelveLabsProvider(VideoAnalysisProvider):
    def __init__(self, api_key: str):
        self.client = TwelveLabsClient(api_key)

    async def analyze_video(
        self,
        video_path: str,
        options: AnalysisOptions
    ) -> VideoAnalysis:
        # Implementation
        pass
```

### Service Selection

**Use configuration to select providers:**

```python
# backend/app/config.py
class AIConfig:
    video_analysis_provider: str = "twelvelabs"  # or "openai", "custom"
    speech_provider: str = "deepgram"  # or "whisper", "assemblyai"
    coaching_provider: str = "gemini"  # or "claude", "gpt4"
```

---

## 📊 Database Models

### Supabase Tables

**Note:** Tables are created in Supabase dashboard. Use Supabase client to query.

```sql
-- Videos table (created in Supabase dashboard)
CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  duration_seconds INTEGER,
  status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analyses table
CREATE TABLE analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  coherence_score INTEGER,
  score_tier TEXT,
  metrics JSONB,
  dissonance_flags JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
```

### Pydantic Schemas (for API responses)

```python
# backend/app/models/schemas.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class Video(BaseModel):
    id: str
    user_id: str
    storage_path: str
    duration_seconds: Optional[int]
    status: str
    created_at: datetime

class Analysis(BaseModel):
    id: str
    video_id: str
    coherence_score: int
    score_tier: str
    metrics: dict
    dissonance_flags: list
    created_at: datetime
```

---

## 🔐 Authentication & Authorization

### Supabase JWT Verification

**Supabase handles authentication on the frontend.** Backend only verifies JWT tokens.

```python
# backend/app/dependencies.py
from supabase import create_client, Client
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.config import settings

# Initialize Supabase client
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """
    Verify Supabase JWT token and return user.

    Args:
        credentials: HTTP Bearer token from request header

    Returns:
        User object from Supabase

    Raises:
        HTTPException: If token is invalid
    """
    try:
        # Supabase verifies JWT and returns user
        user = supabase.auth.get_user(credentials.credentials)
        return user.user
    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )
```

### Row Level Security (RLS)

**RLS policies are defined in Supabase SQL, not in Python code:**

```sql
-- Users can only view their own videos
CREATE POLICY "Users can view own videos"
ON videos FOR SELECT
USING (auth.uid() = user_id);

-- Users can only insert their own videos
CREATE POLICY "Users can insert own videos"
ON videos FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

**Benefits:**
- Security enforced at database level
- No need for manual access control checks in Python
- Works even if someone bypasses the API

---

## 📦 Background Jobs

### Celery Task Example

```python
# backend/app/tasks/video_processing.py
from celery import Celery
from app.services.video_service import VideoService
from app.services.ai import get_ai_providers

celery_app = Celery("coherence")

@celery_app.task(bind=True, max_retries=3)
def process_video(self, video_id: str):
    """Process video analysis in background."""
    try:
        video_service = VideoService()
        ai_providers = get_ai_providers()

        # Update status
        video_service.update_status(video_id, "processing")

        # Process video
        result = video_service.analyze_video(video_id, ai_providers)

        # Save results
        video_service.save_analysis(video_id, result)

        # Update status
        video_service.update_status(video_id, "complete")

    except Exception as exc:
        # Retry on failure
        raise self.retry(exc=exc, countdown=60)
```

---

## 🚨 Error Handling

### Custom Exceptions

```python
# backend/app/utils/exceptions.py
class CoherenceException(Exception):
    """Base exception for Coherence."""
    pass

class VideoNotFoundError(CoherenceException):
    """Video not found."""
    pass

class ProcessingError(CoherenceException):
    """Video processing failed."""
    pass

class AIServiceError(CoherenceException):
    """AI service call failed."""
    pass
```

### Error Handler Middleware

```python
# backend/app/middleware/error_handler.py
@app.exception_handler(CoherenceException)
async def coherence_exception_handler(
    request: Request,
    exc: CoherenceException
):
    return JSONResponse(
        status_code=400,
        content={
            "error": str(exc),
            "code": exc.__class__.__name__,
            "retryable": isinstance(exc, ProcessingError)
        }
    )
```

---

## 📝 Logging & Monitoring

### Structured Logging

```python
# backend/app/utils/logging.py
import logging
import json

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_data = {
            "timestamp": self.formatTime(record),
            "level": record.levelname,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
        }
        if hasattr(record, "user_id"):
            log_data["user_id"] = record.user_id
        if hasattr(record, "video_id"):
            log_data["video_id"] = record.video_id
        return json.dumps(log_data)

# Configure logger
logger = logging.getLogger("coherence")
handler = logging.StreamHandler()
handler.setFormatter(JSONFormatter())
logger.addHandler(handler)
```

### Monitoring Integration

- **Error Tracking:** Sentry
- **APM:** Datadog, New Relic, or similar
- **Metrics:** Prometheus + Grafana
- **Logs:** CloudWatch, Stackdriver, or similar

---

## ✅ Quality Standards

### Code Quality

- **Type hints:** All functions must have type hints
- **Docstrings:** Public APIs must have docstrings
- **Tests:** 80%+ code coverage for core logic
- **Linting:** Pass ruff/flake8 checks
- **Formatting:** Black code formatter

### API Quality

- **Response times:** <200ms for simple endpoints, <30s for processing
- **Error messages:** Clear, actionable, user-friendly
- **Documentation:** OpenAPI/Swagger docs up to date
- **Versioning:** API versioning strategy (v1, v2)

### Security

- **Authentication:** Required for all user endpoints
- **Authorization:** Check user owns resource
- **Input validation:** Validate all inputs
- **SQL injection:** Use ORM, never raw SQL
- **XSS:** Sanitize user inputs
- **CSRF:** CSRF tokens for state-changing operations

---

## 🎬 Development Workflow

### Local Development

1. **Set up environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # or: .\venv\Scripts\Activate.ps1 on Windows
   pip install -r requirements.txt
   ```

2. **Set up Supabase:**
   - Create project at [supabase.com](https://supabase.com/)
   - Copy project URL and anon key
   - Create tables via Supabase dashboard (see ROADMAP.md Day 1)
   - No migrations needed - Supabase handles schema changes

3. **Configure environment variables:**
   ```bash
   # .env file
   SUPABASE_URL=https://xxx.supabase.co
   SUPABASE_KEY=eyJxxx...  # Service role key for backend
   REDIS_URL=redis://localhost:6379  # or Upstash URL
   TWELVELABS_API_KEY=xxx
   DEEPGRAM_API_KEY=xxx
   GEMINI_API_KEY=xxx
   ```

4. **Run tests:**
   ```bash
   pytest
   ```

5. **Start development server:**
   ```bash
   uvicorn app.main:app --reload
   ```

6. **Start Celery worker (separate terminal):**
   ```bash
   celery -A app.tasks.celery_app worker --loglevel=info
   ```

### Code Review Checklist

- [ ] Type hints on all functions
- [ ] Docstrings for public APIs
- [ ] Tests added/updated
- [ ] Error handling implemented
- [ ] Logging added for important operations
- [ ] Supabase schema changes tested
- [ ] API documentation updated

---

## 🔗 Frontend Integration

### Integration Process

1. Frontend marks integration points with `// BACKEND_HOOK:`
2. Backend implements matching endpoints
3. Use Pydantic schemas matching TypeScript interfaces
4. Test with frontend team
5. Update API documentation

### Mock Data Strategy

**For development/testing:**
- Provide mock data generators
- Use fixtures in tests
- Support test mode in API

---

## 📝 Guidance Style

When assisting:
- **Be direct** - no long preambles
- **Show tradeoffs** - "This is faster but costs more"
- **Prioritize production** - "This improves reliability, do it"
- **Flag risks** - "This could fail at scale, add monitoring"
- **Suggest improvements** - "Consider caching this for performance"

**Success metric:** Production system handles 1000+ concurrent users reliably.

---

## 🎯 Acceptance Criteria

Backend is production-ready when:
- ✅ Supabase authentication integrated (JWT verification)
- ✅ Row Level Security (RLS) policies configured
- ✅ Supabase Storage for video files
- ✅ Background jobs process videos reliably (Celery + Redis)
- ✅ Error handling and logging comprehensive
- ✅ API is documented and versioned
- ✅ Tests cover critical paths (80%+ coverage)
- ✅ Monitoring and alerting configured (Sentry, Cloud Run metrics)
- ✅ Security best practices followed (RLS, input validation)

**Your mission:** Build a scalable, maintainable backend that enables confident presentations for millions of users.

---

## Non-Negotiable Design Principles

See AGENTS.md for detailed principles.

---

## Documentation Policy

Do **NOT** generate new documentation `.md` files after every task.
Only create documentation at **milestones** and **only when explicitly prompted**.
All documentation must be stored in 'documentation' folder

---

## "Role" mental models

Use these specializations as needed:

- architect-reviewer: sanity-check structure, boundaries, and long-term maintainability.
- backend-developer: API/data model/auth/server logic; validate error handling and contracts.
- frontend-developer: page composition, state management, UX, responsive behavior.
- fullstack-developer: end-to-end features spanning client and server.
- react-specialist: component architecture, hooks, memoization, React best practices.
- typescript-pro: types, generics, inference, avoiding unsafe casts.
- ui-designer: layout, spacing, typography, a11y, and shadcn-consistent UI.
- code-reviewer: PR-level feedback; keep suggestions actionable and prioritized.
- data-engineer: data pipelines, ETL/ELT processes, data infrastructure, streaming, data lake/warehouse design. Use when building analytics pipelines, optimizing video processing data flows, or designing scalable data architectures for user analytics.
- database-administrator: database performance optimization, high availability, backup/recovery, replication, query tuning. Use when optimizing Supabase PostgreSQL queries, setting up replication for high availability, configuring RLS policies, or troubleshooting database performance issues.
- llm-architect: LLM system design, fine-tuning strategies, RAG implementation, production serving, model optimization. Use when designing AI service abstraction layers, optimizing Gemini usage for coaching synthesis, implementing RAG for context-aware coaching, evaluating LLM alternatives, or optimizing token usage and costs.

---

## Finding library/API documentation

Always use context7 when I need code generation, setup or configuration steps, or
library/API documentation. This means you should automatically use the Context7 MCP
tools to resolve library id and get library docs without me having to explicitly ask.
