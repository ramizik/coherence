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
- **Database:** PostgreSQL (recommended) or MongoDB
- **Queue:** Celery + Redis or RQ for background jobs
- **Storage:** Cloud storage (S3/GCS/Azure Blob) for videos
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
├── alembic/                   # Database migrations
│   ├── versions/
│   └── env.py
├── app/
│   ├── __init__.py
│   ├── main.py                # FastAPI app entry
│   ├── config.py              # Configuration management
│   ├── dependencies.py        # Dependency injection
│   ├── middleware/
│   │   ├── auth.py            # Authentication middleware
│   │   ├── error_handler.py   # Error handling
│   │   └── rate_limit.py      # Rate limiting
│   ├── routers/
│   │   ├── auth.py            # Authentication endpoints
│   │   ├── users.py           # User management
│   │   ├── videos.py          # Video endpoints
│   │   └── analytics.py        # Analytics endpoints
│   ├── services/
│   │   ├── auth_service.py    # Authentication logic
│   │   ├── video_service.py   # Video processing
│   │   ├── storage_service.py # Cloud storage
│   │   └── ai/                # AI service abstraction
│   │       ├── base.py         # Abstract base classes
│   │       ├── twelvelabs_provider.py
│   │       ├── deepgram_provider.py
│   │       └── gemini_provider.py
│   ├── models/
│   │   ├── database.py        # SQLAlchemy models
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

```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
GET  /api/auth/me
```

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

### Core Models

```python
# backend/app/models/database.py
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    created_at = Column(DateTime)

    videos = relationship("Video", back_populates="user")

class Video(Base):
    __tablename__ = "videos"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"))
    storage_path = Column(String)
    duration_seconds = Column(Integer)
    status = Column(String)  # queued, processing, complete, error
    created_at = Column(DateTime)

    user = relationship("User", back_populates="videos")
    analysis = relationship("Analysis", back_populates="video", uselist=False)

class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(String, primary_key=True)
    video_id = Column(String, ForeignKey("videos.id"))
    coherence_score = Column(Integer)
    score_tier = Column(String)
    created_at = Column(DateTime)

    video = relationship("Video", back_populates="analysis")
    metrics = relationship("AnalysisMetrics", back_populates="analysis")
    flags = relationship("DissonanceFlag", back_populates="analysis")
```

---

## 🔐 Authentication & Authorization

### JWT-Based Authentication

```python
# backend/app/services/auth_service.py
from jose import JWTError, jwt
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
```

### Authorization Middleware

```python
# backend/app/middleware/auth.py
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials"
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user
```

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
   source venv/bin/activate
   pip install -r requirements.txt
   ```

2. **Set up database:**
   ```bash
   alembic upgrade head
   ```

3. **Run migrations:**
   ```bash
   alembic revision --autogenerate -m "description"
   alembic upgrade head
   ```

4. **Run tests:**
   ```bash
   pytest
   ```

5. **Start development server:**
   ```bash
   uvicorn app.main:app --reload
   ```

### Code Review Checklist

- [ ] Type hints on all functions
- [ ] Docstrings for public APIs
- [ ] Tests added/updated
- [ ] Error handling implemented
- [ ] Logging added for important operations
- [ ] Database migrations tested
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
- ✅ Authentication and authorization implemented
- ✅ Database persistence for all data
- ✅ Background jobs process videos reliably
- ✅ Error handling and logging comprehensive
- ✅ API is documented and versioned
- ✅ Tests cover critical paths (80%+ coverage)
- ✅ Monitoring and alerting configured
- ✅ Security best practices followed

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

---

## Finding library/API documentation

Always use context7 when I need code generation, setup or configuration steps, or
library/API documentation. This means you should automatically use the Context7 MCP
tools to resolve library id and get library docs without me having to explicitly ask.
