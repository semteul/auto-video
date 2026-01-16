from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from server.database import get_db
from server.service.project_section import (
    create_section, create_section_next_to, create_section_prev_to, delete_section, update_duration, update_speech_section, swap_section
)
from server.api.schemas import SectionResponse

router = APIRouter()

@router.post("/projects/{project_id}/sections")
async def create_section_api(project_id: str, db: Session = Depends(get_db)):
    section = await create_section(db, project_id)
    if not section:
        raise HTTPException(400, "Failed to create section")
    return SectionResponse(**section.dict())

@router.post("/projects/{project_id}/sections/next-to/{next_section_id}")
async def create_section_next_to_api(project_id: str, next_section_id: str, db: Session = Depends(get_db)):
    section = await create_section_next_to(db, project_id, next_section_id)
    if not section:
        raise HTTPException(400, "Failed to create section next to")
    return SectionResponse(**section.dict())

@router.post("/projects/{project_id}/sections/prev-to/{prev_section_id}")
async def create_section_prev_to_api(project_id: str, prev_section_id: str, db: Session = Depends(get_db)):
    section = await create_section_prev_to(db, project_id, prev_section_id)
    if not section:
        raise HTTPException(400, "Failed to create section prev to")
    return SectionResponse(**section.dict())

@router.delete("/projects/{project_id}/sections/{section_id}")
async def delete_section_api(project_id: str, section_id: str, db: Session = Depends(get_db)):
    result = await delete_section(db, project_id, section_id)
    if not result:
        raise HTTPException(404, "Section not found")
    return {"success": True, "deleted_id": section_id}

@router.patch("/projects/{project_id}/sections/{section_id}/duration")
async def update_duration_api(project_id: str, section_id: str, new_duration: float, db: Session = Depends(get_db)):
    result = await update_duration(db, project_id, section_id, new_duration)
    if not result:
        raise HTTPException(400, "Failed to update duration")
    return {"success": True}

@router.patch("/projects/{project_id}/sections/{section_id}/speech")
async def update_speech_section_api(project_id: str, section_id: str, section: dict, db: Session = Depends(get_db)):
    # section dict를 SpeechSection 모델로 변환 필요
    result = await update_speech_section(db, project_id, section)
    if not result:
        raise HTTPException(400, "Failed to update speech section")
    return {"success": True}

@router.post("/projects/{project_id}/sections/swap")
async def swap_section_api(project_id: str, id_1: str, id_2: str, db: Session = Depends(get_db)):
    project = await swap_section(db, project_id, id_1, id_2)
    if not project:
        raise HTTPException(400, "Failed to swap sections")
    return {"success": True}
