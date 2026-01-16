from datetime import date

from sqlalchemy import Date, ForeignKey, Integer, String, Column
from sqlalchemy.dialects.postgresql import JSONB
from .base import Base


class ProjectModel(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True)
    body = Column(JSONB, nullable=True)


class FileModel(Base):
    __tablename__ = "files"

    id = Column(String, primary_key=True)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False) # 연관된 프로젝트 ID

    delete_date = Column(Date, nullable=True, default=date.max) # 삭제 예정일
    
    bucket = Column(String, nullable=False) # 저장소 버킷 이름
    object_name = Column(String, nullable=False) # 저장소 내 파일 위치

    name = Column(String, nullable=False) # 실제 파일 이를
    size = Column(Integer, nullable=False) # 파일 크기 (바이트 단위)
    content_type = Column(String, nullable=True) # MIME 타입
    