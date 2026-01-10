from backend.twelvelabs.twelvelabs_client import client


def get_video_chapters(video_id: str) -> str:
    """
    Step 1: Create timestamps/chapters of the video based on different conceptual parts.
    Uses analyze_stream to identify distinct sections of the presentation.
    """
    print("\nIdentifying video chapters/sections...")

    chapters_prompt = """Analyze this presentation video and identify distinct conceptual sections/chapters.
For each section, provide:
- Start timestamp (in MM:SS format)
- End timestamp (in MM:SS format)
- Section title/topic
- Brief description of what is covered

Format your response as a numbered list of chapters."""

    result_text = ""
    text_stream = client.analyze_stream(
        video_id=video_id,
        prompt=chapters_prompt,
    )

    for text in text_stream:
        if text.event_type == "text_generation":
            print(text.text, end="", flush=True)
            result_text += text.text

    print()  # newline after streaming
    return result_text


def analyze_section_alignment(video_id: str, start_time: str, end_time: str, section_title: str) -> str:
    """
    Step 2: For a specific timeframe, analyze how the speaker's presentation aligns with slides.
    """
    print(f"\nAnalyzing section: {section_title} ({start_time} - {end_time})...")

    alignment_prompt = f"""Focus on the section from {start_time} to {end_time} titled "{section_title}".

Analyze the alignment between the speaker and the slides:

1. VISUAL-VERBAL ALIGNMENT:
   - Does the speaker refer to what's shown on the slides?
   - Does the speaker point at or gesture towards slide content?
   - Is the slide content relevant to what the speaker is saying?

2. CONTENT MATCH:
   - Rate the alignment: Excellent / Good / Poor / Completely Unrelated
   - What specific content on slides matches or mismatches the speech?

3. SUGGESTIONS:
   - How could this section be improved?
   - Should slides be modified or should the speaker change their talking points?

Be specific with observations from this section."""

    result_text = ""
    text_stream = client.analyze_stream(
        video_id=video_id,
        prompt=alignment_prompt,
    )

    for text in text_stream:
        if text.event_type == "text_generation":
            print(text.text, end="", flush=True)
            result_text += text.text

    print()  # newline after streaming
    return result_text


def analyze_full_presentation(video_id: str) -> str:
    """
    Complete analysis: Analyze the entire presentation for speaker-slide alignment.
    """
    print("\nPerforming full presentation analysis...")

    full_prompt = """Analyze this entire presentation video. Focus on:

1. CHAPTER BREAKDOWN:
   Identify distinct sections/topics with timestamps (start - end).

2. FOR EACH SECTION, analyze:
   - Does the speaker's verbal content align with what's shown on slides?
   - Does the speaker point at or reference the slides appropriately?
   - Is the slide content relevant or unrelated to the topic being discussed?
   - Rate alignment: Excellent / Good / Poor / Unrelated

3. OVERALL ASSESSMENT:
   - Which sections have the best alignment?
   - Which sections need the most improvement?
   - Top 3 actionable suggestions to improve the presentation.

Be specific with timestamps and concrete examples."""

    result_text = ""
    text_stream = client.analyze_stream(
        video_id=video_id,
        prompt=full_prompt,
    )

    for text in text_stream:
        if text.event_type == "text_generation":
            print(text.text, end="", flush=True)
            result_text += text.text

    print()  # newline after streaming
    return result_text
