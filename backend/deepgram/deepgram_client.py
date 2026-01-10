"""Deepgram client initialization and configuration."""
import os
from pathlib import Path
from dotenv import load_dotenv
from deepgram import DeepgramClient

# Load environment variables from .env file in repository root
env_path = Path(__file__).parent.parent.parent / ".env"
load_dotenv(env_path)

# Initialize the Deepgram client using API key from environment
api_key = os.getenv("DEEPGRAM_API_KEY")
if not api_key:
    raise ValueError(
        "DEEPGRAM_API_KEY environment variable is required. "
        "Please set it in your .env file or environment."
    )

# Create and export the client instance
client = DeepgramClient(api_key=api_key)
