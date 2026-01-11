from pydantic import Field
from ..config import EnvBaseSettings

class AlembicSettings(EnvBaseSettings):
    db_host: str = Field(alias="DATABASE_HOST")
    db_port: int = Field(alias="DATABASE_PORT")
    db_name: str = Field(alias="DATABASE_NAME")
    db_user: str = Field(alias="DATABASE_USER")
    db_password: str = Field(alias="DATABASE_PASSWORD")

    @property
    def database_url(self) -> str:
        return (
            f"postgresql+psycopg2://"
            f"{self.db_user}:{self.db_password}"
            f"@{self.db_host}:{self.db_port}"
            f"/{self.db_name}"
        )

    class Config:
        case_sensitive = True
