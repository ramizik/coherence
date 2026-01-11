"""Gemini client initialization and configuration."""

import os
import logging
from pathlib import Path
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

# Load environment variables from .env file in repository root
env_path = Path(__file__).parent.parent.parent / ".env"
logger.info(f"Looking for .env at: {env_path.resolve()}")
logger.info(f".env file exists: {env_path.exists()}")

# Load the .env file
loaded = load_dotenv(env_path, override=True)
logger.info(f"dotenv loaded: {loaded}")

# Initialize the Gemini client using API key from environment
api_key = os.getenv("GEMINI_API_KEY")
logger.info(f"GEMINI_API_KEY found: {bool(api_key)}")

client = None

if not api_key:
    logger.warning(
        "GEMINI_API_KEY environment variable not set. "
        "Gemini features will be disabled. "
        "Set GEMINI_API_KEY in your .env file to enable dissonance detection."
    )
else:
    try:
        import google.generativeai as genai

        genai.configure(api_key=api_key)
        # Use Gemini 2.5 Flash for multimodal synthesis (fast and cost-effective)
        client = genai.GenerativeModel("gemini-2.5-flash")
        logger.info("Gemini client initialized successfully with gemini-2.5-flash")
    except Exception as e:
        logger.error(f"Failed to initialize Gemini client: {e}")
        client = None


def is_available() -> bool:
    """Check if Gemini client is available."""
    return client is not None
