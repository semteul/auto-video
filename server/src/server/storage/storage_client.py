import boto3
from functools import lru_cache

from pydantic import BaseModel
from .settings import StorageSettings
from botocore.exceptions import ClientError

from typing import BinaryIO
import uuid



@lru_cache
def get_settings() -> StorageSettings:
    return StorageSettings()


@lru_cache
def get_s3_client():
    settings = get_settings()
    return boto3.client(
        "s3",
        endpoint_url=settings.s3_endpoint_url,
        aws_access_key_id=settings.aws_access_key_id,
        aws_secret_access_key=settings.aws_secret_access_key,
        region_name=settings.aws_default_region,
    )


class UploadedFile(BaseModel):
    id: str
    bucket: str
    object_name: str
    name: str
    content_type: str


def upload_media_stream(
    fileobj: BinaryIO,
    *,
    content_type: str,
    id: str,
):
    s3 = get_s3_client()
    settings = get_settings()

    bucket = settings.media_bucket
    object_name = f"{uuid.uuid4().hex}"

    ensure_bucket_exists(s3, bucket)

    s3.upload_fileobj(
        Fileobj=fileobj,
        Bucket=bucket,
        Key=object_name,
        ExtraArgs={
            "ContentType": content_type,
        },
    )

    return UploadedFile(
        id=str(id),
        bucket=bucket,
        object_name=object_name,
        name=object_name,
        content_type=content_type,
    )


def ensure_bucket_exists(s3, bucket: str):
    try:
        s3.head_bucket(Bucket=bucket)
    except ClientError as e:
        error_code = int(e.response["Error"]["Code"])
        if error_code == 404:
            s3.create_bucket(Bucket=bucket)
        else:
            raise


def generate_media_signed_url(
    media: UploadedFile,
    expires_seconds: int = 3600,
) -> str:
    s3 = get_s3_client()

    url = s3.generate_presigned_url(
        ClientMethod="get_object",
        Params={
            "Bucket": media.bucket,
            "Key": media.object_name,
            "ResponseContentType": media.content_type,
            "ResponseContentDisposition": (
                f'attachment; filename="{media.name}"'
            ),
        },
        ExpiresIn=expires_seconds,
    )

    return url


# from __future__ import annotations

# from dataclasses import dataclass
# from typing import BinaryIO

# from minio import Minio
# from pydantic import BaseModel

# from .settings import MinioSettings

# import uuid


# @dataclass
# class UploadedObject:
#     url: str
#     bucket: str
#     object_name: str

# class UploadedMedia(BaseModel):
#     id: str
#     bucket: str
#     object_name: str
#     name: str
#     content_type: str


# def _build_client() -> tuple[Minio, MinioSettings]:
#     settings = MinioSettings()
#     client = Minio(
#         endpoint=settings.minio_endpoint,
#         access_key=settings.minio_access_key,
#         secret_key=settings.minio_secret_key,
#         secure=settings.minio_secure,
#     )
#     return client, settings


# def upload_tts_audio(
#     content: bytes, object_name: str, content_type: str = "audio/mpeg"
# ) -> UploadedObject:
#     """Upload synthesized audio bytes to MinIO and return its URL.

#     This helper is intentionally minimal and synchronous.
#     """

#     import io

#     client, settings = _build_client()

#     if not client.bucket_exists(settings.minio_bucket):
#         client.make_bucket(settings.minio_bucket)

#     data = io.BytesIO(content)
#     size = len(content)

#     client.put_object(
#         bucket_name=settings.minio_bucket,
#         object_name=object_name,
#         data=data,
#         length=size,
#         content_type=content_type,
#     )

#     scheme = "https" if settings.minio_secure else "http"
#     url = f"{scheme}://{settings.minio_endpoint}/{settings.minio_bucket}/{object_name}"

#     return UploadedObject(
#         url=url, bucket=settings.minio_bucket, object_name=object_name
#     )


# def get_tts_audio(object_name: str) -> bytes:
#     """Download synthesized audio bytes from MinIO."""

#     client, settings = _build_client()

#     response = client.get_object(
#         bucket_name=settings.minio_bucket,
#         object_name=object_name,
#     )

#     audio_content = response.read()
#     response.close()
#     response.release_conn()

#     return audio_content


# def generate_readonly_signed_url(object_name: str, expires_seconds: int = 3600) -> str:
#     """Generate a read-only presigned URL for an existing object.

#     Args:
#         object_name: Object key within the configured bucket.
#         expires_seconds: URL expiry in seconds (default: 1 hour).
#     """

#     from datetime import timedelta

#     client, settings = _build_client()

#     url = client.presigned_get_object(
#         bucket_name=settings.minio_bucket,
#         object_name=object_name,
#         expires=timedelta(seconds=expires_seconds),
#     )

#     return url


# # Random UUID object name upload
# def upload_media_stream(
#     fileobj: BinaryIO,
#     *,
#     content_type: str,
#     id: str,
# ) -> UploadedMedia:
#     client, settings = _build_client()
#     bucket = settings.minio_media_bucket

#     if not client.bucket_exists(bucket):
#         client.make_bucket(bucket)

#     object_name = f"files/{uuid.uuid4().hex}"

#     client.put_object(
#         bucket_name=bucket,
#         object_name=object_name,
#         data=fileobj,
#         length=-1,
#         part_size=10 * 1024 * 1024,
#         content_type=content_type,
#     )

#     return UploadedMedia(
#         id=str(id),
#         bucket=bucket,
#         object_name=object_name,
#         name=object_name,
#         content_type=content_type,
#     )


# def generate_media_signed_url(
#     media: UploadedMedia,
#     expires_seconds: int = 3600,
# ) -> str:

#     from datetime import timedelta

#     client, _ = _build_client()

#     url = client.presigned_get_object(
#         bucket_name=media.bucket,
#         object_name=media.object_name,
#         expires=timedelta(seconds=expires_seconds),
#         response_headers={
#             "response-content-type": media.content_type,
#             "response-content-disposition": f'attachment; filename="{media.name}"',
#         },
#     )

#     return url
