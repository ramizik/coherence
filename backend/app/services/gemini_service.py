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
    strengths = result_dict.get('strengths', [])
    priorities = result_dict.get('top_3_priorities', [])
    metrics = result_dict.get('metrics', {})
    flags = result_dict.get('dissonance_flags', [])

    # Get speech metrics
    filler_count = metrics.get('fillerWords', 0)
    speaking_pace = metrics.get('speakingPace', 150)
    eye_contact = metrics.get('eyeContact', 70)
    fidgeting = metrics.get('fidgeting', 0)

    # Build context about detected issues
    issues_context = []
    for flag in flags[:3]:  # Top 3 issues
        issues_context.append(
            f"- At {flag.get('timestamp', 0):.0f}s: {flag.get('description', '')}"
        )

    prompt = f"""You are a friendly, supportive presentation coach giving feedback to someone who just practiced their presentation. Write natural, conversational advice as if you're talking directly to them.

ANALYSIS DATA:
- Coherence Score: {score}/100
- Eye Contact: {eye_contact}%
- Filler Words: {filler_count}
- Speaking Pace: {speaking_pace} WPM (optimal: 140-160)
- Fidgeting Instances: {fidgeting}

STRENGTHS DETECTED:
{chr(10).join(f"- {s}" for s in strengths) if strengths else "- Good effort overall"}

AREAS TO IMPROVE:
{chr(10).join(f"- {p}" for p in priorities) if priorities else "- Keep practicing"}

SPECIFIC MOMENTS TO ADDRESS:
{chr(10).join(issues_context) if issues_context else "- No major issues detected"}

INSTRUCTIONS:
Write 4-6 sentences of coaching advice that:
1. Starts with something positive they did well
2. Naturally transitions to 1-2 key areas to improve
3. Gives specific, actionable tips they can use immediately
4. Ends with encouragement

IMPORTANT:
- Write in second person ("you did great", "try to...")
- Be warm and encouraging, not critical
- Sound like a real coach talking, not a formal report
- Don't use bullet points or headers - just flowing sentences
- Keep it concise - this will be displayed in a small card

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
    """Generate fallback coaching advice when Gemini is unavailable."""

    result_dict = synthesis_result.to_dict()
    score = result_dict.get('overall_coherence_score', 0)
    strengths = result_dict.get('strengths', [])
    priorities = result_dict.get('top_3_priorities', [])
    metrics = result_dict.get('metrics', {})

    # Build natural-sounding fallback
    parts = []

    # Positive opening
    if strengths:
        parts.append(f"Great job on your presentation! Your {strengths[0].lower()} really stood out.")
    else:
        parts.append("Nice work on your presentation practice!")

    # Score context
    if score >= 80:
        parts.append("You're doing really well overall.")
    elif score >= 60:
        parts.append("You're on the right track with some room to polish.")
    else:
        parts.append("There are a few areas we can work on together.")

    # Key improvement
    if priorities:
        parts.append(f"The main thing I'd focus on is: {priorities[0].lower()}.")

    # Specific tip based on metrics
    filler_count = metrics.get('fillerWords', 0)
    speaking_pace = metrics.get('speakingPace', 150)

    if filler_count > 10:
        parts.append("Try pausing instead of using filler words - a brief silence is more powerful than 'um' or 'uh'.")
    elif speaking_pace > 170:
        parts.append("You might want to slow down a bit to let your key points land with the audience.")
    elif speaking_pace < 130:
        parts.append("Try picking up the pace slightly to keep your audience engaged.")

    # Encouraging close
    parts.append("Keep practicing and you'll see great improvement!")

    return " ".join(parts)


def _generate_headline(score: int) -> str:
    """Generate a short headline based on the score."""
    if score >= 85:
        return "Excellent presentation skills!"
    elif score >= 70:
        return "Strong performance with minor tweaks needed"
    elif score >= 55:
        return "Good foundation, keep practicing"
    elif score >= 40:
        return "Making progress, focus on key areas"
    else:
        return "Let's work on the fundamentals"


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
        headline = _generate_headline(score)

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
