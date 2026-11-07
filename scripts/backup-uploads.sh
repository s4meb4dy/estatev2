#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-./backups}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"

mkdir -p "$BACKUP_DIR"

STAMP="$(date +%Y%m%d-%H%M%S)"
FILE="$BACKUP_DIR/uploads-$STAMP.tar.gz"

docker compose exec -T site tar -czf - -C /srv/site uploads > "$FILE"

find "$BACKUP_DIR" -type f -name 'uploads-*.tar.gz' \
    -mtime +"$RETENTION_DAYS" -delete

echo "Бэкап фотографий готов: $FILE"
