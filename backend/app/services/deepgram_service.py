"""Deepgram async service wrapper for video processing pipeline.

Provides async interface to Deepgram transcription with graceful error handling.
"""
import asyncio
import logging
from pathlib import Path
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)


def _is_deepgram_available() -> bool:
    """Check if Deepgram is available."""
    try:
        from backend.deepgram.deepgram_client import is_available
        return is_available()
    except Exception:
        return False


async def transcribe_video(
    video_path: str,
    use_llm_filler_detection: bool = True,
) -> Optional[Dict[str, Any]]:
    """Transcribe audio from video file using Deepgram.

    Args:
        video_path: Path to video file
        use_llm_filler_detection: Whether to use LLM for contextual filler detection

    Returns:
        Transcription result dict or None if Deepgram unavailable
    """
    if not _is_deepgram_available():
        logger.warning("Deepgram not available, skipping transcription")
        return None

    try:
        from backend.deepgram.transcription import transcribe_audio

        logger.info(f"Starting Deepgram transcription for: {video_path}")

        result = await transcribe_audio(
            audio_path=video_path,
            language="en",
            use_llm_filler_detection=use_llm_filler_detection,
        )

        logger.info(
            f"Deepgram transcription complete: "
            f"{result.metrics.total_words} words, "
            f"{result.metrics.filler_analysis.total_count} fillers, "
            f"{result.metrics.speaking_pace_wpm} WPM"
        )

        return result.to_dict()

    except Exception as e:
        logger.error(f"Deepgram transcription failed: {e}", exc_info=True)
        return None


async def transcribe_video_fast(video_path: str) -> Optional[Dict[str, Any]]:
    """Fast transcription without LLM-based filler detection.

    Use this for faster processing when contextual filler detection isn't needed.
    """
    return await transcribe_video(video_path, use_llm_filler_detection=False)


def extract_metrics_from_transcription(deepgram_data: Dict[str, Any]) -> Dict[str, Any]:
    """Extract key metrics from Deepgram transcription result.

    Args:
        deepgram_data: Raw transcription result from transcribe_video()

    Returns:
        Dict with extracted metrics for use in analysis
    """
    if not deepgram_data:
        return {
            "filler_word_count": 0,
            "speaking_pace_wpm": 150,
            "pause_count": 0,
            "transcript": "",
            "total_words": 0,
        }

    metrics = deepgram_data.get("metrics", {})
    filler_analysis = metrics.get("filler_analysis", {})

    return {
        "filler_word_count": filler_analysis.get("total_count", 0),
        "vocal_disfluency_count": filler_analysis.get("vocal_disfluency_count", 0),
        "contextual_filler_count": filler_analysis.get("contextual_filler_count", 0),
        "filler_rate_per_minute": filler_analysis.get("filler_rate_per_minute", 0),
        "speaking_pace_wpm": metrics.get("speaking_pace_wpm", 150),
        "pause_count": metrics.get("pause_count", 0),
        "total_words": metrics.get("total_words", 0),
        "content_words": metrics.get("content_words", 0),
        "total_duration_seconds": metrics.get("total_duration_seconds", 0),
        "transcript": deepgram_data.get("transcript", ""),
        "words": deepgram_data.get("words", []),
        "confidence": deepgram_data.get("confidence", 0),
    }


def get_filler_word_list(deepgram_data: Dict[str, Any]) -> list:
    """Get list of detected filler words with timestamps.

    Returns list of dicts: [{"word": "um", "start": 1.2, "end": 1.4, "type": "vocal_disfluency"}]
    """
    if not deepgram_data:
        return []

    metrics = deepgram_data.get("metrics", {})
    filler_analysis = metrics.get("filler_analysis", {})
    return filler_analysis.get("filler_words", [])
