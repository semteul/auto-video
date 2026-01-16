from uuid import UUID
from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum

class SectionType(str, Enum):
    speech = "speech"
    blank = "blank"

class WordResponse(BaseModel):
    text: str
    displayedText: str = Field(..., alias="displayed_text")
    isCaptionSplit: bool = Field(..., alias="is_caption_split")
    start: float

class IntervalResponse(BaseModel):
    id: str
    words: List[WordResponse]

class SectionResponse(BaseModel):
    id: str
    duration: float
    type: SectionType

class SpeechSectionResponse(SectionResponse):
    type: SectionType = SectionType.speech
    isGenerated: bool = Field(..., alias="is_generated")
    intervals: List[IntervalResponse]

class BlankSectionResponse(SectionResponse):
    type: SectionType = SectionType.blank

class MediaResponse(BaseModel):
    id: str
    name: str
    contentType: str = Field(..., alias="content_type")
    size: int
    fileId: str = Field(..., alias="file_id")

class SceneResponse(BaseModel):
    sceneId: str = Field(..., alias="scene_id")
    projectId: str = Field(..., alias="project_id")
    mediaId: Optional[str] = Field(None, alias="media_id")
    intervalCount: int = Field(..., alias="interval_count")
    media: Optional[MediaResponse] = None

class ProjectResponse(BaseModel):
    id: str
    title: str
    sections: List[SectionResponse]
    scenes: List[SceneResponse]
    media: List[MediaResponse]

    class Config:
        allow_population_by_field_name = True