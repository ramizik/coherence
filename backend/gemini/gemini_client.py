"""Gemini client initialization and configuration."""

import os
import logging
from pathlib import Path
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

# Load environment variables from .env file in repository root
env_path = Path(__file__).parent.parent.parent / ".env"
load_dotenv(env_path)

# Initialize the Gemini client using API key from environment
api_key = os.getenv("GEMINI_API_KEY")

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
        # Use Gemini 1.5 Pro for multimodal synthesis
        client = genai.GenerativeModel("gemini-1.5-pro-latest")
        logger.info("Gemini client initialized successfully with gemini-1.5-pro")
    except Exception as e:
        logger.error(f"Failed to initialize Gemini client: {e}")
        client = None


def is_available() -> bool:
    """Check if Gemini client is available."""
    return client is not None
