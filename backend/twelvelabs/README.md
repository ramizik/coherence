# Presentation Analysis Tool

This project uses the Twelve Labs API (Pegasus 1.2 model) to analyze presentation videos. It automatically indexes a video and then analyzes it to detect misalignments between the speaker's speech and the visual content of the slides.

## Recent Changes

- **Refactored Codebase**: Split the monolithic `app.py` into modular components (`indexing.py`, `analysis.py`, `twelvelabs_client.py`) for better maintainability and separation of concerns.
- **Robust Video Upload**: Fixed an issue with file handling during video upload by ensuring files are opened in binary mode (`rb`).
- **Streaming Analysis**: Implemented streaming responses for analysis prompts to provide real-time feedback during the generation process.
- **Chapter Detection**: Added functionality to automatically identify and timestamp different conceptual sections (chapters) of the presentation.

## Project Structure

- **`app.py`**: The main entry point. Orchestrates the workflow:
    1.  Checks for/creates an index.
    2.  Uploads a video (or uses an existing `video_id`).
    3.  Triggers chapter identification and full presentation analysis.
- **`indexing.py`**: Handles all indexing-related operations:
    -   `get_or_create_index()`: Ensures an index named "presentation-analysis" exists using the `pegasus1.2` model.
    -   `upload_video()`: Uploads a local video file to the index and waits for processing to complete.
- **`analysis.py`**: Contains the logic for generating insights:
    -   `get_video_chapters()`: Identifies distinct sections of the video with timestamps.
    -   `analyze_full_presentation()`: Performs a comprehensive analysis of speaker-slide alignment and offers improvement suggestions.
- **`twelvelabs_client.py`**: Initializes and exports the shared `TwelveLabs` client instance.

## Architecture & Workflow

1.  **Initialization**: The `TwelveLabs` client is initialized using the `TWELVELABS_API_KEY` environment variable.
2.  **Indexing (Pegasus 1.2)**:
    -   The tool checks for an index named `presentation-analysis`.
    -   If it doesn't exist, it creates one configured with the **Pegasus 1.2** model (enabled for both `visual` and `audio` understanding).
3.  **Ingestion**:
    -   Video files are uploaded to this index.
    -   The system waits for the indexing task to reach `ready` status.
4.  **Generative Analysis**:
    -   Once indexed, the `video_id` is used to send prompt-based queries to the API.
    -   Prompts are specifically engineered to detect **misalignments** (e.g., speaker talking about "Revenue" while the slide shows "Team Structure").
    -   Responses are streamed back to the console.

## Setup & Usage

### Prerequisites

-   Python 3.11+
-   A Twelve Labs API Key

### Installation

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
3.  Set up your environment variable in a `.env` file:
    ```
    TWELVELABS_API_KEY=your_api_key_here
    ```

### Running the Analysis

Run the main script:

```bash
python app.py
```

*Note: By default, `app.py` is configured to look for a video at `data/videos/bad-presentation-clean.mp4`. You can change the `EXISTING_VIDEO_ID` variable in `app.py` to skip uploading and analyze an already indexed video.*
