from server.repositories import ProjectModelRepository
from sqlalchemy.orm import Session
import uuid
from typing import Optional
from .project_types import Section, SectionType, SpeechSection, Project

async def create_section(db: Session, project_id: str) -> Optional[Section]:
    project_repo = ProjectModelRepository(db)
    project_model = project_repo.get(project_id)
    if not project_model:
        return None

    section_id = str(uuid.uuid4())
    new_section = Section(
        id=section_id,
        duration=0.0,
        type=SectionType.blank,
    )

    project_body = project_model.body
    project_body.sections.append(new_section)

    project_repo.update(project_id, body=project_body)

    return new_section

async def create_section_prev_to(db: Session, project_id: str, prev_section_id: str) -> Optional[Section]:
    project_repo = ProjectModelRepository(db)
    project_model = project_repo.get(project_id)
    if not project_model:
        return None

    section_id = str(uuid.uuid4())
    new_section = Section(
        id=section_id,
        duration=0.0,
        type=SectionType.blank,
    )

    project_body = project_model.body
    for index, section in enumerate(project_body.sections):
        if section.id == prev_section_id:
            project_body.sections.insert(index, new_section)
            break
    else:
        return None

    project_repo.update(project_id, body=project_body)

    return new_section

async def create_section_next_to(db: Session, project_id: str, next_section_id: str) -> Optional[Section]:
    project_repo = ProjectModelRepository(db)
    project_model = project_repo.get(project_id)
    if not project_model:
        return None

    section_id = str(uuid.uuid4())
    new_section = Section(
        id=section_id,
        duration=0.0,
        type=SectionType.blank,
    )

    project_body = project_model.body
    for index, section in enumerate(project_body.sections):
        if section.id == next_section_id:
            project_body.sections.insert(index+1, new_section)
            break
    else:
        return None

    project_repo.update(project_id, body=project_body)

    return new_section

async def delete_section(db: Session, project_id: str, section_id: str) -> bool:
    project_repo = ProjectModelRepository(db)
    project_model = project_repo.get(project_id)
    if not project_model:
        return False

    project_body = project_model.body
    for index, section in enumerate(project_body.sections):
        if section.id == section_id:
            del project_body.sections[index]
            project_repo.update(project_id, body=project_body)
            return True

    return False

async def update_duration(db: Session, project_id: str, section_id: str, new_duration: float) -> bool:
    project_repo = ProjectModelRepository(db)
    project_model = project_repo.get(project_id)
    if not project_model:
        return False

    project_body = project_model.body
    for section in project_body.sections:
        if section.id == section_id:
            section.duration = new_duration
            break
    else:
        return False

    project_repo.update(project_id, body=project_body)
    return True

async def update_speech_section(db: Session, project_id: str, section: SpeechSection):
    project_repo = ProjectModelRepository(db)
    project_model = project_repo.get(project_id)
    if not project_model:
        return None

    project_body = project_model.body
    for index, existing_section in enumerate(project_body.sections):
        if existing_section.id == section.id:
            project_body.sections[index] = section
            break
    else:
        return None

    project_repo.update(project_id, body=project_body)
    return section

async def swap_section(db: Session, project_id: str, id_1: str, id_2: str) -> Optional[Project]:
    project_repo = ProjectModelRepository(db)
    project_model = project_repo.get(project_id)
    if not project_model:
        return None

    project_body = project_model.body
    index_1, index_2 = -1, -1
    for index, section in enumerate(project_body.sections):
        if section.id == id_1:
            index_1 = index
        elif section.id == id_2:
            index_2 = index

    if index_1 == -1 or index_2 == -1:
        return None

    project_body.sections[index_1], project_body.sections[index_2] = (
        project_body.sections[index_2],
        project_body.sections[index_1],
    )

    project_repo.update(project_id, body=project_body)

    return project_body
