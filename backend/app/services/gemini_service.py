"""Gemini AI service for comprehensive presentation analysis.

Synthesizes data from TwelveLabs (visual) and Deepgram (speech) to generate
a unified coaching report. This is SEPARATE from TwelveLabs analysis.

Data Flow:
    TwelveLabs (video analysis) ─┐
                                 ├──► Gemini ──► GeminiReport
    Deepgram (transcription) ────┘

The GeminiReport provides:
- Executive summary
- Synthesized insights from both visual and verbal analysis
- Actionable coaching recommendations
- Practice exercises
"""
import asyncio
import json
import logging
from datetime import datetime
from typing import Any, Dict, Optional

logger = logging.getLogger(__name__)


def _is_gemini_available() -> bool:
    """Check if Gemini API is available."""
    import os
    api_key = os.getenv("GEMINI_API_KEY")
    return api_key is not None and len(api_key) > 0


def prepare_gemini_context(
    deepgram_data: Optional[Dict[str, Any]],
    twelvelabs_data: Optional[Dict[str, Any]],
    video_duration: float = 0,
) -> Dict[str, Any]:
    """Prepare context data for Gemini prompt.

    Structures the raw data from Deepgram and TwelveLabs into a clean
    format that Gemini can easily understand and analyze.

    Args:
        deepgram_data: Raw transcription result from Deepgram
        twelvelabs_data: Raw analysis result from TwelveLabs
        video_duration: Video duration in seconds

    Returns:
        Structured context dict for Gemini prompt
    """
    context = {
        "video_duration_seconds": video_duration,
        "has_speech_data": deepgram_data is not None,
        "has_visual_data": twelvelabs_data is not None,
    }

    # Extract speech data from Deepgram
    if deepgram_data:
        metrics = deepgram_data.get("metrics", {})
        filler_analysis = metrics.get("filler_analysis", {})

        context["speech"] = {
            "transcript": deepgram_data.get("transcript", ""),
            "confidence": deepgram_data.get("confidence", 0),
            "total_words": metrics.get("total_words", 0),
            "content_words": metrics.get("content_words", 0),
            "speaking_pace_wpm": metrics.get("speaking_pace_wpm", 0),
            "filler_words": {
                "total_count": filler_analysis.get("total_count", 0),
                "vocal_disfluencies": filler_analysis.get("vocal_disfluency_count", 0),
                "contextual_fillers": filler_analysis.get("contextual_filler_count", 0),
                "rate_per_minute": filler_analysis.get("filler_rate_per_minute", 0),
                "instances": filler_analysis.get("filler_words", [])[:10],  # Limit for prompt
            },
            "pauses": {
                "count": metrics.get("pause_count", 0),
                "instances": metrics.get("pauses", [])[:5],  # Limit for prompt
            },
        }
    else:
        context["speech"] = None

    # Extract visual data from TwelveLabs
    if twelvelabs_data:
        tl_metrics = twelvelabs_data.get("metrics", {})

        context["visual"] = {
            "eye_contact_percentage": tl_metrics.get("eye_contact_percentage", 0),
            "fidgeting_count": tl_metrics.get("fidgeting_count", 0),
            "gesture_count": tl_metrics.get("gesture_count", 0),
            "dissonance_flags": twelvelabs_data.get("dissonance_flags", []),
            "strengths_detected": twelvelabs_data.get("strengths", []),
            "priorities_detected": twelvelabs_data.get("priorities", []),
            "overall_assessment": twelvelabs_data.get("overall_assessment", ""),
        }
    else:
        context["visual"] = None

    return context


def build_gemini_prompt(context: Dict[str, Any]) -> str:
    """Build the system prompt for Gemini analysis.

    Args:
        context: Prepared context from prepare_gemini_context()

    Returns:
        Complete prompt string for Gemini
    """
    prompt_parts = [
        "You are an expert presentation coach analyzing a recorded presentation.",
        "You have been provided with two types of analysis data:",
        "",
        "1. SPEECH ANALYSIS (from Deepgram transcription):",
        "   - Full transcript of what was said",
        "   - Speaking pace (words per minute)",
        "   - Filler word detection (um, uh, like, you know)",
        "   - Pause patterns",
        "",
        "2. VISUAL ANALYSIS (from TwelveLabs video understanding):",
        "   - Eye contact percentage",
        "   - Fidgeting/nervous movements",
        "   - Gesture usage",
        "   - Visual-verbal dissonance (mismatches between words and body language)",
        "",
        "Your task is to synthesize BOTH sources and provide a comprehensive coaching report.",
        "Focus on actionable, specific feedback that will help the presenter improve.",
        "",
        "=" * 60,
        "ANALYSIS DATA:",
        "=" * 60,
        "",
        json.dumps(context, indent=2, default=str),
        "",
        "=" * 60,
        "REQUIRED OUTPUT FORMAT (JSON):",
        "=" * 60,
        "",
        """Return a JSON object with this exact structure:
{
    "summary": "2-3 sentence executive summary",
    "overallAssessment": "Detailed paragraph assessment of the presentation",
    "keyStrengths": [
        {"category": "strength", "title": "Short title", "description": "Details", "priority": 8}
    ],
    "areasForImprovement": [
        {"category": "improvement", "title": "Short title", "description": "Details", "priority": 9}
    ],
    "immediateActions": ["Action 1", "Action 2"],
    "practiceExercises": ["Exercise 1", "Exercise 2"],
    "speechAnalysis": "Paragraph about speech patterns, pace, filler words",
    "bodyLanguageAnalysis": "Paragraph about gestures, eye contact, posture",
    "contentCoherenceAnalysis": "Paragraph about how well speech matched visuals"
}

IMPORTANT:
- Be specific and actionable in your feedback
- Reference specific timestamps or examples when possible
- Prioritize the most impactful improvements
- Keep the tone encouraging but honest
- Focus on 3-5 key strengths and 3-5 key improvements
- Return ONLY valid JSON, no markdown or extra text""",
    ]

    return "\n".join(prompt_parts)


async def generate_report(
    deepgram_data: Optional[Dict[str, Any]],
    twelvelabs_data: Optional[Dict[str, Any]],
    video_duration: float = 0,
) -> Optional[Dict[str, Any]]:
    """Generate comprehensive coaching report using Gemini.

    API_CALL: Google Gemini API

    Args:
        deepgram_data: Raw transcription result from Deepgram
        twelvelabs_data: Raw analysis result from TwelveLabs
        video_duration: Video duration in seconds

    Returns:
        GeminiReport dict or None if generation fails
    """
    if not _is_gemini_available():
        logger.warning("Gemini API key not configured, skipping report generation")
        return None

    if not deepgram_data and not twelvelabs_data:
        logger.warning("No analysis data available for Gemini report")
        return None

    try:
        # Prepare context
        context = prepare_gemini_context(deepgram_data, twelvelabs_data, video_duration)
        prompt = build_gemini_prompt(context)

        logger.info("Generating Gemini report...")

        # TODO: Implement actual Gemini API call
        # For now, return a placeholder that indicates the structure
        # This will be replaced with actual google.generativeai call

        # Placeholder implementation:
        # import google.generativeai as genai
        # genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        # model = genai.GenerativeModel('gemini-1.5-pro')
        # response = await asyncio.to_thread(model.generate_content, prompt)
        # result = json.loads(response.text)

        logger.info("Gemini report generation complete")

        # Return placeholder structure (to be replaced with actual API response)
        return {
            "summary": "Gemini analysis pending - API integration in progress",
            "overallAssessment": "Full assessment will be generated once Gemini API is connected.",
            "keyStrengths": [],
            "areasForImprovement": [],
            "immediateActions": ["Connect Gemini API to enable full analysis"],
            "practiceExercises": [],
            "speechAnalysis": f"Speech data available: {context['has_speech_data']}",
            "bodyLanguageAnalysis": f"Visual data available: {context['has_visual_data']}",
            "contentCoherenceAnalysis": None,
            "generatedAt": datetime.utcnow().isoformat(),
            "modelUsed": "placeholder",
        }

    except Exception as e:
        logger.error(f"Gemini report generation failed: {e}", exc_info=True)
        return None


def get_cached_analysis_for_gemini(video_id: str, cache: Dict[str, Dict[str, Any]]) -> Dict[str, Any]:
    """Get cached analysis data formatted for Gemini.

    Args:
        video_id: Video identifier
        cache: The _analysis_cache dict from video_service

    Returns:
        Dict with deepgram_data and twelvelabs_data ready for Gemini
    """
    cached = cache.get(video_id, {})
    return {
        "deepgram_data": cached.get("deepgram_data"),
        "twelvelabs_data": cached.get("twelvelabs_data"),
    }
