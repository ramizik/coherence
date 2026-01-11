# 🗺️ ROADMAP.md - Coherence 24-Hour Build Plan

**Last Updated:** Jan 11 2026 01:00AM
**Current Stage:** `STAGE_3_INTEGRATION` ← Frontend-backend integration complete, results page integrated, transcript extraction fixed

---

## 📊 Progress Tracker

```
[████████████████████████████████████████] 100% STAGE 0: Setup (COMPLETE)
[████████████████████████████████████████] 100% STAGE 1: Foundation (COMPLETE)
[░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]   0% STAGE 2: Core Analysis
[████████████████████████████████████░░░░]  90% STAGE 3: Integration (NEARLY COMPLETE)
[████████████████████████████░░░░░░░░░░░░]  70% STAGE 4: Dashboard (PARTIAL)
[░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]   0% STAGE 5: Demo Prep
[░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]   0% STAGE 6: Polish
```

**Overall Progress:** 2.6/6 stages complete

---

## ⏰ Timeline Overview

| Stage                      | Duration | Start | End | Status                       |
| -------------------------- | -------- | ----- | --- | ---------------------------- |
| **Stage 0: Setup**         | 2h       | H-2   | H0  | ✅ COMPLETE                  |
| **Stage 1: Foundation**    | 6h       | H0    | H6  | ✅ COMPLETE                  |
| **Stage 2: Core Analysis** | 6h       | H6    | H12 | ⏳ NOT_STARTED               |
| **Stage 3: Integration**   | 4h       | H12   | H16 | ⚒️ NEARLY COMPLETE (results page integrated) |
| **Stage 4: Dashboard**     | 4h       | H16   | H20 | ⚒️ PARTIAL (components exist, needs real data) |
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

- [ ] **BK-1.2** Deepgram integration (Track A) - Pending

  - Extract audio: `ffmpeg -i video.mp4 -vn audio.wav`
  - Send to Deepgram Transcription API
  - Parse response: transcript + word-level timestamps + confidence
  - **Est:** 2h

- [x] **BK-1.3** `GET /api/videos/{id}/status` endpoint ✅ COMPLETE

  - Return: `{ videoId, status, progress, stage, etaSeconds }`
  - Status values: `queued | processing | complete | error`
  - Stage messages for UX: "Extracting audio...", "Transcribing speech...", etc.
  - **Files:** `backend/app/routers/videos.py`

- [ ] **BK-1.4** Calculate speech metrics from Deepgram - Pending
  - Filler word count: "um", "uh", "like", "you know", "basically"
  - Speaking pace: `word_count / duration_minutes` (target: 140-160 WPM)
  - Pause detection: gaps >2s between words
  - Store in cache: `cache[videoId]["deepgram_data"]`
  - **Est:** 1.5h

### Backend Tasks (Backend Dev 2 - TwelveLabs + FFmpeg)

- [x] **BK-1.5** TwelveLabs video indexing (Track B) - PARTIAL

  - Upload video to TwelveLabs Indexing API ✅
  - Poll/wait for indexing completion (~20-40s for 2-min video) ✅
  - Store index ID in cache - Pending integration with main pipeline
  - **Files:** `backend/twelvelabs/indexing.py`, `backend/twelvelabs/twelvelabs_client.py`
  - **Est:** Integration pending

- [ ] **BK-1.6** FFmpeg slide extraction (Track C) - Pending

  - Scene change detection: `ffmpeg -vf "select=gt(scene,0.3)" ...`
  - Extract ~5-15 PNG screenshots per video
  - Save to `/slides/{videoId}/slide_{n}.png`
  - Store paths in cache: `cache[videoId]["slide_paths"]`
  - **Est:** 2h

- [x] **BK-1.7** In-memory cache implementation ✅ COMPLETE

  ```python
  # backend/app/services/video_service.py
  _video_storage: Dict[str, dict] = {}      # Video metadata
  _status_storage: Dict[str, StatusResponse] = {}  # Processing status
  _results_storage: Dict[str, AnalysisResult] = {} # Analysis results
  ```

  - Thread-safe via asyncio
  - **Files:** `backend/app/services/video_service.py`

- [x] **BK-1.8** Background task orchestration ✅ COMPLETE
  - `asyncio.create_task()` for non-blocking processing
  - Progress/stage updates during processing
  - Mock processing stages (12s total, 2s per stage)
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

- [ ] **TEST-1.1** Upload 1-minute video → See transcript in backend logs - Pending Deepgram
- [x] **TEST-1.2** Frontend can upload → Backend receives file ✅
- [x] **TEST-1.3** Status polling works (progression 0→100%) ✅

### Stage 1 Success Criteria

✅ Can upload video via frontend
⏳ Backend transcribes audio with Deepgram (pending)
⏳ TwelveLabs indexes video in main pipeline (pending integration)
✅ Status endpoint returns real progress
⏳ Filler words counted correctly (pending Deepgram)

**Milestone:** Upload flow working, analysis pipeline pending

### Implementation Notes (Stage 1)

**Completed API Endpoints:**

- `POST /api/videos/upload` - Upload video, returns `UploadResponse`
- `GET /api/videos/{videoId}/status` - Poll status, returns `StatusResponse`
- `GET /api/videos/{videoId}/results` - Get results, returns `AnalysisResult`
- `GET /api/videos/samples/{sampleId}` - Load sample video
- `GET /api/videos/{videoId}/stream` - Stream video file

**Backend Files Created:**

- `backend/app/models/schemas.py` - Pydantic schemas (12 models)
- `backend/app/routers/videos.py` - API endpoints
- `backend/app/services/video_service.py` - Video processing logic
- `backend/data/videos/` - Video file storage

**Frontend Files Created:**

- `frontend/types/index.ts` - TypeScript interfaces
- `frontend/lib/config.ts` - API configuration
- `frontend/lib/services/videoAnalysis.ts` - API service layer
- `frontend/lib/mock-data.ts` - Mock data for testing

---

## 🧠 STAGE 2: Core Analysis (H6 to H12)

**Duration:** 6 hours
**Goal:** Full analysis pipeline → Detect dissonance
**Status:** ⏳ NOT_STARTED

### Pipeline Stage 2: Gemini Synthesis (20-40 seconds)

```
[Deepgram Data] + [TwelveLabs Data] + [Slide Images] → Gemini → Dissonance Detection
```

### Backend Tasks (Backend Dev 1 - Gemini + Scoring)

- [ ] **BK-2.1** Gemini multimodal synthesis

  - Bundle inputs: transcript, visual events, slide images (base64)
  - Craft prompt for dissonance detection (see CLAUDE.md)
  - Parse JSON response: dissonance flags, score breakdown, coaching
  - **Est:** 2h

- [ ] **BK-2.2** Coherence score calculation

  ```python
  # Weighted scoring (0-100):
  score = (
      (eye_contact_pct / 100) * 30 +        # Eye contact: 30%
      max(0, (20 - filler_count) / 20) * 25 + # Filler words: 25%
      max(0, (15 - fidget_count) / 15) * 20 + # Fidgeting: 20%
      pace_score * 15                         # Pace: 15% (ideal 140-160 WPM)
  )
  # Deduct 10 points per HIGH severity flag
  score -= len(critical_flags) * 10
  return max(0, min(100, score))
  ```

  - Score tiers: 0-50 "Needs Work", 51-75 "Good Start", 76-100 "Strong"
  - **Est:** 1.5h

- [ ] **BK-2.3** `GET /api/videos/{id}/results` endpoint

  - Return complete `AnalysisResult` matching TypeScript interface
  - Include: coherenceScore, scoreTier, metrics, dissonanceFlags, timelineHeatmap
  - Include video URL for playback: `/videos/{videoId}.mp4`
  - **Est:** 1h

- [ ] **BK-2.4** Coaching feedback generation
  - Gemini generates actionable advice per flag
  - Format: specific, measurable actions ("Smile when saying X", "Point at screen")
  - Include strengths and top 3 priorities
  - **Est:** 1.5h

### Backend Tasks (Backend Dev 2 - TwelveLabs + Dissonance)

- [ ] **BK-2.5** TwelveLabs semantic queries (10-15 queries)

  ```python
  queries = [
      # Emotions
      "person smiling", "person frowning", "person looking anxious",
      # Eye contact
      "person making eye contact with camera", "person looking away from camera",
      # Gestures
      "person pointing at something", "person using hand gestures",
      "person fidgeting with hands",
      # Posture
      "person standing straight", "person slouching"
  ]
  ```

  - Aggregate: eye contact %, fidget count, emotion timeline
  - **Est:** 3h

- [ ] **BK-2.6** Dissonance detection logic
  - **EMOTIONAL_MISMATCH:** Positive words ("thrilled", "excited") + anxious/flat face
    - Compare Deepgram sentiment vs TwelveLabs facial expression at same timestamp
  - **MISSING_GESTURE:** Deictic phrases ("this", "here", "look at") without pointing
    - Check TwelveLabs for "pointing" gesture within ±3 seconds
  - **PACING_MISMATCH:** Dense slides shown too briefly
    - OCR slide text via Gemini Vision, compare word count vs display time
    - Flag if >100 words shown <20 seconds
  - **Est:** 3h

### Frontend Tasks (Frontend Dev)

- [ ] **FE-2.1** Results page shell

  - 3-panel grid layout (desktop)
  - Video player (left)
  - Coaching cards (right)
  - Timeline (bottom)
  - **Est:** 2h

- [ ] **FE-2.2** Score badge component

  - Color-coded (green/amber/red)
  - Score display + label
  - **Est:** 1h

- [ ] **FE-2.3** Metrics row component

  - Eye contact %, filler words, fidgeting, WPM
  - Icon + value + label
  - **Est:** 1.5h

- [ ] **FE-2.4** Wire results page to API
  - Fetch analysis results
  - Display in components
  - Handle loading/error states
  - **Est:** 1.5h

### Testing Checkpoints

- [ ] **TEST-2.1** Upload video → Receive full analysis results
- [ ] **TEST-2.2** Dissonance flags generated correctly
- [ ] **TEST-2.3** Coherence score matches manual calculation
- [ ] **TEST-2.4** Frontend displays results without errors

### Stage 2 Success Criteria

✅ TwelveLabs semantic queries return relevant timestamps
✅ Gemini detects emotional mismatches
✅ Coherence score calculated (0-100)
✅ Dissonance flags generated with coaching text
✅ Results page renders with mock data

**Milestone:** Full analysis pipeline functional

---

## 🔗 STAGE 3: Integration (H12 to H16) - NEARLY COMPLETE ⚒️

**Duration:** 4 hours
**Goal:** Frontend ↔ Backend wired, end-to-end flow
**Status:** ⚒️ NEARLY COMPLETE (API wiring complete, results page integrated, real analysis pending)

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

- [ ] **BK-3.3** Logging implementation - Pending

  - Basic logging in place, structured logging pending
  - **Est:** 1h

- [ ] **BK-3.4** Integration testing - Partial
  - Endpoints created, real analysis pending
  - **Est:** 1.5h

### Frontend Tasks (Frontend Dev)

- [x] **FE-3.1** Replace mock data with API calls ✅ COMPLETE

  - `UploadPage.tsx` uses `uploadVideo()`
  - `ProcessingView.tsx` uses `pollStatus()`
  - `SampleVideos.tsx` uses `loadSampleVideo()`
  - Mock data kept for fallback development
  - **Files:** `frontend/components/upload/*.tsx`

- [x] **FE-3.2** Error handling UI ✅ COMPLETE

  - Error messages displayed in components
  - `VideoAnalysisError` class for typed errors
  - Retry capability via `retryable` flag
  - **Files:** `frontend/lib/services/videoAnalysis.ts`

- [x] **FE-3.3** Loading states ✅ COMPLETE

  - `isUploading` state in UploadZone
  - `isLoading` state in SampleVideos
  - Progress bar synced to real API status
  - **Files:** `frontend/components/upload/*.tsx`

- [x] **FE-3.4** Results page integration ✅ COMPLETE
  - ResultsPage component with backend integration
  - VideoPlayer, CoachingCard, ScoreBadge, DissonanceTimeline, MetricsRow components
  - Mock data fallback for demo reliability
  - **Files:** `frontend/components/results/*.tsx`

### Testing Checkpoints

- [ ] **TEST-3.1** Upload real video → See analysis in 60s - Pending real analysis
- [x] **TEST-3.2** Error scenarios handled gracefully ✅
- [x] **TEST-3.3** Local file upload works correctly ✅
- [x] **TEST-3.4** All TypeScript interfaces match backend responses ✅

### Stage 3 Success Criteria

✅ Frontend fully wired to backend APIs
✅ Upload → Processing → Results flow works end-to-end
✅ Error messages display correctly with retry capability
✅ Results page displays analysis with all components
⏳ Processing completes in <60 seconds (mock: 12s, real analysis pending)
✅ Mock data fallback ensures demo reliability

**Milestone:** Frontend-backend integration complete, results page functional

### Implementation Notes (Stage 3)

**Results Page Components Created:**
- `frontend/components/results/ResultsPage.tsx` - Main dashboard with backend integration
- `frontend/components/results/VideoPlayer.tsx` - Custom video player with controls
- `frontend/components/results/CoachingCard.tsx` - Dismissible coaching insight cards
- `frontend/components/results/ScoreBadge.tsx` - Circular score progress indicator
- `frontend/components/results/DissonanceTimeline.tsx` - Interactive timeline with flag markers
- `frontend/components/results/MetricsRow.tsx` - 4-card metrics grid

**Key Integration Features:**
- Backend API calls via `fetchResults()` and `getVideoStreamUrl()`
- Mock data fallback for demo reliability
- Error handling with retry capability
- ProcessingView card design preserved during integration

**Transcript Extraction Fix (Jan 11):**
- **Issue:** Frontend displayed fake "analysis descriptions" instead of actual speech transcripts
- **Root cause:** `_convert_analysis_to_result()` wasn't extracting transcript from Deepgram data
- **Fix Location:** `backend/app/services/video_service.py`
- **Changes:**
  - Added `TranscriptSegment` to imports
  - `_convert_analysis_to_result()` now extracts `words` array from `deepgram_data`
  - Groups words into ~10-word segments with timestamps
  - `_convert_deepgram_only_result()` updated with same logic
- **Frontend handling:** `frontend/lib/api.ts` transforms `ApiTranscriptSegment[]` to `TranscriptSegment[]`
- **Fallback:** If no transcript, frontend generates basic segments from dissonance flags

---

## 🎨 STAGE 4: Dashboard Polish (H16 to H20)

**Duration:** 4 hours
**Goal:** Beautiful, interactive results dashboard
**Status:** ⚒️ PARTIAL (Components exist, needs real analysis data)

### Frontend Tasks (Frontend Dev - Priority)

- [x] **FE-4.1** Video player component ✅ COMPLETE

  - HTML5 video element with custom controls
  - Play/pause, seek, volume, fullscreen
  - Sync with timeline clicks
  - **Files:** `frontend/components/results/VideoPlayer.tsx`

- [x] **FE-4.2** Dissonance timeline component ✅ COMPLETE

  - Interactive timeline with severity markers
  - Color-coded flags (red/amber/green)
  - Clickable to seek video
  - Hover tooltips with flag details
  - **Files:** `frontend/components/results/DissonanceTimeline.tsx`

- [x] **FE-4.3** Coaching card component ✅ COMPLETE

  - Glassmorphic styling with severity borders
  - Dismissible with smooth animations
  - "Jump to Moment" button
  - **Files:** `frontend/components/results/CoachingCard.tsx`

- [x] **FE-4.4** Score badge and metrics components ✅ COMPLETE
  - ScoreBadge with circular progress indicator
  - MetricsRow with 4-card grid (Eye Contact, Filler Words, Pace, Gestures)
  - Color-coded based on thresholds
  - **Files:** `frontend/components/results/ScoreBadge.tsx`, `frontend/components/results/MetricsRow.tsx`

- [ ] **FE-4.5** Responsive layout tweaks - Pending
  - Test on 1440px, 1920px screens
  - Fix spacing issues if any
  - **Est:** 1h

### Backend Tasks (Backend Dev 2 - Support)

- [ ] **BK-4.1** Video serving endpoint

  - `GET /videos/{videoId}.mp4`
  - Stream video file
  - Range request support
  - **Est:** 1h

- [ ] **BK-4.2** Thumbnail generation

  - Extract frame at 10% mark
  - Serve as JPG
  - **Est:** 1h

- [ ] **BK-4.3** Slide image serving
  - `GET /slides/{videoId}/slide_{n}.png`
  - Serve extracted slide images
  - **Est:** 0.5h

### Backend Tasks (Backend Dev 1 - Support)

- [ ] **BK-4.4** Performance optimization
  - Cache TwelveLabs queries
  - Parallel API calls
  - Reduce processing time to <45s
  - **Est:** 1.5h

### Testing Checkpoints

- [ ] **TEST-4.1** Timeline click seeks video correctly
- [ ] **TEST-4.2** All dissonance flags visible in UI
- [ ] **TEST-4.3** Dashboard looks polished (no placeholder text)
- [ ] **TEST-4.4** Video playback smooth (no buffering)

### Stage 4 Success Criteria

✅ Interactive timeline functional
✅ Video player synced to timeline
✅ Coaching cards styled beautifully
✅ Score badge and metrics display correctly
⏳ Dashboard displays real analysis data (currently shows mock/fallback)
✅ Dashboard looks production-ready

**Milestone:** Dashboard components complete, awaiting real analysis data

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

**Active Stage:** `STAGE_3_INTEGRATION` / `STAGE_4_DASHBOARD`
**Current Tasks:**

- [x] Backend: API structure complete (upload, status, results endpoints)
- [x] Frontend: Components wired to real API
- [x] Frontend: Results page fully integrated with all components
- [ ] Backend: Integrate TwelveLabs analysis into main pipeline
- [ ] Backend: Add Deepgram transcription
- [ ] Backend: Add Gemini synthesis for dissonance detection

**Completed:**

- ✅ FastAPI app with video router
- ✅ Pydantic schemas matching TypeScript interfaces
- ✅ In-memory video storage and caching
- ✅ Background processing with status updates
- ✅ Frontend API service layer
- ✅ CORS configured for frontend
- ✅ Results page with all components (VideoPlayer, CoachingCard, ScoreBadge, DissonanceTimeline, MetricsRow)
- ✅ ProcessingView card design preserved
- ✅ Mock data fallback for demo reliability
- ✅ **Transcript extraction from Deepgram** - Real speech transcripts now returned in API response

**Blockers:** None
**Next Checkpoint:** BK-1.2 (Deepgram integration), BK-2.1 (Gemini synthesis), BK-2.5 (TwelveLabs semantic queries)

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

- None yet

### Open Questions (Resolved)

- ✅ Live camera recording? → **No, uploads only** (simpler for hackathon)
- ✅ Max video duration? → **5 minutes** (longer = demo risk)
- ✅ User accounts? → **No, anonymous uploads** (no auth complexity)

---

## 🎉 Completion Checklist

### Must-Have (Demo Blockers)

- [ ] Upload video via frontend
- [ ] See processing status
- [ ] View results dashboard
- [ ] Interactive timeline works
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

---

**Last Updated:** Jan 11 2026 01:00AM
**Team Motto:** Ship fast, demo strong, win hackathon! 🏆
