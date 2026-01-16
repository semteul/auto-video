from server.repositories import ProjectModelRepository
from sqlalchemy.orm import Session
import uuid
from typing import List, Optional
from .project_types import Project

async def create_project(db: Session, title: str) :
    project_repo = ProjectModelRepository(db)

    project_id = str(uuid.uuid4())

    body = Project(
        id=project_id,
        title=title,
        sections=[],
        scenes=[],
        media=[],
    )

    project = project_repo.create(id=project_id, body=body)

    return project


async def get_project(db: Session, project_id: str) -> Optional[Project]:
    project_repo = ProjectModelRepository(db)
    project_model = project_repo.get(project_id)
    if not project_model:
        return None
    return project_model.body


async def get_all_projects(db: Session) -> List[Project]:
    project_repo = ProjectModelRepository(db)
    project_models = project_repo.get_all()
    return [project_model.body for project_model in project_models]


async def delete_project(db: Session, project_id: str) -> bool:
    project_repo = ProjectModelRepository(db)
    return project_repo.delete(project_id)


async def update_project_title(db: Session, project_id: str, title: str) -> Optional[Project]:
    project_repo = ProjectModelRepository(db)
    project_model = project_repo.get(project_id)
    if not project_model:
        return None
    project_model.body.title = title
    
    updated_project = project_repo.update(project_id, body=project_model.body)

    return updated_project.body
