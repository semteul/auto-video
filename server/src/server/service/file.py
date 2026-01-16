from typing import BinaryIO
from server.database.models.models import FileModel
from server.repositories.repository import FileRepository
from server.storage.storage_client import UploadedFile, generate_media_signed_url, upload_audio_bytes, upload_media_stream
from sqlalchemy.orm import Session


# media stream을 이용해 파일 생성
def create_file_by_media_stream(
    fileobj: BinaryIO, 
    *, 
    content_type: str, 
    name: str, 
    db: Session,
    project_id: str,
) -> FileModel:
    result = upload_media_stream(fileobj=fileobj, content_type=content_type, name=name)
    fileRepo = FileRepository(db)

    file = fileRepo.create(
        project_id=project_id,
        bucket_name=result.bucket,
        object_name=result.object_name,
        size=result.size,
        name=result.name,
    )

    return file

# bytes를 audio로 업로드해 파일 생성
def create_audio_file_by_bytes(
    content: bytes,
    *,
    object_name: str,
    db: Session,
    project_id: str,
) -> FileModel:
    result = upload_audio_bytes(content=content, object_name=object_name)
    fileRepo = FileRepository(db)

    file = fileRepo.create(
        project_id=project_id,
        bucket_name=result.bucket,
        object_name=result.object_name,
        size=result.size,
        name=result.name,
    )

    return file

# 파일 ID로 파일 url 조회
def get_file_url_by_id(db: Session, file_id: str, expired_seconds: int = 3600) -> str:
    fileRepo = FileRepository(db)
    file = fileRepo.get(file_id)
    if not file:
        return None
    
    return generate_media_signed_url(media=UploadedFile(
        id=file.id,
        bucket=file.bucket,
        object_name=file.object_name,
        name=file.name,
        content_type=file.content_type,
        size=file.size,
    ), expires_seconds=expired_seconds)