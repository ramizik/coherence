"""PDF Report Generation Service.

Generates comprehensive PDF reports from video analysis results.
Uses fpdf2 for PDF creation with a professional, branded design.
"""

import logging
import re
from datetime import datetime
from io import BytesIO
from typing import List, Optional

from fpdf import FPDF

from backend.app.models.schemas import AnalysisResult, DissonanceFlag, Severity
from backend.gemini.lessons_generator import ImprovementLesson

logger = logging.getLogger(__name__)


def _sanitize_text(text: str) -> str:
    """Sanitize text to only include ASCII-compatible characters for Helvetica font.

    Replaces common Unicode characters with ASCII equivalents.
    """
    if not text:
        return text

    # Common replacements
    replacements = {
        "•": "-",
        "–": "-",
        "—": "-",
        "'": "'",
        "'": "'",
        """: '"',
        """: '"',
        "…": "...",
        "→": "->",
        "←": "<-",
        "≥": ">=",
        "≤": "<=",
        "×": "x",
        "÷": "/",
        "°": " degrees",
        "±": "+/-",
        "\u200b": "",  # Zero-width space
        "\u00a0": " ",  # Non-breaking space
    }

    for unicode_char, ascii_char in replacements.items():
        text = text.replace(unicode_char, ascii_char)

    # Remove any remaining non-ASCII characters
    text = text.encode("ascii", "replace").decode("ascii")

    return text

# ========================
# Color Palette (RGB)
# ========================
COLORS = {
    "primary": (139, 92, 246),      # Purple
    "primary_dark": (109, 40, 217), # Darker purple
    "success": (34, 197, 94),       # Green
    "warning": (245, 158, 11),      # Amber
    "danger": (239, 68, 68),        # Red
    "text_dark": (15, 23, 42),      # Slate 900
    "text_light": (100, 116, 139),  # Slate 500
    "bg_light": (241, 245, 249),    # Slate 100
    "white": (255, 255, 255),
}


def _get_score_color(score: int) -> tuple:
    """Get color based on score tier."""
    if score >= 76:
        return COLORS["success"]
    elif score >= 51:
        return COLORS["warning"]
    return COLORS["danger"]


def _get_severity_color(severity: Severity) -> tuple:
    """Get color based on severity level."""
    if severity == Severity.HIGH:
        return COLORS["danger"]
    elif severity == Severity.MEDIUM:
        return COLORS["warning"]
    return COLORS["success"]


def _format_timestamp(seconds: float) -> str:
    """Format seconds as MM:SS."""
    mins = int(seconds // 60)
    secs = int(seconds % 60)
    return f"{mins}:{secs:02d}"


class CoherenceReportPDF(FPDF):
    """Custom PDF class for Coherence reports."""

    def __init__(self, title: str = "Presentation Analysis Report"):
        super().__init__()
        self.title = title
        self.set_auto_page_break(auto=True, margin=20)

    def header(self):
        """Add header to each page."""
        if self.page_no() > 1:  # Skip header on cover page
            self.set_font("Helvetica", "B", 10)
            self.set_text_color(*COLORS["text_light"])
            self.cell(0, 8, "Coherence - Presentation Analysis Report", align="L")
            self.ln(3)
            # Draw line below the text
            line_y = self.get_y()
            self.set_draw_color(*COLORS["primary"])
            self.set_line_width(0.5)
            self.line(10, line_y, 200, line_y)
            self.ln(8)

    def footer(self):
        """Add footer to each page."""
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(*COLORS["text_light"])
        self.cell(0, 10, f"Page {self.page_no()}", align="C")

    def add_cover_page(self, result: AnalysisResult):
        """Add branded cover page with score."""
        self.add_page()

        # Background rectangle at top
        self.set_fill_color(*COLORS["primary"])
        self.rect(0, 0, 210, 100, "F")

        # Title
        self.set_y(30)
        self.set_font("Helvetica", "B", 28)
        self.set_text_color(*COLORS["white"])
        self.cell(0, 15, "COHERENCE", align="C")
        self.ln(12)

        self.set_font("Helvetica", "", 14)
        self.cell(0, 8, "AI Presentation Coach", align="C")
        self.ln(20)

        self.set_font("Helvetica", "B", 12)
        self.cell(0, 8, "Comprehensive Analysis Report", align="C")

        # Score circle
        self.set_y(120)
        score_color = _get_score_color(result.coherenceScore)

        # Score box
        self.set_fill_color(*score_color)
        self.set_draw_color(*score_color)
        box_x = 70
        box_width = 70
        self.rect(box_x, 115, box_width, 50, "F")

        self.set_xy(box_x, 125)
        self.set_font("Helvetica", "B", 36)
        self.set_text_color(*COLORS["white"])
        self.cell(box_width, 20, str(result.coherenceScore), align="C")

        self.set_xy(box_x, 145)
        self.set_font("Helvetica", "", 12)
        self.cell(box_width, 10, "Coherence Score", align="C")

        # Score tier
        self.set_y(175)
        self.set_font("Helvetica", "B", 16)
        self.set_text_color(*score_color)
        self.cell(0, 10, result.scoreTier.value, align="C")

        # Video info
        self.set_y(200)
        self.set_font("Helvetica", "", 11)
        self.set_text_color(*COLORS["text_dark"])

        duration_mins = int(result.durationSeconds // 60)
        duration_secs = int(result.durationSeconds % 60)

        self.cell(0, 8, f"Video Duration: {duration_mins}:{duration_secs:02d}", align="C")
        self.ln(8)
        self.cell(0, 8, f"Report Generated: {datetime.now().strftime('%B %d, %Y at %I:%M %p')}", align="C")
        self.ln(8)
        self.cell(0, 8, f"Video ID: {result.videoId}", align="C")

        # Footer note
        self.set_y(260)
        self.set_font("Helvetica", "I", 9)
        self.set_text_color(*COLORS["text_light"])
        self.cell(0, 8, "Powered by TwelveLabs, Deepgram, and Google Gemini", align="C")

    def add_executive_summary(self, result: AnalysisResult):
        """Add executive summary section with Gemini advice."""
        self.add_page()

        # Section title
        self.set_font("Helvetica", "B", 18)
        self.set_text_color(*COLORS["primary"])
        self.cell(0, 12, "Executive Summary", align="L")
        self.ln(15)

        # Gemini coaching advice
        if result.geminiReport:
            if result.geminiReport.headline:
                self.set_font("Helvetica", "B", 14)
                self.set_text_color(*COLORS["text_dark"])
                self.multi_cell(0, 8, _sanitize_text(result.geminiReport.headline))
                self.ln(5)

            self.set_font("Helvetica", "", 11)
            self.set_text_color(*COLORS["text_dark"])
            self.multi_cell(0, 6, _sanitize_text(result.geminiReport.coachingAdvice))
            self.ln(10)

        # Strengths
        if result.strengths:
            self.set_font("Helvetica", "B", 12)
            self.set_text_color(*COLORS["success"])
            self.cell(0, 10, "Strengths", align="L")
            self.ln(8)

            self.set_font("Helvetica", "", 10)
            self.set_text_color(*COLORS["text_dark"])
            for strength in result.strengths:
                self.cell(5)
                self.cell(0, 6, f"- {_sanitize_text(strength)}")
                self.ln(6)
            self.ln(8)

        # Priorities
        if result.priorities:
            self.set_font("Helvetica", "B", 12)
            self.set_text_color(*COLORS["warning"])
            self.cell(0, 10, "Top Priorities for Improvement", align="L")
            self.ln(8)

            self.set_font("Helvetica", "", 10)
            self.set_text_color(*COLORS["text_dark"])
            for i, priority in enumerate(result.priorities, 1):
                self.cell(5)
                self.cell(0, 6, f"{i}. {_sanitize_text(priority)}")
                self.ln(6)

    def add_metrics_section(self, result: AnalysisResult):
        """Add metrics breakdown section."""
        self.add_page()

        # Section title
        self.set_font("Helvetica", "B", 18)
        self.set_text_color(*COLORS["primary"])
        self.cell(0, 12, "Performance Metrics", align="L")
        self.ln(15)

        metrics = result.metrics

        # Metrics grid
        metrics_data = [
            ("Eye Contact", f"{metrics.eyeContact}%",
             "Good" if metrics.eyeContact >= 70 else "Needs Work",
             metrics.eyeContact >= 70),
            ("Filler Words", str(metrics.fillerWords),
             "Excellent" if metrics.fillerWords <= 5 else ("Acceptable" if metrics.fillerWords <= 10 else "High"),
             metrics.fillerWords <= 5),
            ("Speaking Pace", f"{metrics.speakingPace} WPM",
             "Optimal" if 140 <= metrics.speakingPace <= 160 else "Adjust",
             140 <= metrics.speakingPace <= 160),
            ("Nervous Gestures", str(metrics.fidgeting),
             "Low" if metrics.fidgeting <= 5 else "Reduce",
             metrics.fidgeting <= 5),
        ]

        for i, (label, value, status, is_good) in enumerate(metrics_data):
            y_pos = 50 + (i * 35)

            # Background box
            self.set_fill_color(*COLORS["bg_light"])
            self.rect(15, y_pos, 180, 28, "F")

            # Metric name
            self.set_xy(20, y_pos + 5)
            self.set_font("Helvetica", "", 10)
            self.set_text_color(*COLORS["text_light"])
            self.cell(50, 8, label)

            # Metric value
            self.set_xy(20, y_pos + 14)
            self.set_font("Helvetica", "B", 16)
            color = COLORS["success"] if is_good else COLORS["warning"]
            self.set_text_color(*color)
            self.cell(50, 10, value)

            # Status badge
            self.set_xy(140, y_pos + 10)
            self.set_font("Helvetica", "", 10)
            self.set_text_color(*color)
            self.cell(50, 8, status, align="R")

        # Target ranges note
        self.set_y(200)
        self.set_font("Helvetica", "I", 9)
        self.set_text_color(*COLORS["text_light"])
        self.multi_cell(0, 5,
            "Target Ranges: Eye Contact 70%+ | Filler Words <5 | Speaking Pace 140-160 WPM | Nervous Gestures <5")

    def add_issues_section(self, result: AnalysisResult):
        """Add detailed issues/coaching insights section."""
        self.add_page()

        # Section title
        self.set_font("Helvetica", "B", 18)
        self.set_text_color(*COLORS["primary"])
        self.cell(0, 12, "Coaching Insights", align="L")
        self.ln(14)

        self.set_font("Helvetica", "", 10)
        self.set_text_color(*COLORS["text_light"])
        self.cell(0, 6, f"{len(result.dissonanceFlags)} issues identified")
        self.ln(12)

        if not result.dissonanceFlags:
            self.set_font("Helvetica", "I", 11)
            self.set_text_color(*COLORS["success"])
            self.cell(0, 10, "No significant issues detected. Great job!")
            return

        for i, flag in enumerate(result.dissonanceFlags):
            # Check if we need a new page
            if self.get_y() > 240:
                self.add_page()

            severity_color = _get_severity_color(flag.severity)

            # Issue header with timestamp
            self.set_font("Helvetica", "B", 11)
            self.set_text_color(*severity_color)
            timestamp = _format_timestamp(flag.timestamp)
            self.cell(0, 8, f"[{timestamp}] {flag.type.value.replace('_', ' ').title()}")
            self.ln(6)

            # Severity badge
            self.set_font("Helvetica", "", 9)
            self.cell(0, 6, f"Severity: {flag.severity.value}")
            self.ln(6)

            # Description
            self.set_font("Helvetica", "", 10)
            self.set_text_color(*COLORS["text_dark"])
            self.multi_cell(0, 5, _sanitize_text(flag.description))
            self.ln(3)

            # Coaching tip
            self.set_fill_color(*COLORS["bg_light"])
            self.set_font("Helvetica", "I", 10)
            self.set_text_color(*COLORS["primary_dark"])

            tip_y = self.get_y()
            self.rect(15, tip_y, 180, 15, "F")
            self.set_xy(18, tip_y + 3)
            self.multi_cell(174, 5, f"Tip: {_sanitize_text(flag.coaching)}")
            self.ln(10)

    def add_improvement_lessons(self, lessons: List[ImprovementLesson]):
        """Add personalized improvement lessons section."""
        self.add_page()

        # Section title
        self.set_font("Helvetica", "B", 18)
        self.set_text_color(*COLORS["primary"])
        self.cell(0, 12, "Personalized Improvement Plan", align="L")
        self.ln(14)

        self.set_font("Helvetica", "", 10)
        self.set_text_color(*COLORS["text_light"])
        self.cell(0, 6, "Customized lessons based on your analysis results")
        self.ln(12)

        if not lessons:
            self.set_font("Helvetica", "I", 11)
            self.set_text_color(*COLORS["success"])
            self.cell(0, 10, "No specific improvement lessons needed. Keep up the excellent work!")
            return

        for i, lesson in enumerate(lessons):
            # Check if we need a new page
            if self.get_y() > 200:
                self.add_page()

            # Lesson header
            self.set_fill_color(*COLORS["primary"])
            header_y = self.get_y()
            self.rect(15, header_y, 180, 12, "F")

            self.set_xy(18, header_y + 2)
            self.set_font("Helvetica", "B", 11)
            self.set_text_color(*COLORS["white"])
            self.cell(0, 8, f"Lesson {i + 1}: {_sanitize_text(lesson.title)}")
            self.ln(15)

            # Description
            self.set_font("Helvetica", "", 10)
            self.set_text_color(*COLORS["text_dark"])
            self.multi_cell(0, 5, _sanitize_text(lesson.description))
            self.ln(5)

            # Exercises
            self.set_font("Helvetica", "B", 10)
            self.set_text_color(*COLORS["text_dark"])
            self.cell(0, 6, "Exercises:")
            self.ln(5)

            self.set_font("Helvetica", "", 9)
            for exercise in lesson.exercises:
                if self.get_y() > 270:
                    self.add_page()
                self.cell(8)
                self.multi_cell(0, 5, f"- {_sanitize_text(exercise)}")
                self.ln(2)
            self.ln(3)

            # Timeline and metrics
            self.set_font("Helvetica", "I", 9)
            self.set_text_color(*COLORS["text_light"])
            self.cell(0, 5, f"Timeline: {_sanitize_text(lesson.timeline)}")
            self.ln(5)
            self.cell(0, 5, f"Success Metric: {_sanitize_text(lesson.success_metrics)}")
            self.ln(12)

    def add_transcript_section(self, result: AnalysisResult):
        """Add full transcript section."""
        self.add_page()

        # Section title
        self.set_font("Helvetica", "B", 18)
        self.set_text_color(*COLORS["primary"])
        self.cell(0, 12, "Full Transcript", align="L")
        self.ln(15)

        if not result.transcript:
            self.set_font("Helvetica", "I", 11)
            self.set_text_color(*COLORS["text_light"])
            self.cell(0, 10, "Transcript not available for this analysis.")
            return

        self.set_font("Helvetica", "", 10)
        self.set_text_color(*COLORS["text_dark"])

        for segment in result.transcript:
            if self.get_y() > 260:
                self.add_page()

            # Timestamp
            timestamp = _format_timestamp(segment.start)
            self.set_font("Helvetica", "B", 9)
            self.set_text_color(*COLORS["text_light"])
            self.cell(15, 6, f"[{timestamp}]")

            # Text
            self.set_font("Helvetica", "", 10)
            self.set_text_color(*COLORS["text_dark"])

            # Calculate remaining width
            self.multi_cell(0, 5, _sanitize_text(segment.text))
            self.ln(3)


def generate_report_pdf(
    result: AnalysisResult,
    lessons: Optional[List[ImprovementLesson]] = None,
) -> bytes:
    """Generate a comprehensive PDF report.

    Args:
        result: Analysis result from video processing
        lessons: Optional list of improvement lessons from Gemini

    Returns:
        PDF file as bytes
    """
    logger.info(f"Generating PDF report for video: {result.videoId}")

    pdf = CoherenceReportPDF()

    # Add all sections
    pdf.add_cover_page(result)
    pdf.add_executive_summary(result)
    pdf.add_metrics_section(result)
    pdf.add_issues_section(result)

    if lessons:
        pdf.add_improvement_lessons(lessons)

    pdf.add_transcript_section(result)

    # Output to bytes
    output = BytesIO()
    pdf.output(output)
    pdf_bytes = output.getvalue()

    logger.info(f"PDF report generated: {len(pdf_bytes)} bytes")
    return pdf_bytes
