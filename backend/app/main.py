"""FastAPI main application entry point."""
import os
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Load environment variables from .env file in repository root
env_path = Path(__file__).parent.parent.parent / ".env"
load_dotenv(env_path)

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
