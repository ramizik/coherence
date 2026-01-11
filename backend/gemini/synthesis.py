"""Gemini multimodal synthesis for dissonance detection.

This module takes TwelveLabs visual analysis and Deepgram transcription data,
then uses Gemini 1.5 Pro to detect visual-verbal dissonance in presentations.

Input formats:
- TwelveLabs: List of query results with clips
  {
      "query": "person fidgeting with hands",
      "clips": [
          {"start": 12.3, "end": 15.7, "confidence": 0.82},
          {"start": 45.1, "end": 48.9, "confidence": 0.91}
      ]
  }

- Deepgram: Transcript with word-level timestamps
  {
      "transcript": "Hello everyone, um, today I'm, uh, thrilled to present...",
      "words": [
          {"word": "Hello", "start": 0.5, "end": 0.8},
          {"word": "um", "start": 1.2, "end": 1.4}
      ],
      "confidence": 0.94
  }

Output format:
  {
      "dissonance_flags": [...],
      "overall_coherence_score": 67,
      "score_breakdown": {...},
      "strengths": [...],
      "top_3_priorities": [...]
  }
"""

import asyncio
import json
import logging
import uuid
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Dict, List, Optional

from backend.gemini.gemini_client import client, is_available

logger = logging.getLogger(__name__)


class DissonanceType(str, Enum):
    """Type of visual-verbal dissonance."""

    EMOTIONAL_MISMATCH = "EMOTIONAL_MISMATCH"
    MISSING_GESTURE = "MISSING_GESTURE"
    PACING_MISMATCH = "PACING_MISMATCH"


class Severity(str, Enum):
    """Severity level of dissonance."""

    HIGH = "HIGH"  # Critical - must fix
    MEDIUM = "MEDIUM"  # Important - should fix
    LOW = "LOW"  # Minor - nice to fix


@dataclass
class DissonanceFlag:
    """A detected visual-verbal dissonance."""

    type: DissonanceType
    timestamp: float  # Seconds from video start
    severity: Severity
    description: str
    coaching_tip: str
    clip_start: Optional[float] = None  # Start of the clip (for playback)
    clip_end: Optional[float] = None  # End of the clip
    transcript_excerpt: Optional[str] = None  # Related transcript text
    id: str = field(default_factory=lambda: f"flag-{uuid.uuid4().hex[:8]}")

    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization."""
        return {
            "id": self.id,
            "type": self.type.value,
            "timestamp": self.timestamp,
            "endTimestamp": self.clip_end,
            "severity": self.severity.value,
            "description": self.description,
            "coaching": self.coaching_tip,
            "visualEvidence": f"Detected at {self.clip_start:.1f}s - {self.clip_end:.1f}s" if self.clip_start else None,
            "verbalEvidence": self.transcript_excerpt,
        }


@dataclass
class ScoreBreakdown:
    """Breakdown of coherence score components."""

    eye_contact: int  # Out of 30
    filler_words: int  # Out of 25
    fidgeting: int  # Out of 20
    pacing: int  # Out of 15
    dissonance_penalty: int  # Negative points for critical flags

    def to_dict(self) -> dict:
        return {
            "eye_contact": self.eye_contact,
            "filler_words": self.filler_words,
            "fidgeting": self.fidgeting,
            "pacing": self.pacing,
            "dissonance_penalty": self.dissonance_penalty,
        }


@dataclass
class SynthesisResult:
    """Complete synthesis result from Gemini analysis."""

    dissonance_flags: List[DissonanceFlag]
    overall_coherence_score: int
    score_breakdown: ScoreBreakdown
    strengths: List[str]
    top_3_priorities: List[str]
    metrics: Dict[str, Any]  # Raw metrics for frontend

    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization."""
        return {
            "dissonance_flags": [f.to_dict() for f in self.dissonance_flags],
            "overall_coherence_score": self.overall_coherence_score,
            "score_breakdown": self.score_breakdown.to_dict(),
            "strengths": self.strengths,
            "top_3_priorities": self.top_3_priorities,
            "metrics": self.metrics,
        }


def calculate_coherence_score(
    eye_contact_pct: int,
    filler_count: int,
    fidget_count: int,
    speaking_pace_wpm: int,
    critical_flag_count: int,
) -> tuple[int, ScoreBreakdown]:
    """Calculate coherence score based on metrics.

    Weighted scoring (0-100):
    - Eye contact: 30% (higher is better)
    - Filler words: 25% (fewer is better, <5 is excellent)
    - Fidgeting: 20% (fewer is better, <3 is excellent)
    - Speaking pace: 15% (140-160 WPM is optimal)
    - Dissonance penalties: -10 each for critical flags

    Returns:
        Tuple of (total_score, breakdown)
    """
    # Eye contact score (0-30 points)
    # 80%+ = 30 points, linear scale down
    eye_score = min(30, int((eye_contact_pct / 100) * 30))

    # Filler words score (0-25 points)
    # 0-5 fillers = 25 points, 20+ fillers = 0 points
    if filler_count <= 5:
        filler_score = 25
    elif filler_count >= 20:
        filler_score = 0
    else:
        filler_score = max(0, int((20 - filler_count) / 15 * 25))

    # Fidgeting score (0-20 points)
    # 0-3 fidgets = 20 points, 15+ fidgets = 0 points
    if fidget_count <= 3:
        fidget_score = 20
    elif fidget_count >= 15:
        fidget_score = 0
    else:
        fidget_score = max(0, int((15 - fidget_count) / 12 * 20))

    # Speaking pace score (0-15 points)
    # 140-160 WPM is optimal (15 points)
    # Below 120 or above 180 = 0 points
    if 140 <= speaking_pace_wpm <= 160:
        pace_score = 15
    elif 120 <= speaking_pace_wpm < 140:
        pace_score = 10 + int((speaking_pace_wpm - 120) / 20 * 5)
    elif 160 < speaking_pace_wpm <= 180:
        pace_score = 15 - int((speaking_pace_wpm - 160) / 20 * 5)
    elif speaking_pace_wpm < 120:
        pace_score = max(0, int(speaking_pace_wpm / 120 * 10))
    else:  # > 180
        pace_score = max(0, 10 - int((speaking_pace_wpm - 180) / 20 * 10))

    # Dissonance penalty (-10 per critical flag)
    dissonance_penalty = critical_flag_count * -10

    # Calculate total score
    total_score = eye_score + filler_score + fidget_score + pace_score + dissonance_penalty
    total_score = max(0, min(100, total_score))  # Clamp to 0-100

    breakdown = ScoreBreakdown(
        eye_contact=eye_score,
        filler_words=filler_score,
        fidgeting=fidget_score,
        pacing=pace_score,
        dissonance_penalty=dissonance_penalty,
    )

    return total_score, breakdown


def _extract_metrics_from_inputs(
    twelvelabs_data: List[Dict[str, Any]],
    deepgram_data: Dict[str, Any],
) -> Dict[str, Any]:
    """Extract structured metrics from TwelveLabs and Deepgram data.

    Returns metrics dict with:
    - eye_contact_pct: Percentage based on "looking at camera" detections
    - filler_count: From Deepgram metrics
    - fidget_count: From fidgeting query results
    - speaking_pace_wpm: From Deepgram metrics
    """
    # Default metrics
    metrics = {
        "eye_contact_pct": 70,  # Default estimate
        "filler_count": 0,
        "fidget_count": 0,
        "speaking_pace_wpm": 150,  # Default estimate
        "total_duration_seconds": 0,
    }

    # Extract from Deepgram data
    if deepgram_data:
        if "metrics" in deepgram_data:
            dm = deepgram_data["metrics"]
            metrics["filler_count"] = dm.get("filler_analysis", {}).get("total_count", 0)
            metrics["speaking_pace_wpm"] = dm.get("speaking_pace_wpm", 150)
            metrics["total_duration_seconds"] = dm.get("total_duration_seconds", 0)
        elif "confidence" in deepgram_data:
            # Basic format without extended metrics
            words = deepgram_data.get("words", [])
            if words:
                metrics["total_duration_seconds"] = words[-1].get("end", 0)

    # Extract from TwelveLabs data
    if twelvelabs_data:
        eye_contact_clips = 0
        eye_contact_duration = 0.0
        fidget_clips = 0
        total_duration = metrics.get("total_duration_seconds", 0)

        for query_result in twelvelabs_data:
            query = query_result.get("query", "").lower()
            clips = query_result.get("clips", [])

            # Eye contact detection
            if "looking at camera" in query or "eye contact" in query:
                for clip in clips:
                    eye_contact_clips += 1
                    clip_duration = clip.get("end", 0) - clip.get("start", 0)
                    eye_contact_duration += clip_duration

            # Fidgeting detection
            if "fidget" in query or "nervous" in query:
                fidget_clips += len(clips)

        # Calculate eye contact percentage
        if total_duration > 0 and eye_contact_duration > 0:
            metrics["eye_contact_pct"] = min(100, int((eye_contact_duration / total_duration) * 100))

        metrics["fidget_count"] = fidget_clips

    return metrics


def _build_gemini_prompt(
    transcript: str,
    twelvelabs_data: List[Dict[str, Any]],
    metrics: Dict[str, Any],
) -> str:
    """Build the analysis prompt for Gemini."""

    # Format TwelveLabs data for the prompt
    visual_events = []
    for query_result in twelvelabs_data:
        query = query_result.get("query", "")
        clips = query_result.get("clips", [])
        if clips:
            for clip in clips:
                visual_events.append({
                    "description": query,
                    "start": clip.get("start", 0),
                    "end": clip.get("end", 0),
                    "confidence": clip.get("confidence", 0),
                })

    prompt = f"""You are an expert presentation coach. Analyze this presentation for visual-verbal dissonance.

You have the following data:

1. TRANSCRIPT (with word-level timestamps available):
"{transcript}"

2. VISUAL ANALYSIS (body language detections from video):
{json.dumps(visual_events, indent=2)}

3. CURRENT METRICS:
- Eye contact: {metrics.get('eye_contact_pct', 70)}%
- Filler words detected: {metrics.get('filler_count', 0)}
- Fidgeting instances: {metrics.get('fidget_count', 0)}
- Speaking pace: {metrics.get('speaking_pace_wpm', 150)} WPM
- Total duration: {metrics.get('total_duration_seconds', 0):.1f} seconds

DETECT THESE CRITICAL ISSUES:

A) EMOTIONAL_MISMATCH: Speech sentiment contradicts facial expression
   - Example: Saying "excited" or "thrilled" but detected "anxious face" or "frowning"
   - Look for positive words paired with negative visual cues (or vice versa)

B) MISSING_GESTURE: Deictic phrases without corresponding pointing
   - Look for phrases like "look at this", "here we see", "this chart shows"
   - Flag if no "pointing" or "gesturing" was detected within ±3 seconds

C) PACING_MISMATCH: Speaking too fast/slow for the content complexity
   - If pace is >170 WPM with complex content, flag as too fast
   - If pace is <120 WPM, flag as too slow

For each issue found, provide:
- Exact timestamp (in seconds)
- Severity: "HIGH" (must fix), "MEDIUM" (should fix), or "LOW" (minor)
- Clear description of what was wrong
- Specific, actionable coaching tip

Also identify:
- 2-4 STRENGTHS: What the presenter did well
- TOP 3 PRIORITIES: Most important improvements to focus on

Return ONLY valid JSON in this exact format:
{{
    "dissonance_flags": [
        {{
            "type": "EMOTIONAL_MISMATCH",
            "timestamp": 45.2,
            "clip_start": 43.0,
            "clip_end": 48.0,
            "severity": "HIGH",
            "description": "Said 'thrilled to present' but facial expression showed anxiety",
            "coaching_tip": "Practice saying this line while smiling in a mirror. Your face should match your excitement.",
            "transcript_excerpt": "We're thrilled to present our solution..."
        }}
    ],
    "strengths": ["Clear voice projection", "Logical structure"],
    "top_3_priorities": [
        "Reduce nervous fidgeting (8 instances)",
        "Increase eye contact with camera (currently 62%, target 80%)",
        "Match facial expressions to emotional language"
    ]
}}

If no dissonance is detected, return an empty array for dissonance_flags.
Focus on the most impactful issues - do not flag every minor concern."""

    return prompt


async def synthesize_analysis(
    twelvelabs_data: List[Dict[str, Any]],
    deepgram_data: Dict[str, Any],
) -> SynthesisResult:
    """Synthesize TwelveLabs and Deepgram data to detect dissonance.

    API_CALL: Gemini 1.5 Pro - generate_content()

    Args:
        twelvelabs_data: List of query results from TwelveLabs
            Format: [{"query": "...", "clips": [{"start": ..., "end": ..., "confidence": ...}]}]
        deepgram_data: Transcription result from Deepgram
            Format: {"transcript": "...", "words": [...], "confidence": ..., "metrics": {...}}

    Returns:
        SynthesisResult with dissonance flags, coherence score, and coaching insights
    """
    if not is_available():
        logger.warning("Gemini client not available. Returning mock analysis.")
        return _generate_mock_result(twelvelabs_data, deepgram_data)

    # Extract metrics from inputs
    metrics = _extract_metrics_from_inputs(twelvelabs_data, deepgram_data)

    # Get transcript
    transcript = deepgram_data.get("transcript", "") if deepgram_data else ""

    # Build the analysis prompt
    prompt = _build_gemini_prompt(transcript, twelvelabs_data, metrics)

    try:
        # API_CALL: Gemini 1.5 Pro
        logger.info("Calling Gemini for dissonance analysis...")
        response = await asyncio.to_thread(
            client.generate_content,
            prompt,
            generation_config={
                "temperature": 0.3,  # Lower temperature for more consistent JSON
                "max_output_tokens": 2048,
            },
        )

        # Parse the response
        response_text = response.text.strip()

        # Handle potential markdown code blocks
        if "```json" in response_text:
            start = response_text.find("```json") + 7
            end = response_text.find("```", start)
            response_text = response_text[start:end].strip()
        elif "```" in response_text:
            start = response_text.find("```") + 3
            end = response_text.find("```", start)
            response_text = response_text[start:end].strip()

        result = json.loads(response_text)

        # Parse dissonance flags
        dissonance_flags = []
        for flag_data in result.get("dissonance_flags", []):
            try:
                flag = DissonanceFlag(
                    type=DissonanceType(flag_data.get("type", "EMOTIONAL_MISMATCH")),
                    timestamp=float(flag_data.get("timestamp", 0)),
                    severity=Severity(flag_data.get("severity", "MEDIUM")),
                    description=flag_data.get("description", ""),
                    coaching_tip=flag_data.get("coaching_tip", ""),
                    clip_start=flag_data.get("clip_start"),
                    clip_end=flag_data.get("clip_end"),
                    transcript_excerpt=flag_data.get("transcript_excerpt"),
                )
                dissonance_flags.append(flag)
            except (ValueError, KeyError) as e:
                logger.warning(f"Failed to parse dissonance flag: {e}")
                continue

        # Count critical flags for scoring
        critical_flag_count = sum(1 for f in dissonance_flags if f.severity == Severity.HIGH)

        # Calculate coherence score
        score, breakdown = calculate_coherence_score(
            eye_contact_pct=metrics.get("eye_contact_pct", 70),
            filler_count=metrics.get("filler_count", 0),
            fidget_count=metrics.get("fidget_count", 0),
            speaking_pace_wpm=metrics.get("speaking_pace_wpm", 150),
            critical_flag_count=critical_flag_count,
        )

        logger.info(
            f"Analysis complete: {len(dissonance_flags)} flags, "
            f"coherence score: {score}"
        )

        return SynthesisResult(
            dissonance_flags=dissonance_flags,
            overall_coherence_score=score,
            score_breakdown=breakdown,
            strengths=result.get("strengths", ["Clear communication"]),
            top_3_priorities=result.get("top_3_priorities", ["Practice more"]),
            metrics={
                "eyeContact": metrics.get("eye_contact_pct", 70),
                "fillerWords": metrics.get("filler_count", 0),
                "fidgeting": metrics.get("fidget_count", 0),
                "speakingPace": metrics.get("speaking_pace_wpm", 150),
                "speakingPaceTarget": "140-160",
            },
        )

    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse Gemini response as JSON: {e}")
        return _generate_mock_result(twelvelabs_data, deepgram_data)
    except Exception as e:
        logger.error(f"Gemini analysis failed: {e}")
        return _generate_mock_result(twelvelabs_data, deepgram_data)


def _generate_mock_result(
    twelvelabs_data: List[Dict[str, Any]],
    deepgram_data: Dict[str, Any],
) -> SynthesisResult:
    """Generate a mock result when Gemini is unavailable.

    DEMO_CACHE: Use this for offline demo mode.
    """
    metrics = _extract_metrics_from_inputs(twelvelabs_data, deepgram_data)

    # Create sample dissonance flags
    mock_flags = [
        DissonanceFlag(
            type=DissonanceType.EMOTIONAL_MISMATCH,
            timestamp=45.2,
            severity=Severity.HIGH,
            description="Said 'thrilled to present' but facial expression showed anxiety",
            coaching_tip="Practice saying this line while smiling in a mirror. Your face should match your excitement.",
            clip_start=43.0,
            clip_end=48.0,
            transcript_excerpt="We're thrilled to present our solution...",
        ),
        DissonanceFlag(
            type=DissonanceType.MISSING_GESTURE,
            timestamp=83.5,
            severity=Severity.MEDIUM,
            description="Said 'look at this data' without pointing at screen",
            coaching_tip="When referencing visuals, physically point to anchor audience attention",
            clip_start=82.0,
            clip_end=85.0,
        ),
    ]

    critical_count = sum(1 for f in mock_flags if f.severity == Severity.HIGH)
    score, breakdown = calculate_coherence_score(
        eye_contact_pct=metrics.get("eye_contact_pct", 62),
        filler_count=metrics.get("filler_count", 12),
        fidget_count=metrics.get("fidget_count", 8),
        speaking_pace_wpm=metrics.get("speaking_pace_wpm", 156),
        critical_flag_count=critical_count,
    )

    return SynthesisResult(
        dissonance_flags=mock_flags,
        overall_coherence_score=score,
        score_breakdown=breakdown,
        strengths=["Clear voice projection", "Logical structure"],
        top_3_priorities=[
            f"Reduce nervous fidgeting ({metrics.get('fidget_count', 8)} instances)",
            f"Increase eye contact with camera (currently {metrics.get('eye_contact_pct', 62)}%, target 80%)",
            "Match facial expressions to emotional language",
        ],
        metrics={
            "eyeContact": metrics.get("eye_contact_pct", 62),
            "fillerWords": metrics.get("filler_count", 12),
            "fidgeting": metrics.get("fidget_count", 8),
            "speakingPace": metrics.get("speaking_pace_wpm", 156),
            "speakingPaceTarget": "140-160",
        },
    )


async def synthesize_analysis_with_cache(
    twelvelabs_data: List[Dict[str, Any]],
    deepgram_data: Dict[str, Any],
    cache: dict,
    video_id: str,
) -> SynthesisResult:
    """Synthesize analysis and store results in cache.

    Store: cache[video_id]["gemini_data"] = {...}
    """
    result = await synthesize_analysis(twelvelabs_data, deepgram_data)

    # Store in cache
    cache[video_id] = cache.get(video_id, {})
    cache[video_id]["gemini_data"] = result.to_dict()

    return result
