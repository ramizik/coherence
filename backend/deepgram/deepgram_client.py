"""Deepgram client initialization and configuration."""
import os
import logging
from pathlib import Path
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

# Load environment variables from .env file in repository root
env_path = Path(__file__).parent.parent.parent / ".env"
load_dotenv(env_path)

# Initialize the Deepgram client using API key from environment
api_key = os.getenv("DEEPGRAM_API_KEY")

client = None

if not api_key:
    logger.warning(
        "DEEPGRAM_API_KEY environment variable not set. "
        "Deepgram transcription will be disabled. "
        "Set DEEPGRAM_API_KEY in your .env file to enable speech analysis."
    )
else:
    try:
        from deepgram import DeepgramClient
        # SDK v5.x uses keyword argument api_key=
        client = DeepgramClient(api_key=api_key)
        logger.info("Deepgram client initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize Deepgram client: {e}")
        client = None


def is_available() -> bool:
    """Check if Deepgram client is available."""
    return client is not None
