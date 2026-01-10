## Documentation Index

### Project Documentation

| File | Description | Last Updated |
|------|-------------|--------------|
| [ROADMAP.md](./ROADMAP.md) | Build plan, milestones, task tracking | Jan 10 2026 |
| [FIGMA_GUIDELINES.md](./FIGMA_GUIDELINES.md) | Frontend generation spec, TypeScript interfaces | - |

### Root Documentation

| File | Description |
|------|-------------|
| [../AGENTS.md](../AGENTS.md) | AI agent guidelines, development workflow |
| [../CLAUDE.md](../CLAUDE.md) | Backend development guidelines, API contracts |
| [../README.md](../README.md) | Project overview, quick start |
| [../QUICKSTART.md](../QUICKSTART.md) | Quick start guide for running frontend + backend |

### Backend Documentation

| File | Description |
|------|-------------|
| [../backend/README.md](../backend/README.md) | Backend setup, CLI tool for testing |

---

## Current Status

**Stage:** 1.5/6 complete (Foundation + Partial Integration)

### Completed

- ✅ Stage 0: Setup (frontend + backend infrastructure)
- ✅ Stage 1 (Partial): API endpoints, status polling, file upload
- ✅ Stage 3 (Partial): Frontend ↔ Backend wiring

### In Progress

- ⚒️ TwelveLabs integration into main pipeline
- ⚒️ Deepgram transcription
- ⚒️ Gemini synthesis for dissonance detection

### API Endpoints Implemented

| Endpoint | Method | Status |
|----------|--------|--------|
| `/api/videos/upload` | POST | ✅ Connected |
| `/api/videos/{id}/status` | GET | ✅ Connected |
| `/api/videos/{id}/results` | GET | ✅ Connected |
| `/api/videos/samples/{id}` | GET | ✅ Connected |
| `/api/videos/{id}/stream` | GET | ✅ Connected |

### Key Files

**Backend:**
- `backend/app/main.py` - FastAPI entry point
- `backend/app/routers/videos.py` - Video API endpoints
- `backend/app/services/video_service.py` - Processing logic
- `backend/app/models/schemas.py` - Pydantic schemas

**Frontend:**
- `frontend/types/index.ts` - TypeScript interfaces
- `frontend/lib/services/videoAnalysis.ts` - API service layer
- `frontend/lib/config.ts` - API configuration
