# 이 프로젝트는 무엇인가?
웹 환경에서 AI 도움으로 쉽게 "편집 가능한" 프레젠테이션 영상을 제작하는 오픈소스 프로젝트를 목표로 하고 있다.

# 프로젝트 폴더
```
auto-video/
├─ api/          # Python API 서버 (FastAPI)
├─ web/          # FE (Vite + React + TS)
├─ workers/      # Python 워커 (AI 작업)
├─ infra/        # infra 설정 (docker-compose, redis.conf 등)
├─ tasks.py      # 로컬 개발용 실행 스크립트 (bootstrap, dev)
├─ docker-compose.yml  # 로컬 개발용 Redis 등 컨테이너 정의
└─ README.md 
```



---



# 개발환경

* node 필요
* docker 필요
* python 필요
* poetry 필요 : https://python-poetry.org/docs/#installation

## FE개발
```
cd web
```
### 개발환경 세팅

로컬 실행
```
npm run dev
```

빌드
```
npm run build
```

## Python API 서버 개발
```
cd api
```
### 개발환경 세팅

로컬 실행
```

```
## Python Worker 개발
### 


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