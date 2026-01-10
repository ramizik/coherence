"""
CLI tool for backend developers to test backend modules independently.

This tool allows testing different backend functionality without running the frontend.
Run from repository root with: python -m backend.cli <command> [options]
"""
import argparse
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

# Import backend modules
from backend.twelvelabs.indexing import get_or_create_index, upload_video
from backend.twelvelabs.analysis import get_video_chapters, analyze_full_presentation, analyze_section_alignment


def cmd_index(args):
    """Index a video file."""
    print("=" * 60)
    print("INDEXING VIDEO FILE")
    print("=" * 60)
    
    video_path = Path(args.video).resolve()
    if not video_path.exists():
        print(f"Error: Video file not found: {video_path}")
        sys.exit(1)
    
    print(f"Video path: {video_path}")
    print(f"File size: {video_path.stat().st_size / (1024*1024):.2f} MB")
    
    index_id = get_or_create_index(args.index_name)
    video_id = upload_video(index_id, str(video_path))
    
    print("\n" + "=" * 60)
    print(f"SUCCESS: Video indexed with ID: {video_id}")
    print("=" * 60)
    print(f"\nYou can use this video_id for analysis:")
    print(f"  python -m backend.cli analyze --video-id {video_id}")
    print(f"  python -m backend.cli chapters --video-id {video_id}")


def cmd_chapters(args):
    """Get video chapters."""
    print("=" * 60)
    print("GETTING VIDEO CHAPTERS")
    print("=" * 60)
    
    if args.video_id:
        video_id = args.video_id
        print(f"Using existing video ID: {video_id}")
    elif args.video:
        # Index the video first
        video_path = Path(args.video).resolve()
        if not video_path.exists():
            print(f"Error: Video file not found: {video_path}")
            sys.exit(1)
        
        print(f"Indexing video first: {video_path}")
        index_id = get_or_create_index()
        video_id = upload_video(index_id, str(video_path))
        print(f"Video indexed with ID: {video_id}\n")
    else:
        print("Error: Either --video-id or --video must be provided")
        sys.exit(1)
    
    chapters = get_video_chapters(video_id)
    
    if args.output:
        output_path = Path(args.output)
        output_path.write_text(chapters, encoding="utf-8")
        print(f"\nChapters saved to: {output_path}")
    
    print("\n" + "=" * 60)
    print("CHAPTERS RETRIEVED")
    print("=" * 60)


def cmd_analyze(args):
    """Run full presentation analysis."""
    print("=" * 60)
    print("RUNNING FULL PRESENTATION ANALYSIS")
    print("=" * 60)
    
    if args.video_id:
        video_id = args.video_id
        print(f"Using existing video ID: {video_id}")
    elif args.video:
        # Index the video first
        video_path = Path(args.video).resolve()
        if not video_path.exists():
            print(f"Error: Video file not found: {video_path}")
            sys.exit(1)
        
        print(f"Indexing video first: {video_path}")
        index_id = get_or_create_index()
        video_id = upload_video(index_id, str(video_path))
        print(f"Video indexed with ID: {video_id}\n")
    else:
        print("Error: Either --video-id or --video must be provided")
        sys.exit(1)
    
    analysis = analyze_full_presentation(video_id)
    
    if args.output:
        output_path = Path(args.output)
        output_path.write_text(analysis, encoding="utf-8")
        print(f"\nAnalysis saved to: {output_path}")
    
    print("\n" + "=" * 60)
    print("ANALYSIS COMPLETE")
    print("=" * 60)


def cmd_section(args):
    """Analyze a specific section of a video."""
    print("=" * 60)
    print("ANALYZING VIDEO SECTION")
    print("=" * 60)
    
    if not args.video_id:
        print("Error: --video-id is required for section analysis")
        sys.exit(1)
    
    if not all([args.start_time, args.end_time, args.title]):
        print("Error: --start-time, --end-time, and --title are all required")
        sys.exit(1)
    
    video_id = args.video_id
    print(f"Video ID: {video_id}")
    print(f"Section: {args.title} ({args.start_time} - {args.end_time})")
    
    analysis = analyze_section_alignment(
        video_id, 
        args.start_time, 
        args.end_time, 
        args.title
    )
    
    if args.output:
        output_path = Path(args.output)
        output_path.write_text(analysis, encoding="utf-8")
        print(f"\nSection analysis saved to: {output_path}")
    
    print("\n" + "=" * 60)
    print("SECTION ANALYSIS COMPLETE")
    print("=" * 60)


def cmd_full_workflow(args):
    """Run complete workflow: index + chapters + analysis."""
    print("=" * 60)
    print("RUNNING FULL WORKFLOW")
    print("=" * 60)
    
    video_path = Path(args.video).resolve()
    if not video_path.exists():
        print(f"Error: Video file not found: {video_path}")
        sys.exit(1)
    
    print(f"Video: {video_path}")
    
    # Step 1: Index
    print("\n" + "=" * 60)
    print("STEP 1: INDEXING VIDEO")
    print("=" * 60)
    index_id = get_or_create_index(args.index_name)
    video_id = upload_video(index_id, str(video_path))
    print(f"\nVideo indexed with ID: {video_id}")
    
    # Step 2: Chapters
    if not args.skip_chapters:
        print("\n" + "=" * 60)
        print("STEP 2: GETTING VIDEO CHAPTERS")
        print("=" * 60)
        chapters = get_video_chapters(video_id)
        
        if args.output_chapters:
            output_path = Path(args.output_chapters)
            output_path.write_text(chapters, encoding="utf-8")
            print(f"\nChapters saved to: {output_path}")
    
    # Step 3: Full Analysis
    if not args.skip_analysis:
        print("\n" + "=" * 60)
        print("STEP 3: RUNNING FULL ANALYSIS")
        print("=" * 60)
        analysis = analyze_full_presentation(video_id)
        
        if args.output_analysis:
            output_path = Path(args.output_analysis)
            output_path.write_text(analysis, encoding="utf-8")
            print(f"\nAnalysis saved to: {output_path}")
    
    print("\n" + "=" * 60)
    print("FULL WORKFLOW COMPLETE")
    print("=" * 60)
    print(f"\nVideo ID: {video_id}")
    print("You can use this ID for future operations without re-indexing.")


def main():
    parser = argparse.ArgumentParser(
        description="CLI tool for testing backend modules independently",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Index a video file
  python -m backend.cli index --video ./my-video.mp4

  # Get chapters using existing video ID
  python -m backend.cli chapters --video-id abc123

  # Get chapters by indexing a new video
  python -m backend.cli chapters --video ./my-video.mp4

  # Run full analysis
  python -m backend.cli analyze --video-id abc123

  # Run complete workflow (index + chapters + analysis)
  python -m backend.cli workflow --video ./my-video.mp4

  # Save output to file
  python -m backend.cli analyze --video-id abc123 --output results.txt
        """
    )
    
    subparsers = parser.add_subparsers(dest="command", help="Command to execute")
    
    # Index command
    parser_index = subparsers.add_parser("index", help="Index a video file")
    parser_index.add_argument("--video", required=True, help="Path to video file")
    parser_index.add_argument("--index-name", default="presentation-analysis", 
                             help="Index name (default: presentation-analysis)")
    parser_index.set_defaults(func=cmd_index)
    
    # Chapters command
    parser_chapters = subparsers.add_parser("chapters", help="Get video chapters")
    parser_chapters.add_argument("--video-id", help="Existing video ID (skip indexing)")
    parser_chapters.add_argument("--video", help="Path to video file (will index first)")
    parser_chapters.add_argument("--output", help="Save output to file")
    parser_chapters.set_defaults(func=cmd_chapters)
    
    # Analyze command
    parser_analyze = subparsers.add_parser("analyze", help="Run full presentation analysis")
    parser_analyze.add_argument("--video-id", help="Existing video ID (skip indexing)")
    parser_analyze.add_argument("--video", help="Path to video file (will index first)")
    parser_analyze.add_argument("--output", help="Save output to file")
    parser_analyze.set_defaults(func=cmd_analyze)
    
    # Section command
    parser_section = subparsers.add_parser("section", help="Analyze a specific video section")
    parser_section.add_argument("--video-id", required=True, help="Video ID")
    parser_section.add_argument("--start-time", required=True, help="Start time (MM:SS)")
    parser_section.add_argument("--end-time", required=True, help="End time (MM:SS)")
    parser_section.add_argument("--title", required=True, help="Section title")
    parser_section.add_argument("--output", help="Save output to file")
    parser_section.set_defaults(func=cmd_section)
    
    # Full workflow command
    parser_workflow = subparsers.add_parser("workflow", help="Run complete workflow (index + chapters + analysis)")
    parser_workflow.add_argument("--video", required=True, help="Path to video file")
    parser_workflow.add_argument("--index-name", default="presentation-analysis",
                                 help="Index name (default: presentation-analysis)")
    parser_workflow.add_argument("--skip-chapters", action="store_true",
                                 help="Skip chapter extraction")
    parser_workflow.add_argument("--skip-analysis", action="store_true",
                                 help="Skip full analysis")
    parser_workflow.add_argument("--output-chapters", help="Save chapters to file")
    parser_workflow.add_argument("--output-analysis", help="Save analysis to file")
    parser_workflow.set_defaults(func=cmd_full_workflow)
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        sys.exit(1)
    
    try:
        args.func(args)
    except KeyboardInterrupt:
        print("\n\nOperation cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"\nError: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
