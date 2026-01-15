# 🗺️ ROADMAP.md - Coherence Production Development Plan

**Last Updated:** January 2026
**Current Phase:** PHASE_1_FOUNDATION
**Status:** 🏆 Hackathon MVP Complete - Transitioning to Production

---

## 📊 Progress Overview

**Hackathon MVP (Complete ✅):**
- ✅ Core video analysis pipeline
- ✅ Visual-verbal dissonance detection
- ✅ Interactive results dashboard
- ✅ Basic API endpoints

**Production Roadmap (In Progress 🚧):**
- 🚧 Phase 1: Foundation & Infrastructure
- ⏳ Phase 2: User Experience & Mobile
- ⏳ Phase 3: Advanced Features
- ⏳ Phase 4: Scale & Optimization
- ⏳ Phase 5: Launch Preparation

---

## 🎯 PHASE 1: Foundation & Infrastructure (Immediate Priorities)

**Goal:** Build production-ready foundation with authentication, database, and scalable architecture.
These foundational elements are **provider-agnostic** and must be built regardless of which AI APIs we use.

### Infrastructure Tasks

- [ ] **INFRA-1.1** Database setup and migration
  - Choose database (PostgreSQL recommended)
  - Set up migration system (Alembic)
  - Design schema for users, videos, analyses
  - **Files:** `backend/database/`, `backend/alembic/`

- [ ] **INFRA-1.2** User authentication system
  - JWT-based authentication
  - User registration/login endpoints
  - Password hashing (bcrypt)
  - Email verification flow
  - **Files:** `backend/app/routers/auth.py`, `backend/app/services/auth_service.py`

- [ ] **INFRA-1.3** Video storage migration
  - Move from local filesystem to cloud storage (S3/GCS)
  - Implement signed URLs for secure access
  - Add video metadata to database
  - **Files:** `backend/app/services/storage_service.py`

- [ ] **INFRA-1.4** Background job system
  - Replace in-memory tasks with proper queue (Celery/RQ)
  - Set up Redis for job queue
  - Implement retry logic and error handling
  - **Files:** `backend/app/tasks/`, `backend/app/workers/`

- [ ] **INFRA-1.5** API rate limiting and security
  - Implement rate limiting per user
  - Add CORS configuration for production domains
  - Input validation and sanitization
  - **Files:** `backend/app/middleware/`

### Backend Tasks

- [ ] **BK-1.1** User management endpoints
  - `POST /api/auth/register` - User registration
  - `POST /api/auth/login` - User login
  - `GET /api/users/me` - Get current user
  - `PUT /api/users/me` - Update user profile
  - **Files:** `backend/app/routers/auth.py`, `backend/app/routers/users.py`

- [ ] **BK-1.2** Video ownership and access control
  - Associate videos with user accounts
  - Implement access control middleware
  - Add video sharing/permissions system
  - **Files:** `backend/app/middleware/auth.py`, `backend/app/services/video_service.py`

- [ ] **BK-1.3** Analysis history and persistence
  - Store analysis results in database
  - Add pagination for user's video list
  - Implement analysis comparison over time
  - **Files:** `backend/app/models/schemas.py`, `backend/app/routers/videos.py`

- [ ] **BK-1.4** Error handling and logging
  - Structured logging (JSON format)
  - Error tracking (Sentry integration)
  - Health check endpoints
  - **Files:** `backend/app/middleware/error_handler.py`

### Frontend Tasks

- [ ] **FE-1.1** Authentication UI
  - Login/Register pages
  - Protected route wrapper
  - Auth context and state management
  - **Files:** `frontend/components/auth/`, `frontend/lib/auth.ts`

- [ ] **FE-1.2** User profile and settings
  - Profile page component
  - Settings page (preferences, account)
  - **Files:** `frontend/components/profile/`, `frontend/components/settings/`

- [ ] **FE-1.3** Video history page
  - List of user's analyzed videos
  - Filtering and sorting
  - **Files:** `frontend/components/history/`

### Success Criteria

✅ Users can register and log in
✅ Videos are associated with user accounts
✅ Analysis results persist in database
✅ Background jobs process videos reliably
✅ API has rate limiting and security measures

**Milestone:** Production-ready foundation with authentication and persistence

---

## 📱 PHASE 2: User Experience & Mobile

**Goal:** Mobile-first responsive design and enhanced UX

### Mobile-First Design

- [ ] **MOBILE-2.1** Responsive layout system
  - Mobile-first breakpoints (320px, 768px, 1024px, 1440px)
  - Touch-friendly interactions
  - Mobile navigation menu
  - **Files:** `frontend/components/layout/`, Tailwind config

- [ ] **MOBILE-2.2** Mobile-optimized upload flow
  - Camera integration for mobile recording
  - File picker with camera option
  - Mobile video preview
  - **Files:** `frontend/components/upload/MobileUpload.tsx`

- [ ] **MOBILE-2.3** Mobile results dashboard
  - Stacked layout for small screens
  - Touch-optimized timeline
  - Swipeable coaching cards
  - **Files:** `frontend/components/results/MobileResults.tsx`

### UX Enhancements

- [ ] **UX-2.1** Onboarding flow
  - Welcome tour for new users
  - Sample video demonstration
  - **Files:** `frontend/components/onboarding/`

- [ ] **UX-2.2** Improved processing experience
  - Better progress indicators
  - Estimated time display
  - Email notifications when complete
  - **Files:** `frontend/components/processing/`

- [ ] **UX-2.3** Enhanced results visualization
  - Interactive charts for metrics over time
  - Comparison with previous analyses
  - Export options (PDF, CSV)
  - **Files:** `frontend/components/results/Charts.tsx`

### Accessibility

- [ ] **A11Y-2.1** WCAG 2.1 AA compliance
  - Keyboard navigation
  - Screen reader support
  - Color contrast improvements
  - **Files:** All components

### Success Criteria

✅ Mobile-responsive design works on all screen sizes
✅ Touch interactions are smooth and intuitive
✅ Onboarding guides new users effectively
✅ Results are accessible and easy to understand
✅ WCAG 2.1 AA compliance achieved

**Milestone:** Polished mobile-first user experience

---

## 🚀 PHASE 3: Advanced Features

**Goal:** Enhanced AI capabilities and advanced coaching features, starting with **Path 1: Optimize Current Stack**.

### Path 1: Optimize Current Stack (Recommended Initial Approach)

We launch with the current TwelveLabs + Deepgram + Gemini stack, but make it production-ready via:

- **AI-3.0.1** TwelveLabs temporal clustering
  - Implement temporal clustering as a post-processing step to group contiguous high-scoring frames into coherent clips
  - Apply temporal smoothing to consolidate adjacent high-scoring segments and suppress isolated spikes
  - **Why:** Reduces irrelevant event detection and improves UX of timeline and flags

- **AI-3.0.2** Confidence score filtering
  - Use TwelveLabs similarity scores to filter out low-confidence matches
  - Tune thresholds based on internal evaluation and early user feedback
  - **Why:** Eliminates noisy detections and improves trust in flags

- **AI-3.0.3** Query optimization (Pegasus 1.2)
  - Use Pegasus 1.2 model with more specific semantic queries (e.g., “nervous fidgeting at podium”, “looking away from camera while speaking”)
  - Evaluate impact on timestamp precision and relevance

- **AI-3.0.4** Cost optimization for current stack
  - Add caching for repeated analysis patterns
  - Implement result memoization for similar video segments
  - Consider batch processing of non-urgent analyses during off-peak hours
  - Track cost per analysis and per provider

### AI Service Exploration

**Note:** AI services are flexible - explore best options for each use case

- [ ] **AI-3.1** Evaluate and optimize AI services
  - Research alternatives to TwelveLabs/Deepgram/Gemini
  - Compare cost, accuracy, latency
  - Implement **service abstraction layer** for easy swapping (video analysis, speech transcription, coaching synthesis)
  - **Files:** `backend/app/services/ai/`

- [ ] **AI-3.2** Enhanced visual analysis
  - Better gesture detection
  - Posture analysis
  - Slide detection and OCR
  - **Files:** `backend/app/services/visual_analysis.py`

- [ ] **AI-3.3** Advanced speech analysis
  - Sentiment analysis over time
  - Tone variation detection
  - Pause pattern analysis
  - **Files:** `backend/app/services/speech_analysis.py`

- [ ] **AI-3.4** Personalized coaching
  - User-specific coaching style preferences
  - Learning from user improvements
  - Customizable coaching focus areas
  - **Files:** `backend/app/services/coaching_service.py`

### Advanced Features

- [ ] **ADV-3.1** Video comparison
  - Compare multiple recordings
  - Track improvement over time
  - **Files:** `frontend/components/comparison/`

- [ ] **ADV-3.2** Practice mode
  - Real-time feedback during recording
  - Live coaching suggestions
  - **Files:** `frontend/components/practice/`

- [ ] **ADV-3.3** Team/group features
  - Share analyses with team
  - Group coaching sessions
  - **Files:** `backend/app/routers/teams.py`, `frontend/components/teams/`

- [ ] **ADV-3.4** Integration with presentation tools
  - PowerPoint/Google Slides integration
  - Slide-specific feedback
  - **Files:** `backend/app/services/integrations/`

### Success Criteria

✅ AI services are optimized for cost and accuracy
✅ Advanced visual and speech analysis implemented
✅ Personalized coaching adapts to user needs
✅ Video comparison and practice modes functional
✅ Team features enable collaborative improvement

**Milestone:** Advanced AI-powered coaching platform

---

## ⚡ PHASE 4: Scale & Optimization

**Goal:** Prepare for production scale and performance, targeting **<30 seconds** processing for 3-minute videos.

### Performance Optimization

- [ ] **PERF-4.1** Video processing optimization
  - Parallel processing improvements
  - Caching strategies
  - CDN for video delivery
  - **Files:** `backend/app/services/video_service.py`

- [ ] **PERF-4.2** Database optimization
  - Query optimization
  - Indexing strategy
  - Connection pooling
  - **Files:** Database migrations, query analysis

- [ ] **PERF-4.3** Frontend performance
  - Code splitting
  - Lazy loading
  - Image optimization
  - **Files:** Vite config, component optimization

### Scalability

- [ ] **SCALE-4.1** Horizontal scaling
  - Load balancer configuration
  - Stateless API design
  - Session management
  - **Files:** Infrastructure configs

- [ ] **SCALE-4.2** Monitoring and observability
  - Application performance monitoring (APM)
  - Error tracking
  - Usage analytics
  - **Files:** `backend/app/monitoring/`

- [ ] **SCALE-4.3** Cost optimization
  - AI service cost analysis
  - Storage optimization
  - Compute resource optimization
  - **Files:** Cost tracking, optimization scripts

### Success Criteria

✅ System handles 1000+ concurrent users
✅ Video processing completes in <30 seconds for 3-minute videos
✅ Database queries are optimized
✅ Frontend loads in <2 seconds
✅ Cost per analysis is optimized

**Milestone:** Scalable, performant production system

---

## 🎯 PHASE 5: Launch Preparation

**Goal:** Production deployment and go-to-market readiness

### Deployment

- [ ] **DEPLOY-5.1** Production infrastructure
  - Set up production environment
  - CI/CD pipeline
  - Environment configuration
  - **Files:** `infrastructure/`, `.github/workflows/`

- [ ] **DEPLOY-5.2** Security hardening
  - Security audit
  - Penetration testing
  - GDPR compliance
  - **Files:** Security documentation

- [ ] **DEPLOY-5.3** Backup and disaster recovery
  - Automated backups
  - Disaster recovery plan
  - Data retention policies
  - **Files:** Backup scripts, DR documentation

### Go-to-Market

- [ ] **GTM-5.1** Pricing and billing
  - Subscription tiers
  - Payment processing (Stripe)
  - Usage-based billing
  - **Files:** `backend/app/routers/billing.py`, `frontend/components/billing/`

- [ ] **GTM-5.2** Marketing website
  - Landing page
  - Pricing page
  - Blog/documentation
  - **Files:** Marketing site (separate repo or subdomain)

- [ ] **GTM-5.3** User onboarding and support
  - Help center
  - In-app tutorials
  - Support ticket system
  - **Files:** `frontend/components/help/`, `backend/app/routers/support.py`

### Success Criteria

✅ Production environment is stable and secure
✅ Billing and subscriptions work correctly
✅ Marketing materials are ready
✅ Support system is operational
✅ Launch checklist is complete

**Milestone:** Production-ready platform ready for users

---

## 🧭 Strategic AI & Provider Strategy

### Path 1: Optimize Current Stack (Launch Path)

1. **Build service abstraction layer** for video analysis, speech transcription, and coaching (Phase 3, early).
2. **Launch with current stack + optimizations** (TwelveLabs + Deepgram + Gemini plus temporal clustering, confidence filtering, caching).
3. **Gather real user data** on:
   - Perceived accuracy of flags and scores
   - User satisfaction with coaching (NPS, qualitative feedback)
4. **A/B test alternatives** with 10–20% of traffic:
   - Swap in alternative providers behind abstraction layer
   - Compare cost, accuracy, latency, and user outcomes
5. **Make data-driven migration decisions**:
   - Keep or replace providers based on measured impact, not assumptions.

### Cost Optimization Tactics

- Cache repeated analysis patterns and memoize similar segments.
- Batch non-urgent processing in off-peak windows.
- Track cost per analysis per provider and per user segment.
- Prefer cheaper providers for non-critical features when quality is similar.

## 🎯 Current Focus

**Active Phase:** `PHASE_1_FOUNDATION`

**Current Tasks:**
- [ ] Set up PostgreSQL database and migrations
- [ ] Implement user authentication system
- [ ] Migrate video storage to cloud (S3/GCS)
- [ ] Set up background job queue (Celery/RQ)

**✅ Completed (Hackathon MVP):**
- ✅ Core video analysis pipeline
- ✅ Visual-verbal dissonance detection
- ✅ Interactive results dashboard
- ✅ Basic API endpoints
- ✅ Frontend-backend integration

**Blockers:** None
**Next Checkpoint:** INFRA-1.1 (Database setup)

---

## 📝 Architecture Decisions

### Technology Choices (Flexible)

**Backend:**
- **Framework:** FastAPI (Python) - Keep for now, evaluate alternatives if needed
- **Database:** PostgreSQL (recommended) or MongoDB
- **Queue:** Celery + Redis or RQ
- **Storage:** AWS S3, Google Cloud Storage, or Azure Blob

**Frontend:**
- **Framework:** Vite + React 18 (TypeScript) - Keep
- **UI Library:** TailwindCSS + shadcn/ui - Keep
- **State Management:** React Context or Zustand
- **Mobile:** Progressive Web App (PWA) or React Native

**AI Services:**
- **Video Analysis:** TwelveLabs (current) or alternatives (OpenAI Vision, custom models)
- **Speech:** Deepgram (current) or alternatives (Whisper, AssemblyAI)
- **Synthesis:** Gemini (current) or alternatives (Claude, GPT-4)

**Deployment:**
- **Backend:** AWS ECS, Google Cloud Run, or Railway
- **Frontend:** Vercel, Netlify, or Cloudflare Pages
- **Database:** Managed PostgreSQL (RDS, Cloud SQL, Supabase)

### Design Principles

- **Mobile-First:** Design for mobile, enhance for desktop
- **User-Centric:** Every feature should solve a real user problem
- **Scalable:** Architecture should support growth
- **Cost-Conscious:** Optimize for cost efficiency
- **Accessible:** WCAG 2.1 AA compliance minimum

---

## 🚨 Risk Mitigation

### Technical Risks

**Risk:** AI service costs scale with usage
- **Mitigation:** Implement caching, optimize API calls, explore alternatives
- **Monitoring:** Track cost per analysis

**Risk:** Video processing bottlenecks
- **Mitigation:** Horizontal scaling, queue system, CDN for delivery
- **Monitoring:** Processing time metrics

**Risk:** Database performance at scale
- **Mitigation:** Proper indexing, query optimization, read replicas
- **Monitoring:** Query performance metrics

### Business Risks

**Risk:** User acquisition and retention
- **Mitigation:** Strong onboarding, valuable features, user feedback loops
- **Monitoring:** User activation and retention metrics

**Risk:** Competition from established players
- **Mitigation:** Focus on unique value (visual-verbal dissonance), iterate quickly
- **Monitoring:** Market research, feature differentiation

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

### User Research & Feedback

- Weekly user interviews during beta to understand workflows and pain points.
- Track NPS (Net Promoter Score) over time.
- Instrument funnels to measure where users drop off (upload, processing, results).

### Business Metrics

- Customer acquisition cost (CAC)
- Lifetime value (LTV)
- Monthly recurring revenue (MRR)
- Churn rate: <5%

---

**Last Updated:** January 2026
**Vision:** Make confident presentation skills accessible to everyone through AI-powered coaching.
