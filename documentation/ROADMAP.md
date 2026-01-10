# 🗺️ ROADMAP.md - Coherence 24-Hour Build Plan

**Last Updated:** Jun 10 12:15PM
**Current Stage:** `STAGE_0_SETUP` ← Update this as you progress

---

## 📊 Progress Tracker

```
[████████████████████████████████████████] 100% STAGE 0: Setup (COMPLETE)
[░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]   0% STAGE 1: Foundation
[░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]   0% STAGE 2: Core Analysis
[░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]   0% STAGE 3: Integration
[░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]   0% STAGE 4: Dashboard
[░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]   0% STAGE 5: Demo Prep
[░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]   0% STAGE 6: Polish
```

**Overall Progress:** 0/6 stages complete

---

## ⏰ Timeline Overview

| Stage | Duration | Start | End | Status |
|-------|----------|-------|-----|--------|
| **Stage 0: Setup** | 2h | H-2 | H0 | ⚒️ IN PROGRESS |
| **Stage 1: Foundation** | 6h | H0 | H6 | ⏳ NOT_STARTED |
| **Stage 2: Core Analysis** | 6h | H6 | H12 | ⏳ NOT_STARTED |
| **Stage 3: Integration** | 4h | H12 | H16 | ⏳ NOT_STARTED |
| **Stage 4: Dashboard** | 4h | H16 | H20 | ⏳ NOT_STARTED |
| **Stage 5: Demo Prep** | 3h | H20 | H23 | ⏳ NOT_STARTED |
| **Stage 6: Polish** | 1h | H23 | H24 | ⏳ NOT_STARTED |

---

## 🎯 STAGE 0: Pre-Hackathon Setup (H-2 to H0)

**Duration:** 2 hours
**Goal:** Infrastructure ready before hackathon starts
**Status:** ⏳ NOT_STARTED

### Backend Tasks
- [ ] **BK-0.1** Create GitHub repository with `.gitignore`
- [ ] **BK-0.2** Initialize FastAPI project structure
- [ ] **BK-0.3** Set up virtual environment + `requirements.txt`
- [ ] **BK-0.4** Test local FastAPI server runs correctly
- [ ] **BK-0.5** Test TwelveLabs API key (index dummy video)
- [ ] **BK-0.6** Test Deepgram API key (transcribe 10s audio)
- [ ] **BK-0.7** Test Gemini API key (simple text prompt)
- [ ] **BK-0.8** Install FFmpeg on local machine + verify

### Frontend Tasks
- [ ] **FE-0.1** Initialize Next.js 14 project with TypeScript
- [ ] **FE-0.2** Configure TailwindCSS + custom theme
- [ ] **FE-0.3** Test local Next.js dev server runs correctly
- [ ] **FE-0.4** Install Lucide React icons
- [ ] **FE-0.5** Create basic routing structure (`/upload`, `/processing`, `/results`)
- [ ] **FE-0.6** Test API connection to backend health endpoint

### Shared Tasks
- [ ] **SH-0.1** Create shared TypeScript interface definitions
- [ ] **SH-0.2** Set up team communication (Slack/Discord channel)
- [ ] **SH-0.3** Agree on Git workflow (branch naming, PR process)
- [ ] **SH-0.4** Create project board (GitHub Projects or Trello)

### Success Criteria
✅ Both frontend and backend run locally
✅ All API keys verified working
✅ Team can push/pull from repo
✅ "Hello World" renders on both ends

---

## 🏗️ STAGE 1: Foundation (H0 to H6)

**Duration:** 6 hours
**Goal:** Upload video → Get transcript back
**Status:** ⏳ NOT_STARTED

### Backend Tasks (Backend Dev 1)
- [ ] **BK-1.1** `POST /api/videos/upload` endpoint
  - Accept multipart file upload
  - Validate file type (MP4/MOV), size (<500MB), duration (<3min)
  - Save to `/uploads/{uuid}.mp4`
  - Return `{ videoId, status: "processing" }`
  - **Est:** 1.5h

- [ ] **BK-1.2** Deepgram integration
  - Extract audio from video (FFmpeg)
  - Send to Deepgram API
  - Parse transcript with word-level timestamps
  - **Est:** 2h

- [ ] **BK-1.3** `GET /api/videos/{id}/status` endpoint
  - Return processing status from in-memory cache
  - Mock progress updates (0% → 100%)
  - **Est:** 1h

- [ ] **BK-1.4** Calculate basic speech metrics
  - Filler word count ("um", "uh", "like", "you know")
  - Speaking pace (WPM calculation)
  - Pause detection (gaps >2s)
  - **Est:** 1.5h

### Backend Tasks (Backend Dev 2)
- [ ] **BK-1.5** TwelveLabs video indexing
  - Upload video to TwelveLabs
  - Wait for indexing completion
  - Store index ID in memory cache
  - **Est:** 2h

- [ ] **BK-1.6** FFmpeg slide extraction
  - Detect scene changes (basic algorithm)
  - Extract 1 frame per scene as PNG
  - Save to `/slides/{videoId}/slide_{n}.png`
  - **Est:** 2h

- [ ] **BK-1.7** In-memory cache implementation
  - Dict structure: `{videoId: { status, results, indexId }}`
  - Thread-safe access (use `threading.Lock`)
  - **Est:** 1h

- [ ] **BK-1.8** Background task processing
  - FastAPI `BackgroundTasks` setup
  - Async processing pipeline trigger
  - **Est:** 1h

### Frontend Tasks (Frontend Dev)
- [ ] **FE-1.1** Upload page component
  - Drag-and-drop zone
  - File validation (client-side)
  - Progress bar during upload
  - **Est:** 2h

- [ ] **FE-1.2** Processing page component
  - Status polling (every 3s)
  - Animated loading indicators
  - Mock status messages
  - **Est:** 2h

- [ ] **FE-1.3** Mock data generators
  - Create `lib/mock-data.ts`
  - Generate realistic transcript
  - Generate mock metrics
  - **Est:** 1h

- [ ] **FE-1.4** API service layer
  - `lib/services/videoAnalysis.ts`
  - Upload, status, results functions
  - Mark `// BACKEND_HOOK:` comments
  - **Est:** 1h

### Testing Checkpoints
- [ ] **TEST-1.1** Upload 1-minute video → See transcript in backend logs
- [ ] **TEST-1.2** Frontend can upload → Backend receives file
- [ ] **TEST-1.3** Status polling works (mock progression 0→100%)

### Stage 1 Success Criteria
✅ Can upload video via frontend
✅ Backend transcribes audio with Deepgram
✅ TwelveLabs indexes video successfully
✅ Status endpoint returns mock progress
✅ Filler words counted correctly

**Milestone:** End-to-end upload flow working

---

## 🧠 STAGE 2: Core Analysis (H6 to H12)

**Duration:** 6 hours
**Goal:** Full analysis pipeline → Detect dissonance
**Status:** ⏳ NOT_STARTED

### Backend Tasks (Backend Dev 1)
- [ ] **BK-2.1** Gemini transcript sentiment analysis
  - Send transcript to Gemini
  - Extract emotional tone per sentence
  - Map to timestamps
  - **Est:** 2h

- [ ] **BK-2.2** Coherence score calculation
  - Implement weighted algorithm
  - Eye contact: 30%, Filler words: 25%, Fidgeting: 20%, Pace: 15%
  - Apply dissonance penalties
  - **Est:** 1.5h

- [ ] **BK-2.3** `GET /api/videos/{id}/results` endpoint
  - Return complete `AnalysisResult` object
  - Match TypeScript interface exactly
  - Include video URL for playback
  - **Est:** 1h

- [ ] **BK-2.4** Coaching feedback generation
  - Gemini prompt for actionable advice
  - Format: "Fix: [specific action]"
  - **Est:** 1.5h

### Backend Tasks (Backend Dev 2)
- [ ] **BK-2.5** TwelveLabs semantic queries (10-15 queries)
  - Emotion: "person smiling", "person frowning", "person anxious"
  - Engagement: "person looking at camera", "person looking away"
  - Gestures: "person pointing", "person fidgeting hands"
  - Posture: "person standing straight", "person slouching"
  - **Est:** 3h

- [ ] **BK-2.6** Dissonance detection logic
  - **Emotional Mismatch:** Compare transcript sentiment vs TwelveLabs expressions
  - **Missing Gesture:** Detect deictic words ("this", "here") without pointing
  - **Pacing Mismatch:** OCR slide text (Gemini Vision) vs speech duration
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

## 🔗 STAGE 3: Integration (H12 to H16)

**Duration:** 4 hours
**Goal:** Frontend ↔ Backend wired, end-to-end flow
**Status:** ⏳ NOT_STARTED

### Backend Tasks (Both Devs)
- [ ] **BK-3.1** CORS configuration
  - Allow frontend origin
  - Handle preflight requests
  - **Est:** 0.5h

- [ ] **BK-3.2** Error handling standardization
  - Consistent error response format
  - HTTP status codes
  - User-friendly messages
  - **Est:** 1h

- [ ] **BK-3.3** Logging implementation
  - Request/response logging
  - Error tracking
  - Performance metrics
  - **Est:** 1h

- [ ] **BK-3.4** Integration testing
  - Test all endpoints with real frontend
  - Fix response format mismatches
  - **Est:** 1.5h

### Frontend Tasks (Frontend Dev)
- [ ] **FE-3.1** Replace all mock data with API calls
  - Remove `lib/mock-data.ts` usage
  - Wire `lib/services/videoAnalysis.ts` to real endpoints
  - **Est:** 1.5h

- [ ] **FE-3.2** Error handling UI
  - Toast notifications for errors
  - Retry buttons
  - Validation messages
  - **Est:** 1h

- [ ] **FE-3.3** Loading states polish
  - Skeleton screens
  - Smooth transitions
  - **Est:** 1h

- [ ] **FE-3.4** End-to-end flow testing
  - Upload → Processing → Results
  - Fix UI bugs
  - **Est:** 0.5h

### Testing Checkpoints
- [ ] **TEST-3.1** Upload real video → See analysis in 60s
- [ ] **TEST-3.2** Error scenarios handled gracefully
- [ ] **TEST-3.3** Local file upload works correctly
- [ ] **TEST-3.4** All TypeScript interfaces match backend responses

### Stage 3 Success Criteria
✅ No more mock data in frontend
✅ Upload → Results flow works with real APIs
✅ Error messages display correctly
✅ Processing completes in <60 seconds
✅ Team can demo basic flow

**Milestone:** MVP functional end-to-end

---

## 🎨 STAGE 4: Dashboard Polish (H16 to H20)

**Duration:** 4 hours
**Goal:** Beautiful, interactive results dashboard
**Status:** ⏳ NOT_STARTED

### Frontend Tasks (Frontend Dev - Priority)
- [ ] **FE-4.1** Video player component
  - HTML5 video element
  - Custom controls (play/pause, seek)
  - Sync with timeline clicks
  - **Est:** 1.5h

- [ ] **FE-4.2** Dissonance timeline component
  - Canvas-based heatmap
  - Color gradient (green → red)
  - Clickable to seek video
  - Hover tooltips
  - **Est:** 2h

- [ ] **FE-4.3** Coaching card component
  - Glassmorphic styling
  - Severity-based borders
  - "Jump to Moment" button
  - **Est:** 1.5h

- [ ] **FE-4.4** Responsive layout tweaks
  - Test on 1440px, 1920px screens
  - Fix spacing issues
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
✅ Dashboard looks production-ready
✅ Processing time <45 seconds

**Milestone:** Demo-quality dashboard

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

**Active Stage:** `STAGE_0_SETUP`
**Current Tasks:**
- [ ] Backend: Setting up FastAPI skeleton
- [ ] Frontend: Initializing Next.js project
- [ ] Shared: Testing API keys

**Blockers:** None
**Next Checkpoint:** TEST-1.1 (upload → transcript)

---

## 📝 Notes & Decisions

### Architecture Decisions
- **AD-001:** Using in-memory cache (no MongoDB) for speed
- **AD-002:** FFmpeg for video processing (not cloud service)
- **AD-003:** Desktop-first design (mobile nice-to-have)

### API Changes
- **API-001:** Added `estimatedTime` field to upload response

### Known Issues
- None yet

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

**Last Updated:** June 10 12:15PM
**Team Motto:** Ship fast, demo strong, win hackathon! 🏆