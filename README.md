# 🎯 Coherence - AI Presentation Coach

**Win your next presentation with AI-powered body language feedback.**

Coherence is the first AI platform that detects **visual-verbal dissonance** — when your body language contradicts what you're saying. Built for students, professionals, and anyone who wants to present with confidence.

---

## 🚀 The Problem

- **75% of people** fear public speaking more than death
- **90% of presentation anxiety** stems from lack of objective feedback
- Existing tools (Yoodli, PowerPoint Coach) only analyze audio
- **55% of communication is non-verbal**, yet no tool catches body language mistakes

### What We Catch

❌ **Emotional Mismatch** - Saying "I'm thrilled" with an anxious face
❌ **Missing Gestures** - Saying "look at this chart" without pointing
❌ **Pacing Issues** - Showing dense slides too briefly for comprehension

---

## 🎥 Demo Video

> [Insert 2-minute demo video link here]

**Local Setup:** Run frontend and backend locally for development and testing

---

## 🏗️ Architecture

```
┌─────────────────┐
│   Next.js 14    │  ← Frontend (TypeScript + TailwindCSS)
│  Local Dev      │
└────────┬────────┘
         │ REST API
┌────────▼────────┐
│    FastAPI      │  ← Backend (Python)
│  Local Server   │
└────────┬────────┘
         │
    ┌────┼─────────────────┐
    ▼    ▼                 ▼
┌───────┐ ┌──────────┐ ┌─────────┐
│Twelve │ │ Deepgram │ │ Gemini  │
│ Labs  │ │  (Audio) │ │ (Brain) │
│(Video)│ └──────────┘ └─────────┘
└───────┘
```

### Technology Stack

**Frontend**
- Next.js 14 (App Router) - React framework
- TypeScript - Type safety
- TailwindCSS - Glassmorphic UI
- Lucide React - Icon system

**Backend**
- FastAPI - Python async web framework
- FFmpeg - Video frame extraction
- Pydantic - Data validation

**AI Services**
- **TwelveLabs** - Semantic video search (body language analysis)
- **Deepgram** - Real-time speech transcription
- **Gemini 1.5 Pro** - Multimodal synthesis & dissonance detection

---

## 🎯 Key Features

### 1. Visual-Verbal Dissonance Detection
Our unique AI analyzes three dimensions simultaneously:
- **Speech Content** (what you say)
- **Body Language** (how you look)
- **Slide Pacing** (what you show)

### 2. Actionable Coaching
Not just metrics — we tell you exactly how to improve:
> "You said 'passionate' at 2:15 but your face showed anxiety. **Fix:** Smile with teeth and lean forward 10° when expressing enthusiasm."

### 3. Interactive Timeline
Color-coded heatmap showing exactly when dissonance occurs. Click any moment to jump to that timestamp.

### 4. Coherence Score (0-100)
Weighted algorithm combining:
- Eye contact percentage (30%)
- Filler word count (25%)
- Fidgeting frequency (20%)
- Speaking pace (15%)
- Dissonance penalties (10%)

---

## 📊 Sample Analysis

**Input:** 3-minute MBA pitch video

**Output:**
```json
{
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
      "description": "Said 'thrilled' with anxious expression",
      "coaching": "Smile with teeth, lean forward 10°"
    }
  ]
}
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- FFmpeg installed
- API keys for TwelveLabs, Deepgram, Gemini

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
# Add API endpoint URL to .env.local
npm run dev
# Opens at http://localhost:3000
```

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Add API keys to .env
uvicorn app.main:app --reload
# Runs at http://localhost:8000
```

### Environment Variables

**Frontend** (`.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Backend** (`.env`)
```
TWELVELABS_API_KEY=your_key_here
DEEPGRAM_API_KEY=your_key_here
GEMINI_API_KEY=your_key_here
```

---

## 📁 Project Structure

```
coherence/
├── frontend/
│   ├── app/
│   │   ├── upload/page.tsx
│   │   ├── processing/[id]/page.tsx
│   │   └── results/[id]/page.tsx
│   ├── components/
│   │   ├── ui/
│   │   └── dashboard/
│   └── lib/
│       ├── mock-data.ts
│       └── services/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── routers/
│   │   ├── services/
│   │   └── models/
│   └── tests/
├── docs/
│   ├── CLAUDE.md           # AI assistant guidelines
│   ├── FIGMA_MAKE.md       # Frontend generation spec
│   └── API.md              # API documentation
└── README.md
```

---

## 🎪 Demo Preparation

### Pre-Demo Checklist
- [ ] Index 3 sample videos in TwelveLabs
- [ ] Cache analysis results for instant loading
- [ ] Test offline mode (cached fallback)
- [ ] Verify all API keys are active
- [ ] Rehearse 3-minute pitch 4+ times
- [ ] Test local file upload works smoothly
- [ ] Backup laptop with identical local setup

### Demo Flow (3 minutes)
1. **[0:00-0:30]** Hook - Explain dissonance problem
2. **[0:30-1:30]** Show pre-analyzed sample with red flags
3. **[1:30-2:30]** Live demo - upload & analyze local video
4. **[2:30-3:00]** Close - Market size & CTA

---

## 🧪 Testing

### Run Frontend Tests
```bash
cd frontend
npm test
```

### Run Backend Tests
```bash
cd backend
pytest tests/ -v
```

### Test Coverage Focus
- Upload → Processing → Results flow (critical path)
- API endpoint response shapes
- Dissonance detection logic
- Coherence score calculation

---

## 🎯 Target Users

1. **College Students** (Primary)
   - Final presentations cause 95% anxiety
   - Need objective feedback before high-stakes demos
   - Budget-conscious ($9/month tier)

2. **MBA Students** (Secondary)
   - Pitch competitions with real money at stake
   - Want competitive edge in delivery
   - Willing to pay for premium features

3. **Corporate Sales** (Tertiary)
   - Training teams for client demos
   - B2B sales where delivery = deal closure
   - Enterprise contracts ($99/seat)

---

## 💰 Business Model (Post-Hackathon)

### Freemium SaaS
- **Free Tier:** 1 video/month, basic metrics
- **Student ($9/mo):** 10 videos/month, full coaching
- **Professional ($29/mo):** Unlimited videos, slide analysis
- **Enterprise ($99/seat):** Team analytics, integrations

### Market Opportunity
- **TAM:** 50M students + professionals presenting annually
- **SAM:** 10M active presentation tool users
- **SOM:** 500K early adopters (Year 1 target)

---

## 📚 Documentation

- [Frontend Guidelines](documentation/FIGMA_GUIDELINES.md)
- [Claude Guidelines](CLAUDE.md)

---

## 🐛 Known Limitations (Hackathon Scope)

- ❌ No user authentication
- ❌ No video editing/trimming
- ❌ No database persistence (in-memory cache only)
- ❌ No mobile app (web-only, local-only)
- ❌ No real-time streaming analysis
- ❌ Processing limited to 3-minute videos

---

## 📄 License

MIT License - Built for SB Hacks 2025

---

## 🙏 Acknowledgments

- **TwelveLabs** - Semantic video understanding API
- **Deepgram** - Real-time speech transcription
- **Google** - Gemini 1.5 Pro multimodal AI
- **Next.js** - Frontend framework
- **FastAPI** - Backend framework

---

**Built with ❤️ in 24 hours | SBHacks 2025**