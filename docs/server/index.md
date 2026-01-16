# 서버 폴더 구조 및 역할

이 문서는 `server/` 디렉토리의 주요 폴더 및 파일 구조와 각 폴더의 역할을 정리한 것입니다.

## 폴더 구조

```
server/
├── alembic/                # 데이터베이스 마이그레이션 관리 (Alembic)
│   ├── env.py
│   ├── script.py.mako
│   ├── versions/           # 마이그레이션 스크립트 저장
│   └── ...
├── src/
│   └── server/
│       ├── api/            # FastAPI 엔드포인트 및 API 설정
│       ├── common/         # 공통 예외 처리 등 유틸리티
│       ├── database/       # DB 설정, 세션, 모델, 레포지토리
│       │   ├── models/     # SQLAlchemy 모델 정의
│       │   └── repositories/ # DB 접근 레포지토리
│       ├── redis/          # Redis 클라이언트 및 설정
│       ├── service/        # 비즈니스 로직 (예: media 서비스)
│       ├── storage/        # 스토리지 연동 및 설정
│       ├── tts/            # TTS(Text-to-Speech) 관련 모듈
│       └── tests/          # 서버 단위 테스트 코드
├── alembic.ini             # Alembic 설정 파일
├── pyproject.toml          # Python 프로젝트 및 의존성 관리 파일
└── README.md               # 서버 설명 문서
```

## 폴더별 역할 설명

- **alembic/**: 데이터베이스 마이그레이션을 관리하는 폴더입니다. `versions/` 하위에 각 마이그레이션 스크립트가 저장됩니다.
- **src/server/api/**: FastAPI 기반의 API 엔드포인트와 관련 설정 파일이 위치합니다.
- **src/server/api/schemas.py**: 이 파일은 API에서 사용하는 주요 데이터 모델(DTO) 정의를 모아둔 곳입니다.
- **src/server/common/**: 예외 처리 등 여러 모듈에서 공통적으로 사용하는 유틸리티 코드가 들어 있습니다.
- **src/server/database/**: 데이터베이스 연결, 세션 관리, 모델 정의, 레포지토리(쿼리/트랜잭션) 코드가 포함됩니다.
  - **models/**: SQLAlchemy를 이용한 데이터베이스 테이블 모델 정의가 있습니다.
  - **repositories/**: 데이터베이스에 접근하는 레포지토리 패턴 구현체가 위치합니다.
- **src/server/redis/**: Redis 클라이언트 및 설정 파일이 위치합니다.
- **src/server/service/**: 비즈니스 로직(예: 미디어 관련 서비스 등)이 구현되어 있습니다. (함수기반)
- **src/server/storage/**: 외부 스토리지(예: S3 등) 연동 및 관련 설정 파일이 위치합니다.
- **src/server/tts/**: TTS(Text-to-Speech) 기능 관련 모듈이 위치합니다.
- **src/server/tests/**: 서버 코드의 단위 테스트가 위치합니다.
- **alembic.ini**: Alembic 마이그레이션 도구의 설정 파일입니다.
- **pyproject.toml**: Python 프로젝트의 의존성 및 빌드 설정 파일입니다.
- **README.md**: 서버 프로젝트에 대한 설명이 담긴 문서입니다.


## ORM 타입 및 도메인 클래스 정리

### ORM 모델 (SQLAlchemy)

- **Base**: 모든 ORM 모델의 베이스 클래스 (DeclarativeBase 상속)
- **UserModel**: 사용자 테이블. 필드: id(UUID), name(str)
- **ProjectModel**: 프로젝트 테이블. 필드: id(UUID), title(str), media(프로젝트에 속한 미디어 리스트)
- **ProjectMediaModel**: 프로젝트에 속한 미디어 테이블. 필드: id(UUID), name(str), bucket(str), size(int), object_name(str), content_type(str), project_id(UUID)

- **SceneModel**: 프로젝트의 Scene(장면) 테이블. 필드: id(UUID), project_id(UUID), media_id(UUID), word_count(int), order(int)

### 주요 도메인 클래스 (Pydantic 등)

- **ProjectResponse**: 프로젝트 응답 DTO (id, title)
- **MediaUrlResponse**: 미디어 URL 응답 DTO (id, name, content_type, size, url)
- **Word**: TTS용 단어 정보 (text, displayed_text, is_caption_splitted, start)
- **Section**: TTS용 섹션 정보 (id, is_generated, delay, words)
- **VideoScript**: TTS용 스크립트 정보 (id, title, section_ids)