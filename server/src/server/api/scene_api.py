from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from server.database import get_db
from server.service.project_scene import (
    create_scene, create_scene_next_to, create_scene_prev_to, delete_scene, swap_scene, resize_scene
)
from server.api.schemas import SceneResponse

router = APIRouter()

@router.post("/projects/{project_id}/scenes")
async def create_scene_api(project_id: str, db: Session = Depends(get_db)):
    scene = await create_scene(db, project_id)
    if not scene:
        raise HTTPException(400, "Failed to create scene")
    return SceneResponse(**scene.dict())

@router.post("/projects/{project_id}/scenes/next-to/{next_scene_id}")
async def create_scene_next_to_api(project_id: str, next_scene_id: str, db: Session = Depends(get_db)):
    scene = await create_scene_next_to(db, project_id, next_scene_id)
    if not scene:
        raise HTTPException(400, "Failed to create scene next to")
    return SceneResponse(**scene.dict())

@router.post("/projects/{project_id}/scenes/prev-to/{prev_scene_id}")
async def create_scene_prev_to_api(project_id: str, prev_scene_id: str, db: Session = Depends(get_db)):
    scene = await create_scene_prev_to(db, project_id, prev_scene_id)
    if not scene:
        raise HTTPException(400, "Failed to create scene prev to")
    return SceneResponse(**scene.dict())

@router.delete("/projects/{project_id}/scenes/{scene_id}")
async def delete_scene_api(project_id: str, scene_id: str, db: Session = Depends(get_db)):
    result = await delete_scene(db, project_id, scene_id)
    if not result:
        raise HTTPException(404, "Scene not found")
    return {"success": True, "deleted_id": scene_id}

@router.post("/projects/{project_id}/scenes/swap")
async def swap_scene_api(project_id: str, id_1: str, id_2: str, db: Session = Depends(get_db)):
    project = await swap_scene(db, project_id, id_1, id_2)
    if not project:
        raise HTTPException(400, "Failed to swap scenes")
    return {"success": True}

@router.patch("/projects/{project_id}/scenes/{scene_id}/resize")
async def resize_scene_api(project_id: str, scene_id: str, new_interval_count: int, db: Session = Depends(get_db)):
    result = await resize_scene(db, project_id, scene_id, new_interval_count)
    if not result:
        raise HTTPException(400, "Failed to resize scene")
    return {"success": True}
