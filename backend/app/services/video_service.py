"""Video processing service.

Handles video upload, processing orchestration, and results retrieval.
Uses in-memory storage for hackathon demo (no database).
Integrates with TwelveLabs and Deepgram for real video analysis.
Supports pre-cached results for demo reliability (offline mode).
"""
import asyncio
import json
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
    TranscriptSegment,
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

# Deepgram integration - check availability at runtime
def _is_deepgram_available() -> bool:
    """Check if Deepgram service is available."""
    try:
        from backend.deepgram.deepgram_client import is_available
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

# Import Deepgram service (may fail if dependencies missing)
try:
    from backend.app.services import deepgram_service
    DEEPGRAM_IMPORTED = True
except Exception as e:
    logging.warning(f"Deepgram service import failed: {e}")
    DEEPGRAM_IMPORTED = False
    deepgram_service = None

# Import Gemini service (may fail if dependencies missing)
try:
    from backend.app.services import gemini_service
    from backend.app.services.gemini_service import is_gemini_available
    GEMINI_IMPORTED = True
except Exception as e:
    logging.warning(f"Gemini service import failed: {e}")
    GEMINI_IMPORTED = False
    gemini_service = None
    is_gemini_available = lambda: False

logger = logging.getLogger(__name__)

# In-memory cache for analysis data (used by Gemini later)
_analysis_cache: Dict[str, Dict[str, Any]] = {}

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

# Path for cached analysis results (pre-processed for demo)
CACHE_DIR = Path(__file__).parent.parent.parent.parent / "data" / "cache"


def _ensure_videos_dir():
    """Ensure the videos directory exists."""
    VIDEOS_DIR.mkdir(parents=True, exist_ok=True)


def _ensure_cache_dir():
    """Ensure the cache directory exists."""
    CACHE_DIR.mkdir(parents=True, exist_ok=True)


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
# Sample Videos (Pre-cached for Demo)
# ========================

SAMPLE_VIDEOS = {
    "sample-1": {
        "title": "Startup Pitch",
        "description": "A strong startup pitch presentation",
        "expected_score": 81,
        "duration": 120.0,
    },
    "sample-2": {
        "title": "Class Presentation",
        "description": "A presentation that needs more practice",
        "expected_score": 42,
        "duration": 180.0,
    },
    "sample-3": {
        "title": "Team Introduction",
        "description": "An average presentation with room for improvement",
        "expected_score": 59,
        "duration": 150.0,
    },
}

# In-memory cache for loaded sample results (loaded from disk on first access)
_sample_results_cache: Dict[str, AnalysisResult] = {}


def _get_cached_result_path(sample_id: str) -> Path:
    """Get the path to a cached result JSON file."""
    return CACHE_DIR / f"{sample_id}_result.json"


def _load_cached_result(sample_id: str) -> Optional[AnalysisResult]:
    """Load a cached result from disk.

    Returns:
        AnalysisResult if cache file exists, None otherwise
    """
    # Check in-memory cache first
    if sample_id in _sample_results_cache:
        logger.info(f"Returning in-memory cached result for: {sample_id}")
        return _sample_results_cache[sample_id]

    # Try to load from disk
    cache_path = _get_cached_result_path(sample_id)
    if not cache_path.exists():
        logger.warning(f"No cached result found for: {sample_id}")
        return None

    try:
        with open(cache_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        # Convert JSON to AnalysisResult
        result = AnalysisResult(**data)

        # Store in memory cache for faster subsequent access
        _sample_results_cache[sample_id] = result
        logger.info(f"Loaded cached result from disk: {sample_id}")

        return result
    except Exception as e:
        logger.error(f"Failed to load cached result for {sample_id}: {e}")
        return None


def save_cached_result(sample_id: str, result: AnalysisResult) -> bool:
    """Save an analysis result to the cache.

    Args:
        sample_id: Sample video identifier
        result: Analysis result to cache

    Returns:
        True if saved successfully, False otherwise
    """
    _ensure_cache_dir()

    cache_path = _get_cached_result_path(sample_id)

    try:
        # Convert to dict and save as JSON
        result_dict = result.model_dump()

        with open(cache_path, "w", encoding="utf-8") as f:
            json.dump(result_dict, f, indent=2, default=str)

        # Also store in memory cache
        _sample_results_cache[sample_id] = result

        logger.info(f"Saved cached result: {cache_path}")
        return True
    except Exception as e:
        logger.error(f"Failed to save cached result for {sample_id}: {e}")
        return False


def _generate_sample_result(sample_id: str) -> AnalysisResult:
    """Get result for a sample video - from cache or generated.

    Prioritizes cached results for instant demo loading.
    Falls back to mock generation if no cache exists.
    """
    # Try to load from cache first (instant access for demo)
    cached = _load_cached_result(sample_id)
    if cached:
        return cached

    # Fall back to mock generation
    sample = SAMPLE_VIDEOS.get(sample_id)
    if not sample:
        raise ValueError(f"Unknown sample: {sample_id}")

    logger.warning(f"No cache for {sample_id}, generating mock result")
    result = _generate_mock_result(sample_id, sample["duration"])
    result.coherenceScore = sample["expected_score"]
    result.scoreTier = _get_score_tier(sample["expected_score"])
    return result


def is_sample_cached(sample_id: str) -> bool:
    """Check if a sample video has cached results."""
    if sample_id in _sample_results_cache:
        return True
    return _get_cached_result_path(sample_id).exists()


def get_cached_samples_status() -> Dict[str, bool]:
    """Get caching status for all sample videos."""
    return {
        sample_id: is_sample_cached(sample_id)
        for sample_id in SAMPLE_VIDEOS.keys()
    }


def get_sample_videos_with_data() -> List[Dict[str, Any]]:
    """Get all sample videos with their actual analysis data.

    Returns list of sample info with real scores from cached results.
    Falls back to placeholder data if cache doesn't exist.
    """
    samples = []

    for sample_id, sample_info in SAMPLE_VIDEOS.items():
        cached = _load_cached_result(sample_id)

        if cached:
            # Use real data from cache
            samples.append({
                "id": sample_id,
                "title": sample_info.get("title", f"Sample {sample_id}"),
                "score": cached.coherenceScore,
                "scoreTier": cached.scoreTier,
                "isCached": True,
                "flagCount": len(cached.dissonanceFlags) if cached.dissonanceFlags else 0,
            })
        else:
            # Fallback to placeholder data
            expected_score = sample_info.get("expected_score", 50)
            samples.append({
                "id": sample_id,
                "title": sample_info.get("title", f"Sample {sample_id}"),
                "score": expected_score,
                "scoreTier": _get_score_tier(expected_score),
                "isCached": False,
                "flagCount": 0,
            })

    return samples


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


def _convert_analysis_to_result(
    video_id: str,
    video_path: str,
    twelvelabs_data: Optional[Dict[str, Any]],
    deepgram_data: Optional[Dict[str, Any]],
) -> AnalysisResult:
    """Convert merged TwelveLabs + Deepgram analysis to AnalysisResult schema.

    Uses TwelveLabs for visual analysis (eye contact, fidgeting, dissonance flags).
    Uses Deepgram for speech analysis (filler words, speaking pace).

    Args:
        video_id: Our internal video ID
        video_path: Path to the video file
        twelvelabs_data: Analysis from TwelveLabs (or None)
        deepgram_data: Transcription from Deepgram (or None)

    Returns:
        Structured AnalysisResult
    """
    # Extract Deepgram metrics (speech-based)
    dg_metrics = {}
    if deepgram_data and DEEPGRAM_IMPORTED and deepgram_service:
        dg_metrics = deepgram_service.extract_metrics_from_transcription(deepgram_data)

    # Extract TwelveLabs metrics (visual-based)
    tl_metrics = twelvelabs_data.get("metrics", {}) if twelvelabs_data else {}

    # Merge metrics: Deepgram for speech, TwelveLabs for visual
    metrics = AnalysisMetrics(
        eyeContact=int(tl_metrics.get("eye_contact_percentage", 60)),
        # Use Deepgram filler count if available, fallback to TwelveLabs
        fillerWords=int(dg_metrics.get("filler_word_count", tl_metrics.get("filler_word_count", 10))),
        fidgeting=int(tl_metrics.get("fidgeting_count", 5)),
        # Use Deepgram speaking pace if available
        speakingPace=int(dg_metrics.get("speaking_pace_wpm", tl_metrics.get("speaking_pace_wpm", 150))),
        speakingPaceTarget="140-160",
    )

    # Convert dissonance flags from TwelveLabs
    raw_flags = twelvelabs_data.get("dissonance_flags", []) if twelvelabs_data else []
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

    # Calculate coherence score using merged metrics
    merged_metrics_for_score = {
        "eye_contact_percentage": metrics.eyeContact,
        "filler_word_count": metrics.fillerWords,
        "fidgeting_count": metrics.fidgeting,
        "speaking_pace_wpm": metrics.speakingPace,
    }

    if TWELVELABS_IMPORTED and twelvelabs_service:
        coherence_score = twelvelabs_service.calculate_coherence_score(merged_metrics_for_score, raw_flags)
    else:
        coherence_score = 65

    score_tier = _get_score_tier(coherence_score)

    # Get duration from Deepgram (more accurate) or TwelveLabs
    duration = float(dg_metrics.get("total_duration_seconds", 0))
    if duration == 0 and twelvelabs_data:
        duration = float(twelvelabs_data.get("duration_seconds", 120))

    # Get strengths and priorities from TwelveLabs
    strengths = []
    priorities = []
    if twelvelabs_data:
        strengths = twelvelabs_data.get("strengths", [])
        priorities = twelvelabs_data.get("priorities", [])

    if not strengths:
        strengths = ["Video analyzed successfully", "Presentation structure detected"]
    if not priorities:
        priorities = ["Review flagged moments", "Practice with feedback", "Re-record for comparison"]

    # Extract transcript segments from Deepgram data
    transcript_segments: List[TranscriptSegment] = []
    if deepgram_data:
        words = deepgram_data.get("words", [])
        if words:
            # Group words into segments (roughly by sentence or time chunks)
            current_segment_words = []
            segment_start = 0.0

            for word_data in words:
                word = word_data.get("word", "")
                start = float(word_data.get("start", 0))
                end = float(word_data.get("end", 0))
                confidence = word_data.get("confidence", 0.9)

                if not current_segment_words:
                    segment_start = start

                current_segment_words.append(word)

                # Create a new segment every ~10 words or at sentence boundaries
                is_sentence_end = word.endswith(('.', '!', '?'))
                if len(current_segment_words) >= 10 or is_sentence_end:
                    transcript_segments.append(TranscriptSegment(
                        text=" ".join(current_segment_words),
                        start=segment_start,
                        end=end,
                        confidence=confidence,
                    ))
                    current_segment_words = []

            # Add remaining words as final segment
            if current_segment_words:
                last_word = words[-1] if words else {}
                transcript_segments.append(TranscriptSegment(
                    text=" ".join(current_segment_words),
                    start=segment_start,
                    end=float(last_word.get("end", segment_start + 1)),
                    confidence=last_word.get("confidence", 0.9),
                ))

    return AnalysisResult(
        videoId=video_id,
        videoUrl=f"/api/videos/{video_id}/stream",
        durationSeconds=duration if duration > 0 else 120,
        coherenceScore=coherence_score,
        scoreTier=score_tier,
        metrics=metrics,
        dissonanceFlags=dissonance_flags,
        timelineHeatmap=timeline_points,
        strengths=strengths[:4],  # Max 4 strengths
        priorities=priorities[:3],  # Top 3 priorities
        transcript=transcript_segments if transcript_segments else None,
    )


def _convert_deepgram_only_result(
    video_id: str,
    video_path: str,
    deepgram_data: Dict[str, Any],
) -> AnalysisResult:
    """Convert Deepgram-only analysis to AnalysisResult.

    Used when TwelveLabs is unavailable but Deepgram works.
    Provides speech metrics but limited visual analysis.
    """
    dg_metrics = {}
    if DEEPGRAM_IMPORTED and deepgram_service:
        dg_metrics = deepgram_service.extract_metrics_from_transcription(deepgram_data)

    metrics = AnalysisMetrics(
        eyeContact=50,  # Default - no visual analysis
        fillerWords=int(dg_metrics.get("filler_word_count", 10)),
        fidgeting=5,  # Default - no visual analysis
        speakingPace=int(dg_metrics.get("speaking_pace_wpm", 150)),
        speakingPaceTarget="140-160",
    )

    # Generate basic dissonance flags from speech patterns
    dissonance_flags: List[DissonanceFlag] = []
    timeline_points: List[TimelinePoint] = []

    # Flag high filler word usage
    if metrics.fillerWords > 15:
        dissonance_flags.append(DissonanceFlag(
            id="flag-filler",
            timestamp=30.0,
            type=DissonanceType.PACING_MISMATCH,
            severity=Severity.MEDIUM,
            description=f"High filler word usage: {metrics.fillerWords} detected",
            coaching="Practice pausing instead of using filler words like 'um' and 'uh'.",
            verbalEvidence=f"Deepgram detected {metrics.fillerWords} filler words",
        ))
        timeline_points.append(TimelinePoint(timestamp=30.0, severity=Severity.MEDIUM))

    # Flag speaking pace issues
    if metrics.speakingPace < 120:
        dissonance_flags.append(DissonanceFlag(
            id="flag-pace-slow",
            timestamp=60.0,
            type=DissonanceType.PACING_MISMATCH,
            severity=Severity.LOW,
            description=f"Speaking pace is slow: {metrics.speakingPace} WPM (target: 140-160)",
            coaching="Try to speak slightly faster to maintain audience engagement.",
        ))
        timeline_points.append(TimelinePoint(timestamp=60.0, severity=Severity.LOW))
    elif metrics.speakingPace > 180:
        dissonance_flags.append(DissonanceFlag(
            id="flag-pace-fast",
            timestamp=60.0,
            type=DissonanceType.PACING_MISMATCH,
            severity=Severity.MEDIUM,
            description=f"Speaking pace is fast: {metrics.speakingPace} WPM (target: 140-160)",
            coaching="Slow down to help your audience process the information.",
        ))
        timeline_points.append(TimelinePoint(timestamp=60.0, severity=Severity.MEDIUM))

    duration = float(dg_metrics.get("total_duration_seconds", 120))

    # Calculate basic score from speech metrics
    filler_penalty = min(20, metrics.fillerWords)
    pace_score = 15 if 140 <= metrics.speakingPace <= 160 else (10 if 120 <= metrics.speakingPace <= 180 else 5)
    coherence_score = max(30, 70 - filler_penalty + pace_score)

    # Extract transcript segments from Deepgram data
    transcript_segments: List[TranscriptSegment] = []
    if deepgram_data:
        words = deepgram_data.get("words", [])
        if words:
            current_segment_words = []
            segment_start = 0.0

            for word_data in words:
                word = word_data.get("word", "")
                start = float(word_data.get("start", 0))
                end = float(word_data.get("end", 0))
                confidence = word_data.get("confidence", 0.9)

                if not current_segment_words:
                    segment_start = start

                current_segment_words.append(word)

                # Create a new segment every ~10 words or at sentence boundaries
                is_sentence_end = word.endswith(('.', '!', '?'))
                if len(current_segment_words) >= 10 or is_sentence_end:
                    transcript_segments.append(TranscriptSegment(
                        text=" ".join(current_segment_words),
                        start=segment_start,
                        end=end,
                        confidence=confidence,
                    ))
                    current_segment_words = []

            # Add remaining words as final segment
            if current_segment_words:
                last_word = words[-1] if words else {}
                transcript_segments.append(TranscriptSegment(
                    text=" ".join(current_segment_words),
                    start=segment_start,
                    end=float(last_word.get("end", segment_start + 1)),
                    confidence=last_word.get("confidence", 0.9),
                ))

    return AnalysisResult(
        videoId=video_id,
        videoUrl=f"/api/videos/{video_id}/stream",
        durationSeconds=duration if duration > 0 else 120,
        coherenceScore=coherence_score,
        scoreTier=_get_score_tier(coherence_score),
        metrics=metrics,
        dissonanceFlags=dissonance_flags,
        timelineHeatmap=timeline_points,
        strengths=[
            "Speech transcribed successfully",
            f"Speaking pace: {metrics.speakingPace} WPM",
        ],
        priorities=[
            "Note: Visual analysis unavailable - only speech analyzed",
            "Consider re-running with TwelveLabs for full analysis",
            f"Reduce filler words (currently {metrics.fillerWords})" if metrics.fillerWords > 5 else "Good filler word control",
        ],
        transcript=transcript_segments if transcript_segments else None,
    )


async def _run_deepgram_analysis(video_id: str, video_path: str) -> Optional[Dict[str, Any]]:
    """Run Deepgram transcription in background.

    Returns transcription result or None if failed/unavailable.
    """
    deepgram_available = DEEPGRAM_IMPORTED and _is_deepgram_available()

    if not deepgram_available:
        logger.warning(f"Deepgram not available for video: {video_id}")
        return None

    try:
        logger.info(f"Starting Deepgram transcription for video: {video_id}")
        result = await deepgram_service.transcribe_video(
            video_path=video_path,
            use_llm_filler_detection=False,  # Fast mode for demo
        )
        logger.info(f"Deepgram transcription complete for video: {video_id}")
        return result
    except Exception as e:
        logger.error(f"Deepgram transcription failed for {video_id}: {e}")
        return None


async def _run_twelvelabs_analysis(
    video_id: str,
    video_path: str,
    on_status_update=None,
) -> Optional[Dict[str, Any]]:
    """Run TwelveLabs video analysis.

    Returns analysis result or None if failed/unavailable.
    """
    twelvelabs_available = TWELVELABS_IMPORTED and _is_twelvelabs_available()

    if not twelvelabs_available:
        logger.warning(f"TwelveLabs not available for video: {video_id}")
        return None

    try:
        logger.info(f"Starting TwelveLabs analysis for video: {video_id}")

        # Get or create index
        index_id = await twelvelabs_service.get_or_create_index()
        logger.info(f"Using TwelveLabs index: {index_id}")

        # Upload and index video
        twelvelabs_video_id = await twelvelabs_service.upload_and_index_video(
            index_id=index_id,
            video_path=video_path,
            on_status_update=on_status_update,
        )
        logger.info(f"Video indexed with TwelveLabs ID: {twelvelabs_video_id}")

        # Store TwelveLabs video ID for reference
        _video_storage[video_id]["twelvelabs_video_id"] = twelvelabs_video_id

        # Run presentation analysis
        analysis = await twelvelabs_service.analyze_presentation(twelvelabs_video_id)
        logger.info(f"TwelveLabs analysis complete for video: {video_id}")

        return analysis
    except Exception as e:
        logger.error(f"TwelveLabs analysis failed for {video_id}: {e}")
        return None


async def _process_video(video_id: str):
    """Background task to process video with TwelveLabs and Deepgram in parallel.

    Pipeline:
    1. Start Deepgram transcription (async)
    2. Start TwelveLabs indexing and analysis (async)
    3. Wait for both to complete
    4. Merge results and convert to schema
    5. Cache for Gemini synthesis (future)
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
        # Check service availability
        twelvelabs_available = TWELVELABS_IMPORTED and _is_twelvelabs_available()
        deepgram_available = DEEPGRAM_IMPORTED and _is_deepgram_available()

        if not twelvelabs_available and not deepgram_available:
            # ========== MOCK PROCESSING (No services available) ==========
            logger.warning(f"No AI services available, using mock analysis for: {video_id}")

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

        else:
            # ========== PARALLEL PROCESSING ==========
            logger.info(f"Starting parallel analysis for video: {video_id}")
            logger.info(f"  - TwelveLabs: {'available' if twelvelabs_available else 'unavailable'}")
            logger.info(f"  - Deepgram: {'available' if deepgram_available else 'unavailable'}")

            _update_status(video_id, 5, "Starting analysis...", 90)

            # Status callback for TwelveLabs
            def on_twelvelabs_status(status):
                if status == "uploading":
                    _update_status(video_id, 15, "Uploading to TwelveLabs...", 75)
                elif status == "indexing":
                    _update_status(video_id, 30, "Analyzing video content...", 55)
                elif status == "validating":
                    _update_status(video_id, 40, "Validating video...", 45)

            # Run both analyses in parallel
            _update_status(video_id, 10, "Transcribing speech & analyzing video...", 80)

            deepgram_task = _run_deepgram_analysis(video_id, video_path)
            twelvelabs_task = _run_twelvelabs_analysis(
                video_id, video_path, on_twelvelabs_status
            )

            # Wait for both to complete
            deepgram_result, twelvelabs_result = await asyncio.gather(
                deepgram_task,
                twelvelabs_task,
                return_exceptions=True,
            )

            # Handle exceptions from gather
            if isinstance(deepgram_result, Exception):
                logger.error(f"Deepgram task exception: {deepgram_result}")
                deepgram_result = None
            if isinstance(twelvelabs_result, Exception):
                logger.error(f"TwelveLabs task exception: {twelvelabs_result}")
                twelvelabs_result = None

            # Store results in cache for Gemini synthesis
            # This structured cache is what Gemini will use to generate its report
            _analysis_cache[video_id] = {
                "deepgram_data": deepgram_result,
                "twelvelabs_data": twelvelabs_result,
                "video_path": video_path,
                "video_duration": video_meta.get("duration", 0),
                "processed_at": datetime.utcnow().isoformat(),
            }
            logger.info(f"Analysis data cached for Gemini: video_id={video_id}")

            _update_status(video_id, 70, "Merging analysis results...", 20)

            # Merge results
            if twelvelabs_result:
                # Use TwelveLabs as base, enhance with Deepgram data
                _update_status(video_id, 80, "Generating insights...", 15)
                result = _convert_analysis_to_result(
                    video_id=video_id,
                    video_path=video_path,
                    twelvelabs_data=twelvelabs_result,
                    deepgram_data=deepgram_result,
                )
            elif deepgram_result:
                # Only Deepgram available - generate basic result
                _update_status(video_id, 80, "Generating insights from speech...", 15)
                result = _convert_deepgram_only_result(
                    video_id=video_id,
                    video_path=video_path,
                    deepgram_data=deepgram_result,
                )
            else:
                # Fallback to mock
                logger.warning(f"Both analyses failed, using mock for: {video_id}")
                duration = video_meta.get("duration", 120.0)
                result = _generate_mock_result(video_id, duration)

            # ========== GEMINI COMPREHENSIVE ANALYSIS ==========
            # Run Gemini to generate comprehensive coaching report
            gemini_available = GEMINI_IMPORTED and is_gemini_available()

            if gemini_available and (deepgram_result or twelvelabs_result):
                _update_status(video_id, 90, "Generating comprehensive coaching report...", 8)
                try:
                    gemini_report = await gemini_service.generate_coaching_report(
                        deepgram_data=deepgram_result,
                        twelvelabs_data=twelvelabs_result,
                        video_duration=video_meta.get("duration", 0),
                    )
                    if gemini_report:
                        result.geminiReport = gemini_report
                        logger.info(f"Gemini coaching report added for video: {video_id}")

                        # Also cache the Gemini result
                        gemini_report_dict = gemini_report.model_dump()
                        _analysis_cache[video_id]["gemini_report"] = gemini_report_dict

                        # ========== LOG GEMINI COACHING REPORT ==========
                        logger.info("=" * 70)
                        logger.info("GEMINI COACHING REPORT")
                        logger.info("=" * 70)
                        logger.info(f"Headline: {gemini_report.headline}")
                        logger.info("-" * 70)
                        logger.info("Coaching Advice:")
                        logger.info(gemini_report.coachingAdvice)
                        logger.info("-" * 70)
                        logger.info(f"Generated At: {gemini_report.generatedAt}")
                        logger.info(f"Model Used: {gemini_report.modelUsed}")
                        logger.info("=" * 70)

                except Exception as e:
                    logger.warning(f"Gemini report generation failed: {e}")
                    # Continue without Gemini report - not critical
            else:
                if not gemini_available:
                    logger.info(f"Gemini not available, skipping coaching report for: {video_id}")

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


# ========================
# Gemini Integration Helpers
# ========================

def get_analysis_cache_for_gemini(video_id: str) -> Optional[Dict[str, Any]]:
    """Get cached analysis data for Gemini report generation.

    This provides access to the raw Deepgram and TwelveLabs data
    that Gemini will use to synthesize a comprehensive report.

    Args:
        video_id: Video identifier

    Returns:
        Dict with deepgram_data, twelvelabs_data, and metadata, or None if not cached
    """
    return _analysis_cache.get(video_id)


def is_analysis_cached(video_id: str) -> bool:
    """Check if analysis data is cached for a video.

    Args:
        video_id: Video identifier

    Returns:
        True if cached data exists for Gemini
    """
    return video_id in _analysis_cache


def get_all_cached_video_ids() -> List[str]:
    """Get list of all video IDs with cached analysis data.

    Returns:
        List of video IDs that have cached analysis ready for Gemini
    """
    return list(_analysis_cache.keys())
