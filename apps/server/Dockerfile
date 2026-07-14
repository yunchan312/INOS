# syntax=docker/dockerfile:1
# Prisma 엔진이 musl(alpine)에서 불안정하므로 Debian slim 사용
FROM node:22-slim AS build
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
RUN corepack enable
WORKDIR /repo

# 의존성 레이어 캐시: 매니페스트만 먼저 복사
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY apps/server/package.json apps/server/
COPY packages/prisma/package.json packages/prisma/
# prisma의 postinstall(prisma generate)이 install 중 실행되므로 스키마를 먼저 복사
COPY packages/prisma/schema.prisma packages/prisma/
COPY packages/types/package.json packages/types/
COPY packages/utils/package.json packages/utils/
RUN pnpm install --frozen-lockfile --filter @inos/server...

COPY packages ./packages
COPY apps/server ./apps/server

RUN pnpm --filter @inos/types build \
  && pnpm --filter @inos/prisma exec prisma generate \
  && pnpm --filter @inos/server build

FROM node:22-slim
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /repo
ENV NODE_ENV=production
COPY --from=build /repo ./

WORKDIR /repo/apps/server
EXPOSE 3000
# 시작 전 마이그레이션 적용 (스키마는 packages/prisma 공유본 사용)
CMD ["sh", "-c", "npx prisma migrate deploy --schema ../../packages/prisma/schema.prisma && node dist/main"]
