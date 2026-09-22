# INOS — 인문학의 OS

> **"초대받은 사람들만의, 조용한 인문학 모임 공간"**

일정 조율과 발제문 준비는 자동으로, 모임에서는 대화에만 집중하도록.

---

## 무엇을 하는 서비스인가

INOS는 폐쇄형(초대 기반) 인문학 모임 플랫폼입니다. 회원가입으로 아무나 들어오는 공개 모임 개념이 없습니다 — 오가니제이션(모임 그룹) 생성은 관리자가 승인하고, 그 안의 멤버는 **이메일 초대 또는 초대 링크로만** 늘어납니다.

오가니제이션 하나의 라이프사이클:

1. 소유자가 멤버를 **이메일로 초대**하거나 **초대 링크**를 발급합니다.
2. 소유자가 책/영화를 정해 모임을 만들면(TMDB·국립중앙도서관 검색으로 작품을 확정) 후보 날짜 범위가 멤버들에게 전달됩니다.
3. 멤버들이 when2meet 방식으로 가능한 날짜를 표시하면 — **전원이 가능한 날짜**로 자동 확정되고, 겹치는 날이 없으면 소유자가 날짜별 인원을 보고 직접 확정합니다.
4. 날짜가 확정되는 즉시 Claude가 작품별 발제 질문 5개를 생성합니다. 진행자는 **자기 질문을 직접 추가**할 수도 있습니다.
5. 모임 당일부터 멤버들이 발제 질문마다 노트를 남기고 공개 여부를 토글하면, 공개된 노트는 실시간으로 다른 멤버에게도 보입니다.
6. **프레젠테이션 모드**로 질문 하나를 화면 가득 띄워 함께 봅니다.
7. "모임 종료"를 누르면 전원의 화면이 실시간으로 종료 상태가 되고, 멤버는 **감상**을 남깁니다.
8. 끝난 모임은 **서가**에 책등으로 꽂혀 누적됩니다. 개인 서가는 공유 링크로 공개할 수 있습니다.

주요 변경(날짜 확정, 발제문 준비, 3시간 전 리마인더, 미응답 독촉)은 **이메일과 인앱 알림함 양쪽**으로 전달됩니다.

---

## 핵심 플로우

```
로그인(Google / 로컬) → 오가니제이션 홈 → [소유자] 모임 생성 → 멤버 초대장 발송
                                                              │
                                                              ▼
                                        멤버들이 when2meet 방식으로 가능 날짜 제출
                                                              │
                                    ┌─────────────────────────┴─────────────────────────┐
                                    ▼                                                   ▼
                        전원 겹치는 날짜 있음 → 자동 확정                   겹치는 날짜 없음 → 소유자 알림
                                    │                                        → 소유자가 날짜별 인원 보고 수동 확정
                                    └─────────────────────────┬─────────────────────────┘
                                                              ▼
                                              날짜 확정 즉시 AI 발제 질문 5×N개 생성
                                                              │
                                                              ▼
                              모임 당일부터 멤버 노트 작성 (공개 시 실시간 브로드캐스트)
                                              + 프레젠테이션 모드로 함께 보기
                                                              │
                                                              ▼
                              모임 종료 → 전원 화면 실시간 read-only 전환 → 감상 → 서가에 누적
```

---

## 모노레포 구조

```
apps/
├── server/      # 일반 API — 인증/그룹/모임/서가/게시판/알림/메일/외부 API (NestJS + Fastify, :3000)
├── ai-server/   # AI 전담 — 발제문 생성 SSE, 실시간 소켓 게이트웨이 (NestJS + Fastify, :3001)
├── web/         # 프론트엔드 (React 19 + Vite + TanStack Query, :5173)
└── desktop/     # web을 감싼 Electron 셸
packages/
├── prisma/      # 공유 DB 스키마 + 마이그레이션 + 시드
├── types/       # apps 간 공유 DTO — 타입 전용(값 export 금지, 아래 컨벤션 참고)
└── utils/       # 공유 순수 함수
```

### apps/server

| 모듈 | 담당 |
|---|---|
| `auth` | Google OAuth(axios 직접 구현) + 로컬 회원가입/로그인(bcrypt) → JWT 발급, `/admin` 접근 판별 |
| `user` | 프로필 조회/수정 |
| `group` | 오가니제이션 CRUD, 멤버십, 이메일 초대·초대 링크·수락, 설정(그리팅 등) |
| `meeting` | 모임 CRUD, 가용성 제출·자동/수동 확정, 모임 종료 |
| `library` | 개인/그룹 서가 — 별점 리뷰, 수기 등록, 공유 링크(`libraryShareId`) 발급 |
| `board` | 오가니제이션 게시판 — 글, 좋아요 |
| `notification` | 알림 4종 발송 + 인앱 알림함(읽음 처리), BullMQ 지연 잡 스케줄·취소 |
| `mail` | Gmail SMTP(nodemailer) 발송 — 초대, 신청, 관리자 알림 |
| `tmdb` / `seoji` | 영화(TMDB)·도서(국립중앙도서관 서지정보) 검색 및 작품 메타데이터 적재 |
| `showcase` | 랜딩 페이지용 공개 서가 데이터 |
| `admin` | 오가니제이션·사용자 검색/관리, 관리자 권한 부여 |

Google OAuth는 Passport 대신 axios로 직접 구현했습니다 — Fastify Reply가 Express 전용 API(`res.setHeader` 등)를 지원하지 않아 `passport-google-oauth20`이 깨지기 때문입니다. 리다이렉트는 NestJS `@Redirect()`로 처리합니다.

외부 작품 API는 **키가 없으면 해당 검색 엔드포인트만 503**이고 나머지 기능은 정상 동작합니다. 조회 결과는 `BookWork`/`MovieWork`에 `isbn13`/`tmdbId` 유니크 키로 적재되어, 그 행 자체가 30일 TTL 캐시 역할을 겸합니다.

### apps/ai-server

- Claude(`claude-sonnet-4-6`)에 프롬프트 캐싱 + `web_search` 툴을 적용해 작품별 발제 질문 5개 생성
- `@Sse()`로 생성 과정을 실시간 스트리밍 (`?token=` 쿼리로 JWT 인증 — EventSource가 헤더를 못 보내서)
- **socket.io 게이트웨이(`/notes`)가 모든 실시간 브로드캐스트를 담당**합니다:
  - **모임 룸**(`meeting:{id}`) — 노트, 커스텀 발제문, 감상, 모임 종료
  - **오가니제이션 룸**(`org:{id}`) — 모임 생성/수정/삭제/확정, 가용성 응답 진행률
- 발제문 페이지에 속한 쓰기(노트·커스텀 발제문·감상)는 **ai-server가 직접 소유**합니다. 게이트웨이를 가진 쪽이 직접 쓰고 직접 브로드캐스트해야 실시간이 한 프로세스 안에서 보장되기 때문입니다.
- 그 외 apps/server의 변경은 서버 간 내부 엔드포인트(`/ai/discussions/:id/events/finished`, `/ai/events/orgs/:id`)로 fire-and-forget 통지합니다. 브라우저는 이 엔드포인트에 접근하지 않습니다.

### apps/web

| 관심사 | 선택 |
|---|---|
| 라우팅 | `react-router-dom` (전 페이지 지연 로딩) |
| 서버 상태 | `@tanstack/react-query` |
| 클라이언트 상태 | Zustand (`stores/auth-store.ts`) |
| 실시간 | `socket.io-client` (`hooks/useNotesSocket.ts`, `hooks/useOrgEvents.ts`) |
| 스타일 | Tailwind + 무채색 토큰 체계 — [`docs/DESIGN.md`](docs/DESIGN.md) |

---

## 개발 환경 설정

### 사전 요구사항

- Node.js 20+, pnpm 9+
- PostgreSQL 14+ (확장 불필요)
- Redis — BullMQ 큐용(메일 발송, 발제문 생성, 지연 알림). **apps/server만 사용합니다.**

### 설치와 환경변수

```bash
pnpm install
cp apps/server/.env.example    apps/server/.env
cp apps/ai-server/.env.example apps/ai-server/.env
cp apps/web/.env.example       apps/web/.env
```

각 `.env.example`이 전체 키와 발급처를 주석으로 담고 있습니다. 여기서는 **틀리기 쉬운 것만** 적습니다.

| 주의 | 내용 |
|---|---|
| `JWT_ACCESS_SECRET` | server와 ai-server에 **반드시 동일한 값**. 다르면 ai-server 호출이 전부 401 |
| `SMTP_USER`/`SMTP_PASS` | 비워두면 실제 발송 없이 서버 콘솔에 메일 내용만 출력됩니다(개발 폴백) |
| `TMDB_API_KEY`/`SEOJI_CERT_KEY` | 없으면 해당 검색만 503. 배포 시 `.env`뿐 아니라 **`docker-compose.yml`의 `environment` 블록에도 있어야** 컨테이너까지 전달됩니다 |
| `MEETING_DEFAULT_HOUR` | 확정일에는 시각 정보가 없어, "3시간 전" 리마인더는 이 시각(24h 기준)을 모임 시작으로 가정합니다 |
| `ANTHROPIC_API_KEY` | ai-server 전용. 없으면 발제문 생성이 `FAILED`로 떨어집니다 |

### DB 초기화

```bash
cd packages/prisma
pnpm prisma:migrate      # 마이그레이션 적용
pnpm prisma:seed         # 개발용 시드(관리자 유저 + 오가니제이션 1개)
```

### 관리자 지정

`/admin`은 `users.isAdmin = true`인 유저만 접근할 수 있습니다. 최초 관리자는 로그인 후 DB에서 직접 지정합니다.

```sql
UPDATE users SET "isAdmin" = true WHERE email = 'your@email.com';
```

### 실행

```bash
pnpm dev          # server + ai-server + web 전체
pnpm dev:api      # server + ai-server만
pnpm desktop      # Electron 셸
pnpm type-check   # 전 패키지 타입체크 (CI가 배포 전 실행)
```

- 웹 http://localhost:5173
- Swagger http://localhost:3000/api/docs · http://localhost:3001/ai/docs

---

## 데이터 모델

전체 스키마는 [`packages/prisma/schema.prisma`](packages/prisma/schema.prisma). 도메인별 요약:

| 영역 | 모델 |
|---|---|
| 계정·그룹 | `User`(Google/로컬, `isAdmin`, `libraryShareId`) · `Group` · `GroupMember`(`OWNER`/`MEMBER`) · `Invitation`(토큰·TTL·상태) · `GroupInviteLink` |
| 모임 | `Meeting`(책/영화 각각 optional·최소 1개, 후보 범위, 확정일, `PENDING`/`CONFIRMED`/`DONE`/`CANCELLED`) · `MeetingAvailability` |
| 작품 | `BookWork`(`isbn13` 유니크) · `MovieWork`(`tmdbId` 유니크) — 유니크 키가 중복 제거이자 30일 캐시 |
| 발제문 | `Discussion`(`GENERATING`/`GENERATED`/`PUBLISHED`/`FAILED`) · `DiscussionCustomPrompt` · `DiscussionNote`(공개 여부) · `DiscussionImpression` |
| 서가 | `PersonalLibraryReview` · `GroupLibraryReview` · `ManualLibraryEntry` |
| 게시판·알림 | `GroupPost` · `GroupPostLike` · `NotificationLog` |

`NotificationLog`는 `@@unique([meetingId, userId, type])`로 중복 발송을 DB 레벨에서 막고, 같은 행의 `readAt`이 인앱 알림함의 읽음 상태를 겸합니다.

---

## 배포

EC2 한 대 + Docker Compose로 전 스택(웹 정적 파일 포함)을 운영합니다. Caddy가 HTTPS 자동 발급과 리버스 프록시(`/api`, `/ai`, `/socket.io`)를 담당해 same-origin으로 서빙되고, master 브랜치에 push되면 GitHub Actions가 타입체크 후 SSH로 자동 재배포합니다. 관측은 Sentry + Grafana Loki(선택, 없으면 비활성).

자세한 절차는 [`deploy/DEPLOY.md`](deploy/DEPLOY.md).

---

## 코딩 컨벤션

- TypeScript strict mode
- API 응답은 `packages/types`의 DTO 타입 사용
- **`packages/types`는 타입 전용입니다.** `main`과 `exports.import`가 모두 CJS `dist/index.js`를 가리켜, enum·상수 같은 **런타임 값을 넣으면 Vite 빌드가 깨집니다**(`"X" is not exported by ...`). 값은 각 앱 안(`apps/web/src/lib/` 등)에 둡니다
- Prisma 쿼리는 `PrismaService`를 통해서만
- 환경변수는 `@nestjs/config`로 접근
- 에러는 NestJS `HttpException` 계열 사용
- 파일명 kebab-case, 클래스 PascalCase, 변수/함수 camelCase, 상수 UPPER_SNAKE_CASE

---

## 문서

| 문서 | 내용 |
|---|---|
| [`docs/DESIGN.md`](docs/DESIGN.md) | 디자인 토큰·타이포·컴포넌트 규칙 (코드에서 역추출) |
| [`docs/DISCUSSION_GENERATION.md`](docs/DISCUSSION_GENERATION.md) | 발제문 생성 설계안 + 비용 추정 — **구현 전 설계안** |
| [`docs/RETROSPECTIVE.md`](docs/RETROSPECTIVE.md) | 전체 개발 회고 |
| [`docs/blog/`](docs/blog/) | 개발기 5편 — 기획 · 아키텍처 · 디자인 · Main server · AI-server |
| [`deploy/DEPLOY.md`](deploy/DEPLOY.md) | 배포 절차 |

---

*INOS — 초대받은 사람들만의 인문학 모임 OS*
