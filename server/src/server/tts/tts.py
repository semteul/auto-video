from pathlib import Path
from typing import List

from google.api_core.client_options import ClientOptions
from google.cloud import texttospeech_v1beta1 as texttospeech
from pydantic_settings import BaseSettings, SettingsConfigDict


BASE_PATH = Path(__file__).resolve()
ENV_FILE = None
for parent in BASE_PATH.parents:
    candidate = parent / ".env.local"
    if candidate.exists():
        ENV_FILE = candidate
        break


class Settings(BaseSettings):
    google_tts_api_key: str

    model_config = SettingsConfigDict(
        env_file=str(ENV_FILE) if ENV_FILE is not None else None,
        env_file_encoding="utf-8",
    )


def _build_client() -> texttospeech.TextToSpeechClient:
    settings = Settings()
    api_key = settings.google_tts_api_key
    return texttospeech.TextToSpeechClient(
        client_options=ClientOptions(api_key=api_key)
    )


def list_voices(prefix: str | None = None) -> List[str]:
    """Return available TTS voices as a plain list of dicts.

    Args:
        prefix: If given, only voices whose name starts with this prefix
            will be returned (for example, "ko-" for Korean voices).

    Returns:
        List of voice metadata dictionaries with keys:
        name, language_codes, gender, sample_rate_hz.
    """

    client = _build_client()
    response = client.list_voices()

    voices: List[str] = []
    for v in response.voices:
        if prefix and not v.name.startswith(prefix):
            continue
        
        if v.name.startswith("ko-KR-Chirp3-"):
            voices.append(v.name)

    return voices


def _build_ssml(text: str) -> str:
    """Wrap plain text in a simple SSML <speak> container.

    This is intentionally minimal so we can experiment quickly.
    """

    # 어절 단위로 split
    word = text.split()

    # mark 태그 추가
    marked_text = " ".join(f"{w} <mark name='m{i}'/>" for i, w in enumerate(word))

    return f"<speak>{marked_text}</speak>"


def test_synthesize_ssml_to_mp3() -> None:
    client = _build_client()

    # TODO: Replace this sample text and voice with your own.
    sample_text = "안녕하세요. 구글 TTS SSML 테스트입니다. 마크드 텍스트를 테스트합니다. 각 어절마다 마크가 들어갑니다."
    ssml = _build_ssml(sample_text)

    synthesis_input = texttospeech.SynthesisInput(ssml=ssml)

    voice = texttospeech.VoiceSelectionParams(
        language_code="ko-KR",
        # Replace this with a concrete voice name from list_google_tts_voices
        name="ko-KR-Chirp3-HD-Achernar",
    )

    audio_config = texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.MP3,
    )

    response = client.synthesize_speech(
        request=texttospeech.SynthesizeSpeechRequest(
            input=synthesis_input,
            voice=voice,
            audio_config=audio_config,
            enable_time_pointing=[
                texttospeech.SynthesizeSpeechRequest.TimepointType.SSML_MARK
            ],
        )
    )

    output_path = BASE_PATH.parent / "a.mp3"
    output_path.write_bytes(response.audio_content)

    # Print mark timestamps for quick inspection
    for tp in response.timepoints:
        print(f"mark={tp.mark_name!r}, time={tp.time_seconds:.3f}s")

    print(f"Wrote synthesized audio to {output_path}")

def main() -> None:
    # voices = list_voices()
    # for v in voices:
    #     print(v)
    test_synthesize_ssml_to_mp3()
    
if __name__ == "__main__":
    raise SystemExit(main())