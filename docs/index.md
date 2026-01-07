---
title: Home
nav_order: 1
---

# 이 프로젝트는 무엇인가?
웹 환경에서 AI 도움으로 쉽게 "편집 가능한" 프레젠테이션 영상을 제작하는 오픈소스 프로젝트를 목표로 하고 있다.

# 프로젝트 폴더
```
auto-video/
├─ docs/                # 문서 정리 (just-the-docs 자동 배포)
├─ infra/               # infra 설정 (docker-compose, redis.conf 등)
├─ server/              # Python API(FastAPI) + worker (dramatiq, 향후 추가 예정)
├─ web/                 # FE (Vite + React + TS)
├─ docker-compose.yml   # 로컬 개발용 Redis 등 컨테이너 정의
├─ .gitignore           # 전역 .gitignore, 프로젝트 전체가 공유중
└─ readme.md 
```



---



# 개발환경
## 필요 패키지
* node
* docker
* python
* poetry : https://python-poetry.org/docs/#installation

## FE개발
```
cd web
```
### 로컬 개발환경

개발 서버 실행
```
npm run dev
```

빌드
```
npm run build
```

## 개발용 로컬 인프라 시동
docker-compose 생성
```
cd /
docker-compose up
```

redis 동작확인
```
docker exec auto-video-redis redis-cli ping
```



## Python API 서버 개발
개발환경 실행 전 로컬 redis 시동 필요
```
cd server
```

### 로컬 개발환경
의존성 설치(최소실행시 필수)
```
poetry install
```

개발서버 실행
```
poetry run uvicorn server.api.main:app --reload
```

* **poetry run** : poetry 가상환경에서 실행

* **uvicorn** : 실제 실행하는 서버 프로그램.
  
* **server.api.main:app**
	server/src/server/api/main.py 모듈(server.api.main) 안에 있는 app 객체를 이용

* **--reload**
	코드변경시 자동 서버 재시작

* **서버 포트 / OpenAPI**
	* 서버 기본 주소: http://127.0.0.1:8000
	* Swagger UI (OpenAPI 문서): http://127.0.0.1:8000/docs
	* 원시 OpenAPI 스키마(JSON): http://127.0.0.1:8000/openapi.json

### Poetry 가상환경 위치 (.venv 사용하기)

기본 설정에서는 Poetry가 사용자 캐시 디렉터리(예: `AppData\Local\pypoetry\Cache\virtualenvs\...`)
아래에 가상환경을 만든다. 프로젝트 안에 `.venv` 폴더로 가상환경을 두고 싶다면
아래 설정을 한 번만 해두면 된다.

```bash
poetry config virtualenvs.in-project true
```

그 후 해당 프로젝트 루트에서 기존 가상환경을 지우고 다시 설치하면 `.venv`가 생성된다.

```bash
cd api   # 또는 server, workers 등 해당 프로젝트 루트
poetry env remove python
poetry install
```

VS Code/Pylance에서 Python 인터프리터를 선택할 때는, 이 `.venv` 폴더 안의
`python`(Windows에서는 `Scripts/python.exe`)을 선택하면 된다.

## Python Worker 개발
개발환경 실행 전 로컬 redis 시동 필요

```
cd ./workers
```
### 로컬 개발환경
의존성 설치(최소실행시 필수)
```
poetry install
```


Dramatiq Actor 실행
```
poetry run dramatiq workers.tts
```

모듈 테스트
```
poetry run py ./src/workers/tts.py
```

---



# 차후 CI/CD 계획
아직 구상중입니다.

## CD
### python workers & api
각 worker별, api별 dockerfile에 pip등 명령어 정의해서

1. 도커 build -> 레지스트리 업로드
2. 쿠버네티스(EKS 등)에서 이미지 받아서 자동배포 or VPS나 EC2 등에 수동 배포

### FE
방법이 여러개이다.

1. npm build후 정적 호스팅
* AWS S3 + ClouodFrount

2. FE 플랫폼에 호스팅

3. Cloudflare Pages, Vercel 등 FE 배포 서비스 이용


### redis
Elasticache 등 상용 클라우드 이용