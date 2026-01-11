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

    prompt = f"""You are a warm, encouraging presentation coach giving detailed feedback. Write like you're having a friendly conversation.

WHAT I OBSERVED:
- Eye contact: {eye_contact_quality}
- Speech patterns: {filler_quality}, {pace_quality}
- Body language: {fidget_quality}

AREAS TO ADDRESS (must mention these):
{chr(10).join(f"- {area}" for area in improvement_areas[:3])}

PRACTICE TECHNIQUES TO SUGGEST (pick 1-2 relevant ones):
{chr(10).join(f"- {tip}" for tip in practice_suggestions[:3])}

Write 5-7 sentences of coaching advice with this structure:

STRUCTURE:
1. Start with genuine, specific praise (1-2 sentences)
2. Transition to improvement areas - ALWAYS mention at least one specific thing to work on, even if they did well overall (2-3 sentences)
3. End with a specific practice technique they can do at home to improve (1-2 sentences)

CRITICAL RULES:
- DO NOT include ANY numbers, percentages, or statistics
- ALWAYS include specific improvement suggestions, even for good presentations
- ALWAYS end with a concrete practice exercise they can do
- Write naturally like a human coach, not a formal report
- Be encouraging but also genuinely helpful with actionable advice

Write ONLY the coaching advice:"""

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

    # Natural positive opening based on what went well
    if eye_contact >= 70:
        parts.append("Great job on your presentation! You did a wonderful job maintaining eye contact with the camera, which really helps connect with your audience.")
    elif 130 <= speaking_pace <= 170:
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

    # ALWAYS add improvement suggestion - find the most relevant one
    improvement_added = False

    # Check for flag-based issues first
    for flag in flags[:1]:
        flag_type = flag.get('type', '')
        if flag_type == 'EMOTIONAL_MISMATCH':
            parts.append("One area to focus on: your facial expressions could better match the emotion in your words. When you're saying something exciting, let that enthusiasm show on your face!")
            improvement_added = True
            break
        elif flag_type == 'MISSING_GESTURE':
            parts.append("One area to focus on: when you reference something specific, try pointing or gesturing toward it. This helps guide your audience's attention.")
            improvement_added = True
            break
        elif flag_type == 'PACING_MISMATCH':
            parts.append("One area to focus on: try varying your pace more - slow down for important points and speed up slightly for transitions.")
            improvement_added = True
            break

    # If no flag-based improvement, use metrics
    if not improvement_added:
        if eye_contact < 80:
            parts.append("One area to focus on: try to maintain even more consistent eye contact with the camera. It creates a stronger connection with your audience, even through a screen.")
            improvement_added = True
        elif filler_count > 3:
            parts.append("One area to focus on: I noticed some filler words creeping in. Try embracing brief pauses instead - silence is actually a powerful tool that makes you sound more confident.")
            improvement_added = True
        elif fidgeting > 2:
            parts.append("One area to focus on: try to channel your energy into purposeful gestures rather than nervous movements. Your hands can be great tools for emphasis!")
            improvement_added = True
        elif speaking_pace > 170:
            parts.append("One area to focus on: you tend to speed up during key moments. Try taking a breath before important points to let them really land with your audience.")
            improvement_added = True
        elif speaking_pace < 130:
            parts.append("One area to focus on: try adding more energy and variation to your delivery. A slightly faster pace during exciting parts can help keep your audience engaged.")
            improvement_added = True

    # Default improvement if nothing specific found
    if not improvement_added:
        parts.append("To take your presentation to the next level, focus on adding more vocal variety - varying your tone and emphasis can make your key points even more memorable.")

    # ALWAYS add a practice technique at the end
    if filler_count > 3:
        parts.append("Here's a technique to practice: record yourself speaking for two minutes on any topic. Every time you catch yourself about to say 'um' or 'uh', pause and take a breath instead. With repetition, this becomes natural.")
    elif eye_contact < 80:
        parts.append("Here's a technique to practice: try the 'triangle method' - look at your camera, then briefly glance to the left, then right, creating a natural gaze pattern. Practice this while reading aloud until it feels natural.")
    elif fidgeting > 2:
        parts.append("Here's a technique to practice: before your next presentation, try 'power posing' for two minutes - stand tall with hands on hips. This reduces cortisol and helps calm nervous energy.")
    elif speaking_pace > 170 or speaking_pace < 130:
        parts.append("Here's a technique to practice: read a paragraph aloud at three different speeds - slow, medium, and fast. Record yourself and listen back to find the pace that sounds most natural and engaging.")
    else:
        parts.append("Here's a technique to practice: rehearse your presentation while recording yourself, then watch it back with the sound off. This helps you notice body language habits you might not be aware of.")

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
