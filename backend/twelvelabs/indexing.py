import os
from twelvelabs import IndexesCreateRequestModelsItem
from twelvelabs_client import client


def get_or_create_index(index_name: str = "presentation-analysis"):
    """Get existing index or create a new one."""
    # Check if index already exists
    print("Checking for existing index...")
    for index in client.indexes.list():
        if index.index_name == index_name:
            print(f"Found existing index: {index.id}")
            return index.id

    # Create new index if not found
    print("Creating new index...")
    index = client.indexes.create(
        index_name=index_name,
        models=[
            IndexesCreateRequestModelsItem(
                model_name="pegasus1.2",
                model_options=["visual", "audio"],
            ),
        ],
    )
    print(f"Index created: {index.id}")
    return index.id


def upload_video(index_id: str, video_path: str):
    """Upload a video to the index."""
    print(f"Uploading video: {video_path}")

    # Verify file exists
    if not os.path.exists(video_path):
        raise FileNotFoundError(f"Video file not found: {video_path}")

    print(f"File size: {os.path.getsize(video_path) / (1024*1024):.2f} MB")

    with open(video_path, "rb") as f:
        task = client.tasks.create(
            index_id=index_id,
            video_file=f
        )

    print(f"Task created: {task.id}")
    print("Waiting for indexing to complete...")

    completed_task = client.tasks.wait_for_done(
        task.id,
        sleep_interval=5,
        callback=lambda t: print(f"  Status: {t.status}")
    )

    if completed_task.status != "ready":
        raise RuntimeError(f"Indexing failed with status: {completed_task.status}")

    print(f"Video indexed successfully. Video ID: {completed_task.video_id}")
    return completed_task.video_id
