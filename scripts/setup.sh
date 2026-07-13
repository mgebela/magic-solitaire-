#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Starting PostgreSQL..."
docker compose -f docker/docker-compose.dev.yml up -d

echo "==> Waiting for database..."
until docker compose -f docker/docker-compose.dev.yml exec -T postgres pg_isready -U postgres -d three_towers > /dev/null 2>&1; do
  sleep 1
done

echo "==> Installing dependencies..."
npm install

echo "==> Running migrations..."
npm run db:migrate

echo "==> Building packages..."
npm run build

echo "==> Done. Run 'npm run dev' to start development servers."
