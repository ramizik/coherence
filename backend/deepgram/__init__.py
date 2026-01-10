"""Deepgram speech-to-text integration module.

Provides transcription with word-level timestamps and derived metrics:
- Filler word detection (um, uh, like, you know)
- Speaking pace (WPM)
- Pause detection (gaps >2s)
"""
from backend.deepgram.deepgram_client import client
from backend.deepgram.transcription import (
    transcribe_audio,
    TranscriptionResult,
    WordInfo,
    SpeechMetrics,
)

__all__ = [
    "client",
    "transcribe_audio",
    "TranscriptionResult",
    "WordInfo",
    "SpeechMetrics",
]
