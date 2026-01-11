from __future__ import annotations

from ..config import EnvBaseSettings


class DatabaseSettings(EnvBaseSettings):
    data_base_host: str
    data_base_port: int
    data_base_name: str
    data_base_user: str
    data_base_password: str