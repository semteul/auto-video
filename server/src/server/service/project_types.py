from pydantic import BaseModel
from typing import List, Optional
from enum import Enum

class SectionType(str, Enum):
    speech = "speech"
    blank = "blank"

class Word(BaseModel):
    text: str
    displayed_text: str
    is_caption_split: bool
    start: float

class Interval(BaseModel):
    id: str
    words: List[Word]

class Section(BaseModel):
    id: str
    duration: float
    type: SectionType 

class SpeechSection(Section):
    type: SectionType = SectionType.speech
    is_generated: bool
    intervals: List[Interval]

class BlankSection(Section):
    type: SectionType = SectionType.blank

class Media(BaseModel):
    id: str
    name: str
    content_type: str
    size: int
    file_id: str

class Scene(BaseModel):
    scene_id: str
    project_id: str
    media_id: Optional[str]
    interval_count: int
    media: Optional[Media] = None

class Project(BaseModel):
    id: str
    title: str
    sections: List[Section]
    scenes: List[Scene]
    media: List[Media]
