"""Gemini service wrapper for video processing pipeline.

This module wraps the backend.gemini module to provide async service functions
for the video processing pipeline. It generates natural, conversational coaching
advice that reads like a human presentation coach giving feedback.

Data Flow:
    TwelveLabs (video analysis) ─┐
                                 ├──► Gemini ──► GeminiReport (natural language)
    Deepgram (transcription) ────┘
"""
import asyncio
import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

from backend.app.models.schemas import GeminiReport

logger = logging.getLogger(__name__)

# Import the actual Gemini module
try:
    from backend.gemini import (
        is_available,
        synthesize_analysis,
        SynthesisResult,
    )
    from backend.gemini.gemini_client import client as gemini_client
    GEMINI_IMPORTED = True
except ImportError as e:
    logger.warning(f"Failed to import Gemini module: {e}")
    GEMINI_IMPORTED = False
    is_available = lambda: False
    synthesize_analysis = None
    SynthesisResult = None
    gemini_client = None


def is_gemini_available() -> bool:
    """Check if Gemini API is available."""
    if not GEMINI_IMPORTED:
        return False
    return is_available()


def _build_coaching_prompt(
    synthesis_result: "SynthesisResult",
    deepgram_data: Optional[Dict[str, Any]] = None,
) -> str:
    """Build prompt for natural language coaching advice."""

    result_dict = synthesis_result.to_dict()
    score = result_dict.get('overall_coherence_score', 0)
    metrics = result_dict.get('metrics', {})
    flags = result_dict.get('dissonance_flags', [])

    # Convert metrics to qualitative descriptions (NO numbers)
    filler_count = metrics.get('fillerWords', 0)
    speaking_pace = metrics.get('speakingPace', 150)
    eye_contact = metrics.get('eyeContact', 70)
    fidgeting = metrics.get('fidgeting', 0)

    # Qualitative assessments
    eye_contact_quality = "excellent" if eye_contact >= 80 else "good" if eye_contact >= 60 else "could use some work"
    filler_quality = "very few filler words" if filler_count <= 3 else "some filler words" if filler_count <= 8 else "quite a few filler words"
    pace_quality = "good pace" if 130 <= speaking_pace <= 170 else "a bit fast" if speaking_pace > 170 else "a bit slow"
    fidget_quality = "calm and composed" if fidgeting <= 2 else "some nervous movements" if fidgeting <= 6 else "noticeable fidgeting"

    # Overall assessment
    if score >= 80:
        overall = "This was a strong presentation overall."
    elif score >= 60:
        overall = "This was a solid presentation with room to grow."
    elif score >= 40:
        overall = "There's good potential here with some areas to work on."
    else:
        overall = "This is a great starting point for improvement."

    # Build qualitative issues (no timestamps or numbers)
    issues_natural = []
    for flag in flags[:2]:  # Top 2 issues only
        desc = flag.get('description', '')
        # Strip any numbers from description
        if desc:
            issues_natural.append(desc.split('(')[0].strip())  # Remove anything in parentheses

    prompt = f"""You are a warm, encouraging presentation coach giving feedback to someone who just practiced. Write like you're having a friendly conversation with them.

WHAT I OBSERVED:
- Overall: {overall}
- Eye contact: {eye_contact_quality}
- Speech: {filler_quality}, {pace_quality}
- Body language: {fidget_quality}
{f"- Notable moments: {', '.join(issues_natural)}" if issues_natural else ""}

Write 4-5 sentences of natural coaching advice.

CRITICAL RULES:
1. DO NOT include ANY numbers, percentages, counts, or statistics
2. DO NOT say things like "X instances", "Y%", "Z words per minute"
3. DO NOT use parentheses with metrics
4. Write EXACTLY like a human coach would speak - warm, natural, conversational
5. Start with genuine praise for something specific they did well
6. Mention 1-2 areas to improve using descriptive language only
7. Give one concrete tip they can try next time
8. End with encouragement

EXAMPLE OF GOOD OUTPUT:
"You've got a really engaging presence on camera! I especially liked how you maintained eye contact throughout most of your presentation - that really helps connect with your audience. One thing to work on: I noticed you tend to speed up when you get to the exciting parts. Try taking a breath before your key points to let them land. You're doing great, and with a little more practice on pacing, you'll be even more compelling!"

EXAMPLE OF BAD OUTPUT (never do this):
"Great job! You had 85% eye contact and only 3 filler words (um, uh). Your speaking pace was 156 WPM which is within the optimal range of 140-160. You fidgeted 2 times. Keep practicing!"

Write ONLY the coaching advice, nothing else:"""

    return prompt


async def _generate_natural_coaching(
    synthesis_result: "SynthesisResult",
    deepgram_data: Optional[Dict[str, Any]] = None,
) -> str:
    """Generate natural language coaching advice using Gemini."""

    if not gemini_client:
        return _generate_fallback_coaching(synthesis_result, deepgram_data)

    prompt = _build_coaching_prompt(synthesis_result, deepgram_data)

    try:
        response = await asyncio.to_thread(
            gemini_client.generate_content,
            prompt,
            generation_config={
                "temperature": 0.7,  # Slightly higher for more natural language
                "max_output_tokens": 300,  # Keep it concise
            },
        )

        coaching_text = response.text.strip()

        # Clean up any markdown or extra formatting
        coaching_text = coaching_text.replace("**", "").replace("*", "")
        coaching_text = coaching_text.replace("###", "").replace("##", "").replace("#", "")

        logger.info(f"Generated natural coaching advice ({len(coaching_text)} chars)")
        return coaching_text

    except Exception as e:
        logger.warning(f"Failed to generate coaching with Gemini: {e}")
        return _generate_fallback_coaching(synthesis_result, deepgram_data)


def _generate_fallback_coaching(
    synthesis_result: "SynthesisResult",
    deepgram_data: Optional[Dict[str, Any]] = None,
) -> str:
    """Generate fallback coaching advice when Gemini is unavailable.

    Uses fully natural language without any numbers or statistics.
    """
    result_dict = synthesis_result.to_dict()
    score = result_dict.get('overall_coherence_score', 0)
    metrics = result_dict.get('metrics', {})

    # Get metrics for qualitative assessment
    filler_count = metrics.get('fillerWords', 0)
    speaking_pace = metrics.get('speakingPace', 150)
    eye_contact = metrics.get('eyeContact', 70)
    fidgeting = metrics.get('fidgeting', 0)

    parts = []

    # Natural positive opening based on what went well
    if eye_contact >= 70:
        parts.append("Great job on your presentation! You did a wonderful job maintaining eye contact with the camera, which really helps connect with your audience.")
    elif speaking_pace >= 130 and speaking_pace <= 170:
        parts.append("Nice work on your presentation! Your pacing was really natural and easy to follow.")
    elif filler_count <= 5:
        parts.append("Great job on your presentation! You spoke clearly and confidently throughout.")
    else:
        parts.append("Nice effort on your presentation practice! There's a lot of potential here.")

    # Add context based on overall score (no numbers)
    if score >= 80:
        parts.append("Overall, this was a really polished delivery.")
    elif score >= 60:
        parts.append("You're definitely on the right track, with just a few areas to fine-tune.")
    elif score >= 40:
        parts.append("With some focused practice on a couple of key areas, you'll see big improvements.")
    else:
        parts.append("Everyone starts somewhere, and you've got a solid foundation to build on.")

    # Natural improvement suggestions (no numbers ever)
    if filler_count > 10:
        parts.append("One thing to work on: try replacing filler words with brief pauses. A moment of silence actually sounds more confident than 'um' or 'uh'.")
    elif fidgeting > 5:
        parts.append("I noticed some nervous movement - try resting your hands in one position or using purposeful gestures to channel that energy.")
    elif speaking_pace > 170:
        parts.append("You tend to speed up at times - try taking a breath before your key points to let them really land with your audience.")
    elif speaking_pace < 130:
        parts.append("Consider picking up the energy a bit - varying your pace can help keep your audience engaged.")
    elif eye_contact < 60:
        parts.append("Try to look at the camera more often - it creates a connection with your audience even through the screen.")
    else:
        parts.append("Keep refining the small details and your delivery will become even more natural.")

    # Encouraging close
    parts.append("Keep practicing and trust the process - you're making great progress!")

    return " ".join(parts)


def _generate_headline(score: int, metrics: Dict[str, Any]) -> str:
    """Generate a natural headline based on overall assessment."""
    eye_contact = metrics.get('eyeContact', 70)
    filler_count = metrics.get('fillerWords', 0)
    fidgeting = metrics.get('fidgeting', 0)

    # Pick headline based on strongest attribute or overall impression
    if score >= 85:
        if eye_contact >= 80:
            return "Confident and engaging delivery!"
        return "Polished presentation skills!"
    elif score >= 70:
        if filler_count <= 3:
            return "Clear and articulate speaker"
        return "Strong delivery with room to shine"
    elif score >= 55:
        if eye_contact >= 70:
            return "Good presence, refining the details"
        return "Solid foundation to build on"
    elif score >= 40:
        if fidgeting <= 3:
            return "Finding your voice"
        return "Growing as a presenter"
    else:
        return "Every expert was once a beginner"


async def generate_coaching_report(
    deepgram_data: Optional[Dict[str, Any]],
    twelvelabs_data: Optional[Dict[str, Any]],
    video_duration: float = 0,
) -> Optional[GeminiReport]:
    """Generate natural language coaching report using Gemini.

    API_CALL: Gemini 1.5 Pro via backend.gemini.synthesis

    Args:
        deepgram_data: Raw transcription result from Deepgram
        twelvelabs_data: Raw analysis result from TwelveLabs (can be list or dict)
        video_duration: Video duration in seconds

    Returns:
        GeminiReport with natural coaching advice, or None if generation fails
    """
    if not is_gemini_available():
        logger.warning("Gemini not available, skipping coaching report generation")
        return None

    if not deepgram_data and not twelvelabs_data:
        logger.warning("No analysis data available for Gemini report")
        return None

    try:
        logger.info("Generating natural coaching report...")

        # Prepare TwelveLabs data in expected format (list of query results)
        tl_data_list = []
        if twelvelabs_data:
            if isinstance(twelvelabs_data, list):
                tl_data_list = twelvelabs_data
            elif isinstance(twelvelabs_data, dict):
                if "query_results" in twelvelabs_data:
                    tl_data_list = twelvelabs_data["query_results"]
                else:
                    tl_data_list = [twelvelabs_data]

        # Get synthesis result for metrics and context
        synthesis_result = await synthesize_analysis(
            twelvelabs_data=tl_data_list,
            deepgram_data=deepgram_data or {},
        )

        # Log the synthesis result
        result_dict = synthesis_result.to_dict()
        logger.info("=" * 60)
        logger.info("SYNTHESIS RESULT FOR COACHING")
        logger.info("=" * 60)
        logger.info(f"Coherence Score: {result_dict.get('overall_coherence_score', 'N/A')}")
        logger.info(f"Metrics: {result_dict.get('metrics', {})}")
        logger.info(f"Strengths: {result_dict.get('strengths', [])}")
        logger.info(f"Priorities: {result_dict.get('top_3_priorities', [])}")
        logger.info("=" * 60)

        # Generate natural language coaching
        coaching_advice = await _generate_natural_coaching(
            synthesis_result=synthesis_result,
            deepgram_data=deepgram_data,
        )

        # Generate headline
        score = result_dict.get('overall_coherence_score', 50)
        metrics = result_dict.get('metrics', {})
        headline = _generate_headline(score, metrics)

        report = GeminiReport(
            coachingAdvice=coaching_advice,
            headline=headline,
            generatedAt=datetime.utcnow().isoformat(),
            modelUsed="gemini-1.5-pro",
        )

        logger.info("Natural coaching report generated successfully")
        return report

    except Exception as e:
        logger.error(f"Coaching report generation failed: {e}", exc_info=True)
        return None
