# Database

Three Towers Solitaire uses **PostgreSQL** with **Prisma ORM**.

## Schema Overview

```mermaid
erDiagram
    User ||--o{ RefreshToken : has
    User ||--o{ PasswordResetToken : has
    User ||--o{ Game : plays
    User ||--o{ Move : makes
    Game ||--o{ Move : contains

    User {
        uuid id PK
        string email UK
        string username UK
        string password_hash
        boolean email_verified
    }

    Game {
        uuid id PK
        uuid user_id FK
        int seed
        enum mode
        enum status
        int score
    }

    Move {
        uuid id PK
        uuid game_id FK
        uuid user_id FK
        enum type
        string card_id
        int sequence
    }
```

## Tables

| Table | Purpose |
|-------|---------|
| `users` | Player accounts |
| `refresh_tokens` | JWT refresh token store |
| `password_reset_tokens` | Password reset flow |
| `games` | Game sessions (seed, score, status) |
| `moves` | Individual moves for replay/validation |

## Local Development

### 1. Start PostgreSQL

```bash
npm run db:up
```

This starts PostgreSQL 16 via Docker on port `5432` (dev compose file).

### 2. Run Migrations

```bash
npm run db:migrate
```

### 3. Browse Data (optional)

```bash
npm run db:studio
```

Opens Prisma Studio at http://localhost:5555

## Environment

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/three_towers
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run db:up` | Start PostgreSQL container (dev) |
| `npm run db:down` | Stop PostgreSQL container (dev) |
| `npm run docker:up` | Start full production stack |
| `npm run docker:down` | Stop production stack |
| `npm run db:migrate` | Run pending migrations |
| `npm run db:studio` | Open Prisma Studio |

Migrations live in `apps/server/prisma/migrations/`.
