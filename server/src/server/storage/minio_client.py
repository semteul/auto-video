from __future__ import annotations

from dataclasses import dataclass

from minio import Minio

from .settings import MinioSettings


@dataclass
class UploadedObject:
    url: str
    bucket: str
    object_name: str


def _build_client() -> tuple[Minio, MinioSettings]:
    settings = MinioSettings()
    client = Minio(
        endpoint=settings.minio_endpoint,
        access_key=settings.minio_access_key,
        secret_key=settings.minio_secret_key,
        secure=settings.minio_secure,
    )
    return client, settings


def upload_tts_audio(
    content: bytes, object_name: str, content_type: str = "audio/mpeg"
) -> UploadedObject:
    """Upload synthesized audio bytes to MinIO and return its URL.

    This helper is intentionally minimal and synchronous.
    """

    import io

    client, settings = _build_client()

    if not client.bucket_exists(settings.minio_bucket):
        client.make_bucket(settings.minio_bucket)

    data = io.BytesIO(content)
    size = len(content)

    client.put_object(
        bucket_name=settings.minio_bucket,
        object_name=object_name,
        data=data,
        length=size,
        content_type=content_type,
    )

    scheme = "https" if settings.minio_secure else "http"
    url = f"{scheme}://{settings.minio_endpoint}/{settings.minio_bucket}/{object_name}"

    return UploadedObject(
        url=url, bucket=settings.minio_bucket, object_name=object_name
    )

def get_tts_audio(object_name: str) -> bytes:
    """Download synthesized audio bytes from MinIO."""

    client, settings = _build_client()

    response = client.get_object(
        bucket_name=settings.minio_bucket,
        object_name=object_name,
    )

    audio_content = response.read()
    response.close()
    response.release_conn()

    return audio_content


def generate_readonly_signed_url(object_name: str, expires_seconds: int = 3600) -> str:
    """Generate a read-only presigned URL for an existing object.

    Args:
        object_name: Object key within the configured bucket.
        expires_seconds: URL expiry in seconds (default: 1 hour).
    """

    from datetime import timedelta

    client, settings = _build_client()

    url = client.presigned_get_object(
        bucket_name=settings.minio_bucket,
        object_name=object_name,
        expires=timedelta(seconds=expires_seconds),
    )

    return url
