#!/usr/bin/env python3
"""Pre-process sample videos and cache results for demo mode.

This script processes sample videos through the full analysis pipeline
(TwelveLabs + Deepgram + Gemini) and caches the results for instant
loading during demos.

Usage:
    # Process all sample videos
    python -m backend.preprocess_samples

    # Process specific video
    python -m backend.preprocess_samples --video ./path/to/video.mp4 --sample-id sample-1

    # List sample video status
    python -m backend.preprocess_samples --status

    # Clear cache
    python -m backend.preprocess_samples --clear-cache

Run from repository root with virtual environment activated.
"""

import argparse
import asyncio
import json
import logging
import shutil
import sys
from pathlib import Path

from dotenv import load_dotenv

# Load environment variables
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Import after env is loaded
from backend.app.services.video_service import (
    SAMPLE_VIDEOS,
    VIDEOS_DIR,
    CACHE_DIR,
    save_cached_result,
    is_sample_cached,
    get_cached_samples_status,
    _ensure_videos_dir,
    _ensure_cache_dir,
)
from backend.app.services import deepgram_service, twelvelabs_service, gemini_service
from backend.app.models.schemas import (
    AnalysisResult,
    AnalysisMetrics,
    DissonanceFlag,
    TimelinePoint,
    TranscriptSegment,
    ScoreTier,
    Severity,
    DissonanceType,
    GeminiReport,
)


def print_header(text: str):
    """Print a formatted header."""
    print()
    print("=" * 60)
    print(f"  {text}")
    print("=" * 60)
    print()


def print_status():
    """Print caching status for all sample videos."""
    print_header("SAMPLE VIDEO CACHE STATUS")

    status = get_cached_samples_status()

    for sample_id, info in SAMPLE_VIDEOS.items():
        cached = status.get(sample_id, False)
        status_icon = "✓" if cached else "✗"
        status_text = "CACHED" if cached else "NOT CACHED"

        print(f"  {status_icon} {sample_id}: {info['title']}")
        print(f"      Status: {status_text}")
        print(f"      Expected Score: {info['expected_score']}")
        print()

    # Check for video files
    print_header("SAMPLE VIDEO FILES")
    _ensure_videos_dir()

    for sample_id in SAMPLE_VIDEOS.keys():
        found = False
        for ext in [".mp4", ".mov", ".webm"]:
            video_path = VIDEOS_DIR / f"{sample_id}{ext}"
            if video_path.exists():
                size_mb = video_path.stat().st_size / (1024 * 1024)
                print(f"  ✓ {sample_id}{ext} ({size_mb:.1f} MB)")
                found = True
                break

        if not found:
            print(f"  ✗ {sample_id} - NO VIDEO FILE FOUND")
            print(f"      Place video at: {VIDEOS_DIR}/{sample_id}.mp4")

    print()


def clear_cache():
    """Clear all cached results."""
    print_header("CLEARING CACHE")

    if CACHE_DIR.exists():
        for cache_file in CACHE_DIR.glob("*_result.json"):
            cache_file.unlink()
            print(f"  Deleted: {cache_file.name}")

        print("\n  Cache cleared!")
    else:
        print("  No cache directory found.")

    print()


def _get_score_tier(score: int) -> ScoreTier:
    """Convert numeric score to tier."""
    if score >= 76:
        return ScoreTier.STRONG
    elif score >= 51:
        return ScoreTier.GOOD_START
    else:
        return ScoreTier.NEEDS_WORK


async def process_video(video_path: Path, sample_id: str) -> AnalysisResult:
    """Process a video through the full analysis pipeline.

    Args:
        video_path: Path to the video file
        sample_id: Sample ID for caching

    Returns:
        Complete AnalysisResult
    """
    logger.info(f"Processing video: {video_path}")
    logger.info(f"Sample ID: {sample_id}")

    # Check service availability
    # Note: Use is_available() functions, not check_client() which raises errors
    from backend.twelvelabs.twelvelabs_client import is_available as tl_is_available
    twelvelabs_available = tl_is_available()
    deepgram_available = deepgram_service._is_deepgram_available()
    gemini_available = gemini_service.is_gemini_available()

    logger.info(f"TwelveLabs: {'available' if twelvelabs_available else 'unavailable'}")
    logger.info(f"Deepgram: {'available' if deepgram_available else 'unavailable'}")
    logger.info(f"Gemini: {'available' if gemini_available else 'unavailable'}")

    if not twelvelabs_available and not deepgram_available:
        raise RuntimeError("At least one AI service (TwelveLabs or Deepgram) must be available")

    # Run analyses in parallel
    deepgram_result = None
    twelvelabs_result = None

    tasks = []

    if deepgram_available:
        logger.info("Starting Deepgram transcription...")
        tasks.append(("deepgram", deepgram_service.transcribe_video(str(video_path))))

    if twelvelabs_available:
        logger.info("Starting TwelveLabs analysis...")
        # Get or create index
        index_id = await twelvelabs_service.get_or_create_index("coherence-demo-samples")
        tasks.append(("twelvelabs", _run_twelvelabs_pipeline(index_id, str(video_path))))

    # Wait for all tasks
    results = {}
    for name, coro in tasks:
        try:
            results[name] = await coro
            logger.info(f"{name} completed successfully")
        except Exception as e:
            logger.error(f"{name} failed: {e}")
            results[name] = None

    deepgram_result = results.get("deepgram")
    twelvelabs_result = results.get("twelvelabs")

    # Build the analysis result
    logger.info("Building analysis result...")

    # Extract metrics
    metrics = _extract_metrics(deepgram_result, twelvelabs_result)

    # Get video duration first (needed for fallback flags)
    duration = 120.0  # Default
    if deepgram_result and "metrics" in deepgram_result:
        duration = deepgram_result["metrics"].get("total_duration_seconds", 120.0)

    # Extract dissonance flags from TwelveLabs
    flags = _extract_flags(twelvelabs_result)

    # If TwelveLabs didn't return any flags, generate coaching flags from metrics
    # This ensures users always see actionable coaching insights
    if not flags:
        logger.info("No TwelveLabs flags detected - generating coaching flags from metrics")
        flags = _generate_coaching_flags_from_metrics(metrics, duration)

    # Calculate score (based on metrics, not penalized by generated flags)
    # Only use TwelveLabs-detected flags for score penalty
    twelvelabs_flags = _extract_flags(twelvelabs_result)
    score = _calculate_score(metrics, twelvelabs_flags)

    # Extract transcript
    transcript = _extract_transcript(deepgram_result)

    # Generate Gemini coaching report
    gemini_report = None
    if gemini_available:
        logger.info("Generating Gemini coaching report...")
        try:
            gemini_report = await gemini_service.generate_coaching_report(
                deepgram_data=deepgram_result,
                twelvelabs_data=twelvelabs_result,
                video_duration=duration,
            )
        except Exception as e:
            logger.warning(f"Gemini report failed: {e}")

    # Build strengths and priorities
    strengths, priorities = _generate_insights(metrics, flags)

    # Create timeline heatmap
    timeline = _create_timeline(flags, duration)

    result = AnalysisResult(
        videoId=sample_id,
        videoUrl=f"/api/videos/{sample_id}/stream",
        durationSeconds=duration,
        coherenceScore=score,
        scoreTier=_get_score_tier(score),
        metrics=metrics,
        dissonanceFlags=flags,
        timelineHeatmap=timeline,
        strengths=strengths,
        priorities=priorities,
        transcript=transcript,
        geminiReport=gemini_report,
    )

    return result


async def _run_twelvelabs_pipeline(index_id: str, video_path: str) -> dict:
    """Run TwelveLabs upload and analysis."""
    # Upload video
    video_id = await twelvelabs_service.upload_and_index_video(index_id, video_path)
    logger.info(f"TwelveLabs video ID: {video_id}")

    # Run analysis
    analysis = await twelvelabs_service.analyze_presentation(video_id)

    # Log the raw response for debugging
    logger.info("=" * 60)
    logger.info("TWELVELABS RAW ANALYSIS RESPONSE:")
    logger.info(f"  Metrics: {analysis.get('metrics', {})}")
    logger.info(f"  Dissonance flags count: {len(analysis.get('dissonance_flags', []))}")
    for i, flag in enumerate(analysis.get('dissonance_flags', [])[:5]):
        logger.info(f"    Flag {i+1}: {flag}")
    logger.info(f"  Strengths: {analysis.get('strengths', [])}")
    logger.info(f"  Priorities: {analysis.get('priorities', [])}")
    logger.info("=" * 60)

    return analysis


def _extract_metrics(deepgram_data: dict, twelvelabs_data: dict) -> AnalysisMetrics:
    """Extract metrics from analysis results."""
    eye_contact = 70  # Default
    filler_words = 0
    fidgeting = 0
    speaking_pace = 150

    if deepgram_data and "metrics" in deepgram_data:
        dm = deepgram_data["metrics"]
        filler_words = dm.get("filler_analysis", {}).get("total_count", 0)
        speaking_pace = dm.get("speaking_pace_wpm", 150)

    if twelvelabs_data and "metrics" in twelvelabs_data:
        tm = twelvelabs_data["metrics"]
        eye_contact = tm.get("eye_contact_percentage", 70)
        fidgeting = tm.get("fidgeting_count", 0)

    return AnalysisMetrics(
        eyeContact=eye_contact,
        fillerWords=filler_words,
        fidgeting=fidgeting,
        speakingPace=speaking_pace,
        speakingPaceTarget="140-160",
    )


def _extract_flags(twelvelabs_data: dict) -> list[DissonanceFlag]:
    """Extract dissonance flags from TwelveLabs analysis."""
    flags = []

    if not twelvelabs_data:
        logger.warning("No TwelveLabs data provided for flag extraction")
        return flags

    raw_flags = twelvelabs_data.get("dissonance_flags", [])
    logger.info(f"Found {len(raw_flags)} raw dissonance flags from TwelveLabs")

    for i, f in enumerate(raw_flags[:10]):  # Max 10 flags
        try:
            # TwelveLabs uses timestamp_seconds, but also check other field names
            timestamp = f.get("timestamp_seconds") or f.get("timestamp") or 0
            end_timestamp = f.get("end_timestamp_seconds") or f.get("endTimestamp") or f.get("end_timestamp")

            flag = DissonanceFlag(
                id=f.get("id", f"flag-{i+1}"),
                timestamp=float(timestamp),
                endTimestamp=float(end_timestamp) if end_timestamp else None,
                type=DissonanceType(f.get("type", "EMOTIONAL_MISMATCH")),
                severity=Severity(f.get("severity", "MEDIUM")),
                description=f.get("description", ""),
                coaching=f.get("coaching", f.get("coaching_tip", "")),
                visualEvidence=f.get("visualEvidence") or f.get("visual_evidence"),
                verbalEvidence=f.get("verbalEvidence") or f.get("verbal_evidence"),
            )
            flags.append(flag)
            logger.info(f"Extracted flag {i+1}: {flag.type.value} at {flag.timestamp}s - {flag.severity.value}")
        except Exception as e:
            logger.warning(f"Failed to parse flag {i}: {e} - Raw data: {f}")

    return flags


def _extract_transcript(deepgram_data: dict) -> list[TranscriptSegment]:
    """Extract transcript segments from Deepgram data."""
    segments = []

    if not deepgram_data:
        return segments

    words = deepgram_data.get("words", [])
    if not words:
        return segments

    # Group words into segments
    current_words = []
    segment_start = 0.0

    for word_data in words:
        word = word_data.get("word", "")
        start = float(word_data.get("start", 0))
        end = float(word_data.get("end", 0))
        confidence = word_data.get("confidence", 0.9)

        if not current_words:
            segment_start = start

        current_words.append(word)

        # Create segment every ~10 words or at sentence boundaries
        if len(current_words) >= 10 or word.endswith(('.', '!', '?')):
            segments.append(TranscriptSegment(
                text=" ".join(current_words),
                start=segment_start,
                end=end,
                confidence=confidence,
            ))
            current_words = []

    # Add remaining words
    if current_words:
        last_word = words[-1] if words else {}
        segments.append(TranscriptSegment(
            text=" ".join(current_words),
            start=segment_start,
            end=float(last_word.get("end", segment_start + 1)),
            confidence=last_word.get("confidence", 0.9),
        ))

    return segments


def _calculate_score(metrics: AnalysisMetrics, flags: list[DissonanceFlag]) -> int:
    """Calculate coherence score."""
    # Base scores
    eye_score = min(30, int((metrics.eyeContact / 100) * 30))

    if metrics.fillerWords <= 5:
        filler_score = 25
    elif metrics.fillerWords >= 20:
        filler_score = 0
    else:
        filler_score = max(0, int((20 - metrics.fillerWords) / 15 * 25))

    if metrics.fidgeting <= 3:
        fidget_score = 20
    elif metrics.fidgeting >= 15:
        fidget_score = 0
    else:
        fidget_score = max(0, int((15 - metrics.fidgeting) / 12 * 20))

    if 140 <= metrics.speakingPace <= 160:
        pace_score = 15
    elif 120 <= metrics.speakingPace < 140 or 160 < metrics.speakingPace <= 180:
        pace_score = 10
    else:
        pace_score = 5

    # Dissonance penalties
    high_flags = sum(1 for f in flags if f.severity == Severity.HIGH)
    medium_flags = sum(1 for f in flags if f.severity == Severity.MEDIUM)
    penalty = (high_flags * 10) + (medium_flags * 5)

    total = eye_score + filler_score + fidget_score + pace_score - penalty
    return max(0, min(100, total))


def _generate_insights(metrics: AnalysisMetrics, flags: list[DissonanceFlag]) -> tuple[list[str], list[str]]:
    """Generate strengths and priorities."""
    strengths = []
    priorities = []

    # Strengths
    if metrics.eyeContact >= 70:
        strengths.append("Strong eye contact with camera")
    if metrics.fillerWords <= 5:
        strengths.append("Clear speech with minimal filler words")
    if metrics.fidgeting <= 3:
        strengths.append("Calm and composed body language")
    if 140 <= metrics.speakingPace <= 160:
        strengths.append("Well-paced delivery")

    if not strengths:
        strengths.append("Good effort and engagement")

    # Priorities
    if metrics.eyeContact < 60:
        priorities.append("Increase eye contact with camera")
    if metrics.fillerWords > 10:
        priorities.append("Reduce filler words (um, uh, like)")
    if metrics.fidgeting > 5:
        priorities.append("Minimize nervous fidgeting")
    if metrics.speakingPace > 180:
        priorities.append("Slow down your speaking pace")
    elif metrics.speakingPace < 120:
        priorities.append("Increase energy and speaking pace")

    # Add flag-based priorities
    for flag in flags[:2]:
        if flag.type == DissonanceType.EMOTIONAL_MISMATCH:
            priorities.append("Match facial expressions to your words")
        elif flag.type == DissonanceType.MISSING_GESTURE:
            priorities.append("Use gestures when referencing content")

    if not priorities:
        priorities.append("Continue practicing for consistency")

    return strengths[:4], priorities[:3]


def _create_timeline(flags: list[DissonanceFlag], duration: float) -> list[TimelinePoint]:
    """Create timeline heatmap from flags."""
    points = []

    for flag in flags:
        points.append(TimelinePoint(
            timestamp=flag.timestamp,
            severity=flag.severity,
        ))

    # Sort by timestamp
    points.sort(key=lambda p: p.timestamp)

    return points


def _generate_coaching_flags_from_metrics(
    metrics: AnalysisMetrics,
    duration: float
) -> list[DissonanceFlag]:
    """Generate coaching flags from metrics when TwelveLabs doesn't detect specific issues.

    This ensures users always see actionable coaching insights, even for good presentations.
    """
    flags = []
    flag_id = 1

    # Generate flags based on metrics thresholds
    # Eye contact: Always room for improvement if < 90%
    if metrics.eyeContact < 90:
        severity = Severity.LOW if metrics.eyeContact >= 70 else (Severity.MEDIUM if metrics.eyeContact >= 50 else Severity.HIGH)
        flags.append(DissonanceFlag(
            id=f"metric-flag-{flag_id}",
            timestamp=duration * 0.25,  # Early in video
            endTimestamp=None,
            type=DissonanceType.EMOTIONAL_MISMATCH,
            severity=severity,
            description=f"Eye contact could be stronger. Try looking directly at the camera more consistently.",
            coaching="Practice the 'triangle method': look at your camera, then left of frame, then right, and back to camera. This creates natural eye movement while maintaining engagement.",
            visualEvidence="Eye contact analysis throughout video",
            verbalEvidence=None,
        ))
        flag_id += 1

    # Filler words: Flag if > 3
    if metrics.fillerWords > 3:
        severity = Severity.LOW if metrics.fillerWords <= 5 else (Severity.MEDIUM if metrics.fillerWords <= 10 else Severity.HIGH)
        flags.append(DissonanceFlag(
            id=f"metric-flag-{flag_id}",
            timestamp=duration * 0.4,
            endTimestamp=None,
            type=DissonanceType.PACING_MISMATCH,
            severity=severity,
            description=f"Detected filler words like 'um', 'uh', or 'like'. These can distract from your message.",
            coaching="Try the 'pause and breathe' technique: when you feel a filler word coming, pause briefly and take a breath instead. Silence is more powerful than fillers.",
            visualEvidence=None,
            verbalEvidence="Filler word detection throughout audio",
        ))
        flag_id += 1

    # Fidgeting: Flag if > 2
    if metrics.fidgeting > 2:
        severity = Severity.LOW if metrics.fidgeting <= 3 else (Severity.MEDIUM if metrics.fidgeting <= 6 else Severity.HIGH)
        flags.append(DissonanceFlag(
            id=f"metric-flag-{flag_id}",
            timestamp=duration * 0.5,
            endTimestamp=None,
            type=DissonanceType.MISSING_GESTURE,
            severity=severity,
            description="Nervous movements detected. This can signal anxiety to your audience.",
            coaching="Ground yourself: before starting, plant your feet firmly and keep your hands visible. If you need to move, make it purposeful - step toward your audience or gesture to emphasize points.",
            visualEvidence="Body language analysis throughout video",
            verbalEvidence=None,
        ))
        flag_id += 1

    # Speaking pace: Flag if outside optimal range
    if metrics.speakingPace < 130 or metrics.speakingPace > 170:
        if metrics.speakingPace < 130:
            severity = Severity.LOW if metrics.speakingPace >= 110 else Severity.MEDIUM
            description = "Your speaking pace is slower than optimal. This might cause the audience to lose engagement."
            coaching = "Try practicing with slightly more energy. Imagine you're telling an exciting story to a friend. Varying your pace keeps audiences engaged."
        else:
            severity = Severity.LOW if metrics.speakingPace <= 180 else Severity.MEDIUM
            description = "Your speaking pace is faster than optimal. The audience may struggle to follow."
            coaching = "Practice the 'headline pause' technique: after each key point, pause for 1-2 seconds. This lets your message sink in and naturally slows your pace."

        flags.append(DissonanceFlag(
            id=f"metric-flag-{flag_id}",
            timestamp=duration * 0.6,
            endTimestamp=None,
            type=DissonanceType.PACING_MISMATCH,
            severity=severity,
            description=description,
            coaching=coaching,
            visualEvidence=None,
            verbalEvidence=f"Speaking pace analysis: {metrics.speakingPace} WPM (optimal: 140-160 WPM)",
        ))
        flag_id += 1

    # Always add at least one positive coaching tip for good presentations
    if not flags:
        flags.append(DissonanceFlag(
            id=f"metric-flag-{flag_id}",
            timestamp=duration * 0.3,
            endTimestamp=None,
            type=DissonanceType.EMOTIONAL_MISMATCH,
            severity=Severity.LOW,
            description="Great presentation! Here's a tip to make it even better: vary your vocal tone for emphasis.",
            coaching="Try the 'word emphasis' technique: identify 2-3 key words in each sentence and emphasize them with slight volume or pitch changes. This adds natural energy and highlights your main points.",
            visualEvidence="Overall presentation quality assessment",
            verbalEvidence="Voice analysis throughout audio",
        ))

    return flags


async def process_sample(sample_id: str, video_path: Path = None):
    """Process a sample video and cache the result."""
    print_header(f"PROCESSING: {sample_id}")

    sample_info = SAMPLE_VIDEOS.get(sample_id)
    if not sample_info:
        print(f"  ERROR: Unknown sample ID: {sample_id}")
        return False

    print(f"  Title: {sample_info['title']}")
    print(f"  Expected Score: {sample_info['expected_score']}")

    # Find video file if not provided
    if video_path is None:
        _ensure_videos_dir()
        for ext in [".mp4", ".mov", ".webm"]:
            potential_path = VIDEOS_DIR / f"{sample_id}{ext}"
            if potential_path.exists():
                video_path = potential_path
                break

    if video_path is None or not video_path.exists():
        print(f"\n  ERROR: No video file found for {sample_id}")
        print(f"  Place video at: {VIDEOS_DIR}/{sample_id}.mp4")
        return False

    print(f"  Video: {video_path}")
    print()

    try:
        # Process the video
        result = await process_video(video_path, sample_id)

        # Save to cache
        if save_cached_result(sample_id, result):
            print(f"\n  ✓ Successfully cached result for {sample_id}")
            print(f"    Coherence Score: {result.coherenceScore}")
            print(f"    Tier: {result.scoreTier.value}")
            print(f"    Flags: {len(result.dissonanceFlags)}")
            print(f"    Transcript Segments: {len(result.transcript or [])}")
            if result.geminiReport:
                print(f"    Gemini Report: Yes")
            return True
        else:
            print(f"\n  ✗ Failed to cache result for {sample_id}")
            return False

    except Exception as e:
        logger.exception(f"Failed to process {sample_id}")
        print(f"\n  ✗ ERROR: {e}")
        return False


async def process_all_samples():
    """Process all sample videos."""
    print_header("PROCESSING ALL SAMPLE VIDEOS")

    _ensure_videos_dir()
    _ensure_cache_dir()

    success_count = 0
    fail_count = 0

    for sample_id in SAMPLE_VIDEOS.keys():
        if await process_sample(sample_id):
            success_count += 1
        else:
            fail_count += 1

    print_header("PROCESSING COMPLETE")
    print(f"  Successful: {success_count}")
    print(f"  Failed: {fail_count}")
    print()

    # Show final status
    print_status()


async def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Pre-process sample videos for demo caching"
    )
    parser.add_argument(
        "--status",
        action="store_true",
        help="Show cache status for all samples"
    )
    parser.add_argument(
        "--clear-cache",
        action="store_true",
        help="Clear all cached results"
    )
    parser.add_argument(
        "--video",
        type=str,
        help="Path to video file to process"
    )
    parser.add_argument(
        "--sample-id",
        type=str,
        choices=list(SAMPLE_VIDEOS.keys()),
        help="Sample ID to use (required with --video)"
    )
    parser.add_argument(
        "--sample",
        type=str,
        choices=list(SAMPLE_VIDEOS.keys()),
        help="Process a specific sample (uses video from data/videos/)"
    )

    args = parser.parse_args()

    if args.status:
        print_status()
        return

    if args.clear_cache:
        clear_cache()
        return

    if args.video:
        if not args.sample_id:
            print("ERROR: --sample-id is required when using --video")
            sys.exit(1)

        video_path = Path(args.video)
        if not video_path.exists():
            print(f"ERROR: Video file not found: {video_path}")
            sys.exit(1)

        await process_sample(args.sample_id, video_path)
        return

    if args.sample:
        await process_sample(args.sample)
        return

    # Default: process all samples
    await process_all_samples()


if __name__ == "__main__":
    asyncio.run(main())
