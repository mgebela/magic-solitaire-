# Three Towers Solitaire

A production-quality web implementation of **TriPeaks / Three Towers Solitaire** with timed scoring, combos, multiplayer, and AI opponents.

## Tech Stack

| Layer | Stack |
|-------|-------|
| Frontend | React 19, TypeScript, Vite, TailwindCSS |
| Backend | NestJS, TypeScript |
| Game Engine | Pure TypeScript (framework-agnostic) |
| Shared | TypeScript types & constants |

## Multiplayer (Milestone 8)

- Socket.io rooms with 6-character join codes
- Same-seed competitive races (up to 4 players)
- Server-authoritative move validation
- Live opponent scoreboard and match results

Connect via WebSocket namespace `/multiplayer` (JWT required).

## Project Structure

```
apps/
  client/        React UI
  server/        NestJS API
  game-engine/   Game logic (no React)
packages/
  shared/        Shared types & DTOs
docker/          Docker Compose (Milestone 14)
docs/            Architecture & game rules
```

## Prerequisites

- Node.js >= 20
- npm >= 10

## Getting Started

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Start development servers (client + server + packages in watch mode)
npm run dev
```

### Individual Apps

```bash
# Client only (http://localhost:5173)
npm run dev --workspace=@three-towers/client

# Server only (http://localhost:3000/api)
npm run dev --workspace=@three-towers/server
```

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api` | API info |
| GET | `/api/profile/stats` | Player statistics (auth required) |
| GET | `/api/health` | Health check |
| POST | `/api/games` | Create game (auth required) |
| GET | `/api/games/recent` | Recent games (auth required) |
| GET | `/api/games/:id` | Get game session (auth required) |
| POST | `/api/games/:id/moves` | Submit move (auth required) |
| GET | `/api/leaderboard?mode=timed` | Top scores |
| GET | `/api/leaderboard/personal?mode=timed` | Personal best (auth required) |
| GET | `/api/daily/today` | Today's daily challenge (auth required) |
| POST | `/api/daily/start` | Start daily attempt (auth required) |
| GET | `/api/daily/leaderboard` | Daily leaderboard |

### Puzzle Mode (Milestone 11)

- 8 curated puzzles at `/puzzles` (no auth required)
- Move-limited challenges with 1–3 star ratings
- Progress saved in browser localStorage

### Undo & Hints (Milestone 12)

- **Hint** suggests the best next move (hard AI heuristics)
- **Undo** available in guest solo play; using undo forfeits the +500 no-undo bonus
- Signed-in persisted games support hints only

### Player Profile (Milestone 13)

- `/profile` — aggregate stats, per-mode breakdown, recent game history
- Requires sign-in; data from persisted server games

## Docker Deployment (Milestone 14)

Run the full production stack (nginx + NestJS + PostgreSQL + Redis):

```bash
cp docker/.env.example docker/.env   # edit JWT secrets before real deploy
npm run docker:up
```

Open http://localhost — nginx serves the React app and proxies `/api` and `/socket.io` to the server. Migrations run automatically on server startup.

| Command | Description |
|---------|-------------|
| `npm run docker:up` | Build and start all services |
| `npm run docker:down` | Stop the production stack |
| `npm run docker:logs` | Follow container logs |
| `npm run db:up` | PostgreSQL only (local dev) |

## Development Milestones

This project is built incrementally. See [MILESTONE.md](./MILESTONE.md) for progress.

| # | Milestone | Status |
|---|-----------|--------|
| 1 | Project setup | ✅ Complete |
| 2 | Authentication | ✅ Complete |
| 3 | Database | ✅ Complete |
| 4 | Game engine | ✅ Complete |
| 5 | Card rendering | ✅ Complete |
| 6 | Single player (modes, timer, persistence) | ✅ Complete |
| 7 | Scoring system (bonuses, leaderboard) | ✅ Complete |
| 8 | Multiplayer (Socket.io, same-seed races) | ✅ Complete |
| 9 | AI opponents (practice vs AI) | ✅ Complete |
| 10 | Daily challenge (shared seed, leaderboard) | ✅ Complete |
| 11 | Puzzle mode (curated layouts, star ratings) | ✅ Complete |
| 12 | Undo & hints (solo play assistance) | ✅ Complete |
| 13 | Player profile & statistics | ✅ Complete |
| 14 | Docker & deployment | ✅ Complete |

## Documentation

- [Architecture](./docs/architecture.md)
- [Game Rules](./docs/game-rules.md)
- [Milestones](./MILESTONE.md)

## License

Private — all rights reserved.
