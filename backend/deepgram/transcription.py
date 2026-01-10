"""Deepgram transcription service with derived metrics.

Provides:
- Full transcript with word-level timestamps
- Filler word detection (um, uh, like, you know)
- Speaking pace (WPM) calculation
- Pause detection (gaps >2s between words)
"""
import asyncio
import logging
from dataclasses import dataclass, field
from pathlib import Path
from typing import List, Optional

from deepgram import DeepgramClient, PrerecordedOptions, FileSource

from backend.deepgram.deepgram_client import client

logger = logging.getLogger(__name__)

# Filler words to detect
FILLER_WORDS = {
    "um", "uh", "uhh", "umm", "er", "err", "ah", "ahh",
    "like", "you know", "basically", "actually", "literally",
    "so", "well", "right", "okay", "ok",
}

# Single-word fillers for word-level detection
SINGLE_WORD_FILLERS = {
    "um", "uh", "uhh", "umm", "er", "err", "ah", "ahh",
    "like", "basically", "actually", "literally",
    "so", "well", "right", "okay", "ok",
}

# Two-word filler patterns
TWO_WORD_FILLERS = {
    ("you", "know"),
}

# Pause threshold in seconds
PAUSE_THRESHOLD = 2.0


@dataclass
class WordInfo:
    """Individual word with timing information."""
    word: str
    start: float  # Start time in seconds
    end: float    # End time in seconds
    confidence: float = 1.0
    is_filler: bool = False


@dataclass
class PauseInfo:
    """Detected pause between words."""
    start: float      # Start time in seconds
    end: float        # End time in seconds
    duration: float   # Duration in seconds
    before_word: str  # Word before the pause
    after_word: str   # Word after the pause


@dataclass
class SpeechMetrics:
    """Derived speech metrics from transcription."""
    filler_count: int
    filler_words_detail: List[WordInfo]  # List of filler words with timestamps
    speaking_pace_wpm: int               # Words per minute
    pause_count: int                     # Number of pauses >2s
    pauses: List[PauseInfo]             # Detailed pause info
    total_words: int
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
                }
                for w in self.words
            ],
            "confidence": self.confidence,
            "metrics": {
                "filler_count": self.metrics.filler_count,
                "filler_words_detail": [
                    {"word": w.word, "start": w.start, "end": w.end}
                    for w in self.metrics.filler_words_detail
                ],
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
                "total_duration_seconds": self.metrics.total_duration_seconds,
            },
        }


def _count_fillers(words: List[WordInfo]) -> tuple[int, List[WordInfo]]:
    """Count filler words and return list of filler word instances.

    Detects:
    - Single filler words: um, uh, like, etc.
    - Two-word patterns: "you know"
    """
    filler_count = 0
    filler_instances = []

    i = 0
    while i < len(words):
        word_lower = words[i].word.lower().strip(".,!?")

        # Check for two-word fillers first
        if i + 1 < len(words):
            next_word_lower = words[i + 1].word.lower().strip(".,!?")
            if (word_lower, next_word_lower) in TWO_WORD_FILLERS:
                filler_count += 1
                # Mark both words as fillers
                words[i].is_filler = True
                words[i + 1].is_filler = True
                filler_instances.append(WordInfo(
                    word=f"{words[i].word} {words[i + 1].word}",
                    start=words[i].start,
                    end=words[i + 1].end,
                    confidence=min(words[i].confidence, words[i + 1].confidence),
                    is_filler=True,
                ))
                i += 2
                continue

        # Check for single-word fillers
        if word_lower in SINGLE_WORD_FILLERS:
            filler_count += 1
            words[i].is_filler = True
            filler_instances.append(words[i])

        i += 1

    return filler_count, filler_instances


def _calculate_speaking_pace(words: List[WordInfo], duration_seconds: float) -> int:
    """Calculate speaking pace in words per minute.

    Args:
        words: List of words with timestamps
        duration_seconds: Total duration of the audio

    Returns:
        Words per minute (WPM)
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
    """Detect pauses longer than threshold between words.

    Args:
        words: List of words with timestamps

    Returns:
        List of detected pauses
    """
    pauses = []

    for i in range(len(words) - 1):
        current_word = words[i]
        next_word = words[i + 1]

        gap = next_word.start - current_word.end

        if gap >= PAUSE_THRESHOLD:
            pauses.append(PauseInfo(
                start=current_word.end,
                end=next_word.start,
                duration=round(gap, 2),
                before_word=current_word.word,
                after_word=next_word.word,
            ))

    return pauses


async def transcribe_audio(
    audio_path: str | Path,
    language: str = "en",
) -> TranscriptionResult:
    """Transcribe audio file and extract speech metrics.

    API_CALL: Deepgram.listen.prerecorded()

    Args:
        audio_path: Path to audio or video file (MP4, MOV, WebM, MP3, WAV, etc.)
        language: Language code (default: "en" for English)

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
    # Using nova-2 model for best accuracy
    options = PrerecordedOptions(
        model="nova-2",
        language=language,
        punctuate=True,       # Add punctuation
        diarize=False,        # Skip speaker diarization for speed
        smart_format=True,    # Smart formatting for numbers, dates
        filler_words=True,    # Detect filler words (um, uh)
        utterances=True,      # Group into utterances
    )

    # Create file source payload
    payload: FileSource = {
        "buffer": buffer_data,
    }

    # API_CALL: Deepgram.listen.rest.v1.transcribe_file()
    response = await asyncio.to_thread(
        client.listen.rest.v1.transcribe_file,
        payload,
        options,
    )

    # Extract results
    result = response.results

    if not result or not result.channels:
        raise ValueError("No transcription results returned from Deepgram")

    channel = result.channels[0]

    if not channel.alternatives:
        raise ValueError("No alternatives in transcription result")

    alternative = channel.alternatives[0]

    # Build transcript
    transcript = alternative.transcript or ""

    # Extract word-level timing
    words: List[WordInfo] = []
    raw_words = alternative.words or []

    for w in raw_words:
        words.append(WordInfo(
            word=w.word,
            start=w.start,
            end=w.end,
            confidence=getattr(w, "confidence", 1.0),
            is_filler=False,  # Will be marked in _count_fillers
        ))

    # Calculate confidence
    confidence = alternative.confidence if hasattr(alternative, "confidence") else 0.0
    if confidence == 0.0 and words:
        # Average word confidence
        confidence = sum(w.confidence for w in words) / len(words)

    # Derive metrics
    filler_count, filler_words_detail = _count_fillers(words)

    # Get duration from metadata
    duration_seconds = 0.0
    if hasattr(result, "metadata") and result.metadata:
        duration_seconds = getattr(result.metadata, "duration", 0.0)
    elif words:
        # Estimate from word timestamps
        duration_seconds = words[-1].end

    speaking_pace = _calculate_speaking_pace(words, duration_seconds)
    pauses = _detect_pauses(words)

    metrics = SpeechMetrics(
        filler_count=filler_count,
        filler_words_detail=filler_words_detail,
        speaking_pace_wpm=speaking_pace,
        pause_count=len(pauses),
        pauses=pauses,
        total_words=len(words),
        total_duration_seconds=duration_seconds,
    )

    logger.info(
        f"Transcription complete: {len(words)} words, "
        f"{filler_count} fillers, {speaking_pace} WPM, "
        f"{len(pauses)} pauses"
    )

    return TranscriptionResult(
        transcript=transcript,
        words=words,
        confidence=round(confidence, 2),
        metrics=metrics,
    )


async def transcribe_audio_with_cache(
    audio_path: str | Path,
    cache: dict,
    video_id: str,
    language: str = "en",
) -> TranscriptionResult:
    """Transcribe audio and store results in cache.

    Convenience wrapper that stores results in the provided cache dict.

    Args:
        audio_path: Path to audio/video file
        cache: Dict to store results (typically in-memory video cache)
        video_id: Video ID for cache key
        language: Language code

    Returns:
        TranscriptionResult
    """
    result = await transcribe_audio(audio_path, language)

    # Store in cache
    cache[video_id] = cache.get(video_id, {})
    cache[video_id]["deepgram_data"] = result.to_dict()

    return result
