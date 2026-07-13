# INOS — 인문학의 OS

> **"초대받은 사람들만의, 조용한 인문학 모임 공간"**

일정 조율과 발제문 준비는 자동으로, 모임에서는 대화에만 집중하도록.

---

## 무엇을 하는 서비스인가

INOS는 폐쇄형(초대 기반) 인문학 모임 플랫폼입니다. 오가니제이션(모임 그룹) 안에서:

1. 소유자가 멤버를 이메일로 초대하고,
2. 소유자가 책/영화를 정해 새 모임을 만들면 후보 날짜 범위가 멤버들에게 이메일로 전달되고,
3. 멤버들이 when2meet 방식으로 가능한 날짜를 표시하면 — **전원이 가능한 날짜**로 자동 확정되고, 겹치는 날이 없으면 소유자가 직접 날짜를 확정하고,
4. 날짜가 확정되는 즉시 Claude가 책/영화별 발제 질문 5개를 생성하고,
5. 모임 당일부터 멤버들이 발제 질문마다 노트를 남기고 공개 여부를 토글하면 — 공개된 노트는 실시간으로 다른 멤버에게도 보이고,
6. "모임 종료"를 누르면 모든 멤버의 화면이 실시간으로 종료 상태로 전환되고, 오가니제이션 홈에는 지난 모임과 발제문 기록이 누적됩니다.

콘텐츠 추천/투표, 개인 루틴, 아카이브 열람 같은 기능은 이번 개편에서 제외했습니다 — 지금의 INOS는 "그룹 하나, 모임 하나"의 골든 패스에 집중합니다.

---

## 핵심 플로우

```
로그인(Google) → 오가니제이션 홈 → [소유자] 모임 생성 → 멤버 이메일 초대장 발송
                                                              │
                                                              ▼
                                        멤버들이 when2meet 방식으로 가능 날짜 제출
                                                              │
                                    ┌─────────────────────────┴─────────────────────────┐
                                    ▼                                                   ▼
                        전원 겹치는 날짜 있음 → 자동 확정                   겹치는 날짜 없음 → 소유자 메일 알림
                                    │                                        → 소유자가 날짜별 인원 보고 수동 확정
                                    └─────────────────────────┬─────────────────────────┘
                                                              ▼
                                              날짜 확정 즉시 AI 발제 질문 5×N개 생성
                                                              │
                                                              ▼
                                    모임 당일부터 멤버 노트 작성 (공개 시 실시간 브로드캐스트)
                                                              │
                                                              ▼
                                              모임 종료 → 전원 화면 실시간 read-only 전환
```

---

## 타겟 유저

**Primary** — 이미 아는 사람들끼리 꾸준히 책/영화 모임을 하는 소규모 그룹. 일정 조율과 발제문 준비의 반복 작업을 없애고 싶은 사람들.

INOS에는 회원가입으로 아무나 들어올 수 있는 공개 모임 개념이 없습니다. 오가니제이션 생성은 관리자가 승인하고, 그 안의 멤버는 이메일 초대로만 늘어납니다.

---

## 모노레포 구조

```
apps/
├── server/      # 일반 API — Auth/User/Group/Meeting/Mail/Admin (NestJS, Fastify, port 3000)
├── ai-server/   # AI 전담 — 발제문 생성 SSE, 노트 실시간 소켓 (NestJS, Fastify, port 3001)
└── web/         # 프론트엔드 — React + Vite + TanStack Query (port 5173)
packages/
├── prisma/      # 공유 DB 스키마 + 마이그레이션 + 시드
└── types/       # apps 간 공유 DTO 타입
```

### apps/server — 일반 API

| 모듈 | 담당 |
|---|---|
| `auth` | Google OAuth(axios 직접 구현) → JWT 발급, `/admin` 접근 여부 판별 |
| `user` | 프로필 조회/수정 |
| `group` | 오가니제이션 CRUD, 멤버십, 이메일 초대·수락, 설정(그리팅 등) |
| `meeting` | 모임 생성/수정/삭제, when2meet 가용성 제출·자동/수동 확정, 모임 종료 |
| `mail` | Gmail SMTP(nodemailer) 기반 메일 발송 — 초대, 신청, 관리자 알림 |
| `admin` | 오가니제이션·사용자 검색/필터/페이지네이션, 오가니제이션 생성/수정/삭제, 사용자 삭제·관리자 권한 부여 |

Google OAuth는 Passport 대신 axios로 직접 구현했습니다 — Fastify Reply가 Express 전용 API(`res.setHeader` 등)를 지원하지 않아 `passport-google-oauth20`이 깨지기 때문입니다. 리다이렉트는 NestJS `@Redirect()` 데코레이터로 처리합니다.

### apps/ai-server — AI 전담

- Claude(`claude-sonnet-4-6`)에 프롬프트 캐싱 + `web_search` 툴을 적용해 책/영화별 발제 질문 5개씩 생성
- `@Sse()`로 생성 과정을 브라우저에 실시간 스트리밍 (`?token=` 쿼리로 JWT 인증 — EventSource가 헤더를 못 보내서)
- socket.io 게이트웨이(`/notes` 네임스페이스)로 두 종류의 실시간 이벤트를 브로드캐스트:
  - **모임 룸**(`meeting:{id}`) — 노트 공개/비공개, 모임 종료
  - **오가니제이션 룸**(`org:{id}`) — 모임 생성/수정/삭제/확정, 가용성 응답 진행률
- apps/server → ai-server 호출은 서버 간 내부 엔드포인트(`/ai/discussions/:id/events/finished`, `/ai/events/orgs/:id`)로 이루어지며, 브라우저는 이 엔드포인트에 접근하지 않습니다.

### apps/web — 프론트엔드

- 라우팅: `react-router-dom` (지연 로딩)
- 서버 상태: `@tanstack/react-query`
- 클라이언트 상태(로그인 토큰/유저): Zustand (`stores/auth-store.ts`)
- 실시간: `socket.io-client` (`hooks/useNotesSocket.ts`, `hooks/useOrgEvents.ts`)

---

## 실시간 동기화가 필요한 이유와 방식

SSE와 socket.io 중 socket.io를 선택했습니다:

- 발제문 생성처럼 "한 번 스트리밍하고 끝"인 경우는 SSE(`@Sse()`)를 그대로 유지했지만,
- 노트 공개/비공개, 모임 생성·삭제·확정, 모임 종료처럼 **여러 클라이언트가 상시 접속해 서로의 변경을 받아야 하는 경우**는 socket.io 룸 기반 브로드캐스트를 사용합니다.
- apps/server에는 socket 서버를 두지 않고, 모든 실시간 브로드캐스트는 ai-server의 게이트웨이 하나로 통합했습니다. apps/server는 변경이 생기면 ai-server의 내부 이벤트 엔드포인트를 호출(fire-and-forget)하기만 합니다.

---

## 개발 환경 설정

### 사전 요구사항

- Node.js 20+, pnpm 9+
- PostgreSQL 14+ (pgvector 등 확장 불필요)
- Redis (BullMQ 큐용 — 이메일 발송, 발제문 생성 트리거)

### 설치

```bash
pnpm install
```

### 환경변수

**`apps/server/.env`**

```env
DATABASE_URL=postgresql://<user>:<password>@localhost:5432/inos
REDIS_HOST=localhost
REDIS_PORT=6379

JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES_IN=60m
JWT_REFRESH_EXPIRES_IN=30d

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

PORT=3000
FRONTEND_URL=http://localhost:5173
AI_SERVER_URL=http://localhost:3001
INVITATION_TTL_DAYS=7

# SMTP — Gmail 앱 비밀번호 발급: https://myaccount.google.com/apppasswords
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=
SMTP_PASS=
MAIL_FROM="INOS <you@example.com>"

# 오가니제이션 생성 신청 메일을 받을 주소
ADMIN_EMAIL=
```

> `SMTP_USER`/`SMTP_PASS`를 비워두면 실제 발송 없이 서버 콘솔에 메일 내용이 로그로만 출력됩니다(개발 폴백).

**`apps/ai-server/.env`**

```env
DATABASE_URL=postgresql://<user>:<password>@localhost:5432/inos
JWT_ACCESS_SECRET=   # apps/server와 반드시 동일한 값
ANTHROPIC_API_KEY=
PORT=3001
```

**`apps/web/.env`**

```env
VITE_API_URL=http://localhost:3000/api
VITE_AI_API_URL=http://localhost:3001/ai
```

### DB 초기화

```bash
cd packages/prisma
pnpm prisma:migrate      # 마이그레이션 적용
pnpm prisma:seed         # 개발용 시드(관리자 유저 + 오가니제이션 1개) 생성
```

### 관리자 지정

`/admin` 페이지는 `users.isAdmin = true`인 유저만 접근 가능합니다. 최초 관리자는 로그인 후 DB에서 직접 지정합니다.

```sql
UPDATE users SET "isAdmin" = true WHERE email = 'your@email.com';
```

### 실행

```bash
pnpm dev          # server + ai-server + web 전체
pnpm dev:api      # server + ai-server만
```

- 웹: http://localhost:5173
- API 문서(Swagger): http://localhost:3000/api/docs , http://localhost:3001/ai/docs

---

## 데이터 모델 (요약)

| 모델 | 역할 |
|---|---|
| `User` | Google OAuth 계정, `isAdmin` 플래그 |
| `Group` | 오가니제이션. `greeting`(초대 문구)을 소유자가 설정 |
| `GroupMember` | 멤버십 + 역할(`OWNER`/`MEMBER`) |
| `Invitation` | 이메일 초대 토큰, TTL, 상태(`PENDING`/`ACCEPTED`/`EXPIRED`/`REVOKED`) |
| `Meeting` | 책/영화 정보(각각 optional, 최소 1개 필수), 후보 날짜 범위, 확정일, 상태(`PENDING`/`CONFIRMED`/`DONE`/`CANCELLED`) |
| `MeetingAvailability` | 멤버별 가능 날짜 제출 |
| `Discussion` | 모임별 발제 질문(책/영화 각각 JSON), 생성 상태 |
| `DiscussionNote` | 발제 질문별 멤버 노트, 공개 여부 |

전체 스키마는 `packages/prisma/schema.prisma` 참고.

---

## 코딩 컨벤션

- TypeScript strict mode
- API 응답은 `packages/types`의 DTO 타입 사용
- Prisma 쿼리는 `PrismaService`를 통해서만
- 환경변수는 `@nestjs/config`로 접근
- 에러는 NestJS `HttpException` 계열 사용
- 파일명 kebab-case, 클래스 PascalCase, 변수/함수 camelCase, 상수 UPPER_SNAKE_CASE

---

*INOS — 초대받은 사람들만의 인문학 모임 OS*
