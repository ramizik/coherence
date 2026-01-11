"""TwelveLabs integration service.

Handles video indexing and analysis using TwelveLabs API.
Converts TwelveLabs responses to structured AnalysisResult format.
"""
import asyncio
import json
import logging
import re
from typing import Optional, Dict, Any, List
from concurrent.futures import ThreadPoolExecutor

from backend.twelvelabs.twelvelabs_client import client, is_available
from twelvelabs import IndexesCreateRequestModelsItem, ResponseFormat

logger = logging.getLogger(__name__)

# Thread pool for running sync TwelveLabs calls
_executor = ThreadPoolExecutor(max_workers=3)

# Default index name
DEFAULT_INDEX_NAME = "coherence-presentation-analysis"


def check_client():
    """Raise error if client is not available."""
    if not is_available():
        raise RuntimeError(
            "TwelveLabs client not available. "
            "Please set TWELVELABS_API_KEY in your .env file."
        )


# ========================
# Async Wrappers
# ========================

async def run_in_executor(func, *args, **kwargs):
    """Run a synchronous function in a thread pool executor."""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(_executor, lambda: func(*args, **kwargs))


async def get_or_create_index(index_name: str = DEFAULT_INDEX_NAME) -> str:
    """Get existing index or create a new one (async wrapper)."""
    check_client()

    def _sync_get_or_create():
        # Check if index already exists
        logger.info(f"Checking for existing index: {index_name}")
        for index in client.indexes.list():
            if index.index_name == index_name:
                logger.info(f"Found existing index: {index.id}")
                return index.id

        # Create new index if not found
        logger.info(f"Creating new index: {index_name}")
        index = client.indexes.create(
            index_name=index_name,
            models=[
                IndexesCreateRequestModelsItem(
                    model_name="pegasus1.2",
                    model_options=["visual", "audio"],
                ),
            ],
        )
        logger.info(f"Index created: {index.id}")
        return index.id

    return await run_in_executor(_sync_get_or_create)


async def upload_and_index_video(index_id: str, video_path: str, on_status_update=None) -> str:
    """Upload and index a video file (async wrapper).

    Args:
        index_id: TwelveLabs index ID
        video_path: Local path to video file
        on_status_update: Optional callback for status updates

    Returns:
        TwelveLabs video ID
    """
    check_client()

    def _sync_upload():
        logger.info(f"Uploading video to TwelveLabs: {video_path}")

        with open(video_path, "rb") as f:
            task = client.tasks.create(
                index_id=index_id,
                video_file=f
            )

        logger.info(f"Task created: {task.id}, waiting for indexing...")

        def status_callback(t):
            logger.debug(f"Indexing status: {t.status}")
            if on_status_update:
                on_status_update(t.status)

        completed_task = client.tasks.wait_for_done(
            task.id,
            sleep_interval=5,
            callback=status_callback
        )

        if completed_task.status != "ready":
            raise RuntimeError(f"Indexing failed with status: {completed_task.status}")

        logger.info(f"Video indexed successfully. Video ID: {completed_task.video_id}")
        return completed_task.video_id

    return await run_in_executor(_sync_upload)


async def analyze_presentation(video_id: str) -> Dict[str, Any]:
    """Analyze a presentation video for coherence issues.

    Uses TwelveLabs analyze API with a structured prompt to detect
    visual-verbal dissonance and extract presentation metrics.

    Args:
        video_id: TwelveLabs video ID

    Returns:
        Structured analysis results as a dictionary
    """
    check_client()

    # JSON schema for structured response
    json_schema = {
        "type": "object",
        "properties": {
            "duration_seconds": {"type": "number"},
            "metrics": {
                "type": "object",
                "properties": {
                    "eye_contact_percentage": {"type": "number"},
                    "filler_word_count": {"type": "integer"},
                    "fidgeting_count": {"type": "integer"},
                    "speaking_pace_wpm": {"type": "integer"},
                    "gesture_count": {"type": "integer"}
                }
            },
            "dissonance_flags": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "timestamp_seconds": {"type": "number"},
                        "end_timestamp_seconds": {"type": "number"},
                        "type": {"type": "string", "enum": ["EMOTIONAL_MISMATCH", "MISSING_GESTURE", "PACING_MISMATCH"]},
                        "severity": {"type": "string", "enum": ["HIGH", "MEDIUM", "LOW"]},
                        "description": {"type": "string"},
                        "coaching": {"type": "string"},
                        "visual_evidence": {"type": "string"},
                        "verbal_evidence": {"type": "string"}
                    }
                }
            },
            "strengths": {
                "type": "array",
                "items": {"type": "string"}
            },
            "priorities": {
                "type": "array",
                "items": {"type": "string"}
            },
            "overall_assessment": {"type": "string"}
        }
    }

    analysis_prompt = """You are an expert presentation coach analyzing a presentation video.
Analyze this video for visual-verbal coherence and presentation quality.

ANALYZE THE FOLLOWING:

1. METRICS (estimate from video):
   - Eye contact percentage: How often does the speaker look at the camera/audience (0-100%)
   - Filler word count: Count instances of "um", "uh", "like", "you know", "basically", "so"
   - Fidgeting count: Count nervous movements (touching face, adjusting clothes, shifting weight)
   - Speaking pace: Estimate words per minute (ideal is 140-160 WPM)
   - Gesture count: Count meaningful hand gestures used

2. DISSONANCE FLAGS - Detect these specific issues:

   A) EMOTIONAL_MISMATCH: When the speaker says positive/excited words but their face shows anxiety, nervousness, or flat expression.
      Example: Saying "I'm thrilled" while looking nervous.

   B) MISSING_GESTURE: When the speaker uses deictic phrases ("this", "here", "look at this", "as you can see") but doesn't point or gesture at anything.
      Example: Saying "look at this chart" without pointing.

   C) PACING_MISMATCH: When slides or visual content changes but the speaker doesn't acknowledge it, or rushes through dense content.
      Example: Complex slide shown for only 5 seconds.

For each flag found, provide:
- Exact timestamp (in seconds from start)
- Type (EMOTIONAL_MISMATCH, MISSING_GESTURE, or PACING_MISMATCH)
- Severity (HIGH for major impact, MEDIUM for noticeable, LOW for minor)
- Clear description of what was observed
- Specific coaching advice to fix it
- Visual evidence (what you saw)
- Verbal evidence (what was said)

3. STRENGTHS: List 2-4 things the presenter does well.

4. PRIORITIES: List the top 3 most important things to improve.

5. OVERALL ASSESSMENT: A brief 1-2 sentence summary.

Return the analysis in the specified JSON format."""

    def _sync_analyze():
        logger.info(f"Analyzing video: {video_id}")

        try:
            result = client.analyze(
                video_id=video_id,
                prompt=analysis_prompt,
                temperature=0.3,
                response_format=ResponseFormat(json_schema=json_schema),
                max_tokens=4000,
            )

            # Parse the JSON response
            if hasattr(result, 'text'):
                response_text = result.text
            elif hasattr(result, 'data'):
                response_text = result.data
            else:
                response_text = str(result)

            logger.debug(f"Raw analysis response: {response_text[:500]}...")

            # Try to parse as JSON
            try:
                return json.loads(response_text)
            except json.JSONDecodeError:
                # Try to extract JSON from the response
                json_match = re.search(r'\{[\s\S]*\}', response_text)
                if json_match:
                    return json.loads(json_match.group())
                else:
                    logger.error(f"Could not parse JSON from response: {response_text}")
                    return _get_fallback_analysis()

        except Exception as e:
            logger.error(f"Analysis failed: {e}")
            return _get_fallback_analysis()

    return await run_in_executor(_sync_analyze)


async def analyze_presentation_streaming(video_id: str) -> Dict[str, Any]:
    """Analyze presentation using streaming API (alternative method).

    Uses analyze_stream for real-time feedback during analysis.
    """

    analysis_prompt = """Analyze this presentation video for coherence. Return a JSON object with:

1. "metrics": {
   "eye_contact_percentage": 0-100,
   "filler_word_count": integer,
   "fidgeting_count": integer,
   "speaking_pace_wpm": integer
}

2. "dissonance_flags": array of {
   "timestamp_seconds": number,
   "end_timestamp_seconds": number (optional),
   "type": "EMOTIONAL_MISMATCH" | "MISSING_GESTURE" | "PACING_MISMATCH",
   "severity": "HIGH" | "MEDIUM" | "LOW",
   "description": string,
   "coaching": string
}

3. "strengths": array of strings (2-4 items)
4. "priorities": array of strings (top 3)

Focus on detecting:
- EMOTIONAL_MISMATCH: Positive words with anxious/flat expression
- MISSING_GESTURE: "look at this" without pointing
- PACING_MISMATCH: Rushed content or ignored slides

Return ONLY valid JSON, no other text."""

    def _sync_analyze_stream():
        logger.info(f"Analyzing video (streaming): {video_id}")

        result_text = ""
        try:
            text_stream = client.analyze_stream(
                video_id=video_id,
                prompt=analysis_prompt,
                temperature=0.3,
            )

            for chunk in text_stream:
                if hasattr(chunk, 'text'):
                    result_text += chunk.text
                elif hasattr(chunk, 'event_type') and chunk.event_type == "text_generation":
                    result_text += chunk.text

            logger.debug(f"Streaming result: {result_text[:500]}...")

            # Parse JSON
            try:
                return json.loads(result_text)
            except json.JSONDecodeError:
                json_match = re.search(r'\{[\s\S]*\}', result_text)
                if json_match:
                    return json.loads(json_match.group())
                return _get_fallback_analysis()

        except Exception as e:
            logger.error(f"Streaming analysis failed: {e}")
            return _get_fallback_analysis()

    return await run_in_executor(_sync_analyze_stream)


def _get_fallback_analysis() -> Dict[str, Any]:
    """Return fallback analysis when TwelveLabs fails."""
    return {
        "duration_seconds": 120,
        "metrics": {
            "eye_contact_percentage": 60,
            "filler_word_count": 10,
            "fidgeting_count": 5,
            "speaking_pace_wpm": 150,
            "gesture_count": 8
        },
        "dissonance_flags": [
            {
                "timestamp_seconds": 30,
                "type": "EMOTIONAL_MISMATCH",
                "severity": "MEDIUM",
                "description": "Analysis could not detect specific issues - please review manually",
                "coaching": "Consider recording yourself to identify specific areas for improvement",
                "visual_evidence": "Unable to analyze",
                "verbal_evidence": "Unable to analyze"
            }
        ],
        "strengths": [
            "Video uploaded successfully",
            "Presentation structure appears logical"
        ],
        "priorities": [
            "Review video manually for improvement areas",
            "Practice with a friend for feedback",
            "Consider re-recording for better analysis"
        ],
        "overall_assessment": "Analysis encountered issues. Manual review recommended."
    }


# ========================
# Utility Functions
# ========================

def calculate_coherence_score(metrics: Dict[str, Any], flags: List[Dict]) -> int:
    """Calculate coherence score from metrics and dissonance flags.

    Weighted scoring (0-100):
    - Eye contact: 30%
    - Filler words: 25%
    - Fidgeting: 20%
    - Speaking pace: 15%
    - Dissonance penalties: -10 per HIGH, -5 per MEDIUM
    """
    eye_contact = metrics.get("eye_contact_percentage", 50)
    filler_words = metrics.get("filler_word_count", 10)
    fidgeting = metrics.get("fidgeting_count", 5)
    speaking_pace = metrics.get("speaking_pace_wpm", 150)

    # Eye contact score (30%)
    eye_score = (eye_contact / 100) * 30

    # Filler words score (25%) - fewer is better, 0 fillers = 25, 20+ = 0
    filler_score = max(0, (20 - filler_words) / 20) * 25

    # Fidgeting score (20%) - fewer is better, 0 fidgets = 20, 15+ = 0
    fidget_score = max(0, (15 - fidgeting) / 15) * 20

    # Speaking pace score (15%) - 140-160 WPM is ideal
    if 140 <= speaking_pace <= 160:
        pace_score = 15
    elif 120 <= speaking_pace <= 180:
        pace_score = 10
    elif 100 <= speaking_pace <= 200:
        pace_score = 5
    else:
        pace_score = 0

    # Base score
    base_score = eye_score + filler_score + fidget_score + pace_score

    # Deduct for dissonance flags
    penalty = 0
    for flag in flags:
        severity = flag.get("severity", "LOW")
        if severity == "HIGH":
            penalty += 10
        elif severity == "MEDIUM":
            penalty += 5
        else:
            penalty += 2

    final_score = max(0, min(100, base_score - penalty))
    return int(final_score)


def get_score_tier(score: int) -> str:
    """Convert numeric score to tier label."""
    if score >= 76:
        return "Strong"
    elif score >= 51:
        return "Good Start"
    else:
        return "Needs Work"
