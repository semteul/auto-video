from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from uuid import UUID
from server.database import get_db
from server.service.project_media import create_file_by_media_stream, get_all_media, get_all_url_map
from server.api.schemas import MediaResponse

router = APIRouter()

@router.post("/projects/{project_id}/media/upload")
async def upload_media_api(project_id: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        media = create_file_by_media_stream(db, project_id, file.file, content_type=file.content_type, name=file.filename)
        return {"media_id": media.id}
    except Exception as e:
        raise HTTPException(400, f"Failed to upload media: {str(e)}")

@router.get("/projects/{project_id}/media", response_model=list[MediaResponse])
async def get_project_media_api(project_id: str, db: Session = Depends(get_db)):
    media_list = get_all_media(db, project_id)
    return [MediaResponse(**m.dict()) for m in media_list] if media_list else []

@router.get("/projects/{project_id}/media/url-map", response_model=dict)
async def get_project_media_url_map_api(project_id: str, db: Session = Depends(get_db)):
    url_map = get_all_url_map(db, project_id)
    return url_map or {}
