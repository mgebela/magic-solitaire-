# Milestone 14 — Docker & Deployment ✅

**Status:** Complete  
**Date:** 2026-07-13

## What Was Built

### Docker Images (`docker/`)

| File | Purpose |
|------|---------|
| `server.Dockerfile` | Multi-stage Node 20 build; runs Prisma migrate on start |
| `client.Dockerfile` | Vite production build served by nginx |
| `nginx.conf` | SPA routing + reverse proxy for `/api` and `/socket.io` |
| `server-entrypoint.sh` | `prisma migrate deploy` then `node dist/main.js` |
| `docker-compose.yml` | Full production stack |
| `docker-compose.dev.yml` | PostgreSQL only (local dev) |
| `.env.example` | Production JWT / port overrides |

### Services (production compose)

| Service | Image | Port |
|---------|-------|------|
| **client** | nginx + static React build | 80 |
| **server** | NestJS API + Socket.io | internal 3000 |
| **postgres** | PostgreSQL 16 | internal 5432 |
| **redis** | Redis 7 | internal 6379 |

- Health checks on all services
- Server waits for postgres + redis before starting
- Client waits for healthy server
- `REDIS_URL` wired for future session scaling (not yet used in app code)

### npm Scripts

| Script | Description |
|--------|-------------|
| `npm run docker:up` | Build and start full stack |
| `npm run docker:down` | Stop full stack |
| `npm run docker:logs` | Tail compose logs |
| `npm run db:up` | Dev postgres only (`docker-compose.dev.yml`) |

### Other Changes

- `.dockerignore` for faster builds
- Server `main.ts` loads `.env` only when file exists (container uses env vars)
- `scripts/setup.sh` updated for dev compose file

## How to Test

```bash
cp docker/.env.example docker/.env
npm run docker:up
```

1. Open http://localhost
2. Register / sign in and play solo
3. Check http://localhost/api/health — database should be `ok`
4. Multiplayer WebSocket connects via nginx at `/socket.io`
5. `npm run docker:down` to stop

## What's NOT Included (By Design)

- Kubernetes / cloud IaC
- TLS / HTTPS termination (add a reverse proxy in front)
- GitHub Actions CI/CD pipeline
- Redis integration in application code

## Next Milestone

**Milestone 15 — TBD** (see project roadmap)

---

⏸️ **Awaiting approval before proceeding to Milestone 15.**
