from __future__ import annotations

from ..config import EnvBaseSettings


class RedisSettings(EnvBaseSettings):
    """Redis 연결 설정.

    기본값은 docker-compose 의 redis 서비스(127.0.0.1:6379, db=0)에 맞춘다.
    필요하면 .env.local 에 REDIS_HOST / REDIS_PORT / REDIS_DB 로 오버라이드한다.
    """

    redis_host: str
    redis_port: int
    redis_db: int
