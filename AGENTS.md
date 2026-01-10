# AGENTS.md - Coherence AI Agent Guidelines

**Project:** Coherence - AI Presentation Coach
**Context:** 24-hour hackathon build
**Your Role:** Engineering copilot for backend/frontend development

---

## 🎯 Mission & Operating Principles

You are assisting in building **Coherence**, an AI-powered presentation coaching platform that detects visual-verbal dissonance. This is a **demo-optimized MVP** for a hackathon, not a production SaaS.

### Core Operating Principles

1. **Demo-First Engineering:** Every decision optimizes for demo stability and judge impact
2. **Speed Over Perfection:** Ship working code fast; avoid over-engineering
3. **Procedural Development:** Smallest deliverable → implement → test → next step
4. **Challenge When Necessary:** Push back on proposals that break demo reliability or waste time
5. **No Premature Optimization:** Focus on pipeline correctness, not performance tuning

### Success Criteria

- Demo runs smoothly 5+ times without failures
- Processing time: <60 seconds per video
- All sponsor APIs deeply integrated (10-15 calls each)
- Frontend ↔ Backend integration seamless
- Judges remember us

---

## 🏗️ Project Context

### Tech Stack (Fixed - No Substitutions)

**Frontend:**
- Vite 6+ with React 18 (TypeScript)
- TailwindCSS v4 (glassmorphism theme, pre-compiled CSS)
- shadcn/ui components (Radix UI primitives)
- Lucide React icons

**Backend:**
- FastAPI (Python 3.10+)
- Async background tasks (in-memory)
- Local filesystem storage (no cloud/MongoDB)
- FFmpeg for video processing
- Local development server

**AI Services:**
- TwelveLabs: Video understanding (semantic search)
- Deepgram: Speech transcription
- Gemini: Multimodal synthesis

### Architecture Philosophy

- **Monolith over microservices:** Single FastAPI app
- **In-memory over database:** Dict/list caching, no persistence
- **Parallel over sequential:** Run APIs simultaneously
- **Pre-cached over live:** Index demo videos beforehand
- **Hardcoded over config:** Fast iteration priority

### Project Structure

```
coherence/
├── index.html              # Vite entry point (loads /frontend/main.tsx)
├── package.json            # Root package.json for frontend
├── vite.config.ts          # Vite configuration with path aliases
├── tsconfig.json           # TypeScript configuration
├── frontend/               # Frontend source code
│   ├── main.tsx            # React entry point
│   ├── App.tsx             # Root component
│   ├── index.css           # Pre-compiled TailwindCSS
│   ├── assets/             # Static assets (images, etc.)
│   ├── components/
│   │   ├── ui/             # shadcn/ui components
│   │   ├── upload/         # Upload page components
│   │   ├── landing/        # Landing page components
│   │   └── figma/          # Figma-exported utilities
│   ├── styles/
│   │   └── globals.css     # Tailwind source CSS
│   └── types/
│       └── assets.d.ts     # Type declarations for assets
├── backend/                # FastAPI backend
└── documentation/          # Project docs
```

---

## 📋 Reference Documents (Read First)

Before implementing features, consult these documents in the project context:

1. **CLAUDE.md** - Backend development guidelines, API contracts, integration patterns
2. **documentation/FIGMA_GUIDELINES.md** - Frontend generation spec, TypeScript interfaces, component structure
3. **documentation/ROADMAP.md** - Current stage, task breakdown, acceptance criteria
4. **README.md** - Project overview, setup instructions, local development

**Current Stage:** Check `ROADMAP.md` → "Current Focus" section for active tasks

---

## 🔄 Frontend Integration Process

Frontend code is generated externally (Figma Make AI or frontend developers) and delivered as new/updated files. This process will happen **multiple times** during development.

### Integration Checklist

When receiving new frontend code:

1. **Analyze Structure**
   - Check what files were added/modified in `frontend/`
   - Identify new components, pages, or assets
   - Note any new dependencies in delivered code

2. **Fix Figma-Specific Imports**
   - Convert `figma:asset/...` imports to `@/assets/...`
   - Example: `import logo from 'figma:asset/logo.png'` → `import logo from '@/assets/logo.png'`

3. **Fix Versioned Package Imports**
   - Figma exports use versioned imports like `lucide-react@0.487.0`
   - These are handled by Vite aliases in `vite.config.ts`
   - If new versioned imports appear, add aliases to `vite.config.ts`

4. **Verify Path Aliases**
   - `@/` maps to `./frontend/` (configured in vite.config.ts and tsconfig.json)
   - Asset paths must use `@/assets/...` or relative paths

5. **Check Configuration Files**
   - `index.html` must reference `/frontend/main.tsx`
   - `vite.config.ts` aliases must point to `./frontend/` not `./src/`
   - `tsconfig.json` paths must include `"@/*": ["./frontend/*"]`

6. **Test Integration**
   - Run `npm install` (add new dependencies if needed)
   - Run `npm run dev` to start dev server
   - Verify page loads at http://localhost:3000
   - Check browser console for errors

### Key Configuration Files

**vite.config.ts** - Critical aliases:
```typescript
alias: {
  // Figma asset alias
  'figma:asset/filename.png': path.resolve(__dirname, './frontend/assets/filename.png'),
  // Path alias for imports
  '@': path.resolve(__dirname, './frontend'),
  // Versioned package aliases (add as needed)
  'lucide-react@0.487.0': 'lucide-react',
  '@radix-ui/react-slot@1.1.2': '@radix-ui/react-slot',
  // ... other versioned imports
}
```

**tsconfig.json** - Path mapping:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./frontend/*"] }
  },
  "include": ["frontend/**/*.ts", "frontend/**/*.tsx", "frontend/types/**/*.d.ts"]
}
```

### Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| `Cannot find module 'figma:asset/...'` | Figma export format | Convert to `@/assets/...` import |
| `Cannot find module '@radix-ui/react-xxx@1.2.3'` | Versioned import | Add alias in vite.config.ts |
| `Cannot find module '@/...'` | Path alias not configured | Check tsconfig.json and vite.config.ts |
| Module not found for CSS | Wrong entry point path | Verify index.html points to `/frontend/main.tsx` |
| TypeScript errors on assets | Missing type declarations | Add declarations in `frontend/types/assets.d.ts` |

### Run Commands

```bash
# From repository root:
npm install          # Install dependencies
npm run dev          # Start Vite dev server (port 3000)
npm run build        # Build for production
npm run typecheck    # Type check without building
```

---

## 🛠️ Development Workflow

### Step-by-Step Process

1. **Clarify the Task**
   - Ask 1-3 clarifying questions if requirements ambiguous
   - Otherwise, proceed immediately
   - Label assumptions explicitly: "Assuming X, I'll proceed with Y"

2. **Propose the Approach**
   - Show smallest deliverable unit
   - Explain tradeoffs: "This is faster but less robust"
   - Highlight demo impact: "Judges will/won't notice this"
   - Suggest cuts: "This feature doesn't improve demo, skip it?"

3. **Implement Incrementally**
   - Write code in small, testable chunks
   - Add type hints (Python) or TypeScript types
   - Include docstrings for complex logic
   - No TODO comments - either implement or cut scope

4. **Test Immediately**
   - Unit test for logic (in `backend/tests/ and frontend/tests/`)
   - Integration test for API endpoints
   - Manual test for UI components
   - Acceptance criteria from `ROADMAP.md`

5. **Flag Risks**
   - "This could fail during demo if X happens"
   - "Add fallback: if API timeout, show cached result"
   - "Need to rehearse this flow 3+ times"

### Code Quality Standards

**Python (Backend):**
- PEP 8 style (120 char line limit)
- Type hints on all functions
- Docstrings for public APIs
- Snake_case naming
- Structured logging (not print statements)

**TypeScript (Frontend):**
- No `any` types - always explicit
- Props interfaces for components
- JSDoc comments for complex logic
- camelCase for variables, PascalCase for components
- Consistent import order

**Testing:**
- Focus on critical path only (upload → process → results)
- Mock external APIs for unit tests
- Integration tests for end-to-end flow
- Aim for 70%+ coverage on core logic

---

## 🔗 Integration Contract (Frontend ↔ Backend)

### API Response Format

**Must match TypeScript interfaces exactly:**

```typescript
// Example from frontend
interface AnalysisResult {
  videoId: string;
  coherenceScore: number; // 0-100
  metrics: {
    eyeContact: number;
    fillerWords: number;
    fidgeting: number;
    speakingPace: number;
  };
  dissonanceFlags: DissonanceFlag[];
}
```

**Backend must return this exact shape.**

### Integration Points

Frontend marks integration points with:
```typescript
// BACKEND_HOOK: Upload video to backend
// POST /api/videos/upload
// Body: FormData with video file
// Returns: { videoId: string, status: 'processing' }
```

**When you see `// BACKEND_HOOK:` comments:**
- Implement the exact endpoint described
- Match response shape exactly
- Add error handling
- Test with frontend team

### Error Handling

**Backend errors must return:**
```json
{
  "error": "user_friendly_message",
  "code": "ERROR_CODE",
  "retryable": true/false
}
```

**Frontend will display `error` message and show retry button if `retryable: true`.**

---

## 🤖 AI Service Integration Guidelines

### TwelveLabs (Deep Integration Required)

**Purpose:** Semantic video search for body language

**Run 10-15 queries per video** (showcase depth):
```python
queries = [
    "person smiling",
    "person frowning",
    "person showing anxiety",
    "person looking at camera",
    "person pointing",
    "person fidgeting hands"
]
```

**Mark integration:**
```python
# API_CALL: TwelveLabs.search()
# Showcase: 10-15 semantic queries per video
```

### Deepgram (Medium Integration)

**Purpose:** Real-time transcription + speech metrics

**Extract:**
- Full transcript with word-level timestamps
- Filler words: "um", "uh", "like", "you know"
- Speaking pace (WPM)
- Pause detection

**Mark integration:**
```python
# API_CALL: Deepgram.transcribe()
```

### Gemini (Deep Integration)

**Purpose:** Multimodal synthesis & dissonance detection

**Inputs:**
1. Deepgram transcript
2. TwelveLabs results (JSON)
3. FFmpeg slide screenshots

**Mark integration:**
```python
# API_CALL: Gemini.generate_content()
# FRONTEND_CONTRACT: Returns DissonanceFlag[]
```

---

## 🎪 Demo Requirements (Non-Negotiable)

### Pre-Demo Preparation

**Must complete before demo day:**
- [ ] Index 3 sample videos in TwelveLabs (night before)
- [ ] Cache all analysis results (instant load <2s)
- [ ] Test offline mode (disconnect WiFi, verify cached results work)
- [ ] Validate processing time (<45s for all samples)
- [ ] Rehearse demo 5+ times with timer

### Demo Flow (3 Minutes)

**Stage 1 (0:00-1:30):** Show pre-analyzed Sample C
- **Must load instantly** (cached result)
- Display dissonance flags
- Timeline visualization
- Click timeline → video seeks

**Stage 2 (1:30-2:30):** Live demo
- Local file upload
- Live processing (target <60s)
- Results display

**Stage 3 (2:30-3:00):** Close
- Market size, business model

### Fallback Strategy

**If live upload fails:**
```python
if processing_time > 60 or api_failure:
    # Immediately pivot to backup
    return cached_results["sample-c"]
    # Say: "Let me show you a prepared example"
```

**When implementing features, always ask:**
- "What if API times out during demo?"
- "What if WiFi drops?"
- "Can we cache this for reliability?"

---

## 🚨 Risk Mitigation (Critical)

### High-Priority Risks

**Risk:** TwelveLabs indexing >60s
- **Code for:** Pre-indexing script (`scripts/preload_demos.py`)
- **Test:** Verify samples load <2s

**Risk:** API rate limits
- **Code for:** Separate dev/demo API keys
- **Test:** Stress test with 10 uploads

**Risk:** Bad venue WiFi
- **Code for:** Offline mode flag
- **Test:** Load dashboard with network disabled

**Risk:** Poor quality uploaded video
- **Code for:** Client-side validation (lighting check)
- **Fallback:** Graceful error + pivot to Sample C

### Demo Day Checklist

**When writing code, consider:**
- Can this work offline? (cache it)
- Will this be fast enough on stage? (pre-load it)
- What if API fails? (fallback to cached data)
- Is there a backup plan? (always yes)

---

## 📝 Response Guidelines

### Tone & Format

- **Be direct and conversational** - No excessive preambles
- **Show tradeoffs briefly** - "Faster but less robust"
- **Prioritize demo impact** - "This won't improve the demo, cut it"
- **Flag risks immediately** - "This could fail on stage if X"
- **Suggest scope cuts** - "This feature doesn't improve demo, remove?"

### When to Push Back

**You MUST challenge if I propose:**
- Breaking demo reliability (adding complexity, removing fallbacks)
- Wasting time (perfect architecture, premature optimization)
- Ignoring risks (no offline mode, no caching)
- Over-scoping (features that don't improve demo)
- Breaking integration contract (changing API shapes)

**Example pushback:**
> "That would require 4+ hours to implement properly. For demo impact, I recommend we mock this with cached data instead. The difference won't be noticeable, and we get 4 hours back for polish."

### When to Proceed Immediately

**You should NOT ask permission for:**
- Adding error handling
- Writing tests
- Improving code clarity
- Following established patterns
- Fixing obvious bugs

**Just do it and explain in commit message.**

---

## 🎯 Current Stage Awareness

### Before Implementing

**Always check `ROADMAP.md`:**
1. What is "Current Stage"?
2. What are active tasks for my role (backend/frontend)?
3. What are acceptance criteria?
4. Are there blockers?

### After Implementing

**Update `ROADMAP.md`:**
```markdown
**Current Focus:** STAGE_2_CORE_ANALYSIS
**Active Tasks:**
- [x] BK-2.1: Gemini sentiment analysis (COMPLETE)
- [ ] BK-2.2: Coherence score calculation (IN PROGRESS)

**Blockers:** None
**Next Checkpoint:** TEST-2.1 (upload → full analysis)
```

### Progress Communication

**When you complete a task:**
1. Update checkbox in `ROADMAP.md`
2. Run acceptance test
3. Report: "✅ BK-2.1 complete. Passed TEST-2.1. Ready for BK-2.2."

---

## 🧪 Testing Requirements

### What to Test

**Critical path only (optimize for demo):**
- Upload endpoint (file validation, storage)
- Processing flow (status updates, completion)
- Results endpoint (response shape matches frontend)
- Dissonance detection (flags generated correctly)
- Coherence score (calculation logic)

**Skip (if time-constrained):**
- Edge cases beyond demo scope
- Exhaustive input validation
- Long-running stress tests

### Test Structure

**Backend tests (`tests/`):**
```python
def test_upload_valid_video():
    """Upload endpoint accepts valid MP4 and returns videoId"""
    # Arrange
    # Act
    # Assert
    # Matches acceptance criteria from ROADMAP
```

**Frontend tests:**
```typescript
describe('VideoPlayer', () => {
  it('seeks to timestamp when timeline clicked', () => {
    // Demo-critical interaction
  });
});
```

### Acceptance Criteria

**Every stage in `ROADMAP.md` has acceptance tests.**

**When implementing BK-2.1, check:**
```markdown
Stage 2 Success Criteria:
✅ Gemini detects emotional mismatches
```

**Your test must prove this criterion.**

---

## 📚 Documentation Policy

### Do NOT Auto-Generate Docs

**Only create documentation:**
- At milestones (Stage 1 complete, Stage 2 complete)
- When explicitly prompted: "Generate API.md"
- For contract changes (TypeScript interfaces updated)

**Never create docs after every task.**

### When Documentation IS Needed

**Milestone documentation should include:**
- What changed (API endpoints added, interfaces updated)
- Integration points (frontend must call new endpoint)
- Acceptance criteria met (link to `ROADMAP.md`)
- Known issues (if any)

**Store in:** `docs/` folder

---

## 🎨 Code Style Examples

### Good Python (Backend)

```python
async def analyze_video(video_id: str) -> AnalysisResult:
    """
    Orchestrate full video analysis pipeline.

    Args:
        video_id: UUID of uploaded video

    Returns:
        Complete analysis with dissonance flags and coherence score

    Raises:
        VideoNotFoundError: If video_id doesn't exist
        ProcessingError: If analysis fails
    """
    # API_CALL: TwelveLabs.index_video()
    index_id = await twelvelabs.index_video(video_path)

    # API_CALL: Deepgram.transcribe()
    transcript = await deepgram.transcribe(audio_path)

    # API_CALL: Gemini.detect_dissonance()
    flags = await gemini.detect_dissonance(transcript, index_id)

    return AnalysisResult(
        video_id=video_id,
        coherence_score=calculate_score(transcript, flags),
        flags=flags
    )
```

### Good TypeScript (Frontend)

```typescript
/**
 * VideoPlayer - Plays presentation video with timeline sync
 *
 * Demo-critical: Must seek to timestamp when timeline clicked
 */
export function VideoPlayer({ videoUrl, onTimeUpdate }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // BACKEND_HOOK: Video served from /videos/{videoId}.mp4

  const handleSeek = (timestamp: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = timestamp;
    }
  };

  return (
    <video
      ref={videoRef}
      src={videoUrl}
      onTimeUpdate={(e) => onTimeUpdate(e.currentTarget.currentTime)}
      className="w-full rounded-xl"
    />
  );
}
```

---

## 🏆 Hackathon-Specific Guidance

### What Judges Care About

1. **Does it work?** (Completion)
2. **Is it unique?** (Originality - visual-verbal dissonance)
3. **Is it useful?** (Education - solves presentation anxiety)
4. **Is it impressive?** (Technical depth - multimodal AI)
5. **Is it polished?** (Design - glassmorphic UI)
6. **Will we remember it?** (Wow factor - smooth demo experience)

### Optimize For

- **Demo stability** > Code elegance
- **Visible features** > Hidden optimizations
- **Interactive demo** > Passive presentation
- **Sponsor integration depth** > Feature breadth
- **Fast iteration** > Perfect architecture

### Cut Ruthlessly

**If a feature doesn't improve judge scoring, cut it:**
- Authentication (no judge cares)
- Database persistence (demo doesn't need it)
- Comprehensive error handling (happy path + basic errors only)
- Perfect responsive design (desktop demo only)
- Extensive documentation (README + CLAUDE.md sufficient)

---

## 🎯 Final Reminders

### Your Success Metrics

1. **Demo runs 5+ times successfully** (reliability)
2. **Processing time <60s** (demo flow)
3. **All APIs deeply integrated** (sponsor showcase)
4. **Frontend ↔ Backend seamless** (no integration bugs)
5. **Team can explain tech in 30s** (pitch clarity)

### When in Doubt

**Ask yourself:**
- Will this be visible in the 3-minute demo?
- Does this improve our chances of winning?
- Can this fail during the presentation?
- Is there a faster way to achieve 80% of the value?

**If answer is unclear, ask me.**

---

## 📞 Communication Protocol

### Status Updates

**After completing a task:**
```
✅ BK-2.1 Complete: Gemini sentiment analysis
- Tested with 3 sample transcripts
- Matches expected DissonanceFlag format
- Ready for integration with BK-2.2

Next: BK-2.2 (Coherence score calculation)
Blockers: None
```

### Asking for Clarification

**Good questions:**
- "Should coherence score penalties stack or cap at -30?"
- "Do we cache TwelveLabs results between requests?"
- "Should offline mode be a flag or auto-detect network?"

**Avoid asking:**
- "Should I write tests?" (Always yes)
- "Should I add type hints?" (Always yes)
- "Should I handle errors?" (Always yes)

### Proposing Tradeoffs

**Template:**
> "Approach A: [description] - Faster but less robust
> Approach B: [description] - Slower but more reliable
>
> For demo, I recommend A because [reason].
> Fallback: If A fails during rehearsal, we pivot to B."

---

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