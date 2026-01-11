"""Test script for Gemini synthesis module.

Run from project root:
    python -m backend.gemini.app

Or with mock data:
    python -m backend.gemini.app --mock

This script tests the dissonance detection and coherence scoring logic
using sample TwelveLabs and Deepgram data.
"""

import asyncio
import json
import sys
from pathlib import Path

from dotenv import load_dotenv

# Load environment variables from .env file in repository root
env_path = Path(__file__).parent.parent.parent / ".env"
load_dotenv(env_path)

from backend.gemini.synthesis import (
    synthesize_analysis,
    calculate_coherence_score,
    DissonanceType,
    Severity,
)
from backend.gemini.gemini_client import is_available


# Sample TwelveLabs data (simulated query results)
SAMPLE_TWELVELABS_DATA = [
    {
        "query": "person looking at camera",
        "clips": [
            {"start": 0.0, "end": 15.0, "confidence": 0.85},
            {"start": 25.0, "end": 40.0, "confidence": 0.78},
            {"start": 55.0, "end": 70.0, "confidence": 0.82},
        ],
    },
    {
        "query": "person looking away",
        "clips": [
            {"start": 15.0, "end": 25.0, "confidence": 0.72},
            {"start": 40.0, "end": 55.0, "confidence": 0.68},
        ],
    },
    {
        "query": "person smiling",
        "clips": [
            {"start": 5.0, "end": 12.0, "confidence": 0.88},
            {"start": 60.0, "end": 68.0, "confidence": 0.75},
        ],
    },
    {
        "query": "person showing anxiety",
        "clips": [
            {"start": 43.0, "end": 48.0, "confidence": 0.91},
            {"start": 75.0, "end": 80.0, "confidence": 0.67},
        ],
    },
    {
        "query": "person pointing",
        "clips": [
            {"start": 30.0, "end": 33.0, "confidence": 0.85},
        ],
    },
    {
        "query": "person fidgeting with hands",
        "clips": [
            {"start": 12.3, "end": 15.7, "confidence": 0.82},
            {"start": 45.1, "end": 48.9, "confidence": 0.91},
            {"start": 62.0, "end": 65.0, "confidence": 0.76},
            {"start": 78.0, "end": 82.0, "confidence": 0.69},
            {"start": 95.0, "end": 98.0, "confidence": 0.73},
            {"start": 110.0, "end": 113.0, "confidence": 0.80},
            {"start": 125.0, "end": 128.0, "confidence": 0.71},
            {"start": 140.0, "end": 143.0, "confidence": 0.77},
        ],
    },
]

# Sample Deepgram data (simulated transcription result)
SAMPLE_DEEPGRAM_DATA = {
    "transcript": (
        "Hello everyone, um, today I'm, uh, thrilled to present our innovative solution. "
        "You know, we've been working on this for months and, like, the results have been amazing. "
        "If you look at this data, you can see the significant improvements we've made. "
        "Now, I want to show you, um, how this actually works in practice. "
        "Look at this chart - it clearly demonstrates our progress. "
        "In conclusion, um, we believe this will, you know, revolutionize the industry."
    ),
    "words": [
        {"word": "Hello", "start": 0.5, "end": 0.8},
        {"word": "everyone", "start": 0.9, "end": 1.4},
        {"word": "um", "start": 1.6, "end": 1.8},
        {"word": "today", "start": 2.0, "end": 2.4},
        {"word": "I'm", "start": 2.5, "end": 2.7},
        {"word": "uh", "start": 2.9, "end": 3.1},
        {"word": "thrilled", "start": 3.3, "end": 3.8},
        {"word": "to", "start": 3.9, "end": 4.0},
        {"word": "present", "start": 4.1, "end": 4.5},
        # ... more words would follow
        {"word": "industry", "start": 178.5, "end": 179.2},
    ],
    "confidence": 0.94,
    "metrics": {
        "filler_analysis": {
            "total_count": 12,
            "vocal_disfluency_count": 5,
            "contextual_filler_count": 7,
            "filler_words": [],
            "filler_rate_per_minute": 4.0,
        },
        "speaking_pace_wpm": 156,
        "pause_count": 2,
        "pauses": [],
        "total_words": 98,
        "content_words": 86,
        "total_duration_seconds": 180.0,
    },
}


def print_separator(title: str):
    """Print a section separator."""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}\n")


def format_timestamp(seconds: float) -> str:
    """Format seconds as MM:SS."""
    mins = int(seconds // 60)
    secs = int(seconds % 60)
    return f"{mins:02d}:{secs:02d}"


async def test_synthesis(use_mock: bool = False):
    """Run synthesis test with sample data."""

    print_separator("GEMINI SYNTHESIS TEST")
    print(f"Gemini Available: {is_available()}")
    print(f"Using Mock Data: {use_mock or not is_available()}")

    print_separator("INPUT DATA")
    print("TwelveLabs Queries:")
    for query_result in SAMPLE_TWELVELABS_DATA:
        clips_count = len(query_result["clips"])
        print(f"  - \"{query_result['query']}\": {clips_count} clips detected")

    print("\nDeepgram Metrics:")
    metrics = SAMPLE_DEEPGRAM_DATA.get("metrics", {})
    print(f"  - Filler words: {metrics.get('filler_analysis', {}).get('total_count', 0)}")
    print(f"  - Speaking pace: {metrics.get('speaking_pace_wpm', 0)} WPM")
    print(f"  - Duration: {metrics.get('total_duration_seconds', 0):.0f} seconds")

    print_separator("ANALYZING...")

    # Run synthesis
    result = await synthesize_analysis(
        twelvelabs_data=SAMPLE_TWELVELABS_DATA,
        deepgram_data=SAMPLE_DEEPGRAM_DATA,
    )

    print_separator("COHERENCE SCORE")
    print(f"  Overall Score: {result.overall_coherence_score}/100")
    print(f"\n  Score Breakdown:")
    breakdown = result.score_breakdown
    print(f"    Eye Contact:      {breakdown.eye_contact}/30")
    print(f"    Filler Words:     {breakdown.filler_words}/25")
    print(f"    Fidgeting:        {breakdown.fidgeting}/20")
    print(f"    Pacing:           {breakdown.pacing}/15")
    print(f"    Dissonance Penalty: {breakdown.dissonance_penalty}")

    # Determine tier
    if result.overall_coherence_score >= 80:
        tier = "Strong"
    elif result.overall_coherence_score >= 50:
        tier = "Good Start"
    else:
        tier = "Needs Work"
    print(f"\n  Tier: {tier}")

    print_separator("DISSONANCE FLAGS")
    if result.dissonance_flags:
        for i, flag in enumerate(result.dissonance_flags, 1):
            severity_emoji = {"HIGH": "[!]", "MEDIUM": "[~]", "LOW": "[.]"}.get(
                flag.severity.value, "[?]"
            )
            print(f"\n  {i}. {severity_emoji} {flag.type.value}")
            print(f"     Timestamp: {format_timestamp(flag.timestamp)}")
            if flag.clip_start and flag.clip_end:
                print(
                    f"     Clip: {format_timestamp(flag.clip_start)} - {format_timestamp(flag.clip_end)}"
                )
            print(f"     Description: {flag.description}")
            print(f"     Coaching: {flag.coaching_tip}")
            if flag.transcript_excerpt:
                print(f"     Transcript: \"{flag.transcript_excerpt}\"")
    else:
        print("  No dissonance flags detected.")

    print_separator("STRENGTHS")
    for strength in result.strengths:
        print(f"  + {strength}")

    print_separator("TOP 3 PRIORITIES")
    for i, priority in enumerate(result.top_3_priorities, 1):
        print(f"  {i}. {priority}")

    print_separator("METRICS FOR FRONTEND")
    print(json.dumps(result.metrics, indent=2))

    print_separator("FULL JSON OUTPUT")
    output_dict = result.to_dict()
    # Print a preview (truncated)
    preview = {
        "overall_coherence_score": output_dict["overall_coherence_score"],
        "score_breakdown": output_dict["score_breakdown"],
        "dissonance_flags_count": len(output_dict["dissonance_flags"]),
        "strengths": output_dict["strengths"],
        "top_3_priorities": output_dict["top_3_priorities"],
        "metrics": output_dict["metrics"],
    }
    print(json.dumps(preview, indent=2))

    print_separator("TEST COMPLETE")

    return result


def test_score_calculation():
    """Test the coherence score calculation with various inputs."""

    print_separator("SCORE CALCULATION TESTS")

    test_cases = [
        # (eye_contact, fillers, fidgets, pace, critical_flags, expected_range)
        (95, 2, 1, 150, 0, (85, 100)),  # Excellent presenter
        (80, 5, 3, 145, 0, (70, 90)),  # Good presenter
        (62, 12, 8, 156, 1, (40, 65)),  # Average with 1 critical flag
        (40, 20, 15, 180, 2, (0, 30)),  # Poor presenter
        (70, 8, 5, 130, 0, (55, 75)),  # Below optimal pace
    ]

    for i, (eye, fillers, fidgets, pace, flags, (min_exp, max_exp)) in enumerate(
        test_cases, 1
    ):
        score, breakdown = calculate_coherence_score(
            eye_contact_pct=eye,
            filler_count=fillers,
            fidget_count=fidgets,
            speaking_pace_wpm=pace,
            critical_flag_count=flags,
        )

        status = "PASS" if min_exp <= score <= max_exp else "FAIL"
        print(f"Test {i}: {status}")
        print(
            f"  Inputs: eye={eye}%, fillers={fillers}, fidgets={fidgets}, pace={pace}, flags={flags}"
        )
        print(f"  Score: {score} (expected: {min_exp}-{max_exp})")
        print(f"  Breakdown: {breakdown.to_dict()}")
        print()

    print_separator("SCORE TESTS COMPLETE")


async def main():
    """Main entry point."""
    # Check for flags
    use_mock = "--mock" in sys.argv
    test_scores = "--scores" in sys.argv

    if test_scores:
        test_score_calculation()
    else:
        await test_synthesis(use_mock=use_mock)


if __name__ == "__main__":
    asyncio.run(main())
