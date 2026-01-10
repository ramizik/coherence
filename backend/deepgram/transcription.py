"""Deepgram transcription service with intelligent filler word detection.

Provides:
- Full transcript with word-level timestamps
- Two-tier filler word detection:
  1. Deepgram's built-in vocal disfluencies (um, uh, mhmm, etc.)
  2. LLM-based contextual filler detection (like, you know, basically - only when used as fillers)
- Speaking pace (WPM) calculation
- Pause detection (gaps >2s between words)
"""

import asyncio
import json
import logging
from dataclasses import dataclass
from enum import Enum
from pathlib import Path
from typing import List, Optional, Set

from anthropic import Anthropic
from deepgram import PrerecordedOptions, FileSource

from backend.deepgram.deepgram_client import client

logger = logging.getLogger(__name__)


class FillerType(str, Enum):
    """Classification of filler word types."""

    VOCAL_DISFLUENCY = "vocal_disfluency"  # um, uh, mhmm - always fillers
    CONTEXTUAL = "contextual"  # like, you know, basically - depends on context


# Deepgram's recognized vocal disfluencies (always fillers)
# These are the exact spellings Deepgram uses
DEEPGRAM_FILLERS: Set[str] = {"uh", "um", "mhmm", "mm-mm", "uh-uh", "uh-huh", "nuh-uh"}

# Pause threshold in seconds
PAUSE_THRESHOLD = 2.0


@dataclass
class WordInfo:
    """Individual word with timing information."""

    word: str
    start: float  # Start time in seconds
    end: float  # End time in seconds
    confidence: float = 1.0
    is_filler: bool = False
    filler_type: Optional[FillerType] = None


@dataclass
class PauseInfo:
    """Detected pause between words."""

    start: float  # Start time in seconds
    end: float  # End time in seconds
    duration: float  # Duration in seconds
    before_word: str  # Word before the pause
    after_word: str  # Word after the pause


@dataclass
class FillerAnalysis:
    """Detailed filler word analysis."""

    total_count: int
    vocal_disfluency_count: int  # um, uh, etc.
    contextual_filler_count: int  # like, you know (when used as fillers)
    filler_words: List[WordInfo]  # All filler instances with timestamps
    filler_rate_per_minute: float  # Fillers per minute of speech


@dataclass
class SpeechMetrics:
    """Derived speech metrics from transcription."""

    filler_analysis: FillerAnalysis
    speaking_pace_wpm: int  # Words per minute (excluding fillers)
    pause_count: int  # Number of pauses >2s
    pauses: List[PauseInfo]  # Detailed pause info
    total_words: int
    content_words: int  # Words excluding fillers
    total_duration_seconds: float


@dataclass
class TranscriptionResult:
    """Complete transcription result with metrics."""

    transcript: str
    words: List[WordInfo]
    confidence: float
    metrics: SpeechMetrics

    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization and caching."""
        return {
            "transcript": self.transcript,
            "words": [
                {
                    "word": w.word,
                    "start": w.start,
                    "end": w.end,
                    "confidence": w.confidence,
                    "is_filler": w.is_filler,
                    "filler_type": w.filler_type.value if w.filler_type else None,
                }
                for w in self.words
            ],
            "confidence": self.confidence,
            "metrics": {
                "filler_analysis": {
                    "total_count": self.metrics.filler_analysis.total_count,
                    "vocal_disfluency_count": self.metrics.filler_analysis.vocal_disfluency_count,
                    "contextual_filler_count": self.metrics.filler_analysis.contextual_filler_count,
                    "filler_words": [
                        {
                            "word": w.word,
                            "start": w.start,
                            "end": w.end,
                            "filler_type": (
                                w.filler_type.value if w.filler_type else None
                            ),
                        }
                        for w in self.metrics.filler_analysis.filler_words
                    ],
                    "filler_rate_per_minute": self.metrics.filler_analysis.filler_rate_per_minute,
                },
                "speaking_pace_wpm": self.metrics.speaking_pace_wpm,
                "pause_count": self.metrics.pause_count,
                "pauses": [
                    {
                        "start": p.start,
                        "end": p.end,
                        "duration": p.duration,
                        "before_word": p.before_word,
                        "after_word": p.after_word,
                    }
                    for p in self.metrics.pauses
                ],
                "total_words": self.metrics.total_words,
                "content_words": self.metrics.content_words,
                "total_duration_seconds": self.metrics.total_duration_seconds,
            },
        }


def _detect_vocal_disfluencies(words: List[WordInfo]) -> List[WordInfo]:
    """Detect Deepgram's vocal disfluency fillers (um, uh, etc.).

    These are ALWAYS fillers - no context needed.
    """
    fillers = []

    for word in words:
        word_clean = word.word.lower().strip(".,!?")
        if word_clean in DEEPGRAM_FILLERS:
            word.is_filler = True
            word.filler_type = FillerType.VOCAL_DISFLUENCY
            fillers.append(word)

    return fillers


async def _detect_contextual_fillers_with_llm(
    transcript: str,
    words: List[WordInfo],
    anthropic_client: Optional[Anthropic] = None,
) -> List[WordInfo]:
    """Use LLM to detect contextual filler words.

    Words like "like", "you know", "basically", "actually", "literally", "so",
    "right", "I mean" are only fillers in certain contexts. An LLM can understand
    the difference between:
    - "I like pizza" (not a filler)
    - "It was, like, really good" (filler)

    API_CALL: Anthropic Claude API
    """
    if not anthropic_client:
        try:
            anthropic_client = Anthropic()
        except Exception as e:
            logger.warning(f"Could not initialize Anthropic client: {e}")
            return []

    if not transcript.strip():
        return []

    # Build word list with indices for the LLM to reference
    word_list = [
        {"index": i, "word": w.word, "start": w.start, "end": w.end}
        for i, w in enumerate(words)
        if not w.is_filler  # Skip already-detected vocal disfluencies
    ]

    prompt = f"""Analyze this speech transcript and identify words/phrases used as FILLER words or verbal tics.

TRANSCRIPT:
"{transcript}"

WORD LIST WITH TIMESTAMPS:
{json.dumps(word_list, indent=2)}

FILLER DETECTION RULES:
- Only mark words as fillers when they're used as verbal tics, NOT when they have semantic meaning
- Common contextual fillers include: "like", "you know", "basically", "actually", "literally", "so", "right", "I mean", "kind of", "sort of", "well", "okay"

EXAMPLES:
- "I like pizza" → "like" is NOT a filler (it's a verb)
- "It was, like, amazing" → "like" IS a filler (verbal tic)
- "You know the answer" → "you know" is NOT a filler (asking about knowledge)
- "It's, you know, complicated" → "you know" IS a filler (verbal tic)
- "I actually went there" → "actually" might be a filler if it adds no meaning
- "Actually, that's wrong" → "actually" is NOT a filler (contrast marker)

Return a JSON array of filler word indices. Only include words that are clearly being used as fillers, not for their semantic meaning.

Return ONLY valid JSON in this format:
{{"filler_indices": [1, 5, 12]}}

If no contextual fillers are found, return:
{{"filler_indices": []}}"""

    try:
        response = await asyncio.to_thread(
            anthropic_client.messages.create,
            model="claude-sonnet-4-20250514",
            max_tokens=1024,
            messages=[{"role": "user", "content": prompt}],
        )

        # Parse response
        response_text = response.content[0].text.strip()

        # Extract JSON from response (handle potential markdown formatting)
        if "```" in response_text:
            # Extract JSON from code block
            start = response_text.find("{")
            end = response_text.rfind("}") + 1
            response_text = response_text[start:end]

        result = json.loads(response_text)
        filler_indices = result.get("filler_indices", [])

        # Mark the detected words as contextual fillers
        contextual_fillers = []
        for idx in filler_indices:
            if 0 <= idx < len(words):
                words[idx].is_filler = True
                words[idx].filler_type = FillerType.CONTEXTUAL
                contextual_fillers.append(words[idx])

        logger.info(f"LLM detected {len(contextual_fillers)} contextual fillers")
        return contextual_fillers

    except json.JSONDecodeError as e:
        logger.warning(f"Failed to parse LLM response as JSON: {e}")
        return []
    except Exception as e:
        logger.warning(f"LLM filler detection failed: {e}")
        return []


def _calculate_speaking_pace(
    words: List[WordInfo],
    duration_seconds: float,
) -> int:
    """Calculate speaking pace in words per minute.

    Only counts content words (excludes fillers) for meaningful pace calculation.
    """
    if duration_seconds <= 0:
        return 0

    # Count non-filler words for actual content pace
    content_words = [w for w in words if not w.is_filler]
    word_count = len(content_words)

    # Calculate based on actual speech time (first word to last word)
    if words:
        speech_start = words[0].start
        speech_end = words[-1].end
        actual_speech_duration = speech_end - speech_start

        if actual_speech_duration > 0:
            duration_minutes = actual_speech_duration / 60.0
            return int(word_count / duration_minutes)

    # Fallback to total duration
    duration_minutes = duration_seconds / 60.0
    return int(word_count / duration_minutes) if duration_minutes > 0 else 0


def _detect_pauses(words: List[WordInfo]) -> List[PauseInfo]:
    """Detect pauses longer than threshold between words."""
    pauses = []

    for i in range(len(words) - 1):
        current_word = words[i]
        next_word = words[i + 1]
        gap = next_word.start - current_word.end

        if gap >= PAUSE_THRESHOLD:
            pauses.append(
                PauseInfo(
                    start=current_word.end,
                    end=next_word.start,
                    duration=round(gap, 2),
                    before_word=current_word.word,
                    after_word=next_word.word,
                )
            )

    return pauses


async def transcribe_audio(
    audio_path: str | Path,
    language: str = "en",
    use_llm_filler_detection: bool = True,
    anthropic_client: Optional[Anthropic] = None,
) -> TranscriptionResult:
    """Transcribe audio file and extract speech metrics.

    API_CALL: Deepgram.listen.prerecorded()
    API_CALL: Anthropic Claude (optional, for contextual filler detection)

    Args:
        audio_path: Path to audio or video file (MP4, MOV, WebM, MP3, WAV, etc.)
        language: Language code (default: "en" for English)
        use_llm_filler_detection: Whether to use LLM for contextual filler detection
        anthropic_client: Optional pre-configured Anthropic client

    Returns:
        TranscriptionResult with transcript, word timestamps, and metrics
    """
    audio_path = Path(audio_path)

    if not audio_path.exists():
        raise FileNotFoundError(f"Audio file not found: {audio_path}")

    logger.info(f"Transcribing audio: {audio_path}")

    # Read the audio file
    with open(audio_path, "rb") as audio_file:
        buffer_data = audio_file.read()

    # Configure transcription options
    # filler_words=True ensures Deepgram includes vocal disfluencies in transcript
    options = PrerecordedOptions(
        model="nova-2",
        language=language,
        punctuate=True,
        diarize=False,
        smart_format=True,
        filler_words=True,  # Include um, uh, mhmm, etc.
        utterances=True,
    )

    payload: FileSource = {"buffer": buffer_data}

    # API_CALL: Deepgram transcription
    response = await asyncio.to_thread(
        client.listen.rest.v1.transcribe_file,
        payload,
        options,
    )

    result = response.results
    if not result or not result.channels:
        raise ValueError("No transcription results returned from Deepgram")

    channel = result.channels[0]
    if not channel.alternatives:
        raise ValueError("No alternatives in transcription result")

    alternative = channel.alternatives[0]
    transcript = alternative.transcript or ""

    # Build word list
    words: List[WordInfo] = []
    for w in alternative.words or []:
        words.append(
            WordInfo(
                word=w.word,
                start=w.start,
                end=w.end,
                confidence=getattr(w, "confidence", 1.0),
                is_filler=False,
                filler_type=None,
            )
        )

    # Calculate confidence
    confidence = alternative.confidence if hasattr(alternative, "confidence") else 0.0
    if confidence == 0.0 and words:
        confidence = sum(w.confidence for w in words) / len(words)

    # Get duration
    duration_seconds = 0.0
    if hasattr(result, "metadata") and result.metadata:
        duration_seconds = getattr(result.metadata, "duration", 0.0)
    elif words:
        duration_seconds = words[-1].end

    # === FILLER DETECTION (Two-tier approach) ===

    # Tier 1: Detect Deepgram's vocal disfluencies (always fillers)
    vocal_fillers = _detect_vocal_disfluencies(words)
    logger.info(f"Detected {len(vocal_fillers)} vocal disfluencies")

    # Tier 2: Use LLM for contextual filler detection (optional)
    contextual_fillers = []
    if use_llm_filler_detection and transcript.strip():
        contextual_fillers = await _detect_contextual_fillers_with_llm(
            transcript, words, anthropic_client
        )

    # Combine filler analysis
    all_fillers = vocal_fillers + contextual_fillers
    filler_rate = 0.0
    if duration_seconds > 0:
        filler_rate = round(len(all_fillers) / (duration_seconds / 60), 2)

    filler_analysis = FillerAnalysis(
        total_count=len(all_fillers),
        vocal_disfluency_count=len(vocal_fillers),
        contextual_filler_count=len(contextual_fillers),
        filler_words=all_fillers,
        filler_rate_per_minute=filler_rate,
    )

    # Calculate other metrics
    speaking_pace = _calculate_speaking_pace(words, duration_seconds)
    pauses = _detect_pauses(words)
    content_words = len([w for w in words if not w.is_filler])

    metrics = SpeechMetrics(
        filler_analysis=filler_analysis,
        speaking_pace_wpm=speaking_pace,
        pause_count=len(pauses),
        pauses=pauses,
        total_words=len(words),
        content_words=content_words,
        total_duration_seconds=duration_seconds,
    )

    logger.info(
        f"Transcription complete: {len(words)} words, "
        f"{filler_analysis.total_count} fillers "
        f"({filler_analysis.vocal_disfluency_count} vocal + "
        f"{filler_analysis.contextual_filler_count} contextual), "
        f"{speaking_pace} WPM, {len(pauses)} pauses"
    )

    return TranscriptionResult(
        transcript=transcript,
        words=words,
        confidence=round(confidence, 2),
        metrics=metrics,
    )


async def transcribe_audio_fast(
    audio_path: str | Path,
    language: str = "en",
) -> TranscriptionResult:
    """Fast transcription without LLM-based filler detection.

    Use this when speed is more important than detecting contextual fillers.
    Still detects vocal disfluencies (um, uh, etc.) via Deepgram.
    """
    return await transcribe_audio(
        audio_path=audio_path,
        language=language,
        use_llm_filler_detection=False,
    )


async def transcribe_audio_with_cache(
    audio_path: str | Path,
    cache: dict,
    video_id: str,
    language: str = "en",
    use_llm_filler_detection: bool = True,
) -> TranscriptionResult:
    """Transcribe audio and store results in cache."""
    result = await transcribe_audio(
        audio_path,
        language,
        use_llm_filler_detection=use_llm_filler_detection,
    )

    cache[video_id] = cache.get(video_id, {})
    cache[video_id]["deepgram_data"] = result.to_dict()

    return result
