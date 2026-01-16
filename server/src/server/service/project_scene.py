from server.repositories import ProjectModelRepository
from sqlalchemy.orm import Session
import uuid
from typing import List, Optional
from .project_types import Scene

async def resize_scene(db: Session, project_id: str, scene_id: str, new_interval_count: int) -> bool:
    project_repo = ProjectModelRepository(db)
    project_model = project_repo.get(project_id)
    if not project_model:
        return False

    project_body = project_model.body
    for scene in project_body.scenes:
        if scene.scene_id == scene_id:
            scene.interval_count = new_interval_count
            break
    else:
        return False

    project_repo.update(project_id, body=project_body)

    return True

async def delete_scene(db: Session, project_id: str, scene_id: str) -> Optional[List[Scene]]:
    project_repo = ProjectModelRepository(db)
    project_model = project_repo.get(project_id)
    if not project_model:
        return None
    
    project_body = project_model.body
    for index, scene in enumerate(project_body.scenes):
        if scene.scene_id == scene_id:
            del project_body.scenes[index]
            project_repo.update(project_id, body=project_body)
            return project_body.scenes

    return None

async def swap_scene(db: Session, project_id: str, id_1: str, id_2: str) -> Optional[List[Scene]]:
    project_repo = ProjectModelRepository(db)
    project_model = project_repo.get(project_id)
    if not project_model:
        return None

    project_body = project_model.body
    index_1, index_2 = -1, -1
    for index, scene in enumerate(project_body.scenes):
        if scene.scene_id == id_1:
            index_1 = index
        elif scene.scene_id == id_2:
            index_2 = index

    if index_1 == -1 or index_2 == -1:
        return None

    project_body.scenes[index_1], project_body.scenes[index_2] = (
        project_body.scenes[index_2],
        project_body.scenes[index_1],
    )

    project_repo.update(project_id, body=project_body)

    return project_body.scenes

async def create_scene(db: Session, project_id: str) -> Optional[Scene]:
    project_repo = ProjectModelRepository(db)
    project_model = project_repo.get(project_id)
    if not project_model:
        return None

    scene_id = str(uuid.uuid4())
    new_scene = Scene(
        scene_id=scene_id,
        project_id=project_id,
        media_id=None,
        interval_count=0,
        media=None,
    )

    project_body = project_model.body
    project_body.scenes.append(new_scene)

    project_repo.update(project_id, body=project_body)

    return new_scene

async def create_scene_next_to(db: Session, project_id: str, next_scene_id: str) -> Optional[Scene]:
    project_repo = ProjectModelRepository(db)
    project_model = project_repo.get(project_id)
    if not project_model:
        return None

    scene_id = str(uuid.uuid4())
    new_scene = Scene(
        scene_id=scene_id,
        project_id=project_id,
        media_id=None,
        interval_count=0,
        media=None,
    )

    project_body = project_model.body
    for index, scene in enumerate(project_body.scenes):
        if scene.scene_id == next_scene_id:
            project_body.scenes.insert(index+1, new_scene)
            break
    else:
        return None

    project_repo.update(project_id, body=project_body)

    return new_scene

async def create_scene_prev_to(db: Session, project_id: str, prev_scene_id: str) -> Optional[Scene]:
    project_repo = ProjectModelRepository(db)
    project_model = project_repo.get(project_id)
    if not project_model:
        return None

    scene_id = str(uuid.uuid4())
    new_scene = Scene(
        scene_id=scene_id,
        project_id=project_id,
        media_id=None,
        interval_count=0,
        media=None,
    )

    project_body = project_model.body
    for index, scene in enumerate(project_body.scenes):
        if scene.scene_id == prev_scene_id:
            project_body.scenes.insert(index, new_scene)
            break
    else:
        return None

    project_repo.update(project_id, body=project_body)

    return new_scene
