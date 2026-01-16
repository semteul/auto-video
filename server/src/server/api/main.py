from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .settings import ApiSettings
from .project_api import router as project_router
from .media_api import router as media_router
from .scene_api import router as scene_router
from .section_api import router as section_router

app = FastAPI()

# CORS 설정
_settings = ApiSettings()
_origins_raw = _settings.backend_cors_origins or ""
_origins = [o.strip() for o in _origins_raw.split(",") if o.strip()]

if _origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


app.include_router(project_router)
app.include_router(media_router)
app.include_router(scene_router)
app.include_router(section_router)
