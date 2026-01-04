from fastapi import FastAPI

app = FastAPI()


@app.get("/")
async def read_root():
    return {"message": "Hello from auto-video API"}


# 로컬 개발용 실행 엔트리 (uvicorn 직접 실행 시 사용)
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "api.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        app_dir="src",
    )
