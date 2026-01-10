import os
from pathlib import Path
from dotenv import load_dotenv
from backend.twelvelabs.indexing import get_or_create_index, upload_video
from backend.twelvelabs.analysis import get_video_chapters, analyze_full_presentation

# Load environment variables from .env file in repository root
env_path = Path(__file__).parent.parent.parent / ".env"
load_dotenv(env_path)

# Get absolute path relative to this script's location
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
VIDEO_PATH = os.path.join(SCRIPT_DIR, "data/videos/bad-presentation-clean.mp4")

# If you already have a video indexed, set this to skip upload
EXISTING_VIDEO_ID = "6962b665f452fea43103297e"  # Set to None to upload new video


def main():
    # Step 1: Get or create index
    index_id = get_or_create_index()

    # Step 2: Upload video (or use existing)
    if EXISTING_VIDEO_ID:
        print(f"Using existing video: {EXISTING_VIDEO_ID}")
        video_id = EXISTING_VIDEO_ID
    else:
        video_id = upload_video(index_id, VIDEO_PATH)

    # Step 3: Get video chapters/sections
    print("\n" + "="*60)
    print("STEP 1: IDENTIFYING VIDEO CHAPTERS")
    print("="*60)
    chapters = get_video_chapters(video_id)

    # Step 4: Full presentation analysis
    print("\n" + "="*60)
    print("STEP 2: ANALYZING SPEAKER-SLIDE ALIGNMENT")
    print("="*60)
    analysis = analyze_full_presentation(video_id)

    print("\n" + "="*60)
    print("ANALYSIS COMPLETE")
    print("="*60)


if __name__ == "__main__":
    main()
