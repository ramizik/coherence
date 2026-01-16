"""Application configuration management."""
import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from repository root
env_path = Path(__file__).parent.parent.parent / ".env"
load_dotenv(env_path, override=True)


class Settings:
    """Application settings loaded from environment variables."""

    # Supabase Configuration
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")  # Service role key

    # AI Service Keys
    TWELVELABS_API_KEY: str = os.getenv("TWELVELABS_API_KEY", "")
    DEEPGRAM_API_KEY: str = os.getenv("DEEPGRAM_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

    @classmethod
    def validate(cls) -> None:
        """Validate required settings are present."""
        if not cls.SUPABASE_URL:
            raise ValueError("SUPABASE_URL environment variable is required")
        if not cls.SUPABASE_KEY:
            raise ValueError("SUPABASE_KEY environment variable is required")


# Global settings instance
settings = Settings()
