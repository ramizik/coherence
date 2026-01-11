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
    eye_contact_quality = "excellent" if eye_contact >= 80 else "good" if eye_contact >= 60 else "needs improvement"
    filler_quality = "minimal filler words" if filler_count <= 3 else "some filler words" if filler_count <= 8 else "frequent filler words"
    pace_quality = "well-paced" if 130 <= speaking_pace <= 170 else "tends to rush" if speaking_pace > 170 else "could be more energetic"
    fidget_quality = "composed body language" if fidgeting <= 2 else "some nervous movements" if fidgeting <= 6 else "noticeable fidgeting"

    # Identify improvement areas (always find something to improve)
    improvement_areas = []
    practice_suggestions = []

    if eye_contact < 80:
        improvement_areas.append("maintaining consistent eye contact")
        practice_suggestions.append("Practice the 'triangle technique': look at your camera, then briefly to the left and right of it, creating a natural gaze pattern")
    if filler_count > 3:
        improvement_areas.append("reducing filler words")
        practice_suggestions.append("Try the 'pause and breathe' exercise: when you feel an 'um' coming, pause silently for 2 seconds instead - silence is powerful")
    if speaking_pace > 170 or speaking_pace < 130:
        improvement_areas.append("pacing your delivery")
        practice_suggestions.append("Record yourself reading a passage at different speeds, then listen back to find your optimal pace")
    if fidgeting > 2:
        improvement_areas.append("calm, purposeful body language")
        practice_suggestions.append("Practice 'power posing' before presentations - stand with hands on hips for 2 minutes to reduce nervous energy")

    # Add flag-based improvements
    for flag in flags[:2]:
        desc = flag.get('description', '')
        flag_type = flag.get('type', '')
        if desc:
            clean_desc = desc.split('(')[0].strip().lower()
            if clean_desc and clean_desc not in str(improvement_areas).lower():
                improvement_areas.append(clean_desc)

        # Add practice suggestions based on flag type
        if flag_type == 'EMOTIONAL_MISMATCH' and "facial expressions" not in str(practice_suggestions):
            practice_suggestions.append("Practice in front of a mirror, consciously matching your facial expressions to your emotional words")
        elif flag_type == 'MISSING_GESTURE' and "gestures" not in str(practice_suggestions):
            practice_suggestions.append("When rehearsing, deliberately point or gesture whenever you say 'this', 'here', or 'look at'")
        elif flag_type == 'PACING_MISMATCH' and "chunking" not in str(practice_suggestions):
            practice_suggestions.append("Try 'chunking' your content - pause briefly between main points to let ideas sink in")

    # Default improvement if nothing specific found
    if not improvement_areas:
        improvement_areas.append("adding more vocal variety")
        practice_suggestions.append("Practice reading children's books aloud with exaggerated expression to expand your vocal range")

    prompt = f"""You are an expert presentation coach writing a concise, professional analysis report.

    ANALYSIS DATA:
    - Score: {score}/100
    - Eye Contact: {eye_contact}% ({eye_contact_quality})
    - Filler Words: {filler_count} ({filler_quality})
    - Speaking Pace: {speaking_pace} WPM ({pace_quality})
    - Body Language: {fidgeting} nervous movements ({fidget_quality})

    KEY IMPROVEMENT AREAS:
    {chr(10).join(f"- {area}" for area in improvement_areas[:3])}

    RECOMMENDED PRACTICE:
    {chr(10).join(f"- {tip}" for tip in practice_suggestions[:2])}

    Write a 3-paragraph coaching summary (approx. 150-200 words total):

    1. STRENGTHS (1-2 sentences): objectively state what was done well.
    2. IMPROVEMENTS (2-3 sentences): clear, direct feedback on specific areas to improve.
    3. ACTION PLAN (1-2 sentences): specific technique to practice.

    CRITICAL TONE RULES:
    - PROFESSIONAL & OBJECTIVE: No "Hey there!", "Wow!", "I really liked", or "Good job!".
    - DIRECT: Start immediately with the analysis (e.g., "The presentation demonstrated strong eye contact...").
    - NO FLUFF: Avoid filler phrases. Get straight to the point.
    - NO NUMBERS: Do not mention specific scores or percentages in the text.
    - BALANCED: If the score is low ({score}), be encouraging but honest about the work needed.

    Write ONLY the summary text:"""

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
                "max_output_tokens": 2048,  # Large limit to ensure complete responses
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
    Always includes improvement suggestions and practice techniques.
    """
    result_dict = synthesis_result.to_dict()
    score = result_dict.get('overall_coherence_score', 0)
    metrics = result_dict.get('metrics', {})
    flags = result_dict.get('dissonance_flags', [])

    # Get metrics for qualitative assessment
    filler_count = metrics.get('fillerWords', 0)
    speaking_pace = metrics.get('speakingPace', 150)
    eye_contact = metrics.get('eyeContact', 70)
    fidgeting = metrics.get('fidgeting', 0)

    parts = []

    # Professional positive opening based on what went well
    if eye_contact >= 70:
        parts.append("The speaker demonstrated excellent engagement through consistent eye contact with the camera.")
    elif 130 <= speaking_pace <= 170:
        parts.append("The delivery pace was well-modulated and easy to follow.")
    elif filler_count <= 5:
        parts.append("The presentation was delivered clearly with minimal verbal distractions.")
    else:
        parts.append("The presentation showed potential with a solid effort in delivery.")

    # Add context based on overall score (no numbers)
    if score >= 80:
        parts.append("This was a highly polished performance.")
    elif score >= 60:
        parts.append("The foundational skills are in place, with room for refinement.")
    elif score >= 40:
        parts.append("Focusing on a few key mechanics will significantly improve future impact.")
    else:
        parts.append("Developing core presentation habits will help build confidence.")

    # ALWAYS add improvement suggestion - find the most relevant one
    improvement_added = False

    # Check for flag-based issues first
    for flag in flags[:1]:
        flag_type = flag.get('type', '')
        if flag_type == 'EMOTIONAL_MISMATCH':
            parts.append("To increase impact, align facial expressions more closely with the emotional content of the speech.")
            improvement_added = True
            break
        elif flag_type == 'MISSING_GESTURE':
            parts.append("Incorporating purposeful gestures when referencing specific points would enhance clarity.")
            improvement_added = True
            break
        elif flag_type == 'PACING_MISMATCH':
            parts.append("Varying the speaking pace would help emphasize key transitions and maintain audience interest.")
            improvement_added = True
            break

    # If no flag-based improvement, use metrics
    if not improvement_added:
        if eye_contact < 80:
            parts.append("Increasing the frequency of direct eye contact with the camera will build stronger connection.")
            improvement_added = True
        elif filler_count > 3:
            parts.append("Replacing filler words with brief pauses will project greater confidence and authority.")
            improvement_added = True
        elif fidgeting > 2:
            parts.append("Minimizing nervous movements and channeling energy into purposeful gestures will improve presence.")
            improvement_added = True
        elif speaking_pace > 170:
            parts.append("Slowing down during key points will ensure the message is fully absorbed by the audience.")
            improvement_added = True
        elif speaking_pace < 130:
            parts.append("Increasing vocal energy and pace during dynamic sections will help maintain engagement.")
            improvement_added = True

    # Default improvement if nothing specific found
    if not improvement_added:
        parts.append("Adding more vocal variety in tone and emphasis would make key points even more memorable.")

    # ALWAYS add a practice technique at the end
    if filler_count > 3:
        parts.append("Recommended practice: Record a two-minute speech and consciously pause for silence instead of using fillers.")
    elif eye_contact < 80:
        parts.append("Recommended practice: Use the 'triangle method' by looking at the camera, then briefly left and right, to create a natural gaze pattern.")
    elif fidgeting > 2:
        parts.append("Recommended practice: Try 'power posing' for two minutes before presenting to reduce nervous energy and ground your stance.")
    elif speaking_pace > 170 or speaking_pace < 130:
        parts.append("Recommended practice: Read a passage aloud at three different speeds (slow, medium, fast) to identify the most engaging pace.")
    else:
        parts.append("Recommended practice: Record a rehearsal and watch it without sound to identify any unconscious body language habits.")

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
            modelUsed="gemini-2.5-flash",
        )

        logger.info("Natural coaching report generated successfully")
        return report

    except Exception as e:
        logger.error(f"Coaching report generation failed: {e}", exc_info=True)
        return None
