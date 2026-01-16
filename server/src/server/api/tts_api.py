# import io
# from json import load
# from uuid import uuid4

# @app.post("/tts/scripts")
# async def create_video_script() -> VideoScript:
#     script = VideoScript(
#         id=uuid.uuid4().hex,
#         title="",
#         section_ids=[],
#     )
#     save_video_script(script) # TODO DB로 교체

#     return script

# @app.get("/tts/scripts/{script_id}")
# async def get_video_script(script_id: str) -> VideoScript:
#     script = load_video_script(script_id) # TODO DB로 교체

#     if script is None:
#         raise HTTPException(status_code=404, detail="VideoScript not found")

#     return script

# '''
# script에 랜덤 UUID 로 Section 생성
# '''
# @app.post("/tts/scripts/{script_id}/sections")
# async def create_section(script_id: str) -> Section:
#     loaded_script = load_video_script(script_id) # TODO DB로 교체
#     if loaded_script is None:
#         raise HTTPException(status_code=404, detail="VideoScript not found")
    
#     section = Section(
#         id=uuid.uuid4().hex,
#         is_generated=False,
#         words=[ Word(
#             text="",
#             displayed_text="",
#             is_caption_splitted=False,
#             start=0.0,
#         )],
#         delay=0.0,
#     )

#     save_section(section) # TODO DB로 교체
    
#     loaded_script.section_ids.append(section.id)
#     save_video_script(loaded_script) # TODO DB로 교체
#     return section


# @app.get("/tts/scripts/{script_id}/sections/{section_id}")
# async def get_section(script_id: str, section_id: str) -> Section:
#     section = load_section(section_id) # TODO DB로 교체
    
#     if section is None:
#         raise HTTPException(status_code=404, detail="Section not found")
    
#     return section


# @app.put("/tts/scripts/{script_id}/sections/{section_id}")
# async def update_section(script_id: str, section_id: str, section: Section) -> Section:
#     if section.id != section_id:
#         # path 와 body 가 불일치하면 덮어쓴다
#         section = Section(id=section_id, is_generated=section.is_generated, words=section.words, delay=section.delay)

#     save_section(section) # TODO DB로 교체
#     return section


# @app.post("/tts/scripts/{script_id}/sections/{section_id}/audio-generation")
# async def generate_section_audio(script_id: str, section_id: str) -> Section:
#     section = load_section(section_id) # TODO DB로 교체
#     if section is None:
#         raise HTTPException(status_code=404, detail="Section not found")

#     # TTS 오디오 생성 및 words 가져오기
#     new_section = await generate_audio(section)

#     save_section(new_section) # TODO DB로 교체

#     return new_section


# @app.get("/tts/scripts/{script_id}/sections/{section_id}/audio-url")
# async def get_tts_audio_url(script_id: str, section_id: str) -> dict:
#     # TODO  DB에서 id 로 object_name 조회
#     # TODO 권한 체크

#     # presigned URL 생성해서 반환
#     object_name = f"tts/{section_id}.mp3" # TODO DB에서 조회한 object_name
#     url = generate_readonly_signed_url(object_name, 3600)
#     return {"url": url}


# @app.get("/tts/scripts/{script_id}/voices")
# async def get_tts_voices(script_id: str, prefix: str | None = None) -> list[str]:
#     voices = list_voices(prefix)
#     return voices


# @app.put("/tts/scripts/{script_id}/sections/{section_id}/actions/update-with-audio/")
# async def update_section_with_audio(script_id: str, section_id:str, section: Section) -> Section:
#     # 업데이트
#     await update_section(script_id, section_id, section)
    
#     # 오디오 생성
#     await generate_section_audio(script_id, section_id)

#     return await get_section(script_id, section_id)


# @app.get("/tts/scripts/{script_id}/audio")
# async def get_script_audio(script_id: str) -> Response:
#     """주어진 VideoScript 의 모든 섹션 mp3 를 이어 붙인 단일 mp3를 반환한다."""

#     script = load_video_script(script_id)
#     if script is None:
#         raise HTTPException(status_code=404, detail="VideoScript not found")

#     output_bytes = buildScriptMp3(script)

#     return Response(
#         content=output_bytes,
#         media_type="audio/mpeg",
#         headers={
#             "Content-Disposition": f'attachment; filename="{script_id}.mp3"',
#         },
#     )


# @app.get("/tts/scripts/{script_id}/subtitles.srt")
# async def get_script_srt(script_id: str) -> Response:
#     """주어진 VideoScript 에 대한 SRT 자막 파일을 반환한다."""

#     script = load_video_script(script_id)
#     if script is None:
#         raise HTTPException(status_code=404, detail="VideoScript not found")

#     srt_text = buildScriptSrt(script)
#     print(srt_text)

#     return Response(
#         content=srt_text,
#         media_type="application/x-subrip; charset=utf-8",
#         headers={
#             "Content-Disposition": f'attachment; filename="{script_id}.srt"',
#         },
#     )


# async def generate_audio(section: Section) -> Section:
#     result = synthesize_words_to_mp3(section.words)
#     audio_content: bytes = result["audio_content"]
#     words = result["words"]

#     # S3(로컬 minio)에 업로드
#     # TODO 에러 처리
#     object_name = f"tts/{section.id}.mp3"
#     upload_tts_audio(audio_content, object_name)

#     # URL + timepoints 반환 (timepoints 를 JSON-friendly 형태로 변환)
#     new_section = Section(
#         id=section.id,
#         is_generated=True,
#         words=words,
#         delay=section.delay,
#     )
#     return new_section


# def format_srt_timestamp(seconds: float) -> str:
#     """초 단위 float 을 "HH:MM:SS,mmm" 형식의 SRT 타임스탬프로 변환한다."""

#     if seconds < 0:
#         seconds = 0.0

#     total_ms = int(round(seconds * 1000))
#     hours, rem = divmod(total_ms, 3600_000)
#     minutes, rem = divmod(rem, 60_000)
#     secs, ms = divmod(rem, 1000)

#     return f"{hours:02}:{minutes:02}:{secs:02},{ms:03}"

# def buildScriptMp3(script: VideoScript) -> bytes:
#     # script.section_ids 에 연결된 Section 들을 로드한다.
#     sections: list[Section] = []
#     for section_id in script.section_ids:
#         section = load_section(section_id)
#         if section is not None:
#             sections.append(section)

#     audio_contents: list[bytes] = []

#     for section in sections:
#         if section.is_generated:
#             # mp3 확보
#             object_name = f"tts/{section.id}.mp3"  # TODO DB에서 조회한 object_name
#             audio_content = get_tts_audio(object_name)  # bytes
#             audio_contents.append(audio_content)

#     # 같은 설정으로 생성된 mp3 조각들이라고 가정하고, 바이트 스트림을 단순 연결한다.
#     if not audio_contents:
#         return b""

#     return b"".join(audio_contents)


# def buildScriptSrt(script: VideoScript) -> str:
#     # 1. script.section_ids 에 연결된 Section 들을 로드한다.
#     sections: list[Section] = []
#     for section_id in script.section_ids:
#         section = load_section(section_id)
#         if section is not None:
#             sections.append(section)

#     # 2. mp3 길이를 센다
#     mp3_lengths: list[float] = []
#     for section in sections:
#         if section.is_generated:
#             object_name = f"tts/{section.id}.mp3"  # TODO DB에서 조회한 object_name
#             audio_content = get_tts_audio(object_name)  # bytes

#             audio_file = MP3(io.BytesIO(audio_content))
#             length_seconds = audio_file.info.length
#             mp3_lengths.append(length_seconds)
#         else:
#             mp3_lengths.append(0.0)
    
#     # 3. SRT 생성
#     #   - 각 word 의 start_time 은 word.start + section.delay + 이전 섹션 길이 누적
#     #   - end_time 은 다음 word 의 start_time, 마지막 word 는 전체 mp3 끝 시각
#     srt_lines: list[str] = []
#     srt_index = 1

#     # 전체 mp3 의 총 길이 (초)
#     total_audio_length = sum(mp3_lengths)

#     # 전체 단어들을 (절대 시작 시각, 표시 텍스트) 리스트로 평탄화
#     timed_words: list[tuple[float, str]] = []
#     current_time = 0.0
#     for section, section_length in zip(sections, mp3_lengths):
#         for word in section.words:
#             if word.start is None:
#                 continue
#             start_time = current_time + section.delay + word.start
#             timed_words.append((start_time, word.displayed_text))
#         current_time += section_length

#     # start_time 기준으로 정렬 (혹시 섹션/단어 순서가 섞여 있을 수 있으므로)
#     timed_words.sort(key=lambda x: x[0])

#     for idx, (start_time, text) in enumerate(timed_words):
#         if idx + 1 < len(timed_words):
#             end_time = timed_words[idx + 1][0]
#         else:
#             end_time = total_audio_length

#         start_timestamp = format_srt_timestamp(start_time)
#         end_timestamp = format_srt_timestamp(end_time)

#         srt_lines.append(f"{srt_index}")
#         srt_lines.append(f"{start_timestamp} --> {end_timestamp}")
#         srt_lines.append(text)
#         srt_lines.append("")  # 빈 줄

#         srt_index += 1

#     return "\n".join(srt_lines)
    