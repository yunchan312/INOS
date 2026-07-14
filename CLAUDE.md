# INOS — Claude Code 컨텍스트

## 프로젝트
인문학 모임 플랫폼. AI가 콘텐츠 추천, 발제문 SSE 스트리밍, 대화 요약을 담당.

## 모노레포 구조
- apps/server: 일반 API (Auth/Group/Content/Schedule/Archive)
- apps/ai-server: AI 전담 (추천/발제문SSE/요약)
- apps/web: React 프론트 (웹뷰 겸용)
- apps/desktop: Electron 데스크톱 셸 (배포된 웹앱 렌더링, `pnpm desktop`)
  - Google 로그인은 시스템 브라우저 + 127.0.0.1 루프백 콜백으로 진행 (OAuth state에 desktop_port/nonce 왕복, apps/desktop/src/google-login.ts + auth.controller.ts)
- packages/prisma: DB 스키마 공유
- packages/types: DTO 타입 공유

## 핵심 규칙
- TypeScript strict mode 필수
- 모든 API 응답은 packages/types의 DTO 타입 사용
- NestJS 모듈 단위로 개발 (auth/group/content/schedule/discussion/archive)
- 환경변수는 반드시 @nestjs/config로 접근
- Prisma 쿼리는 packages/prisma의 PrismaService만 사용
- 에러는 NestJS HttpException 사용
- AI 서버의 SSE는 NestJS @Sse() 데코레이터 사용
- 벡터 검색은 PrismaService.$queryRaw로 직접 쿼리

## 서버 포트
- apps/server: 3000
- apps/ai-server: 3001
- apps/web: 5173

## 코딩 컨벤션
- 파일명: kebab-case
- 클래스명: PascalCase
- 변수/함수: camelCase
- 상수: UPPER_SNAKE_CASE
- DTO는 class-validator 데코레이터 필수
