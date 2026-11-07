#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-./backups}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
POSTGRES_DB="${POSTGRES_DB:-estatev2}"
POSTGRES_USER="${POSTGRES_USER:-estatev2}"

mkdir -p "$BACKUP_DIR"

STAMP="$(date +%Y%m%d-%H%M%S)"
FILE="$BACKUP_DIR/estatev2-$STAMP.sql.gz"

docker compose exec -T db pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
    | gzip > "$FILE"

find "$BACKUP_DIR" -type f -name 'estatev2-*.sql.gz' \
    -mtime +"$RETENTION_DAYS" -delete

echo "Бэкап готов: $FILE"
