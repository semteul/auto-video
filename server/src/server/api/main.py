from fastapi import FastAPI
from ..tts import list_voices

app = FastAPI()


@app.get("/hello")
async def read_hello() -> dict:
    return {"message": "Hello, world"}

@app.get("/tts/voices")
async def get_tts_voices(prefix: str | None = None) -> list[str]:
    voices = list_voices(prefix)
    return voices
