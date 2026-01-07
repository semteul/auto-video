from __future__ import annotations

from ..config import EnvBaseSettings


class TtsSettings(EnvBaseSettings):
    """Google TTS 관련 설정.

    - google_tts_api_key: Google Cloud Text-to-Speech API 키
    """

    google_tts_api_key: str
