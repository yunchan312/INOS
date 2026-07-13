# syntax=docker/dockerfile:1
FROM node:22-alpine AS build
RUN corepack enable
WORKDIR /repo

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY apps/web/package.json apps/web/
COPY packages/types/package.json packages/types/
COPY packages/utils/package.json packages/utils/
RUN pnpm install --frozen-lockfile --filter @inos/web...

COPY packages ./packages
COPY apps/web ./apps/web

# same-origin 서빙: Caddy가 /api → server, /ai → ai-server 로 프록시하므로 상대 경로 사용
ENV VITE_API_URL=/api
ENV VITE_AI_API_URL=/ai
RUN pnpm --filter @inos/types build && pnpm --filter @inos/web build

FROM caddy:2-alpine
COPY deploy/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /repo/apps/web/dist /srv/www
