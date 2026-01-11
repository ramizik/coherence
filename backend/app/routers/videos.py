"""Video API router.

Handles video upload, status polling, and results retrieval.
"""
from fastapi import APIRouter, File, UploadFile, HTTPException, Response
from fastapi.responses import FileResponse
from typing import Optional
import logging

from backend.app.models.schemas import (
    UploadResponse,
    StatusResponse,
    AnalysisResult,
    ApiError,
    SampleVideoResponse,
    SampleVideoInfo,
    SampleVideosListResponse,
)
from backend.app.services import video_service

logger = logging.getLogger(__name__)

router = APIRouter()

# Maximum file size: 500MB
MAX_FILE_SIZE = 500 * 1024 * 1024

# Allowed video formats
ALLOWED_CONTENT_TYPES = {
    "video/mp4",
    "video/quicktime",  # .mov
    "video/webm",
    "video/x-m4v",
}


@router.post(
    "/upload",
    response_model=UploadResponse,
    responses={
        400: {"model": ApiError, "description": "Invalid video file"},
        413: {"model": ApiError, "description": "Video file too large"},
    },
    summary="Upload video for analysis",
    description="Upload a video file (MP4/MOV/WebM, max 500MB) to start analysis.",
)
async def upload_video(
    video: UploadFile = File(..., description="Video file to analyze"),
) -> UploadResponse:
    """
    Upload a video file for analysis.

    - **video**: Video file (MP4, MOV, or WebM format, max 500MB)

    Returns a videoId that can be used to poll status and retrieve results.
    """
    # Validate content type
    content_type = video.content_type or ""
    if content_type not in ALLOWED_CONTENT_TYPES:
        logger.warning(f"Invalid content type: {content_type}")
        raise HTTPException(
            status_code=400,
            detail={
                "error": f"Invalid video format: {content_type}. Please use MP4, MOV, or WebM.",
                "code": "INVALID_FORMAT",
                "retryable": True,
            },
        )

    # Read file content
    content = await video.read()

    # Validate file size
    if len(content) > MAX_FILE_SIZE:
        logger.warning(f"File too large: {len(content)} bytes")
        raise HTTPException(
            status_code=413,
            detail={
                "error": "Video file is too large. Maximum size is 500MB.",
                "code": "VIDEO_TOO_LARGE",
                "retryable": True,
            },
        )

    # Upload and start processing
    result = await video_service.upload_video(
        video_file_content=content,
        filename=video.filename or "video.mp4",
        content_type=content_type,
    )

    logger.info(f"Video uploaded successfully: {result.videoId}")
    return result


@router.get(
    "/{video_id}/status",
    response_model=StatusResponse,
    responses={
        404: {"model": ApiError, "description": "Video not found"},
    },
    summary="Get video processing status",
    description="Poll this endpoint to check the processing status of an uploaded video.",
)
async def get_video_status(video_id: str) -> StatusResponse:
    """
    Get the current processing status of a video.

    - **video_id**: The video ID returned from upload

    Poll every 3 seconds until status is 'complete' or 'error'.
    """
    status = await video_service.get_video_status(video_id)

    if not status:
        raise HTTPException(
            status_code=404,
            detail={
                "error": "Video not found",
                "code": "NOT_FOUND",
                "retryable": False,
            },
        )

    return status


@router.get(
    "/{video_id}/results",
    response_model=AnalysisResult,
    responses={
        404: {"model": ApiError, "description": "Results not found"},
        425: {"model": ApiError, "description": "Processing not complete"},
    },
    summary="Get analysis results",
    description="Retrieve the complete analysis results for a processed video.",
)
async def get_video_results(video_id: str) -> AnalysisResult:
    """
    Get the analysis results for a video.

    - **video_id**: The video ID

    Only available after processing is complete.
    """
    # Check status first
    status = await video_service.get_video_status(video_id)

    # For sample videos, we don't have status but can return results
    if not status and video_id not in video_service.SAMPLE_VIDEOS:
        raise HTTPException(
            status_code=404,
            detail={
                "error": "Video not found",
                "code": "NOT_FOUND",
                "retryable": False,
            },
        )

    # If status exists and processing is not complete, return 425 Too Early
    if status and status.status not in ["complete", "error"]:
        raise HTTPException(
            status_code=425,
            detail={
                "error": "Video is still being processed",
                "code": "PROCESSING_NOT_COMPLETE",
                "retryable": True,
            },
        )

    results = await video_service.get_video_results(video_id)

    if not results:
        raise HTTPException(
            status_code=404,
            detail={
                "error": "Results not found",
                "code": "NOT_FOUND",
                "retryable": False,
            },
        )

    return results


@router.get(
    "/samples",
    response_model=SampleVideosListResponse,
    summary="Get all sample videos",
    description="Get list of all sample videos with their actual analysis data (scores, flags).",
)
async def get_all_samples() -> SampleVideosListResponse:
    """
    Get all available sample videos with their real analysis data.

    Returns sample videos with actual coherence scores from cached analysis.
    """
    samples_data = video_service.get_sample_videos_with_data()

    samples = [SampleVideoInfo(**s) for s in samples_data]
    all_cached = all(s.isCached for s in samples)

    return SampleVideosListResponse(samples=samples, allCached=all_cached)


@router.get(
    "/samples/{sample_id}",
    response_model=SampleVideoResponse,
    responses={
        404: {"model": ApiError, "description": "Sample not found"},
    },
    summary="Get sample video info",
    description="Get information about a pre-analyzed sample video.",
)
async def get_sample_video(sample_id: str) -> SampleVideoResponse:
    """
    Get info for a sample video.

    - **sample_id**: Sample video ID (sample-1, sample-2, sample-3)

    Sample videos are pre-analyzed and ready for immediate viewing.
    """
    sample = await video_service.get_sample_video(sample_id)

    if not sample:
        raise HTTPException(
            status_code=404,
            detail={
                "error": "Sample video not found",
                "code": "NOT_FOUND",
                "retryable": False,
            },
        )

    return SampleVideoResponse(**sample)


# ========================
# Video Streaming Endpoint
# ========================

@router.get(
    "/{video_id}/stream",
    summary="Stream video file",
    description="Stream the video file for playback.",
)
async def stream_video(video_id: str):
    """
    Stream a video file.

    - **video_id**: The video ID

    Returns the video file with proper headers for browser playback.
    """
    video_path = video_service.get_video_path(video_id)

    if not video_path:
        raise HTTPException(
            status_code=404,
            detail={
                "error": "Video file not found",
                "code": "NOT_FOUND",
                "retryable": False,
            },
        )

    # Determine media type
    suffix = video_path.suffix.lower()
    media_types = {
        ".mp4": "video/mp4",
        ".mov": "video/quicktime",
        ".webm": "video/webm",
    }
    media_type = media_types.get(suffix, "video/mp4")

    return FileResponse(
        path=video_path,
        media_type=media_type,
        filename=f"{video_id}{suffix}",
    )
