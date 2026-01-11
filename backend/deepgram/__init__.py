"""Deepgram integration for audio transcription.

Compatible with Deepgram SDK v5.x
"""

from backend.deepgram.deepgram_client import client
from backend.deepgram.transcription import (
    transcribe_audio,
    transcribe_audio_fast,
    transcribe_audio_with_cache,
    TranscriptionResult,
    WordInfo,
    SpeechMetrics,
    FillerAnalysis,
    PauseInfo,
    FillerType,
)

__all__ = [
    "client",
    "transcribe_audio",
    "transcribe_audio_fast", 
    "transcribe_audio_with_cache",
    "TranscriptionResult",
    "WordInfo",
    "SpeechMetrics",
    "FillerAnalysis",
    "PauseInfo",
    "FillerType",
]
