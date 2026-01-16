from __future__ import annotations

from pydantic import Field
from ..config import EnvBaseSettings

class DatabaseSettings(EnvBaseSettings):
    database_host: str = Field(alias="DATABASE_HOST")
    database_port: int = Field(alias="DATABASE_PORT")
    database_name: str = Field(alias="DATABASE_NAME")
    database_user: str = Field(alias="DATABASE_USER")
    database_password: str = Field(alias="DATABASE_PASSWORD")