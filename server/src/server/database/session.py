from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from server.database.settings import DatabaseSettings

settings = DatabaseSettings()

DATABASE_URL = (
    f"postgresql+psycopg2://{settings.database_user}:{settings.database_password}"
    f"@{settings.database_host}:{settings.database_port}/{settings.database_name}"
)

engine = create_engine(DATABASE_URL, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()