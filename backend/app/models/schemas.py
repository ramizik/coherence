"""Pydantic schemas for API request/response models.

These models match the TypeScript interfaces defined in frontend/types/index.ts.
Backend uses camelCase field names to match frontend directly (via alias).
"""
from enum import Enum
from typing import Optional, List
from pydantic import BaseModel, Field


# ========================
# Enums
# ========================

class ScoreTier(str, Enum):
    """Coherence score tier."""
    NEEDS_WORK = "Needs Work"
    GOOD_START = "Good Start"
    STRONG = "Strong"


class DissonanceType(str, Enum):
    """Type of visual-verbal dissonance."""
    EMOTIONAL_MISMATCH = "EMOTIONAL_MISMATCH"
    MISSING_GESTURE = "MISSING_GESTURE"
    PACING_MISMATCH = "PACING_MISMATCH"


class Severity(str, Enum):
    """Severity level of dissonance flag."""
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class ProcessingStatus(str, Enum):
    """Video processing status."""
    QUEUED = "queued"
    PROCESSING = "processing"
    COMPLETE = "complete"
    ERROR = "error"


# ========================
# Core Analysis Types
# ========================

class AnalysisMetrics(BaseModel):
    """Metrics extracted from video analysis."""
    eyeContact: int = Field(..., ge=0, le=100, description="Eye contact percentage (0-100)")
    fillerWords: int = Field(..., ge=0, description="Count of filler words")
    fidgeting: int = Field(..., ge=0, description="Count of fidgeting instances")
    speakingPace: int = Field(..., ge=0, description="Words per minute")
    speakingPaceTarget: Optional[str] = Field(None, description="Target WPM range, e.g., '140-160'")

    class Config:
        populate_by_name = True


class DissonanceFlag(BaseModel):
    """A single dissonance flag (visual-verbal mismatch)."""
    id: str = Field(..., description="Unique identifier")
    timestamp: float = Field(..., ge=0, description="Seconds from video start")
    endTimestamp: Optional[float] = Field(None, ge=0, description="End time for clip duration")
    type: DissonanceType = Field(..., description="Type of dissonance")
    severity: Severity = Field(..., description="Severity level")
    description: str = Field(..., description="What was detected")
    coaching: str = Field(..., description="Actionable fix advice")
    visualEvidence: Optional[str] = Field(None, description="What TwelveLabs detected")
    verbalEvidence: Optional[str] = Field(None, description="What Deepgram transcribed")

    class Config:
        populate_by_name = True


class TimelinePoint(BaseModel):
    """Point on the timeline heatmap."""
    timestamp: float = Field(..., ge=0, description="Seconds from video start")
    severity: Severity = Field(..., description="Severity for color coding")


class TranscriptSegment(BaseModel):
    """Optional transcript segment for detailed view."""
    text: str
    start: float
    end: float
    confidence: Optional[float] = None


class AnalysisResult(BaseModel):
    """Complete analysis result returned by backend.
    
    Endpoint: GET /api/videos/{videoId}/results
    """
    videoId: str
    videoUrl: str = Field(..., description="URL to serve video: /videos/{videoId}.mp4")
    durationSeconds: float
    coherenceScore: int = Field(..., ge=0, le=100, description="Coherence score 0-100")
    scoreTier: ScoreTier
    metrics: AnalysisMetrics
    dissonanceFlags: List[DissonanceFlag]
    timelineHeatmap: List[TimelinePoint]
    strengths: List[str] = Field(..., description="What presenter did well")
    priorities: List[str] = Field(..., description="Top 3 improvement areas")
    transcript: Optional[List[TranscriptSegment]] = None

    class Config:
        populate_by_name = True


# ========================
# API Request/Response Types
# ========================

class UploadResponse(BaseModel):
    """Response from video upload.
    
    Endpoint: POST /api/videos/upload
    """
    videoId: str
    status: str = "processing"
    estimatedTime: int = Field(..., description="Seconds until complete")
    durationSeconds: float = Field(..., description="Video duration in seconds")

    class Config:
        populate_by_name = True


class StatusResponse(BaseModel):
    """Response from status check.
    
    Endpoint: GET /api/videos/{videoId}/status
    """
    videoId: str
    status: ProcessingStatus
    progress: int = Field(..., ge=0, le=100, description="Progress percentage 0-100")
    stage: str = Field(..., description="Current processing step for UX")
    etaSeconds: Optional[int] = Field(None, description="Estimated time remaining")
    error: Optional[str] = Field(None, description="Error message if status is error")

    class Config:
        populate_by_name = True


class ApiError(BaseModel):
    """Standard error response from backend."""
    error: str = Field(..., description="User-friendly message")
    code: str = Field(..., description="Error code (e.g., 'VIDEO_TOO_LARGE')")
    retryable: bool = Field(..., description="Show retry button if true")


# ========================
# Sample Video Types
# ========================

class SampleVideoResponse(BaseModel):
    """Response for loading a sample video."""
    videoId: str
    status: str = "complete"
