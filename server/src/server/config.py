from __future__ import annotations

from pathlib import Path
from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


BASE_PATH = Path(__file__).resolve()
ENV_FILE: Optional[Path] = None
for parent in BASE_PATH.parents:
    candidate = parent / ".env.local"
    if candidate.exists():
        ENV_FILE = candidate
        break


class EnvBaseSettings(BaseSettings):
    """Base Settings that loads from the nearest .env.local.

    각 서비스별 Settings 는 이 클래스를 상속해서 필드만 정의하면 됩니다.
    """

    model_config = SettingsConfigDict(
        env_file=str(ENV_FILE) if ENV_FILE is not None else None,
        env_file_encoding="utf-8",
        extra="ignore",
    )
