"""TwelveLabs client initialization and configuration."""
import os
import logging
from pathlib import Path
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

# Load environment variables from .env file in repository root
env_path = Path(__file__).parent.parent.parent / ".env"
load_dotenv(env_path)

# Initialize the TwelveLabs client using API key from environment
api_key = os.getenv("TWELVELABS_API_KEY")

client = None

if not api_key:
    logger.warning(
        "TWELVELABS_API_KEY environment variable not set. "
        "TwelveLabs features will be disabled. "
        "Set TWELVELABS_API_KEY in your .env file to enable video analysis."
    )
else:
    try:
        from twelvelabs import TwelveLabs
        client = TwelveLabs(api_key=api_key)
        logger.info("TwelveLabs client initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize TwelveLabs client: {e}")
        client = None


def is_available() -> bool:
    """Check if TwelveLabs client is available."""
    return client is not None
