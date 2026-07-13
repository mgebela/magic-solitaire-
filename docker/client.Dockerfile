# syntax=docker/dockerfile:1

FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json turbo.json ./
COPY apps/client/package.json apps/client/
COPY apps/game-engine/package.json apps/game-engine/
COPY packages/shared/package.json packages/shared/

RUN npm ci

COPY packages/shared packages/shared
COPY apps/game-engine apps/game-engine
COPY apps/client apps/client

# Same-origin API via nginx reverse proxy in production
ARG VITE_API_URL=
ENV VITE_API_URL=$VITE_API_URL

RUN npx turbo run build --filter=@three-towers/client...

FROM nginx:1.27-alpine AS runner

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/client/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
