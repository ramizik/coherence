"""Video processing service.

Handles video upload, processing orchestration, and results retrieval.
Uses in-memory storage for hackathon demo (no database).
Integrates with TwelveLabs for real video analysis.
"""
import asyncio
import os
import uuid
from datetime import datetime
from pathlib import Path
from typing import Dict, Optional, List, Any
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

# TwelveLabs integration - check availability at runtime
def _is_twelvelabs_available() -> bool:
    """Check if TwelveLabs service is available."""
    try:
        from backend.twelvelabs.twelvelabs_client import is_available
        return is_available()
    except Exception:
        return False

# Import TwelveLabs service (may fail if dependencies missing)
try:
    from backend.app.services import twelvelabs_service
    TWELVELABS_IMPORTED = True
except Exception as e:
    logging.warning(f"TwelveLabs service import failed: {e}")
    TWELVELABS_IMPORTED = False
    twelvelabs_service = None

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


def _update_status(video_id: str, progress: int, stage: str, eta: Optional[int] = None):
    """Update processing status for a video."""
    _status_storage[video_id] = StatusResponse(
        videoId=video_id,
        status=ProcessingStatus.PROCESSING if progress < 100 else ProcessingStatus.COMPLETE,
        progress=progress,
        stage=stage,
        etaSeconds=eta,
    )
    logger.debug(f"Video {video_id}: {progress}% - {stage}")


def _convert_twelvelabs_to_result(
    video_id: str,
    video_path: str,
    analysis: Dict[str, Any]
) -> AnalysisResult:
    """Convert TwelveLabs analysis response to AnalysisResult schema.

    Args:
        video_id: Our internal video ID
        video_path: Path to the video file
        analysis: Raw analysis from TwelveLabs

    Returns:
        Structured AnalysisResult
    """
    # Extract metrics
    raw_metrics = analysis.get("metrics", {})
    metrics = AnalysisMetrics(
        eyeContact=int(raw_metrics.get("eye_contact_percentage", 60)),
        fillerWords=int(raw_metrics.get("filler_word_count", 10)),
        fidgeting=int(raw_metrics.get("fidgeting_count", 5)),
        speakingPace=int(raw_metrics.get("speaking_pace_wpm", 150)),
        speakingPaceTarget="140-160",
    )

    # Convert dissonance flags
    raw_flags = analysis.get("dissonance_flags", [])
    dissonance_flags: List[DissonanceFlag] = []
    timeline_points: List[TimelinePoint] = []

    for i, flag in enumerate(raw_flags):
        # Map type string to enum
        flag_type_str = flag.get("type", "EMOTIONAL_MISMATCH")
        try:
            flag_type = DissonanceType(flag_type_str)
        except ValueError:
            flag_type = DissonanceType.EMOTIONAL_MISMATCH

        # Map severity string to enum
        severity_str = flag.get("severity", "MEDIUM")
        try:
            severity = Severity(severity_str)
        except ValueError:
            severity = Severity.MEDIUM

        timestamp = float(flag.get("timestamp_seconds", i * 30))
        end_timestamp = flag.get("end_timestamp_seconds")

        dissonance_flags.append(DissonanceFlag(
            id=f"flag-{i+1}",
            timestamp=timestamp,
            endTimestamp=float(end_timestamp) if end_timestamp else None,
            type=flag_type,
            severity=severity,
            description=flag.get("description", "Issue detected"),
            coaching=flag.get("coaching", "Review this section of your presentation"),
            visualEvidence=flag.get("visual_evidence"),
            verbalEvidence=flag.get("verbal_evidence"),
        ))

        # Add to timeline
        timeline_points.append(TimelinePoint(
            timestamp=timestamp,
            severity=severity,
        ))

    # Sort timeline by timestamp
    timeline_points.sort(key=lambda p: p.timestamp)

    # Calculate coherence score
    if TWELVELABS_IMPORTED and twelvelabs_service:
        coherence_score = twelvelabs_service.calculate_coherence_score(raw_metrics, raw_flags)
    else:
        coherence_score = 65

    score_tier = _get_score_tier(coherence_score)

    # Get duration from analysis or default
    duration = float(analysis.get("duration_seconds", 120))

    # Get strengths and priorities
    strengths = analysis.get("strengths", [
        "Video analyzed successfully",
        "Presentation structure detected"
    ])
    priorities = analysis.get("priorities", [
        "Review flagged moments",
        "Practice with feedback",
        "Re-record for comparison"
    ])

    # Determine video URL based on file extension
    video_ext = Path(video_path).suffix if video_path else ".mp4"

    return AnalysisResult(
        videoId=video_id,
        videoUrl=f"/api/videos/{video_id}/stream",
        durationSeconds=duration,
        coherenceScore=coherence_score,
        scoreTier=score_tier,
        metrics=metrics,
        dissonanceFlags=dissonance_flags,
        timelineHeatmap=timeline_points,
        strengths=strengths[:4],  # Max 4 strengths
        priorities=priorities[:3],  # Top 3 priorities
    )


async def _process_video(video_id: str):
    """Background task to process video with TwelveLabs.

    Pipeline:
    1. Get/create TwelveLabs index
    2. Upload video to TwelveLabs
    3. Run analysis
    4. Convert results to our schema
    """
    video_meta = _video_storage.get(video_id)
    if not video_meta:
        logger.error(f"Video metadata not found: {video_id}")
        _status_storage[video_id] = StatusResponse(
            videoId=video_id,
            status=ProcessingStatus.ERROR,
            progress=0,
            stage="Video not found",
            error="Video metadata not found",
        )
        return

    video_path = video_meta.get("path")

    try:
        # Check if TwelveLabs is available at runtime
        twelvelabs_available = TWELVELABS_IMPORTED and _is_twelvelabs_available()

        if twelvelabs_available:
            # ========== REAL TWELVELABS PROCESSING ==========
            logger.info(f"Starting TwelveLabs processing for video: {video_id}")

            # Stage 1: Get or create index
            _update_status(video_id, 5, "Connecting to TwelveLabs...", 90)
            index_id = await twelvelabs_service.get_or_create_index()
            logger.info(f"Using TwelveLabs index: {index_id}")

            # Stage 2: Upload and index video
            _update_status(video_id, 15, "Uploading video to TwelveLabs...", 75)

            def on_indexing_status(status):
                if status == "uploading":
                    _update_status(video_id, 25, "Uploading video...", 65)
                elif status == "indexing":
                    _update_status(video_id, 40, "Indexing video content...", 50)
                elif status == "validating":
                    _update_status(video_id, 50, "Validating video...", 40)

            twelvelabs_video_id = await twelvelabs_service.upload_and_index_video(
                index_id=index_id,
                video_path=video_path,
                on_status_update=on_indexing_status,
            )
            logger.info(f"Video indexed with TwelveLabs ID: {twelvelabs_video_id}")

            # Store TwelveLabs video ID for reference
            _video_storage[video_id]["twelvelabs_video_id"] = twelvelabs_video_id

            # Stage 3: Run presentation analysis
            _update_status(video_id, 60, "Analyzing presentation...", 30)
            analysis = await twelvelabs_service.analyze_presentation(twelvelabs_video_id)
            logger.info(f"Analysis complete for video: {video_id}")

            # Stage 4: Convert to our schema
            _update_status(video_id, 85, "Generating insights...", 10)
            result = _convert_twelvelabs_to_result(video_id, video_path, analysis)

        else:
            # ========== MOCK PROCESSING (TwelveLabs not available) ==========
            logger.warning(f"TwelveLabs not available, using mock analysis for: {video_id}")

            mock_stages = [
                (10, "Preparing video...", 40),
                (30, "Analyzing content...", 30),
                (60, "Detecting patterns...", 20),
                (85, "Generating insights...", 10),
            ]

            for progress, stage, eta in mock_stages:
                _update_status(video_id, progress, stage, eta)
                await asyncio.sleep(2)  # Simulate processing time

            duration = video_meta.get("duration", 120.0)
            result = _generate_mock_result(video_id, duration)

        # Stage 5: Complete
        _results_storage[video_id] = result
        _update_status(video_id, 100, "Analysis complete!", None)
        logger.info(f"Video processing complete: {video_id}")

    except Exception as e:
        logger.error(f"Video processing failed: {video_id} - {e}", exc_info=True)
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
