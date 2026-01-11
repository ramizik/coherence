# 🗺️ ROADMAP.md - Coherence 24-Hour Build Plan

**Last Updated:** Jan 11 2026 02:00AM
**Current Stage:** `STAGE_4_COMPLETE` ← Full analysis pipeline implemented, all AI services integrated

---

## 📊 Progress Tracker

```
[████████████████████████████████████████] 100% STAGE 0: Setup (COMPLETE)
[████████████████████████████████████████] 100% STAGE 1: Foundation (COMPLETE)
[████████████████████████████████████████] 100% STAGE 2: Core Analysis (COMPLETE)
[████████████████████████████████████████] 100% STAGE 3: Integration (COMPLETE)
[████████████████████████████████████████] 100% STAGE 4: Dashboard (COMPLETE)
[░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]   0% STAGE 5: Demo Prep
[░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]   0% STAGE 6: Polish
```

**Overall Progress:** 4/6 stages complete

---

## ⏰ Timeline Overview

| Stage                      | Duration | Start | End | Status                       |
| -------------------------- | -------- | ----- | --- | ---------------------------- |
| **Stage 0: Setup**         | 2h       | H-2   | H0  | ✅ COMPLETE                  |
| **Stage 1: Foundation**    | 6h       | H0    | H6  | ✅ COMPLETE                  |
| **Stage 2: Core Analysis** | 6h       | H6    | H12 | ✅ COMPLETE                  |
| **Stage 3: Integration**   | 4h       | H12   | H16 | ✅ COMPLETE                  |
| **Stage 4: Dashboard**     | 4h       | H16   | H20 | ✅ COMPLETE                  |
| **Stage 5: Demo Prep**     | 3h       | H20   | H23 | ⏳ NOT_STARTED               |
| **Stage 6: Polish**        | 1h       | H23   | H24 | ⏳ NOT_STARTED               |

---

## 🎯 STAGE 0: Pre-Hackathon Setup (H-2 to H0) ✅ COMPLETE

**Duration:** 2 hours
**Goal:** Infrastructure ready before hackathon starts
**Status:** ✅ COMPLETE

### Backend Tasks

- [x] **BK-0.1** Create GitHub repository with `.gitignore`
- [x] **BK-0.2** Initialize FastAPI project structure
- [x] **BK-0.3** Set up virtual environment + `requirements.txt`
- [x] **BK-0.4** Test local FastAPI server runs correctly
- [x] **BK-0.5** Test TwelveLabs API key (index dummy video) - Client initialized
- [ ] **BK-0.6** Test Deepgram API key (transcribe 10s audio) - Pending
- [ ] **BK-0.7** Test Gemini API key (simple text prompt) - Pending
- [ ] **BK-0.8** Install FFmpeg on local machine + verify - Pending

### Frontend Tasks

- [x] **FE-0.1** Initialize Vite + React 18 project with TypeScript
- [x] **FE-0.2** Configure TailwindCSS v4 + glassmorphism theme
- [x] **FE-0.3** Test local Vite dev server runs correctly (port 3000)
- [x] **FE-0.4** Install shadcn/ui + Lucide React icons
- [x] **FE-0.5** Create basic routing structure (`/upload`, `/processing`, `/results`)
- [x] **FE-0.6** Test API connection to backend health endpoint (port 8000)

### Shared Tasks

- [x] **SH-0.1** Create shared TypeScript interface definitions
- [ ] **SH-0.2** Set up team communication (Slack/Discord channel)
- [ ] **SH-0.3** Agree on Git workflow (branch naming, PR process)
- [ ] **SH-0.4** Create project board (GitHub Projects or Trello)

### Success Criteria

✅ Both frontend and backend run locally
✅ TwelveLabs API key verified working
✅ "Hello World" renders on both ends

---

## 🏗️ STAGE 1: Foundation (H0 to H6)

**Duration:** 6 hours
**Goal:** Upload video → Get transcript back
**Status:** ✅ COMPLETE

### Pipeline Overview

```
Upload Video → [Track A: Deepgram] → Transcript + Metrics
            → [Track B: TwelveLabs] → Visual Analysis (parallel)
            → [Track C: FFmpeg] → Slide Extraction (parallel)
```

### Backend Tasks (Backend Dev 1 - Upload + Deepgram)

- [x] **BK-1.1** `POST /api/videos/upload` endpoint ✅ COMPLETE

  - Accept multipart file upload (FormData)
  - Validate: MP4/MOV/WebM, max 500MB
  - Save to `backend/data/videos/{uuid}.mp4`
  - Create status in cache: `{ status: "queued", progress: 0, stage: "Uploading..." }`
  - Trigger async background task (non-blocking)
  - Return: `{ videoId, status, estimatedTime, durationSeconds }`
  - **Files:** `backend/app/routers/videos.py`, `backend/app/services/video_service.py`

- [x] **BK-1.2** Deepgram integration (Track A) ✅ COMPLETE

  - Async transcription via `deepgram_service.transcribe_video()`
  - Word-level timestamps with confidence scores
  - Filler word detection (um, uh, like, you know)
  - Speaking pace (WPM) calculation
  - **Files:** `backend/deepgram/`, `backend/app/services/deepgram_service.py`

- [x] **BK-1.3** `GET /api/videos/{id}/status` endpoint ✅ COMPLETE

  - Return: `{ videoId, status, progress, stage, etaSeconds }`
  - Status values: `queued | processing | complete | error`
  - Stage messages for UX: "Transcribing speech...", "Analyzing video...", etc.
  - **Files:** `backend/app/routers/videos.py`

- [x] **BK-1.4** Calculate speech metrics from Deepgram ✅ COMPLETE
  - Filler word count from transcription
  - Speaking pace: `total_words / duration_minutes`
  - Metrics extracted via `extract_metrics_from_transcription()`
  - Stored in `_analysis_cache[videoId]["deepgram_data"]`
  - **Files:** `backend/app/services/deepgram_service.py`

### Backend Tasks (Backend Dev 2 - TwelveLabs + FFmpeg)

- [x] **BK-1.5** TwelveLabs video indexing (Track B) ✅ COMPLETE

  - Upload video to TwelveLabs Indexing API
  - Poll/wait for indexing completion (~20-40s for 2-min video)
  - Runs in parallel with Deepgram via `asyncio.gather()`
  - **Files:** `backend/twelvelabs/`, `backend/app/services/twelvelabs_service.py`

- [ ] **BK-1.6** FFmpeg slide extraction (Track C) - NOT IMPLEMENTED (Cut for hackathon)

  - Scene change detection: `ffmpeg -vf "select=gt(scene,0.3)" ...`
  - **Decision:** Cut from scope - Gemini handles slide analysis directly

- [x] **BK-1.7** In-memory cache implementation ✅ COMPLETE

  ```python
  # backend/app/services/video_service.py
  _video_storage: Dict[str, dict] = {}           # Video metadata
  _status_storage: Dict[str, StatusResponse] = {}  # Processing status
  _results_storage: Dict[str, AnalysisResult] = {} # Analysis results
  _analysis_cache: Dict[str, Dict] = {}           # Raw analysis for Gemini
  ```

  - Thread-safe via asyncio
  - **Files:** `backend/app/services/video_service.py`

- [x] **BK-1.8** Background task orchestration ✅ COMPLETE
  - `asyncio.create_task()` for non-blocking processing
  - Parallel processing: Deepgram + TwelveLabs via `asyncio.gather()`
  - Status updates during processing
  - **Files:** `backend/app/services/video_service.py` → `_process_video()`

### Frontend Tasks (Frontend Dev)

- [x] **FE-1.1** Upload page component ✅ COMPLETE

  - Drag-and-drop zone with visual feedback
  - File validation (client-side): MP4/MOV/WebM, max 500MB
  - Progress states during upload
  - **Files:** `frontend/components/upload/UploadPage.tsx`, `frontend/components/upload/UploadZone.tsx`

- [x] **FE-1.2** Processing page component ✅ COMPLETE

  - Status polling (every 3s) via real API
  - Animated loading indicators
  - Real status messages from backend
  - **Files:** `frontend/components/upload/ProcessingView.tsx`

- [x] **FE-1.3** Mock data generators ✅ COMPLETE

  - Created `frontend/lib/mock-data.ts`
  - `mockAnalysisResult` with realistic data
  - `mockStatusSequence` for status progression
  - **Files:** `frontend/lib/mock-data.ts`

- [x] **FE-1.4** API service layer ✅ COMPLETE
  - `frontend/lib/services/videoAnalysis.ts`
  - Functions: `uploadVideo()`, `pollStatus()`, `fetchResults()`, `loadSampleVideo()`
  - All `// BACKEND_HOOK:` comments updated to CONNECTED ✅
  - **Files:** `frontend/lib/services/videoAnalysis.ts`, `frontend/lib/config.ts`

### Testing Checkpoints

- [x] **TEST-1.1** Upload 1-minute video → See transcript in backend logs ✅
- [x] **TEST-1.2** Frontend can upload → Backend receives file ✅
- [x] **TEST-1.3** Status polling works (progression 0→100%) ✅

### Stage 1 Success Criteria

✅ Can upload video via frontend
✅ Backend transcribes audio with Deepgram
✅ TwelveLabs indexes video in parallel
✅ Status endpoint returns real progress
✅ Filler words counted correctly

**Milestone:** Upload flow + parallel analysis pipeline complete

### Implementation Notes

**API Endpoints (All Implemented):**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/videos/upload` | POST | Upload video, triggers async processing |
| `/api/videos/{id}/status` | GET | Poll status (0-100%, stages) |
| `/api/videos/{id}/results` | GET | Complete analysis with Gemini report |
| `/api/videos/{id}/stream` | GET | Stream video for playback |
| `/api/videos/samples/{id}` | GET | Pre-cached sample info |

**Backend Service Files:**

- `backend/app/services/video_service.py` - Processing orchestration, parallel AI calls
- `backend/app/services/deepgram_service.py` - Async Deepgram wrapper
- `backend/app/services/twelvelabs_service.py` - Async TwelveLabs wrapper
- `backend/app/services/gemini_service.py` - Natural language coaching generation

**AI Module Files:**

- `backend/deepgram/transcription.py` - Audio transcription with filler detection
- `backend/twelvelabs/` - Video indexing and semantic analysis
- `backend/gemini/synthesis.py` - Dissonance detection and scoring

**Frontend Files:**

- `frontend/lib/api.ts` - API service layer with error handling
- `frontend/types/api.ts` - TypeScript interfaces matching Pydantic
- `frontend/components/results/*.tsx` - Dashboard components

---

## 🧠 STAGE 2: Core Analysis (H6 to H12) ✅ COMPLETE

**Duration:** 6 hours
**Goal:** Full analysis pipeline → Detect dissonance
**Status:** ✅ COMPLETE

### Pipeline Stage 2: Gemini Synthesis

```
[Deepgram Data] + [TwelveLabs Data] → Gemini → Coaching Report
                                   → Coherence Score
                                   → Dissonance Flags
```

### Backend Tasks (Backend Dev 1 - Gemini + Scoring)

- [x] **BK-2.1** Gemini multimodal synthesis ✅ COMPLETE

  - Takes Deepgram + TwelveLabs data from `_analysis_cache`
  - Generates natural language coaching advice
  - Returns `GeminiReport` with headline + coachingAdvice
  - **Files:** `backend/app/services/gemini_service.py`, `backend/gemini/synthesis.py`

- [x] **BK-2.2** Coherence score calculation ✅ COMPLETE

  ```python
  # In backend/app/services/twelvelabs_service.py
  def calculate_coherence_score(metrics, flags):
      eye_score = (metrics["eye_contact_percentage"] / 100) * 30
      filler_score = max(0, (20 - metrics["filler_word_count"]) / 20) * 25
      fidget_score = max(0, (15 - metrics["fidgeting_count"]) / 15) * 20
      pace_score = 15 if 140 <= metrics["speaking_pace_wpm"] <= 160 else 10
      # Deduct for flags: -10 per HIGH, -5 per MEDIUM
      return max(0, min(100, base_score - penalty))
  ```

  - Score tiers: 0-50 "Needs Work", 51-75 "Good Start", 76-100 "Strong"
  - **Files:** `backend/app/services/twelvelabs_service.py`

- [x] **BK-2.3** `GET /api/videos/{id}/results` endpoint ✅ COMPLETE

  - Returns complete `AnalysisResult` matching TypeScript interface
  - Includes: coherenceScore, scoreTier, metrics, dissonanceFlags, timelineHeatmap
  - Includes video URL: `/api/videos/{videoId}/stream`
  - Includes transcript segments from Deepgram
  - Includes `geminiReport` with coaching advice
  - **Files:** `backend/app/routers/videos.py`

- [x] **BK-2.4** Coaching feedback generation ✅ COMPLETE
  - Gemini generates natural, conversational advice
  - `_build_coaching_prompt()` creates structured input
  - `_generate_natural_coaching()` returns human-like feedback
  - `_generate_headline()` creates short summary
  - **Files:** `backend/app/services/gemini_service.py`

### Backend Tasks (Backend Dev 2 - TwelveLabs + Dissonance)

- [x] **BK-2.5** TwelveLabs semantic analysis ✅ COMPLETE

  - Uses TwelveLabs Analyze API with structured JSON schema
  - Detects: eye contact, fidgeting, gestures, speaking pace
  - Returns dissonance flags with timestamps and coaching
  - **Files:** `backend/app/services/twelvelabs_service.py` → `analyze_presentation()`

- [x] **BK-2.6** Dissonance detection logic ✅ COMPLETE
  - **EMOTIONAL_MISMATCH:** TwelveLabs detects when speech sentiment contradicts expression
  - **MISSING_GESTURE:** Detects deictic phrases without corresponding gestures
  - **PACING_MISMATCH:** Detects speaking pace issues
  - All processed via TwelveLabs structured analysis prompt
  - **Files:** `backend/app/services/twelvelabs_service.py`

### Frontend Tasks (Frontend Dev)

- [x] **FE-2.1** Results page shell ✅ COMPLETE

  - Grid layout with video player (left) and coaching cards (right)
  - Timeline below video
  - **Files:** `frontend/components/results/ResultsPage.tsx`

- [x] **FE-2.2** Score badge component ✅ COMPLETE

  - Circular progress indicator with score
  - Color-coded by score tier
  - **Files:** `frontend/components/results/ScoreBadge.tsx`

- [x] **FE-2.3** Metrics row component ✅ COMPLETE

  - 4-card grid: Eye Contact, Filler Words, Speaking Pace, Fidgeting
  - Color-coded indicators
  - **Files:** `frontend/components/results/CompactMetrics.tsx`

- [x] **FE-2.4** Wire results page to API ✅ COMPLETE
  - `fetchResults(videoId)` loads analysis
  - Mock data fallback for reliability
  - Loading/error states handled
  - **Files:** `frontend/lib/api.ts`, `frontend/components/results/ResultsPage.tsx`

### Testing Checkpoints

- [x] **TEST-2.1** Upload video → Receive full analysis results ✅
- [x] **TEST-2.2** Dissonance flags generated correctly ✅
- [x] **TEST-2.3** Coherence score calculated correctly ✅
- [x] **TEST-2.4** Frontend displays results without errors ✅

### Stage 2 Success Criteria

✅ TwelveLabs semantic analysis returns dissonance flags
✅ Gemini generates natural coaching advice
✅ Coherence score calculated (0-100)
✅ Dissonance flags include coaching text
✅ Results page renders with real data

**Milestone:** Full analysis pipeline functional

---

## 🔗 STAGE 3: Integration (H12 to H16) ✅ COMPLETE

**Duration:** 4 hours
**Goal:** Frontend ↔ Backend wired, end-to-end flow
**Status:** ✅ COMPLETE

### Backend Tasks (Both Devs)

- [x] **BK-3.1** CORS configuration ✅ COMPLETE

  - Allows `http://localhost:3000` and `http://127.0.0.1:3000`
  - All methods/headers allowed
  - **Files:** `backend/app/main.py`

- [x] **BK-3.2** Error handling standardization ✅ COMPLETE

  - `ApiError` schema: `{ error, code, retryable }`
  - HTTP status codes: 400, 404, 413, 425
  - User-friendly messages
  - **Files:** `backend/app/models/schemas.py`, `backend/app/routers/videos.py`

- [x] **BK-3.3** Logging implementation ✅ COMPLETE

  - Structured logging with module-level loggers
  - Service availability logged on startup
  - Processing stages logged during analysis
  - **Files:** `backend/app/main.py`, `backend/app/services/video_service.py`

- [x] **BK-3.4** Integration testing ✅ COMPLETE
  - All endpoints functional with real AI services
  - Parallel processing works correctly
  - **Files:** All service files tested via API

### Frontend Tasks (Frontend Dev)

- [x] **FE-3.1** Replace mock data with API calls ✅ COMPLETE

  - `UploadPage.tsx` uses `uploadVideo()`
  - `ProcessingView.tsx` uses `pollStatus()`
  - `SampleVideos.tsx` uses `loadSampleVideo()`
  - Mock data kept for fallback
  - **Files:** `frontend/components/upload/*.tsx`, `frontend/lib/api.ts`

- [x] **FE-3.2** Error handling UI ✅ COMPLETE

  - `VideoAnalysisError` class for typed errors
  - Error banners with retry buttons
  - **Files:** `frontend/lib/api.ts`, `frontend/components/results/ResultsPage.tsx`

- [x] **FE-3.3** Loading states ✅ COMPLETE

  - Spinner while loading results
  - Progress bar synced to real API status
  - **Files:** `frontend/components/upload/*.tsx`, `frontend/components/results/ResultsPage.tsx`

- [x] **FE-3.4** Results page integration ✅ COMPLETE
  - ResultsPage component with backend integration
  - All components receive real data from API
  - Mock data fallback for demo reliability
  - **Files:** `frontend/components/results/*.tsx`

### Testing Checkpoints

- [x] **TEST-3.1** Upload real video → See analysis in ~45-60s ✅
- [x] **TEST-3.2** Error scenarios handled gracefully ✅
- [x] **TEST-3.3** Local file upload works correctly ✅
- [x] **TEST-3.4** All TypeScript interfaces match backend responses ✅

### Stage 3 Success Criteria

✅ Frontend fully wired to backend APIs
✅ Upload → Processing → Results flow works end-to-end
✅ Error messages display correctly with retry capability
✅ Results page displays real analysis with all components
✅ Processing completes in ~45-60 seconds
✅ Mock data fallback ensures demo reliability

**Milestone:** Frontend-backend integration complete

---

## 🎨 STAGE 4: Dashboard Polish (H16 to H20) ✅ COMPLETE

**Duration:** 4 hours
**Goal:** Beautiful, interactive results dashboard
**Status:** ✅ COMPLETE

### Frontend Tasks (Frontend Dev - Priority)

- [x] **FE-4.1** Video player component ✅ COMPLETE

  - HTML5 video element with custom controls
  - Play/pause, seek, volume, fullscreen
  - Sync with timeline clicks via `currentTime` prop
  - **Files:** `frontend/components/results/VideoPlayer.tsx`

- [x] **FE-4.2** Dissonance timeline component ✅ COMPLETE

  - Interactive timeline with severity markers
  - Color-coded flags (red/amber/green)
  - Clickable to seek video via `onSeek` callback
  - Current time indicator
  - **Files:** `frontend/components/results/DissonanceTimeline.tsx`

- [x] **FE-4.3** Coaching card component ✅ COMPLETE

  - Glassmorphic styling with severity borders
  - Dismissible with smooth animations
  - "Jump to Moment" button
  - **Files:** `frontend/components/results/CoachingCard.tsx`

- [x] **FE-4.4** Score badge and metrics components ✅ COMPLETE
  - ScoreBadge with circular progress indicator
  - CompactMetrics bar (Eye Contact, Filler Words, Pace, Fidgeting)
  - Color-coded based on thresholds
  - **Files:** `frontend/components/results/ScoreBadge.tsx`, `frontend/components/results/CompactMetrics.tsx`

- [x] **FE-4.5** Additional components ✅ COMPLETE
  - TranscriptPanel - Scrolling transcript with filler word highlighting
  - GeminiSummaryCard - AI coaching advice display
  - **Files:** `frontend/components/results/TranscriptPanel.tsx`, `frontend/components/results/GeminiSummaryCard.tsx`

### Backend Tasks (Backend Dev 2 - Support)

- [x] **BK-4.1** Video serving endpoint ✅ COMPLETE

  - `GET /api/videos/{videoId}/stream`
  - Streams video file with proper media type
  - **Files:** `backend/app/routers/videos.py`

- [ ] **BK-4.2** Thumbnail generation - NOT IMPLEMENTED (Cut for hackathon)

- [ ] **BK-4.3** Slide image serving - NOT IMPLEMENTED (Cut for hackathon)

### Backend Tasks (Backend Dev 1 - Support)

- [x] **BK-4.4** Performance optimization ✅ COMPLETE
  - Parallel Deepgram + TwelveLabs via `asyncio.gather()`
  - Results cached in `_analysis_cache` for Gemini
  - Processing time ~45-60s for 2-minute video
  - **Files:** `backend/app/services/video_service.py`

### Testing Checkpoints

- [x] **TEST-4.1** Timeline click seeks video correctly ✅
- [x] **TEST-4.2** All dissonance flags visible in UI ✅
- [x] **TEST-4.3** Dashboard looks polished ✅
- [x] **TEST-4.4** Video playback smooth ✅

### Stage 4 Success Criteria

✅ Interactive timeline functional
✅ Video player synced to timeline
✅ Coaching cards styled beautifully
✅ Score badge and metrics display correctly
✅ Dashboard displays real analysis data
✅ Transcript panel shows speech with filler highlighting
✅ Gemini coaching summary displays

**Milestone:** Dashboard complete with all components

---

## 🎬 STAGE 5: Demo Preparation (H20 to H23)

**Duration:** 3 hours
**Goal:** Demo-ready with backups and rehearsals
**Status:** ⏳ NOT_STARTED

### Content Creation (All Team)

- [ ] **DEMO-5.1** Record 3 sample videos

  - Sample A: Nervous presenter (score ~42)
  - Sample B: Confident presenter (score ~89)
  - Sample C: Dissonant presenter (score ~67)
  - **Est:** 1h

- [ ] **DEMO-5.2** Pre-index all samples in TwelveLabs

  - Run full analysis pipeline
  - Cache results in memory
  - Verify instant loading (<2s)
  - **Est:** 0.5h

- [ ] **DEMO-5.3** Create pitch deck
  - 8-10 slides max
  - Problem → Solution → Demo → Market
  - **Est:** 1h

### Backend Tasks (Both Devs)

- [ ] **BK-5.1** Offline mode implementation

  - Serve cached results if API fails
  - Graceful degradation
  - **Est:** 1h

- [ ] **BK-5.2** Demo data seeding
  - Load 3 sample results on startup
  - `GET /api/videos/sample-a/results` (instant)
  - **Est:** 0.5h

### Frontend Tasks (Frontend Dev)

- [ ] **FE-5.1** Demo mode toggle
  - Show cached samples by default
  - Quick access buttons
  - **Est:** 0.5h

### Rehearsal Tasks (All Team)

- [ ] **DEMO-5.4** Rehearsal #1 (full 3-minute pitch)
- [ ] **DEMO-5.5** Rehearsal #2 (timing refinement)
- [ ] **DEMO-5.6** Rehearsal #3 (backup scenario)
- [ ] **DEMO-5.7** Rehearsal #4 (final run)

### Testing Checkpoints

- [ ] **TEST-5.1** Sample videos load in <2 seconds
- [ ] **TEST-5.2** Offline mode works (disconnect WiFi)
- [ ] **TEST-5.3** Local file upload works smoothly
- [ ] **TEST-5.4** Can complete demo in <3 minutes
- [ ] **TEST-5.5** Backup plan tested (Sample C fallback)

### Stage 5 Success Criteria

✅ 3 sample videos cached and instant-loading
✅ Pitch deck finalized
✅ Rehearsed 4+ times successfully
✅ Offline mode functional
✅ Local upload works smoothly
✅ Team knows who says what

**Milestone:** Demo rehearsed and stable

---

## ✨ STAGE 6: Polish & Finalize (H23 to H24)

**Duration:** 1 hour
**Goal:** Final checks and local testing
**Status:** ⏳ NOT_STARTED

### Frontend Tasks (Frontend Dev)

- [ ] **FE-6.1** Final UI polish

  - Fix any visual bugs
  - Check all animations
  - Spell check all text
  - **Est:** 0.5h

- [ ] **FE-6.2** Production build verification
  - `npm run build` (verify no errors)
  - Test production build locally
  - **Est:** 0.5h

### Backend Tasks (Backend Dev 1)

- [ ] **BK-6.1** Final testing and verification

  - Test all endpoints locally
  - Verify environment variables set correctly
  - Test health endpoint
  - **Est:** 0.5h

- [ ] **BK-6.2** Logging and error handling review
  - Verify logs accessible
  - Test error tracking
  - **Est:** 0.5h

### Shared Tasks (All Team)

- [ ] **SH-6.1** Final end-to-end test

  - Upload via local frontend
  - Verify analysis completes
  - Check all links work
  - **Est:** 0.5h

- [ ] **SH-6.2** Demo day checklist
  - [ ] Local environment configured
  - [ ] Pitch deck loaded
  - [ ] Demo videos pre-loaded
  - [ ] API keys verified active
  - [ ] Team roles assigned
  - **Est:** 0.5h

### Testing Checkpoints

- [ ] **TEST-6.1** Local frontend loads correctly
- [ ] **TEST-6.2** Local backend responds
- [ ] **TEST-6.3** Full flow works locally
- [ ] **TEST-6.4** Demo runs smoothly on main machine

### Stage 6 Success Criteria

✅ Local environment fully functional
✅ All demos tested locally
✅ Backup plan in place
✅ Team rested and ready
✅ Demo day checklist complete

**Milestone:** SHIP IT! 🚀

---

## 🚨 Risk Mitigation Checklist

### Pre-Demo Night (H22)

- [ ] **RISK-1** Pre-index all 3 sample videos
- [ ] **RISK-2** Cache results in memory (instant load)
- [ ] **RISK-3** Test offline mode (disconnect WiFi)
- [ ] **RISK-4** Backup laptop with identical local setup
- [ ] **RISK-5** Verify local environment works offline

### Demo Day Morning

- [ ] **RISK-6** Load local dashboard before going on stage
- [ ] **RISK-7** Verify all API keys active
- [ ] **RISK-8** Test local file upload works
- [ ] **RISK-9** Rehearse 1 final time
- [ ] **RISK-10** Confirm team knows fallback plan

### Fallback Plan (If Processing Fails)

```
IF processing_timeout OR api_failure:
  SAY: "Let me show you a prepared example instead"
  LOAD: /results/sample-c (cached, instant)
  CONTINUE: with demo flow using Sample C
  TIME_LOST: <5 seconds
```

---

## 📊 Team Assignments

### Backend Dev 1 (Speech + Orchestration)

- Primary: Deepgram integration, API endpoints, coherence scoring
- Support: Error handling, logging, local setup
- Demo: Explain technical architecture (30s)

### Backend Dev 2 (Vision + Synthesis)

- Primary: TwelveLabs queries, Gemini synthesis, dissonance detection
- Support: Video processing, slide extraction, caching
- Demo: Explain dissonance detection (30s)

### Frontend Dev (UI/UX)

- Primary: All frontend components, dashboard, upload flow
- Support: API integration, local file handling, responsive design
- Demo: Run live demo, narrate user journey (90s)

### All Team

- Code reviews (pair review all PRs)
- Integration testing
- Demo rehearsals
- Pitch deck refinement

---

## 📈 Success Metrics

### Technical Goals

- [ ] Processing time: <60 seconds per video
- [ ] Sample videos load: <2 seconds
- [ ] TwelveLabs queries: 10-15 per video
- [ ] Coherence score accuracy: Manual validation passes
- [ ] Uptime during demo: 100%

### Demo Goals

- [ ] Pitch duration: 2:30-3:00 minutes
- [ ] Local upload & analysis works smoothly
- [ ] Rehearsals: 4+ successful runs
- [ ] Backup activations: 0 (but ready if needed)
- [ ] Team confidence: 10/10

---

## 🎯 Current Focus (Update This!)

**Active Stage:** `STAGE_5_DEMO_PREP` - Core implementation complete, preparing for demo
**Current Tasks:**

- [ ] Index 3 sample videos in TwelveLabs
- [ ] Cache analysis results for instant demo loading
- [ ] Create pitch deck (8-10 slides)
- [ ] Rehearse demo flow 4+ times

**✅ Completed (Stages 0-4):**

- ✅ FastAPI app with CORS and video router
- ✅ All API endpoints: upload, status, results, stream, samples
- ✅ Pydantic schemas with camelCase output
- ✅ In-memory caching for videos, status, results, and analysis
- ✅ Parallel processing: Deepgram + TwelveLabs via asyncio.gather()
- ✅ TwelveLabs integration (indexing + semantic analysis)
- ✅ Deepgram integration (transcription + filler words + WPM)
- ✅ Gemini integration (natural language coaching reports)
- ✅ Coherence score calculation with weighted algorithm
- ✅ Transcript extraction with word-level timestamps
- ✅ Frontend API service layer with error handling
- ✅ Results page with all components:
  - VideoPlayer (custom controls, timeline sync)
  - ScoreBadge (circular progress)
  - CompactMetrics (4-card grid)
  - CoachingCard (dismissible, jump to moment)
  - DissonanceTimeline (interactive, color-coded)
  - TranscriptPanel (filler word highlighting)
  - GeminiSummaryCard (AI coaching advice)
- ✅ Mock data fallback for demo reliability
- ✅ Upload → Processing → Results flow end-to-end

**Blockers:** None
**Next Checkpoint:** DEMO-5.1 (Record sample videos)

---

## 📝 Notes & Decisions

### Architecture Decisions

- **AD-001:** Using in-memory cache (no MongoDB) for speed
- **AD-002:** FFmpeg for video processing (not cloud service)
- **AD-003:** Desktop-first design (mobile nice-to-have)
- **AD-004:** Parallel processing tracks (Deepgram + TwelveLabs + FFmpeg run simultaneously)
- **AD-005:** Gemini as synthesis layer (combines all data for dissonance detection)
- **AD-006:** Max video duration 5 minutes (longer = slower indexing, demo risk)

### API Contract

- **API-001:** Upload returns `{ videoId, status, estimatedTime, durationSeconds }`
- **API-002:** Status includes `stage` field for UX messages
- **API-003:** Results include `scoreTier` and `timelineHeatmap` for dashboard
- **API-004:** Supported formats: MP4, MOV, WebM (max 500MB)

### Processing Pipeline

- **PP-001:** Track A (Deepgram): ~5-10 seconds for 2-min video
- **PP-002:** Track B (TwelveLabs): ~20-40 seconds for indexing + queries
- **PP-003:** Track C (FFmpeg): ~2-5 seconds for slide extraction
- **PP-004:** Gemini synthesis: ~10-20 seconds for multimodal analysis
- **PP-005:** Total pipeline: target <60 seconds for 2-min video
- **PP-006:** Transcript extraction: Deepgram words → ~10-word segments with timestamps

### Demo Caching Strategy

```python
# Pre-index these videos the night before demo
DEMO_VIDEOS = {
    "sample-a": "nervous-presenter-results.json",   # Score ~42
    "sample-b": "confident-presenter-results.json", # Score ~89
    "sample-c": "dissonant-presenter-results.json"  # Score ~67
}

# Instant results for demo reliability
if video_id in DEMO_VIDEOS:
    return cached_results[video_id]  # <2s response
```

### Known Issues

- None - all planned features implemented

### Open Questions (Resolved)

- ✅ Live camera recording? → **No, uploads only** (simpler for hackathon)
- ✅ Max video duration? → **5 minutes** (longer = demo risk)
- ✅ User accounts? → **No, anonymous uploads** (no auth complexity)

---

## 🎉 Completion Checklist

### Must-Have (Demo Blockers)

- [x] Upload video via frontend ✅
- [x] See processing status ✅
- [x] View results dashboard ✅
- [x] Interactive timeline works ✅
- [ ] 3 sample videos cached
- [ ] Demo runs smoothly 5 times

### Nice-to-Have (If Time Permits)

- [ ] PDF export of feedback
- [ ] Slide density analysis
- [ ] Progress tracking graph
- [ ] Voice coaching audio

### Explicitly Cut (Out of Scope)

- ❌ User authentication
- ❌ Database persistence
- ❌ Payment processing
- ❌ Email notifications
- ❌ Video editing tools
- ❌ Production deployment (Vercel/Render)
- ❌ QR code / mobile upload functionality
- ❌ FFmpeg slide extraction (TwelveLabs handles visual analysis)
- ❌ Thumbnail generation

---

**Last Updated:** Jan 11 2026 02:00AM
**Team Motto:** Ship fast, demo strong, win hackathon! 🏆
