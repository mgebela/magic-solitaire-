# syntax=docker/dockerfile:1

FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json turbo.json ./
COPY apps/server/package.json apps/server/
COPY apps/game-engine/package.json apps/game-engine/
COPY packages/shared/package.json packages/shared/

RUN npm ci

COPY packages/shared packages/shared
COPY apps/game-engine apps/game-engine
COPY apps/server apps/server

RUN npx turbo run build --filter=@three-towers/server...

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache openssl

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/packages/shared/package.json ./packages/shared/package.json
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/apps/game-engine/package.json ./apps/game-engine/package.json
COPY --from=builder /app/apps/game-engine/dist ./apps/game-engine/dist
COPY --from=builder /app/apps/server/package.json ./apps/server/package.json
COPY --from=builder /app/apps/server/dist ./apps/server/dist
COPY --from=builder /app/apps/server/prisma ./apps/server/prisma

COPY docker/server-entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

WORKDIR /app/apps/server

EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1

ENTRYPOINT ["/entrypoint.sh"]
