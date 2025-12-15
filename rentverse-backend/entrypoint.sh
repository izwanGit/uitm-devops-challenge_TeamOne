#!/bin/sh

# Debug: Print env vars
echo "Starting backend entrypoint..."

# Only construct DATABASE_URL if it's not already provided by docker-compose
if [ -z "$DATABASE_URL" ]; then
  export DATABASE_URL="postgresql://${POSTGRES_USER:-postgres}:${POSTGRES_PASSWORD:-postgres}@${DB_HOST:-db}:${DB_PORT:-5432}/${POSTGRES_DB:-rentverse}?schema=public"
  echo "Generated DATABASE_URL from parts."
else
  echo "Using provided DATABASE_URL."
fi

# Execute the passed command (e.g., pnpm start)
exec "$@"
