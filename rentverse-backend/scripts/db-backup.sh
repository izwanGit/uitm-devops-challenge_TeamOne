#!/bin/bash
# Load env vars
set -a
[ -f .env ] && source .env
set +a

# Create backups dir
mkdir -p backups

# Generate filename
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backups/db_backup_$TIMESTAMP.sql"

# Dump
echo "Backing up database to $BACKUP_FILE..."
if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL not found in .env"
  exit 1
fi

pg_dump "$DATABASE_URL" > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
  echo "Backup successful: $BACKUP_FILE"
  # List the file size
  ls -lh "$BACKUP_FILE"
else
  echo "Backup failed!"
  rm -f "$BACKUP_FILE"
  exit 1
fi
