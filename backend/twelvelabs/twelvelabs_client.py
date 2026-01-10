"""TwelveLabs client initialization and configuration."""
import os
from pathlib import Path
from dotenv import load_dotenv
from twelvelabs import TwelveLabs

# Load environment variables from .env file in repository root
env_path = Path(__file__).parent.parent.parent / ".env"
load_dotenv(env_path)

# Initialize the TwelveLabs client using API key from environment
api_key = os.getenv("TWELVELABS_API_KEY")
if not api_key:
    raise ValueError(
        "TWELVELABS_API_KEY environment variable is required. "
        "Please set it in your .env file or environment."
    )

# Create and export the client instance
client = TwelveLabs(api_key=api_key)
