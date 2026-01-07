from __future__ import annotations

import json
from typing import Optional

import redis
from server.tts.tts import VideoScript

from ..tts import Section, Word
from .redis_settings import RedisSettings


# 단순 로컬 개발용 Redis 클라이언트
# docker-compose 의 redis 서비스를 기준으로 한다.
# - host: 127.0.0.1
# - port: 6379

def _get_client() -> redis.Redis:
    settings = RedisSettings()
    return redis.Redis(
        host=settings.redis_host,
        port=settings.redis_port,
        db=settings.redis_db,
        decode_responses=True,
    )


def _section_key(section_id: str) -> str:
    return f"section:{section_id}"


def save_section(section: Section) -> None:
    """Section 을 Redis 에 JSON 형태로 저장한다."""

    client = _get_client()

    # Pydantic BaseModel -> dict -> JSON
    raw = section.model_dump()
    client.set(_section_key(section.id), json.dumps(raw, ensure_ascii=False))


def load_section(section_id: str) -> Optional[Section]:
    """Redis 에서 Section 하나를 읽어온다. 없으면 None."""

    client = _get_client()
    data = client.get(_section_key(section_id))
    if data is None:
        return None

    raw = json.loads(data)

    # words 는 Word Pydantic 모델 리스트로 다시 감싸준다.
    # 과거 키 이름(is_caption_splited)과 현재 이름(is_caption_splitted)을 모두 허용한다.
    words = [
        Word(
            text=w["text"],
            displayed_text=w["displayed_text"],
            is_caption_splitted=w.get("is_caption_splitted", w.get("is_caption_splited", False)),
            start=w.get("start"),
        )
        for w in raw.get("words", [])
    ]

    return Section(
        id=raw["id"],
        is_generated=raw["is_generated"],
        delay=raw.get("delay", 0.0),
        words=words,
    )

def save_video_script(script: VideoScript) -> None:
    """VideoScript 를 Redis 에 JSON 형태로 저장한다."""

    client = _get_client()

    script_id = script.id
    if not script_id:
        raise ValueError("script must have an 'id' field")

    # Pydantic BaseModel 은 직접 json.dumps 할 수 없으므로 dict로 변환
    client.set(
        f"videoscript:{script_id}",
        json.dumps(script.model_dump(), ensure_ascii=False),
    )

def load_video_script(script_id: str) -> Optional[VideoScript]:
    """Redis 에서 VideoScript 하나를 읽어온다. 없으면 None."""

    client = _get_client()
    data = client.get(f"videoscript:{script_id}")
    if data is None:
        return None

    raw = json.loads(data)
    return VideoScript(**raw)