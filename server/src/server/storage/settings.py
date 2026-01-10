from __future__ import annotations

from ..config import EnvBaseSettings


class MinioSettings(EnvBaseSettings):
    """MinIO / object storage 관련 설정.

    기본값은 로컬 개발용 docker-compose 설정에 맞춘다.
    실제 값은 .env.local 의 MINIO_* 환경변수로 오버라이드한다.
    """

    minio_endpoint: str
    minio_access_key: str
    minio_secret_key: str
    minio_bucket: str = "audio"
    minio_secure: bool = False
    minio_media_bucket: str
