# 🗺️ ROADMAP.md - Coherence Production Development Plan

**Last Updated:** January 15, 2025
**Current Phase:** PHASE_1_FOUNDATION
**Status:** 🏆 Hackathon MVP Complete - Transitioning to Production
**Timeline:** January 15 - February 18, 2025 (5 weeks)

---

## 📊 Progress Overview

**Hackathon MVP (Complete ✅):**
- ✅ Core video analysis pipeline
- ✅ Visual-verbal dissonance detection
- ✅ Interactive results dashboard
- ✅ Basic API endpoints

**Production Roadmap (In Progress 🚧):**
- 🚧 Week 1: Supabase Foundation & Auth (Jan 15-21)
- ⏳ Week 2: Background Jobs & Video Processing (Jan 22-28)
- ⏳ Week 3: User Experience & History (Jan 29 - Feb 4)
- ⏳ Week 4: AI Optimization & Billing (Feb 5-11)
- ⏳ Week 5: Cloud Run Deployment (Feb 12-18)

---

## 🎯 Week 1: Supabase Foundation & Auth (Jan 15-21)

**Goal:** Set up Supabase project, implement authentication, connect to FastAPI

### Day 1 (Wed, Jan 15) - Supabase Project Setup

**Tasks (3 hours):**
- ☐ Create Supabase project at [supabase.com](https://supabase.com/)
- ☐ Copy project URL, anon key, and service role key
- ☐ Enable email authentication in Auth settings
- ☐ Design database schema in Table Editor (users auto-created)
- ☐ Create `videos` table with user_id foreign key
- ☐ Create `analyses` table linked to videos

**Database Schema:**
```sql
-- Videos table
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
```

**Success Metric:** Database tables created, can query via dashboard

**Time Saved:** 4 hours (no PostgreSQL installation, Alembic setup)

---

### Day 2 (Thu, Jan 16) - Supabase Auth Integration (Backend)

**Tasks (5 hours):**
- ☐ Install `supabase-py` SDK
- ☐ Create Supabase client singleton in FastAPI
- ☐ Implement JWT verification middleware using Supabase's `auth.get_user(jwt)`
- ☐ Create `get_current_user` dependency
- ☐ Test authentication with Supabase dashboard

**Files:** `backend/app/config.py`, `backend/app/dependencies.py`

**Implementation:**
```python
# backend/app/dependencies.py
from supabase import create_client, Client
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        user = supabase.auth.get_user(credentials.credentials)
        return user
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
```

**Success Metric:** Protected endpoints return 401 without valid Supabase token

**Time Saved:** 4 hours (no custom JWT logic, password hashing, token generation)

---

### Day 3 (Fri, Jan 17) - Frontend Authentication (Supabase JS SDK)

**Tasks (5 hours):**
- ☐ Install `@supabase/supabase-js`
- ☐ Create Supabase client in frontend
- ☐ Build Login component using `supabase.auth.signInWithPassword()`
- ☐ Build Register component using `supabase.auth.signUp()`
- ☐ Implement auth context with session persistence
- ☐ Add logout functionality

**Files:** `frontend/lib/supabase.ts`, `frontend/components/auth/`

**Implementation:**
```typescript
// frontend/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

**Success Metric:** Users can register, login, and stay authenticated across page reloads

**Time Saved:** 3 hours (no custom forms, session management, or token storage logic)

---

### Day 4-5 (Sat-Sun, Jan 18-19) - Row Level Security & User Management

**Tasks (8 hours total):**
- ☐ Enable RLS on `videos` and `analyses` tables
- ☐ Create RLS policy: `users can only see their own videos`
- ☐ Test RLS by creating videos as different users
- ☐ Add user profile endpoint (`GET /api/users/me`)
- ☐ Build user profile page in frontend
- ☐ Add email confirmation flow (optional for MVP)

**Supabase SQL for RLS:**
```sql
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own videos"
ON videos FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own videos"
ON videos FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own videos"
ON videos FOR UPDATE
USING (auth.uid() = user_id);

-- Same for analyses table
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analyses"
ON analyses FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM videos
    WHERE videos.id = analyses.video_id
    AND videos.user_id = auth.uid()
  )
);
```

**Success Metric:** Users can only access their own videos, not others'

**Time Saved:** 2 hours (RLS is built-in, no manual access control logic)

---

### Day 6 (Mon, Jan 20) - Supabase Storage Setup

**Tasks (4 hours):**
- ☐ Create storage bucket `videos` in Supabase dashboard
- ☐ Set bucket to private (authenticated users only)
- ☐ Configure RLS for storage: users can upload to `user_id/video_id` path
- ☐ Test upload via dashboard
- ☐ Generate signed URLs for video streaming

**Supabase Storage RLS:**
```sql
CREATE POLICY "Users can upload own videos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'videos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own videos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'videos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

**Success Metric:** Videos upload to Supabase Storage, accessible via signed URLs

**Time Saved:** 5 hours (no AWS S3 setup, CORS, IAM policies)

---

### Day 7 (Tue, Jan 21) - Video Upload Integration

**Tasks (6 hours):**
- ☐ Update upload endpoint to save to Supabase Storage
- ☐ Store video metadata in `videos` table
- ☐ Implement resumable uploads for large files (5GB max)
- ☐ Generate signed URLs (valid for 1 hour)
- ☐ Update frontend to use Supabase upload

**Backend Implementation:**
```python
# Upload to Supabase Storage
video_path = f"{user_id}/{video_id}.mp4"
supabase.storage.from_("videos").upload(video_path, video_file)

# Get signed URL
signed_url = supabase.storage.from_("videos").create_signed_url(video_path, 3600)
```

**Success Metric:** Videos upload to Supabase, stream in results page

---

## 🚀 Week 2: Background Jobs & Video Processing (Jan 22-28)

**Goal:** Implement Redis/Celery for background processing (Supabase doesn't handle this)

### Day 8-9 (Wed-Thu, Jan 22-23) - Redis & Celery Setup

**Tasks (10 hours total):**
- ☐ Install Redis locally (or use Upstash free tier)
- ☐ Install Celery and configure with Redis broker
- ☐ Create `process_video` Celery task
- ☐ Update upload endpoint to trigger background job
- ☐ Store job status in `video_processing_jobs` Supabase table

**Why Supabase Can't Replace This:**
Supabase Edge Functions have 100-second timeout limit, but video processing takes 30-60 seconds. Need dedicated workers.

**Files:** `backend/app/tasks/celery_app.py`, `backend/app/tasks/video_processing.py`

**Success Metric:** Videos process in background, status updates in database

---

### Day 10-11 (Fri-Sat, Jan 24-25) - Job Status Tracking with Supabase Realtime

**Tasks (10 hours total):**
- ☐ Add `status` field to `videos` table (pending/processing/completed/failed)
- ☐ Update Celery task to write status to Supabase
- ☐ Implement Supabase Realtime subscription in frontend
- ☐ Remove polling, use WebSocket updates instead
- ☐ Add retry logic for failed jobs

**Frontend (Realtime Updates):**
```typescript
// Subscribe to video status changes
const subscription = supabase
  .channel('video-updates')
  .on('postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'videos',
      filter: `id=eq.${videoId}`
    },
    (payload) => setVideoStatus(payload.new.status)
  )
  .subscribe()
```

**Success Metric:** Real-time progress updates without polling

**Time Saved:** 2 hours (no custom WebSocket server, Supabase handles it)

---

### Day 12 (Sun, Jan 26) - Rate Limiting & Security

**Tasks (5 hours):**
- ☐ Implement rate limiting using Supabase RLS + triggers
- ☐ Add API key authentication for external access (optional)
- ☐ Configure CORS in FastAPI for Supabase
- ☐ Add input validation for all endpoints

**Supabase Rate Limiting (SQL Function):**
```sql
CREATE OR REPLACE FUNCTION check_upload_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM videos
      WHERE user_id = NEW.user_id
      AND created_at > NOW() - INTERVAL '1 day') >= 10 THEN
    RAISE EXCEPTION 'Daily upload limit exceeded';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_upload_limit
BEFORE INSERT ON videos
FOR EACH ROW EXECUTE FUNCTION check_upload_limit();
```

**Success Metric:** Users blocked after 10 uploads/day (free tier)

---

### Day 13-14 (Mon-Tue, Jan 27-28) - Error Handling & Monitoring

**Tasks (8 hours total):**
- ☐ Integrate Sentry for error tracking
- ☐ Add structured logging to Celery tasks
- ☐ Create error notification system (email users on failed processing)
- ☐ Build admin dashboard in Supabase to monitor jobs
- ☐ Test failure scenarios (invalid video, API timeout)

**Success Metric:** All errors logged to Sentry, users notified on failures

---

## 📱 Week 3: User Experience & History (Jan 29 - Feb 4)

**Goal:** Build video history, profile management, mobile responsiveness

### Day 15 (Wed, Jan 29) - Video History with Supabase Queries

**Tasks (4 hours):**
- ☐ Create `GET /api/users/me/videos` endpoint using Supabase filters
- ☐ Add pagination with `.range(start, end)`
- ☐ Add sorting by date, score, title
- ☐ Implement video deletion (soft delete with `deleted_at` field)

**Backend (Supabase Query):**
```python
videos = supabase.table("videos") \
  .select("*") \
  .eq("user_id", user_id) \
  .is_("deleted_at", "null") \
  .order("created_at", desc=True) \
  .range(0, 19) \
  .execute()
```

**Success Metric:** Paginated video list with filtering

**Time Saved:** 2 hours (no custom SQL, Supabase auto-generates queries)

---

### Day 16-17 (Thu-Fri, Jan 30-31) - Frontend Video History & Profile

**Tasks (10 hours total):**
- ☐ Build VideoHistory page with infinite scroll
- ☐ Create video card component with thumbnail, score
- ☐ Add delete confirmation modal
- ☐ Build Profile page showing user stats
- ☐ Add password change via `supabase.auth.updateUser()`

**Success Metric:** Users can browse, filter, delete videos and update profile

---

### Day 18-19 (Sat-Sun, Feb 1-2) - Mobile Responsiveness

**Tasks (10 hours total):**
- ☐ Audit all pages on mobile (320px-768px)
- ☐ Optimize upload flow for mobile
- ☐ Make results dashboard touch-friendly
- ☐ Add mobile navigation menu
- ☐ Test on iOS Safari and Android Chrome

**Success Metric:** All features work smoothly on mobile

---

### Day 20-21 (Mon-Tue, Feb 3-4) - Onboarding & UX Polish

**Tasks (8 hours total):**
- ☐ Create welcome tour for new users
- ☐ Add sample video with pre-computed results
- ☐ Improve processing UI with stage indicators
- ☐ Add tooltips and help text
- ☐ Optimize page load times

**Success Metric:** First-time users understand how to use the app

---

## 🤖 Week 4: AI Optimization & Billing (Feb 5-11)

**Goal:** Improve AI accuracy, integrate Stripe subscriptions

### Day 22-24 (Wed-Fri, Feb 5-7) - AI Improvements

**Tasks (15 hours total):**
- ☐ Implement confidence filtering (threshold > 0.7)
- ☐ Add temporal clustering algorithm
- ☐ Build AI service abstraction layer
- ☐ Test on 20 sample videos, measure improvement
- ☐ Add cost tracking to Supabase `api_usage` table

**Files:** `backend/app/services/ai/`, `backend/twelvelabs/analysis.py`

**Success Metric:** 50% improvement in timestamp accuracy

---

### Day 25-26 (Sat-Sun, Feb 8-9) - Stripe Integration

**Tasks (12 hours total):**
- ☐ Create Stripe account and products (Free, Individual $19, Pro $49)
- ☐ Install Stripe SDK
- ☐ Build `POST /api/billing/create-checkout` endpoint
- ☐ Implement webhook handler for subscription events
- ☐ Store subscription status in Supabase `subscriptions` table
- ☐ Link Stripe customer ID to Supabase user

**Supabase Table:**
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT CHECK (plan IN ('free', 'individual', 'pro')),
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Success Metric:** Subscriptions sync between Stripe and Supabase

---

### Day 27-28 (Mon-Tue, Feb 10-11) - Usage Limits & Billing UI

**Tasks (10 hours total):**
- ☐ Track monthly video uploads in Supabase
- ☐ Enforce tier limits (2 free, 20 individual, 100 pro)
- ☐ Build Pricing page in frontend
- ☐ Create Subscription management page
- ☐ Add upgrade prompts when limits reached
- ☐ Test payment flow end-to-end

**Success Metric:** Users can subscribe, usage limits enforced

---

## ☁️ Week 5: Cloud Run Deployment (Feb 12-18)

**Goal:** Deploy to production on Google Cloud Run

### Day 29 (Wed, Feb 12) - Google Cloud Setup

**Tasks (5 hours):**
- ☐ Create Google Cloud account (free $300 credit)
- ☐ Enable Cloud Run, Cloud Build, Container Registry APIs
- ☐ Install `gcloud` CLI and authenticate
- ☐ Create project: `gcloud projects create coherence-prod`
- ☐ Link billing account

**Commands:**
```bash
gcloud auth login
gcloud config set project coherence-prod
gcloud services enable run.googleapis.com cloudbuild.googleapis.com
```

**Success Metric:** Google Cloud project ready

---

### Day 30 (Thu, Feb 13) - Deploy Backend to Cloud Run

**Tasks (6 hours):**
- ☐ Create `Dockerfile` in `backend/` directory
- ☐ Test Docker build locally: `docker build -t coherence-api .`
- ☐ Deploy to Cloud Run: `gcloud run deploy coherence-api --source . --region us-central1`
- ☐ Configure environment variables (Supabase keys, AI API keys)
- ☐ Test API endpoint (Cloud Run gives you HTTPS URL)

**Files:** `backend/Dockerfile`

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for video processing
RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Cloud Run sets PORT env var
ENV PORT=8080
CMD uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

**Set Environment Variables:**
```bash
gcloud run services update coherence-api \
  --set-env-vars="SUPABASE_URL=https://xxx.supabase.co" \
  --set-env-vars="SUPABASE_KEY=eyJxxx..." \
  --set-env-vars="TWELVELABS_API_KEY=xxx" \
  --region=us-central1
```

**Success Metric:** FastAPI docs accessible at `https://coherence-api-xxx.run.app/docs`

**Time Saved:** 2 hours vs Railway (no manual container registry setup)

---

### Day 31 (Fri, Feb 14) - Deploy Celery Workers as Cloud Run Jobs

**Tasks (6 hours):**
- ☐ Create separate Dockerfile for Celery worker
- ☐ Deploy as Cloud Run Job (long-running task)
- ☐ Configure Upstash Redis connection
- ☐ Test video processing end-to-end
- ☐ Set max instances to 3 (cost control)

**Files:** `backend/Dockerfile.worker`

```dockerfile
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y ffmpeg \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Run Celery worker
CMD celery -A app.tasks.celery_app worker --loglevel=info --concurrency=2
```

**Deploy Worker:**
```bash
gcloud run jobs create coherence-worker \
  --image=gcr.io/coherence-prod/coherence-worker \
  --region=us-central1 \
  --memory=4Gi \
  --cpu=2 \
  --max-retries=3 \
  --task-timeout=10m
```

**Alternative (Simpler):** Use **Cloud Tasks** to trigger video processing instead of Celery
- Eliminates need for Redis/Celery
- Cloud Run API endpoint processes videos directly
- Google manages queue/retries automatically

**Success Metric:** Videos process successfully via worker

---

### Day 32 (Sat, Feb 15) - CI/CD with Cloud Build

**Tasks (5 hours):**
- ☐ Create `cloudbuild.yaml` for auto-deployment
- ☐ Connect GitHub repo to Cloud Build
- ☐ Enable auto-deploy on push to `main` branch
- ☐ Test deployment by pushing code change
- ☐ Add deployment notifications to Slack

**Files:** `cloudbuild.yaml` (root directory)

```yaml
steps:
  # Build API container
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/coherence-api', './backend']

  # Push to Container Registry
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/coherence-api']

  # Deploy to Cloud Run
  - name: 'gcr.io/cloud-builders/gcloud'
    args:
      - 'run'
      - 'deploy'
      - 'coherence-api'
      - '--image=gcr.io/$PROJECT_ID/coherence-api'
      - '--region=us-central1'
      - '--platform=managed'

timeout: 1200s  # 20 minutes
```

**Connect GitHub:**
```bash
gcloud builds triggers create github \
  --repo-name=coherence \
  --repo-owner=ramizik \
  --branch-pattern="^main$" \
  --build-config=cloudbuild.yaml
```

**Success Metric:** Push to `main` auto-deploys to Cloud Run

---

### Day 33 (Sun, Feb 16) - Frontend Deployment to Vercel

**Tasks (4 hours):**
- ☐ Create Vercel account and connect GitHub repo
- ☐ Configure build settings (Vite React app)
- ☐ Set environment variables (Supabase keys, Cloud Run API URL)
- ☐ Deploy and test production build
- ☐ Configure custom domain (optional)

**Vercel Config:**
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "VITE_SUPABASE_URL": "@supabase_url",
    "VITE_SUPABASE_ANON_KEY": "@supabase_anon_key",
    "VITE_API_URL": "https://coherence-api-xxx.run.app"
  }
}
```

**Success Metric:** Frontend deployed at `https://coherence.vercel.app`

---

### Day 34-35 (Mon-Tue, Feb 17-18) - Monitoring & Beta Testing

**Tasks (10 hours total):**
- ☐ Set up Cloud Run metrics dashboard
- ☐ Configure error tracking (Sentry)
- ☐ Add Cloud Run logging (automatic)
- ☐ Invite 20 beta users
- ☐ Monitor performance (cold starts, latency)

**Cloud Run Monitoring (Free):**
- Request count, latency, errors automatically tracked
- View in Google Cloud Console → Cloud Run → Metrics
- Set up alerts for 5xx errors

**Success Metric:** 15+ beta users, system stable

---

## 🎯 Current Focus

**Active Phase:** `PHASE_1_FOUNDATION` - Week 1: Supabase Foundation & Auth
**Current Date:** January 15, 2025
**Current Day:** Day 1 (Wed, Jan 15) - Supabase Project Setup

**Today's Tasks:**
- ☐ Create Supabase project
- ☐ Design database schema
- ☐ Create `videos` and `analyses` tables

**✅ Completed (Hackathon MVP):**
- ✅ Core video analysis pipeline
- ✅ Visual-verbal dissonance detection
- ✅ Interactive results dashboard
- ✅ Basic API endpoints

**Blockers:** None
**Next Checkpoint:** Day 2 (Thu, Jan 16) - Supabase Auth Integration

---

## 🏗️ Technology Stack (Updated)

### Backend
- **Framework:** FastAPI (Python 3.10+)
- **Database & Auth:** Supabase (PostgreSQL + Auth + Storage)
- **Queue:** Celery + Redis (Upstash) for background jobs
- **Deployment:** Google Cloud Run

### Frontend
- **Framework:** Vite + React 18 (TypeScript)
- **UI Library:** TailwindCSS + shadcn/ui
- **Auth:** Supabase JS SDK
- **Deployment:** Vercel

### AI Services (Flexible)
- **Video Analysis:** TwelveLabs (current) or alternatives
- **Speech:** Deepgram (current) or alternatives
- **Coaching:** Gemini (current) or alternatives

### Why Supabase?
- **Time Savings:** 15+ hours saved vs custom PostgreSQL + auth setup
- **Built-in Features:** Auth, RLS, Storage, Realtime subscriptions
- **Developer Experience:** Dashboard, SQL editor, automatic migrations
- **Cost:** Free tier generous for MVP, scales to production

---

## 📈 Success Metrics

### Technical Metrics
- Video processing time: <30 seconds for 3-minute videos
- API response time: <200ms (p95)
- Uptime: 99.9%
- Error rate: <0.1%

### Product Metrics
- User activation rate: >60%
- Monthly active users growth: 20% MoM
- Analysis completion rate: >80%
- User retention (30-day): >40%

### Business Metrics
- Customer acquisition cost (CAC)
- Lifetime value (LTV)
- Monthly recurring revenue (MRR)
- Churn rate: <5%

---

**Last Updated:** January 15, 2025
**Vision:** Make confident presentation skills accessible to everyone through AI-powered coaching.
