from typing import List

from google.api_core.client_options import ClientOptions
from google.cloud import texttospeech_v1beta1 as texttospeech
from pydantic import BaseModel

from .settings import TtsSettings

class Word(BaseModel):
    text: str
    displayed_text: str
    is_caption_splitted: bool
    start: float

class Section(BaseModel):
    id: str
    is_generated: bool
    delay: float
    words: list[Word]

class VideoScript(BaseModel):
    id: str
    title: str
    section_ids: list[str]

def build_ssml(text: str) -> str:
    """
    Example:
        "안녕하세요 SSML 테스트 입니다." ->
        <speak><mark name="w0"/>안녕하세요 <mark name="w1"/>SSML ...</speak>
    """

    words = text.split()

    parts: list[str] = ["<speak>"]
    for i, word in enumerate(words):
        mark_name = f"w{i}"
        # mark + word
        parts.append(f'<mark name="{mark_name}"/>{word}')
        # 공백으로 어절 구분 보존
        if i != len(words) - 1:
            parts.append(" ")

    parts.append("</speak>")
    return "".join(parts)


def _build_client() -> texttospeech.TextToSpeechClient:
    settings = TtsSettings()
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



def synthesize_words_to_mp3(words: List[Word]) -> dict:
    client = _build_client()

    synthesis_input = texttospeech.SynthesisInput(ssml=build_ssml(" ".join([w.text for w in words])))

    voice = texttospeech.VoiceSelectionParams(
        language_code="ko-KR",
        # Replace this with a concrete voice name from list_google_tts_voices
        name="ko-KR-Wavenet-C",
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

    # time_points를 words.start에 적용
    for tp in response.timepoints:
        for i, w in enumerate(words):
            if tp.mark_name == f"w{i}":
                w.start = tp.time_seconds
                break
        

    return {
        "audio_content": response.audio_content,
        "words": words,
    }



def main() -> None:
    # voices = list_voices()
    # for v in voices:
    #     print(v)
    synthesize_words_to_mp3([
        Word(text="안녕하세요", displayed_text="안녕하세요", is_caption_splitted=False, start=0.0),
        Word(text="SSML", displayed_text="SSML", is_caption_splitted=False, start=1.0),
        Word(text="테스트", displayed_text="테스트", is_caption_splitted=False, start=2.0),
        Word(text="입니다.", displayed_text="입니다.", is_caption_splitted=False, start=3.0),
    ])

if __name__ == "__main__":
    raise SystemExit(main())