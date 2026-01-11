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
load_dotenv(env_path)

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
from backend.app.routers import videos
app.include_router(videos.router, prefix="/api/videos", tags=["videos"])


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

    logger.info("=" * 60)
    logger.info("API ready at http://localhost:8000")
    logger.info("=" * 60)
