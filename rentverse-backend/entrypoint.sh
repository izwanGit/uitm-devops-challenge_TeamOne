#!/bin/sh

# Debug: Print env vars (careful with secrets, only print lengths or non-sensitive parts if needed)
echo "Starting backend entrypoint..."

# Construct DATABASE_URL if it's empty or missing
# We default to constructing it from parts, forcing host.docker.internal
export DATABASE_URL="postgresql://izwan@192.168.0.20:5433/rentverse?schema=public"

echo "Generated DATABASE_URL (host redacted): postgresql://${POSTGRES_USER:-postgres}:***@host.docker.internal:5432/${POSTGRES_DB:-rentverse}?schema=public"

# Execute the passed command (e.g., pnpm start)
exec "$@"
