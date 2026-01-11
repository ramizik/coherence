"""Gemini module for multimodal synthesis and dissonance detection.

This module orchestrates TwelveLabs visual analysis and Deepgram transcription
data through Gemini 1.5 Pro to detect visual-verbal dissonance in presentations.
"""

from backend.gemini.gemini_client import client, is_available
from backend.gemini.synthesis import (
    DissonanceFlag,
    SynthesisResult,
    synthesize_analysis,
    synthesize_analysis_with_cache,
    calculate_coherence_score,
)

__all__ = [
    "client",
    "is_available",
    "DissonanceFlag",
    "SynthesisResult",
    "synthesize_analysis",
    "synthesize_analysis_with_cache",
    "calculate_coherence_score",
]
