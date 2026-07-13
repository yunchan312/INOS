# syntax=docker/dockerfile:1
# Prisma 엔진이 musl(alpine)에서 불안정하므로 Debian slim 사용
FROM node:22-slim AS build
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
RUN corepack enable
WORKDIR /repo

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY apps/ai-server/package.json apps/ai-server/
COPY packages/prisma/package.json packages/prisma/
COPY packages/types/package.json packages/types/
COPY packages/utils/package.json packages/utils/
RUN pnpm install --frozen-lockfile --filter @inos/ai-server...

COPY packages ./packages
COPY apps/ai-server ./apps/ai-server

RUN pnpm --filter @inos/types build \
  && pnpm --filter @inos/prisma exec prisma generate \
  && pnpm --filter @inos/ai-server build

FROM node:22-slim
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /repo
ENV NODE_ENV=production
COPY --from=build /repo ./

WORKDIR /repo/apps/ai-server
EXPOSE 3001
# 마이그레이션은 server 컨테이너가 담당하므로 바로 기동
CMD ["node", "dist/main"]
