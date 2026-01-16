from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from server.database import get_db
from server.service.project import create_project, get_all_projects, get_project, delete_project, update_project_title
from server.api.schemas import ProjectResponse

router = APIRouter()

@router.post("/projects", response_model=ProjectResponse)
async def create_project_api(title: str, db: Session = Depends(get_db)):
    project = await create_project(db, title)
    if not project:
        raise HTTPException(400, "Failed to create project")
    return ProjectResponse(id=project.id, title=project.title)

@router.get("/projects", response_model=list[ProjectResponse])
async def get_projects_api(db: Session = Depends(get_db)):
    projects = await get_all_projects(db)
    return [ProjectResponse(id=p.id, title=p.title) for p in projects]

@router.get("/projects/{project_id}", response_model=ProjectResponse)
async def get_project_api(project_id: str, db: Session = Depends(get_db)):
    project = await get_project(db, project_id)
    if not project:
        raise HTTPException(404, "Project not found")
    return ProjectResponse(id=project.id, title=project.title)

@router.delete("/projects/{project_id}")
async def delete_project_api(project_id: str, db: Session = Depends(get_db)):
    result = await delete_project(db, project_id)
    if not result:
        raise HTTPException(404, "Project not found")
    return {"success": True, "deleted_id": project_id}

@router.patch("/projects/{project_id}/title", response_model=ProjectResponse)
async def update_project_title_api(project_id: str, title: str, db: Session = Depends(get_db)):
    project = await update_project_title(db, project_id, title)
    if not project:
        raise HTTPException(404, "Project not found")
    return ProjectResponse(id=project.id, title=project.title)
