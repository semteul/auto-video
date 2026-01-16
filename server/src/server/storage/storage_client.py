import boto3
from functools import lru_cache

from pydantic import BaseModel
from .settings import StorageSettings
from botocore.exceptions import ClientError

from typing import BinaryIO
import uuid
import io


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
    bucket: str
    object_name: str
    name: str
    content_type: str
    size: int


def upload_media_stream(
    fileobj: BinaryIO,
    *,
    content_type: str,
    name: str,
):
    s3 = get_s3_client()
    settings = get_settings()

    bucket = settings.media_bucket
    object_name = f"{uuid.uuid4().hex}"

    ensure_bucket_exists(s3, bucket)

    # 크기 측정
    fileobj.seek(0, 2)
    size = fileobj.tell()
    fileobj.seek(0) 

    s3.upload_fileobj(
        Fileobj=fileobj,
        Bucket=bucket,
        Key=object_name,
        ExtraArgs={
            "ContentType": content_type,
        },
    )

    return UploadedFile(
        bucket=bucket,
        object_name=object_name,
        name=name,
        content_type=content_type,
        size=size,  # Get size by seeking to end
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

def upload_audio_bytes(
    content: bytes, object_name: str
) -> UploadedFile:
    s3 = get_s3_client()
    settings = get_settings()

    bucket = settings.media_bucket

    data = io.BytesIO(content)
    size = len(content)

    content_type: str = "audio/mpeg"

    s3.put_object(
        Bucket=bucket,
        Key=object_name,
        Body=data,
        ContentLength=size,
        ContentType=content_type,
    )

    return UploadedFile(
        bucket=bucket,
        object_name=object_name,
        name=object_name,
        content_type=content_type,
        size=size,
    )


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