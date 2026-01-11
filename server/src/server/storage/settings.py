from __future__ import annotations
from ..config import EnvBaseSettings


class StorageSettings(EnvBaseSettings):
    """BOTO3 기반 S3 호환 오브젝트 스토리지 설정."""
    aws_access_key_id: str
    aws_secret_access_key: str
    aws_default_region: str
    s3_endpoint_url: str
    media_bucket: str = "media"
    voice_bucket: str = "voice"