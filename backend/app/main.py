"""FastAPI main application entry point."""
import os
import logging
import sys
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Load environment variables from .env file in repository root
env_path = Path(__file__).parent.parent.parent / ".env"
print(f"[main.py] Loading .env from: {env_path.resolve()}")
print(f"[main.py] .env exists: {env_path.exists()}")
load_dotenv(env_path, override=True)

# Configure logging to show all application logs
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

# Set log levels for our modules
logging.getLogger("backend").setLevel(logging.INFO)
logging.getLogger("backend.app.services").setLevel(logging.INFO)
logging.getLogger("backend.deepgram").setLevel(logging.INFO)
logging.getLogger("backend.twelvelabs").setLevel(logging.INFO)
logging.getLogger("backend.gemini").setLevel(logging.INFO)

# Reduce noise from third-party libraries
logging.getLogger("httpx").setLevel(logging.WARNING)
logging.getLogger("httpcore").setLevel(logging.WARNING)
logging.getLogger("urllib3").setLevel(logging.WARNING)

logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Coherence API",
    description="AI Presentation Coach - Backend API",
    version="0.1.0",
)

# Configure CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Health check endpoint."""
    return {"status": "ok", "message": "Coherence API is running"}


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy"}


# Include routers
from backend.app.routers import videos, auth
app.include_router(videos.router, prefix="/api/videos", tags=["videos"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])


@app.on_event("startup")
async def startup_event():
    """Log service availability on startup."""
    logger.info("=" * 60)
    logger.info("Coherence API Starting...")
    logger.info("=" * 60)

    # Check TwelveLabs availability
    try:
        from backend.twelvelabs.twelvelabs_client import is_available as tl_available
        if tl_available():
            logger.info("✓ TwelveLabs: AVAILABLE")
        else:
            logger.warning("✗ TwelveLabs: NOT AVAILABLE (check TWELVELABS_API_KEY)")
    except Exception as e:
        logger.warning(f"✗ TwelveLabs: IMPORT FAILED ({e})")

    # Check Deepgram availability
    try:
        from backend.deepgram.deepgram_client import is_available as dg_available
        if dg_available():
            logger.info("✓ Deepgram: AVAILABLE")
        else:
            logger.warning("✗ Deepgram: NOT AVAILABLE (check DEEPGRAM_API_KEY)")
    except Exception as e:
        logger.warning(f"✗ Deepgram: IMPORT FAILED ({e})")

    # Check Gemini availability
    try:
        from backend.gemini.gemini_client import is_available as gm_available
        if gm_available():
            logger.info("✓ Gemini: AVAILABLE")
        else:
            logger.warning("✗ Gemini: NOT AVAILABLE (check GEMINI_API_KEY)")
    except Exception as e:
        logger.warning(f"✗ Gemini: IMPORT FAILED ({e})")

    # Check Supabase availability
    try:
        from backend.app.config import settings
        if settings.SUPABASE_URL and settings.SUPABASE_KEY:
            logger.info("✓ Supabase: CONFIGURED")
        else:
            logger.warning("✗ Supabase: NOT CONFIGURED (check SUPABASE_URL and SUPABASE_KEY)")
    except Exception as e:
        logger.warning(f"✗ Supabase: CONFIGURATION ERROR ({e})")

    logger.info("-" * 60)

    # Check sample video cache status (for demo mode)
    try:
        from backend.app.services.video_service import get_cached_samples_status, SAMPLE_VIDEOS
        cache_status = get_cached_samples_status()
        cached_count = sum(1 for v in cache_status.values() if v)
        total_count = len(SAMPLE_VIDEOS)

        if cached_count == total_count:
            logger.info(f"✓ Sample Cache: ALL CACHED ({cached_count}/{total_count})")
        elif cached_count > 0:
            logger.info(f"~ Sample Cache: PARTIAL ({cached_count}/{total_count})")
            for sample_id, is_cached in cache_status.items():
                status = "✓" if is_cached else "✗"
                logger.info(f"    {status} {sample_id}")
        else:
            logger.warning(f"✗ Sample Cache: NOT CACHED (run: python -m backend.preprocess_samples)")
    except Exception as e:
        logger.warning(f"✗ Sample Cache: CHECK FAILED ({e})")

    logger.info("=" * 60)
    logger.info("API ready at http://localhost:8000")
    logger.info("=" * 60)
