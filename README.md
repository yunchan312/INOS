# INOS — 인문학의 OS

> **"같이 읽고, 보고, 생각하는 사람들을 위한 인문학 모임 OS"**

모임의 귀찮음은 AI가, 모임의 즐거움은 사람이.

---

## 왜 INOS인가?

인문학 모임을 하는 사람들이 공통으로 겪는 문제들이 있습니다.

| 페인포인트 | 현실 |
|---|---|
| 뭐 읽을지 정하기 귀찮음 | 카톡방에서 "뭐 볼까요~" 무한 루프 |
| 일정 조율이 지옥 | 엑셀 공유하거나 when2meet 링크 돌림 |
| 발제문 준비 부담 | 한 명이 항상 죽도록 준비함 |
| 모임 기록이 휘발됨 | 기껏 토론했는데 3일 뒤 아무도 기억 못 함 |
| 소규모라 지속이 어려움 | 한 명 빠지면 모임 자체가 흔들림 |

INOS는 이 모든 귀찮음을 AI가 대신하고, 사람은 토론과 감상에만 집중할 수 있게 합니다.

---

## 핵심 가치

| | |
|---|---|
| 🤖 **AI가 알아서** | 콘텐츠 추천, 발제문 작성, 대화 정리 |
| 🗂️ **기록은 남긴다** | 우리 모임의 역사가 차곡차곡 쌓임 |
| 👥 **같이도, 혼자도** | 그룹 모임과 개인 루틴 모두 지원 |

---

## 어떻게 쓰나요?

### 모임 리더라면

1. **모임 생성** — 이름, 소개, 관심 분야 설정 후 초대 링크로 멤버 초대
2. **콘텐츠 선정** — AI가 모임 취향에 맞는 책/영화 3~5개 추천 → 멤버 투표로 확정
3. **일정 조율** — 후보 날짜 제시 → 멤버 가능 여부 표시 → 최적 날짜 자동 제안
4. **발제문 생성** — D-1에 AI가 자동으로 핵심 주제·토론 질문·배경 컨텍스트 생성
5. **아카이빙** — 모임 후 AI 대화 요약 + 사진/글로 모임 타임라인 구축

### 모임 멤버라면

- 초대 링크로 간편 합류, 내 취향 입력
- 콘텐츠 투표 또는 직접 제안
- 모임 전날 발제문 수신 및 메모
- 모임 후 AI 요약 확인

### 혼자라면

- 개인 취향 프로필 → AI 주간 추천
- 혼자 보기 전 AI 발제문으로 더 깊게 감상
- 나만의 인문학 일기 아카이빙

---

## 타겟 유저

**Primary** — 20~35세 직장인, 독서/영화 모임 경험 있음. "제대로 하고 싶은데 귀찮은 건 싫어"

**Secondary** — 모임 없이 혼자 인문학 루틴을 만들고 싶은 사람

---

## 경쟁 포지션

```
                    AI 기능 강함
                         │
              [  INOS  ] ★
                         │
 모임 중심 ───────────────┼─────────────── 개인 중심
                         │
      [트레바리]    [북적북적]    [밀리의서재]
                         │
                    AI 기능 약함
```

트레바리의 큐레이션 + 소모임의 자율성 + AI의 편의성

---

## 개발 환경 설정

### 사전 요구사항

- Node.js 20+, pnpm 9+
- PostgreSQL 18+ (pgvector 확장), Redis

### 설치 및 실행

```bash
pnpm install

# 전체 개발 서버
pnpm dev

# API 서버만
pnpm dev:api
```

### 환경변수

`apps/server/.env`

```env
DATABASE_URL=postgresql://<user>:<password>@localhost:5432/inos
REDIS_URL=redis://localhost:6379
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES_IN=60m
JWT_REFRESH_EXPIRES_IN=30d
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
TMDB_API_KEY=
GOOGLE_BOOKS_API_KEY=
S3_BUCKET=
S3_REGION=
S3_ACCESS_KEY=
S3_SECRET_KEY=
PORT=3000
```

`apps/ai-server/.env`

```env
DATABASE_URL=postgresql://<user>:<password>@localhost:5432/inos
JWT_ACCESS_SECRET=
ANTHROPIC_API_KEY=
PORT=3001
```

### DB 초기화

```bash
psql -U postgres -d inos -c "CREATE EXTENSION IF NOT EXISTS vector;"

cd packages/prisma && pnpm prisma db push
```

### API 문서

서버 실행 후 `http://localhost:3000/api/docs`

---

## 모노레포 구조

```
apps/
├── server/      # 일반 API (NestJS, port 3000)
├── ai-server/   # AI 전담 (NestJS, port 3001)
└── web/         # 프론트엔드 (React + Vite, port 5173)
packages/
├── prisma/      # 공유 DB 스키마
├── types/       # 공유 DTO 타입
└── utils/       # 공유 유틸리티
```

---

*INOS — Humanities OS*
