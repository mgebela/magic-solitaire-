#!/bin/sh
set -e

cd /app/apps/server

echo "Running database migrations..."
npx prisma migrate deploy

echo "Starting server..."
exec node dist/main.js
