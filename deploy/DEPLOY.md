# INOS 배포 가이드 — EC2 한 대 + Docker Compose

전체 스택(web + server + ai-server + PostgreSQL + Redis)을 EC2 인스턴스 하나에서 Docker Compose로 운영한다.
Caddy가 HTTPS 자동 발급과 리버스 프록시를 담당하며, 웹/API가 같은 도메인에서 서빙되므로 CORS 이슈가 없다.

```
                        ┌──────────────────────── EC2 ────────────────────────┐
브라우저 ── https:// ──▶│ Caddy(:443) ─┬─ /api/*      → server:3000           │
                        │              ├─ /ai/*, /socket.io/* → ai-server:3001│
                        │              └─ /*          → SPA 정적 파일          │
                        │ PostgreSQL ── Redis                                 │
                        └─────────────────────────────────────────────────────┘
```

## 1. EC2 준비

- **인스턴스**: t4g.small (ARM, 2GB) 이상 권장. Ubuntu 24.04 LTS
- **스토리지**: 20GB 이상
- **보안 그룹 인바운드**: 22(내 IP), 80, 443(전체)

```bash
# 스왑 2GB (빌드 시 메모리 여유 확보 — 2GB RAM 인스턴스면 필수)
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Docker 설치
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
# 재로그인 후 docker 명령 확인
```

## 2. DNS

도메인의 A 레코드를 EC2의 퍼블릭 IP(Elastic IP 권장)로 지정한다.
Caddy가 첫 요청 시 Let's Encrypt 인증서를 자동 발급하므로 별도 SSL 작업은 없다.

## 3. 코드 및 환경변수

```bash
git clone https://github.com/yunchan312/INOS.git ~/INOS
cd ~/INOS
cp deploy/.env.example .env
vi .env    # 전부 채우기 (아래 참고)
```

- `DOMAIN` — 서비스 도메인 (예: `inos.example.com`)
- `JWT_ACCESS_SECRET` — `openssl rand -hex 64`로 생성. server/ai-server가 공유
- `GOOGLE_CLIENT_ID/SECRET` — Google Console에서 발급하고, **redirect URI에
  `https://<DOMAIN>/api/auth/google/callback` 추가** (localhost용과 별도)
- `SMTP_USER/PASS` — Gmail 앱 비밀번호 (https://myaccount.google.com/apppasswords)

## 4. 첫 배포

```bash
cd ~/INOS
docker compose up -d --build
docker compose ps           # 5개 서비스 모두 Up 확인
docker compose logs server | grep migration   # 마이그레이션 적용 확인
```

server 컨테이너가 시작할 때 `prisma migrate deploy`를 자동 실행하므로 DB 초기화는 따로 필요 없다.

최초 관리자 지정 (Google 로그인 1회 후):

```bash
docker compose exec postgres psql -U inos -d inos \
  -c "UPDATE users SET \"isAdmin\" = true WHERE email = 'your@email.com';"
```

## 5. 자동 배포 (GitHub Actions)

master에 push/머지되면 `.github/workflows/deploy.yml`이 실행된다:
타입체크 통과 → EC2에 SSH 접속 → `git reset --hard origin/master` → `docker compose up -d --build`.

GitHub 저장소 → Settings → Secrets and variables → Actions에 등록:

| Secret | 값 |
|---|---|
| `EC2_HOST` | EC2 퍼블릭 IP 또는 도메인 |
| `EC2_USER` | `ubuntu` |
| `EC2_SSH_KEY` | EC2 접속용 개인키 전문 (`-----BEGIN ... KEY-----` 포함) |

배포 전용 키를 쓰려면 EC2에서 `ssh-keygen -t ed25519`로 새 키를 만들어
공개키를 `~/.ssh/authorized_keys`에 추가하고 개인키를 Secret에 넣는다.

## 6. 운영 명령어

```bash
docker compose logs -f server        # 로그 팔로우 (ai-server, caddy 동일)
docker compose restart ai-server     # 개별 재시작
docker compose up -d --build         # 수동 재배포
docker compose down                  # 전체 중지 (볼륨 유지)

# DB 백업 / 복원
docker compose exec postgres pg_dump -U inos inos > backup_$(date +%Y%m%d).sql
cat backup.sql | docker compose exec -T postgres psql -U inos -d inos
```

## (선택) 프론트엔드를 Vercel로 분리 배포

EC2의 Caddy가 웹까지 서빙하는 것이 기본 구성이지만, 프론트만 Vercel로 뺄 수도 있다.
이 경우에도 API/socket은 EC2로 직접 붙으므로 **EC2에 HTTPS 도메인이 반드시 필요**하다
(https 페이지가 http IP를 호출하면 브라우저가 차단).

1. Vercel → Add New Project → GitHub 저장소 import
2. **Root Directory: `apps/web`** 지정 (Framework: Vite 자동 감지, 빌드 설정은 `apps/web/vercel.json`이 처리)
3. Environment Variables 등록:
   - `VITE_API_URL` = `https://<EC2 도메인>/api`
   - `VITE_AI_API_URL` = `https://<EC2 도메인>/ai`
4. EC2의 `.env`에서 `FRONTEND_URL`을 Vercel 배포 URL로 설정 후 `docker compose up -d`
   (OAuth 로그인 후 리다이렉트, CORS, 메일 링크가 이 값을 사용)
5. Google Console redirect URI는 그대로 EC2 도메인: `https://<EC2 도메인>/api/auth/google/callback`

master push 시 Vercel(웹)과 GitHub Actions(EC2 서버)가 각각 자동 배포된다.

## 모니터링

SSH 없이 로그·에러·업타임을 보기 위한 3종. 모두 자격증명이 없으면 자동으로 비활성(무해)이다.

### 1. Sentry — 에러 트래킹 (권장)

서버가 던지는 5xx 예외와 프론트 런타임 에러를 스택트레이스와 함께 대시보드로 모으고 알림을 보낸다.

1. https://sentry.io 가입 → 프로젝트 생성 (Node 2개: server/ai-server, React 1개: web — 또는 통합 1개)
2. 각 프로젝트의 **DSN** 복사
3. EC2 `.env`에 `SERVER_SENTRY_DSN`, `AI_SENTRY_DSN` 설정 → `docker compose up -d`
4. 프론트(Vercel): 환경변수 `VITE_SENTRY_DSN` 추가 후 Redeploy

DSN을 비워두면 Sentry 초기화를 건너뛰므로 로컬/미설정 환경에 영향 없다.

### 2. Grafana Cloud Loki — 로그 조회 (선택)

`docker compose logs` 대신 웹에서 전체 컨테이너 로그를 검색·필터한다. Grafana Alloy 컨테이너가 로그를 수집해 전송한다.

1. https://grafana.com 무료 가입 → Loki 스택 생성
2. Loki 전송 정보 확인: **URL**(`https://logs-prod-xxx.grafana.net/loki/api/v1/push`), **User(instance ID)**, **API Token**
3. EC2 `.env`에 `GRAFANA_LOKI_URL`, `GRAFANA_LOKI_USER`, `GRAFANA_LOKI_TOKEN` 설정
4. 로그 수집 활성화: `docker compose --profile logging up -d`
   (이 프로파일을 붙이지 않으면 Alloy는 실행되지 않는다.
   GitHub Actions 자동 배포는 이 프로파일을 포함하므로 배포 후에도 유지된다 —
   단, `.env`에 GRAFANA_* 값이 채워져 있어야 Alloy가 정상 기동한다)
5. Grafana → Explore → Loki → `{job="inos"}` 또는 `{service="server"}` 로 조회

### 3. UptimeRobot — 업타임 감시 (5분 설정)

서버가 죽으면 이메일/슬랙 알림. 헬스 엔드포인트가 준비돼 있다: `GET /api/health`, `GET /ai/health` (둘 다 `{"status":"ok"}`, 인증 불필요).

1. https://uptimerobot.com 가입
2. Add New Monitor → HTTP(s)
3. URL: `https://<DOMAIN>/api/health` (ai-server용으로 `/ai/health`도 하나 더)
4. 간격 5분, 알림 연락처 지정 → 저장

## 트러블슈팅

- **HTTPS 발급 실패** — DNS A 레코드 전파 확인, 보안 그룹 80/443 오픈 확인. `docker compose logs caddy`
- **server 재시작 반복** — `.env` 누락 변수 확인. `docker compose logs server`
- **빌드 중 OOM** — 스왑 설정 확인 (1단계). 그래도 부족하면 인스턴스 한 단계 업
- **소켓 연결 안 됨** — 브라우저 콘솔에서 `wss://<DOMAIN>/socket.io/` 접속 여부 확인.
  Caddy가 `/socket.io/*`를 ai-server로 프록시하는지 `deploy/Caddyfile` 확인
