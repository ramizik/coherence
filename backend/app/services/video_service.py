"""Video processing service.

Handles video upload, processing orchestration, and results retrieval.
Uses in-memory storage for hackathon demo (no database).
"""
import asyncio
import os
import uuid
from datetime import datetime
from pathlib import Path
from typing import Dict, Optional
import logging

from backend.app.models.schemas import (
    AnalysisResult,
    AnalysisMetrics,
    DissonanceFlag,
    TimelinePoint,
    StatusResponse,
    UploadResponse,
    ProcessingStatus,
    ScoreTier,
    Severity,
    DissonanceType,
)

logger = logging.getLogger(__name__)

# ========================
# In-Memory Storage (Demo)
# ========================

# Storage for uploaded videos metadata
_video_storage: Dict[str, dict] = {}

# Storage for processing status
_status_storage: Dict[str, StatusResponse] = {}

# Storage for analysis results
_results_storage: Dict[str, AnalysisResult] = {}

# Path for video file storage
VIDEOS_DIR = Path(__file__).parent.parent.parent.parent / "data" / "videos"


def _ensure_videos_dir():
    """Ensure the videos directory exists."""
    VIDEOS_DIR.mkdir(parents=True, exist_ok=True)


def _get_score_tier(score: int) -> ScoreTier:
    """Convert numeric score to tier."""
    if score >= 76:
        return ScoreTier.STRONG
    elif score >= 51:
        return ScoreTier.GOOD_START
    else:
        return ScoreTier.NEEDS_WORK


# ========================
# Mock Analysis Data
# ========================

def _generate_mock_result(video_id: str, duration: float = 183.0) -> AnalysisResult:
    """Generate mock analysis result for demo purposes.
    
    TODO: Replace with actual TwelveLabs + Deepgram + Gemini analysis
    """
    return AnalysisResult(
        videoId=video_id,
        videoUrl=f"/videos/{video_id}.mp4",
        durationSeconds=duration,
        coherenceScore=67,
        scoreTier=ScoreTier.GOOD_START,
        metrics=AnalysisMetrics(
            eyeContact=62,
            fillerWords=12,
            fidgeting=8,
            speakingPace=156,
            speakingPaceTarget="140-160",
        ),
        dissonanceFlags=[
            DissonanceFlag(
                id="flag-1",
                timestamp=45.2,
                endTimestamp=48.0,
                type=DissonanceType.EMOTIONAL_MISMATCH,
                severity=Severity.HIGH,
                description='Said "thrilled to present" but facial expression showed anxiety',
                coaching="Practice saying this line while smiling in a mirror. Your face should match your excitement.",
                visualEvidence='TwelveLabs: "person looking anxious" at 0:43-0:48',
                verbalEvidence='Deepgram: "thrilled" (positive sentiment)',
            ),
            DissonanceFlag(
                id="flag-2",
                timestamp=83.5,
                type=DissonanceType.MISSING_GESTURE,
                severity=Severity.MEDIUM,
                description='Said "look at this data" without pointing at screen',
                coaching="When referencing visuals, physically point to anchor audience attention.",
                verbalEvidence='Deepgram: deictic phrase "this data" detected',
            ),
            DissonanceFlag(
                id="flag-3",
                timestamp=135.8,
                endTimestamp=149.8,
                type=DissonanceType.PACING_MISMATCH,
                severity=Severity.HIGH,
                description="Slide 4 contains 127 words but only shown for 14 seconds",
                coaching="Either reduce slide text to <50 words or extend explanation to ~45 seconds.",
            ),
        ],
        timelineHeatmap=[
            TimelinePoint(timestamp=12, severity=Severity.LOW),
            TimelinePoint(timestamp=45, severity=Severity.HIGH),
            TimelinePoint(timestamp=83, severity=Severity.MEDIUM),
            TimelinePoint(timestamp=135, severity=Severity.HIGH),
        ],
        strengths=[
            "Clear voice projection",
            "Logical structure",
            "Good pacing overall",
        ],
        priorities=[
            "Reduce nervous fidgeting (8 instances detected)",
            "Increase eye contact with camera (currently 62%, target 80%)",
            "Match facial expressions to emotional language",
        ],
    )


# ========================
# Sample Videos (Pre-cached)
# ========================

SAMPLE_VIDEOS = {
    "sample-1": {
        "title": "Nervous Student",
        "score": 42,
        "duration": 120.0,
    },
    "sample-2": {
        "title": "Confident Pitch",
        "score": 89,
        "duration": 180.0,
    },
    "sample-3": {
        "title": "Mixed Signals",
        "score": 61,
        "duration": 150.0,
    },
}


def _generate_sample_result(sample_id: str) -> AnalysisResult:
    """Generate result for a sample video."""
    sample = SAMPLE_VIDEOS.get(sample_id)
    if not sample:
        raise ValueError(f"Unknown sample: {sample_id}")
    
    result = _generate_mock_result(sample_id, sample["duration"])
    result.coherenceScore = sample["score"]
    result.scoreTier = _get_score_tier(sample["score"])
    return result


# ========================
# Service Functions
# ========================

async def upload_video(
    video_file_content: bytes,
    filename: str,
    content_type: str,
) -> UploadResponse:
    """Handle video upload and start processing.
    
    Args:
        video_file_content: Raw video bytes
        filename: Original filename
        content_type: MIME type
        
    Returns:
        UploadResponse with videoId and estimated processing time
    """
    _ensure_videos_dir()
    
    # Generate unique video ID
    video_id = str(uuid.uuid4())
    
    # Determine file extension
    ext = Path(filename).suffix.lower() or ".mp4"
    if ext not in [".mp4", ".mov", ".webm"]:
        ext = ".mp4"
    
    # Save video file
    video_path = VIDEOS_DIR / f"{video_id}{ext}"
    video_path.write_bytes(video_file_content)
    
    # Store metadata
    _video_storage[video_id] = {
        "id": video_id,
        "filename": filename,
        "path": str(video_path),
        "content_type": content_type,
        "uploaded_at": datetime.utcnow().isoformat(),
        "size_bytes": len(video_file_content),
    }
    
    # Initialize status
    _status_storage[video_id] = StatusResponse(
        videoId=video_id,
        status=ProcessingStatus.QUEUED,
        progress=0,
        stage="Queued for processing...",
        etaSeconds=45,
    )
    
    # Start background processing (non-blocking)
    asyncio.create_task(_process_video(video_id))
    
    logger.info(f"Video uploaded: {video_id} ({filename}, {len(video_file_content)} bytes)")
    
    # TODO: Get actual video duration from file
    duration = 120.0  # Mock duration
    
    return UploadResponse(
        videoId=video_id,
        status="processing",
        estimatedTime=45,
        durationSeconds=duration,
    )


async def _process_video(video_id: str):
    """Background task to process video.
    
    Simulates processing stages for demo.
    TODO: Integrate actual TwelveLabs, Deepgram, Gemini analysis.
    """
    stages = [
        (10, "Extracting audio...", 40),
        (25, "Transcribing speech...", 35),
        (45, "Analyzing body language...", 25),
        (65, "Detecting dissonance patterns...", 15),
        (85, "Generating coaching insights...", 8),
        (100, "Analysis complete!", 0),
    ]
    
    try:
        for progress, stage, eta in stages:
            await asyncio.sleep(2)  # Simulate processing time
            
            _status_storage[video_id] = StatusResponse(
                videoId=video_id,
                status=ProcessingStatus.PROCESSING if progress < 100 else ProcessingStatus.COMPLETE,
                progress=progress,
                stage=stage,
                etaSeconds=eta if progress < 100 else None,
            )
            
            logger.debug(f"Video {video_id}: {progress}% - {stage}")
        
        # Generate and store results
        video_meta = _video_storage.get(video_id, {})
        duration = video_meta.get("duration", 120.0)
        _results_storage[video_id] = _generate_mock_result(video_id, duration)
        
        logger.info(f"Video processing complete: {video_id}")
        
    except Exception as e:
        logger.error(f"Video processing failed: {video_id} - {e}")
        _status_storage[video_id] = StatusResponse(
            videoId=video_id,
            status=ProcessingStatus.ERROR,
            progress=0,
            stage="Processing failed",
            error=str(e),
        )


async def get_video_status(video_id: str) -> Optional[StatusResponse]:
    """Get current processing status for a video.
    
    Args:
        video_id: Video identifier
        
    Returns:
        StatusResponse or None if not found
    """
    return _status_storage.get(video_id)


async def get_video_results(video_id: str) -> Optional[AnalysisResult]:
    """Get analysis results for a video.
    
    Args:
        video_id: Video identifier
        
    Returns:
        AnalysisResult or None if not found/not complete
    """
    # Check if it's a sample video
    if video_id in SAMPLE_VIDEOS:
        return _generate_sample_result(video_id)
    
    return _results_storage.get(video_id)


def get_video_path(video_id: str) -> Optional[Path]:
    """Get the file path for a video.
    
    Args:
        video_id: Video identifier
        
    Returns:
        Path to video file or None if not found
    """
    video_meta = _video_storage.get(video_id)
    if video_meta:
        path = Path(video_meta["path"])
        if path.exists():
            return path
    
    # Check for sample videos in the videos directory
    for ext in [".mp4", ".mov", ".webm"]:
        sample_path = VIDEOS_DIR / f"{video_id}{ext}"
        if sample_path.exists():
            return sample_path
    
    return None


def get_sample_video_ids() -> list:
    """Get list of available sample video IDs."""
    return list(SAMPLE_VIDEOS.keys())


async def get_sample_video(sample_id: str) -> Optional[dict]:
    """Get sample video info.
    
    Args:
        sample_id: Sample video identifier
        
    Returns:
        Dict with videoId and status, or None if not found
    """
    if sample_id not in SAMPLE_VIDEOS:
        return None
    
    return {
        "videoId": sample_id,
        "status": "complete",
    }
