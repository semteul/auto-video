from sqlalchemy import Column, Integer, String
from .base import Base
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True)
    title = Column(String, nullable=False)
    media = relationship(
        "ProjectMedia",
        back_populates="project",
        cascade="all, delete-orphan",
    )

class ProjectMedia(Base):
    __tablename__ = "project_media"

    id = Column(Integer, primary_key=True)
    object_key = Column(String, nullable=False)
    name= Column(String, nullable=False)

    project = relationship(
        "Project",
        back_populates="media"
    )
