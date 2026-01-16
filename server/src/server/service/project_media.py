from server.repositories import FileRepository, ProjectModelRepository
from server.service.file import get_file_url_by_id
from sqlalchemy.orm import Session
from typing import BinaryIO, Optional
import uuid
from server.storage.storage_client import upload_media_stream
from .project_types import Media, Project

def create_file_by_media_stream(
    db: Session,
    project_id: str,
    fileobj: BinaryIO,
    *,
    content_type: str,
    name: str,
    delete_date=None,
) -> Optional[Media]:
    # 1. 파일 업로드
    uploaded = upload_media_stream(
        fileobj,
        content_type=content_type,
        name=name,
    )

    # 2. DB에 파일 정보 저장
    file_id = str(uuid.uuid4())
    file_repo = FileRepository(db)
    file = file_repo.create(
        id=file_id,
        project_id=project_id,
        bucket_name=uploaded.bucket,
        object_name=uploaded.object_name,
        size=uploaded.size,
        name=uploaded.name,
        delete_date=delete_date,
    )

    # 3. Project에 media 할당
    media_id = str(uuid.uuid4())
    project_repo = ProjectModelRepository(db)
    project_model = project_repo.get(project_id)
    if not project_model:
        return None
    project_body: Project = project_model.body
    media = Media(
        id=media_id,
        name=file.name,
        content_type=file.content_type or uploaded.content_type,
        size=file.size,
        file_id=file_id,
    )

    project_body.media.append(media)
    project_repo.update(project_id, body=project_body)
    return media

def get_all_media(db: Session, project_id: str) -> Optional[list[Media]]:
    project_repo = ProjectModelRepository(db)
    project_model = project_repo.get(project_id)
    if not project_model:
        return None
    project_body: Project = project_model.body
    return project_body.media


def get_all_url_map(db: Session, project_id: str) -> Optional[dict[str, str]]:
    project_repo = ProjectModelRepository(db)
    project_model = project_repo.get(project_id)
    if not project_model:
        return None
    project_body: Project = project_model.body
    url_map: dict[str, str] = {}

    for media in project_body.media:
        file_id = media.file_id
        url = get_file_url_by_id(db, file_id)
        if url:
            url_map[media.id] = url

    return url_map