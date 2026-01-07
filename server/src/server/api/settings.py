from __future__ import annotations

from ..config import EnvBaseSettings


class ApiSettings(EnvBaseSettings):
    """API / FastAPI 레이어에서 사용하는 설정.

    - backend_cors_origins: "http://localhost:5173,http://localhost:4173" 처럼
      콤마로 구분된 Origin 리스트 문자열.
    """

    backend_cors_origins: str | None = None
