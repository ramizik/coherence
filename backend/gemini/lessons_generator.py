"""Gemini-powered personalized improvement lessons generator.

This module uses Gemini to generate structured, personalized improvement
lessons based on the user's specific presentation analysis results.

Each lesson includes:
- Problem identification
- Targeted exercises
- Success metrics
- Realistic timeline
"""

import asyncio
import json
import logging
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional

from backend.gemini.gemini_client import client, is_available

logger = logging.getLogger(__name__)


@dataclass
class ImprovementLesson:
    """A personalized improvement lesson for a specific problem area."""

    problem_type: str  # "eye_contact", "filler_words", "fidgeting", "pacing", "emotional_mismatch", etc.
    title: str
    description: str
    exercises: List[str]  # 3-5 practical exercises
    timeline: str  # "1 week", "2 weeks", etc.
    success_metrics: str
    priority: int = 1  # 1 = highest priority

    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization."""
        return {
            "problemType": self.problem_type,
            "title": self.title,
            "description": self.description,
            "exercises": self.exercises,
            "timeline": self.timeline,
            "successMetrics": self.success_metrics,
            "priority": self.priority,
        }


def _build_lessons_prompt(
    metrics: Dict[str, Any],
    dissonance_flags: List[Dict[str, Any]],
    coherence_score: int,
    transcript_excerpt: str = "",
) -> str:
    """Build the Gemini prompt for generating personalized lessons."""

    # Summarize the issues found
    issue_summary = []

    # Metrics-based issues
    if metrics.get("eyeContact", 100) < 70:
        issue_summary.append(f"- Eye contact: {metrics.get('eyeContact', 0)}% (below recommended 70%)")
    if metrics.get("fillerWords", 0) > 5:
        issue_summary.append(f"- Filler words: {metrics.get('fillerWords', 0)} detected (target: <5)")
    if metrics.get("fidgeting", 0) > 5:
        issue_summary.append(f"- Nervous gestures/fidgeting: {metrics.get('fidgeting', 0)} instances (target: <5)")

    pace = metrics.get("speakingPace", 150)
    if pace < 120 or pace > 170:
        issue_summary.append(f"- Speaking pace: {pace} WPM (optimal: 140-160 WPM)")

    # Dissonance flag issues
    flag_types = {}
    for flag in dissonance_flags:
        flag_type = flag.get("type", "UNKNOWN")
        severity = flag.get("severity", "MEDIUM")
        if flag_type not in flag_types:
            flag_types[flag_type] = {"count": 0, "high_count": 0}
        flag_types[flag_type]["count"] += 1
        if severity == "HIGH":
            flag_types[flag_type]["high_count"] += 1

    for flag_type, counts in flag_types.items():
        issue_summary.append(
            f"- {flag_type.replace('_', ' ').title()}: {counts['count']} instances "
            f"({counts['high_count']} high severity)"
        )

    issues_text = "\n".join(issue_summary) if issue_summary else "No major issues detected."

    prompt = f"""You are an expert presentation coach. Based on this presenter's analysis results,
create personalized improvement lessons.

ANALYSIS SUMMARY:
- Overall Coherence Score: {coherence_score}/100
- Eye Contact: {metrics.get('eyeContact', 'N/A')}%
- Filler Words: {metrics.get('fillerWords', 'N/A')} instances
- Fidgeting/Nervous Gestures: {metrics.get('fidgeting', 'N/A')} instances
- Speaking Pace: {metrics.get('speakingPace', 'N/A')} WPM

ISSUES IDENTIFIED:
{issues_text}

DISSONANCE FLAGS ({len(dissonance_flags)} total):
{json.dumps(dissonance_flags[:5], indent=2) if dissonance_flags else "None"}

YOUR TASK:
Generate 3-5 personalized improvement lessons, each targeting a specific weakness.
Order lessons by priority (most impactful first).

For each lesson, provide:
1. problem_type: Category (e.g., "eye_contact", "filler_words", "fidgeting", "pacing", "emotional_expression")
2. title: Catchy, encouraging title (e.g., "Master the Power of Eye Contact")
3. description: 2-3 sentences explaining why this matters and what improvement looks like
4. exercises: List of 3-5 specific, actionable exercises the presenter can do TODAY
5. timeline: Realistic timeframe to see improvement (e.g., "1-2 weeks with daily practice")
6. success_metrics: How to measure improvement (e.g., "Maintain 80%+ eye contact for full 3-minute practice")
7. priority: 1-5 (1 = most important)

Return ONLY valid JSON in this exact format:
{{
    "lessons": [
        {{
            "problem_type": "eye_contact",
            "title": "Master the Power of Eye Contact",
            "description": "Eye contact builds trust and keeps your audience engaged...",
            "exercises": [
                "Practice the 3-second rule: hold eye contact with one person for 3 seconds before moving on",
                "Record yourself presenting and count how often you look away",
                "Place sticky notes at eye level around your practice space as 'audience members'"
            ],
            "timeline": "1-2 weeks with daily 10-minute practice",
            "success_metrics": "Maintain 75%+ eye contact during a full 3-minute practice presentation",
            "priority": 1
        }}
    ]
}}

Focus on the presenter's SPECIFIC weaknesses. Don't generate generic advice.
If the presenter scored well in an area, don't include a lesson for it.
Be encouraging but actionable - these lessons should lead to real improvement."""

    return prompt


async def generate_improvement_lessons(
    metrics: Dict[str, Any],
    dissonance_flags: List[Dict[str, Any]],
    coherence_score: int,
    transcript_excerpt: str = "",
) -> List[ImprovementLesson]:
    """Generate personalized improvement lessons using Gemini.

    Args:
        metrics: Analysis metrics (eyeContact, fillerWords, fidgeting, speakingPace)
        dissonance_flags: List of dissonance flags from analysis
        coherence_score: Overall coherence score (0-100)
        transcript_excerpt: Optional excerpt from transcript for context

    Returns:
        List of ImprovementLesson objects, ordered by priority
    """
    if not is_available():
        logger.warning("Gemini client not available. Returning default lessons.")
        return _generate_default_lessons(metrics, dissonance_flags)

    prompt = _build_lessons_prompt(metrics, dissonance_flags, coherence_score, transcript_excerpt)

    try:
        logger.info("Calling Gemini for personalized improvement lessons...")
        response = await asyncio.to_thread(
            client.generate_content,
            prompt,
            generation_config={
                "temperature": 0.4,  # Slightly creative but consistent
                "max_output_tokens": 3000,
            },
        )

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

        lessons = []
        for lesson_data in result.get("lessons", []):
            try:
                lesson = ImprovementLesson(
                    problem_type=lesson_data.get("problem_type", "general"),
                    title=lesson_data.get("title", "Improvement Area"),
                    description=lesson_data.get("description", ""),
                    exercises=lesson_data.get("exercises", []),
                    timeline=lesson_data.get("timeline", "2 weeks"),
                    success_metrics=lesson_data.get("success_metrics", ""),
                    priority=lesson_data.get("priority", 5),
                )
                lessons.append(lesson)
            except Exception as e:
                logger.warning(f"Failed to parse lesson: {e}")
                continue

        # Sort by priority
        lessons.sort(key=lambda x: x.priority)

        logger.info(f"Generated {len(lessons)} personalized improvement lessons")
        return lessons

    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse Gemini lessons response: {e}")
        return _generate_default_lessons(metrics, dissonance_flags)
    except Exception as e:
        logger.error(f"Gemini lessons generation failed: {e}")
        return _generate_default_lessons(metrics, dissonance_flags)


def _generate_default_lessons(
    metrics: Dict[str, Any],
    dissonance_flags: List[Dict[str, Any]],
) -> List[ImprovementLesson]:
    """Generate default lessons when Gemini is unavailable."""

    lessons = []
    priority = 1

    # Eye contact lesson
    if metrics.get("eyeContact", 100) < 75:
        lessons.append(ImprovementLesson(
            problem_type="eye_contact",
            title="Build Confident Eye Contact",
            description="Strong eye contact establishes trust and keeps your audience engaged. "
                       "Your analysis showed room for improvement in this area.",
            exercises=[
                "Practice the 3-second rule: hold eye contact with one spot for 3 seconds before moving",
                "Place 3 sticky notes at eye level around your practice space as 'audience members'",
                "Record a 2-minute practice and count your eye contact breaks",
                "Practice presenting to a friend and ask them to rate your eye contact",
            ],
            timeline="1-2 weeks with daily 10-minute practice",
            success_metrics="Maintain 75%+ eye contact during a full 3-minute presentation",
            priority=priority,
        ))
        priority += 1

    # Filler words lesson
    if metrics.get("fillerWords", 0) > 5:
        lessons.append(ImprovementLesson(
            problem_type="filler_words",
            title="Eliminate Filler Words",
            description="Filler words like 'um', 'uh', and 'like' undermine your authority. "
                       f"You used {metrics.get('fillerWords', 0)} filler words in this presentation.",
            exercises=[
                "Record yourself and count every 'um', 'uh', 'like', and 'you know'",
                "Practice pausing instead of filling silence - silence shows confidence",
                "Ask a friend to clap every time you use a filler word during practice",
                "Slow down your speaking pace - rushing leads to more fillers",
                "Prepare and memorize your first sentence to start strong",
            ],
            timeline="2-3 weeks with daily awareness practice",
            success_metrics="Reduce filler words to fewer than 5 in a 3-minute presentation",
            priority=priority,
        ))
        priority += 1

    # Fidgeting lesson
    if metrics.get("fidgeting", 0) > 5:
        lessons.append(ImprovementLesson(
            problem_type="fidgeting",
            title="Project Calm Confidence",
            description="Nervous gestures and fidgeting distract your audience and undermine your message. "
                       f"We detected {metrics.get('fidgeting', 0)} instances of fidgeting.",
            exercises=[
                "Practice with your hands at your sides or in a 'steeple' position",
                "Hold a pen or clicker to give your hands a purpose",
                "Record yourself and identify your specific fidgeting triggers",
                "Practice power poses for 2 minutes before presenting",
                "Focus on slow, deliberate gestures that emphasize key points",
            ],
            timeline="1-2 weeks with daily practice sessions",
            success_metrics="Reduce nervous gestures to fewer than 3 per presentation",
            priority=priority,
        ))
        priority += 1

    # Speaking pace lesson
    pace = metrics.get("speakingPace", 150)
    if pace < 120 or pace > 170:
        pace_issue = "too slow" if pace < 120 else "too fast"
        lessons.append(ImprovementLesson(
            problem_type="pacing",
            title="Master Your Speaking Pace",
            description=f"Your speaking pace of {pace} WPM is {pace_issue}. "
                       "The optimal range is 140-160 WPM for maximum comprehension.",
            exercises=[
                "Use a metronome app set to 150 BPM and practice matching one word per beat",
                "Record yourself and calculate your actual WPM",
                "Practice deliberate pauses after key points",
                "Mark your script with pace reminders: // for pause, >>> for slow down",
                "Practice with a timer - aim for 150 words per minute",
            ],
            timeline="1-2 weeks with daily timed practice",
            success_metrics="Maintain 140-160 WPM consistently throughout presentation",
            priority=priority,
        ))
        priority += 1

    # Emotional expression lesson (if emotional mismatch flags exist)
    emotional_flags = [f for f in dissonance_flags if f.get("type") == "EMOTIONAL_MISMATCH"]
    if emotional_flags:
        lessons.append(ImprovementLesson(
            problem_type="emotional_expression",
            title="Align Your Words and Expression",
            description="Your facial expressions should match your message. "
                       f"We detected {len(emotional_flags)} instances where your expression didn't match your words.",
            exercises=[
                "Practice key phrases in front of a mirror, focusing on your facial expression",
                "Record yourself saying positive statements and review your expression",
                "Practice 'smiling with your eyes' - genuine expressions engage the upper face",
                "Identify your most enthusiastic points and mark them for extra expression",
            ],
            timeline="2 weeks with daily mirror practice",
            success_metrics="Zero emotional mismatch flags in your next analysis",
            priority=priority,
        ))

    return lessons
