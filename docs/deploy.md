# Развёртывание estatev2 на VPS

## Требования

- Ubuntu 22.04/24.04, 2 ГБ RAM и больше.
- Docker Engine и Docker Compose Plugin.
- Открытые порты 80 и 443.
- Домен, направленный A-записью на IP сервера (для HTTPS).

## Установка Docker

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker "$USER"
```

Перезайдите в SSH, чтобы применилась группа `docker`.

## Первый запуск

```bash
git clone https://github.com/s4meb4dy/estatev2.git
cd estatev2

cp .env.example .env
```

Заполните `.env`:

```bash
POSTGRES_DB=estatev2
POSTGRES_USER=estatev2
POSTGRES_PASSWORD=<длинный пароль>
API_TOKEN=<openssl rand -hex 32>
SITE_DOMAIN=example.com
LOG_LEVEL=info
```

`POSTGRES_PASSWORD` лучше делать буквенно-цифровым или URL-кодировать спецсимволы.

Соберите и запустите:

```bash
docker compose up -d --build
```

Compose поднимет:

- `db` — PostgreSQL 16;
- `migrate` — применит миграции Drizzle и завершится;
- `api` — Fastify API на внутреннем порту 3000;
- `site-build` — соберёт статику из опубликованных объектов API;
- `site` — Caddy со статикой и проксированием `/api/*` и `/health`.

## Проверка

```bash
curl http://localhost/health
curl http://localhost/api/properties
```

Ожидаемый ответ `/health`:

```json
{ "status": "ok", "db": "ok", "uptime": 12 }
```

## Импорт тестовых объектов

```bash
docker compose exec api node scripts/seed.js
```

Скрипт идемпотентен: объекты сопоставляются по `slug`, изображения перезаписываются.

## Домен и HTTPS

1. Укажите в `.env` `SITE_DOMAIN=example.com`.
2. Убедитесь, что A-запись домена указывает на сервер.
3. Откройте порты 80 и 443.
4. Перезапустите сайт:

```bash
docker compose up -d site
```

Caddy автоматически получит сертификат Let's Encrypt.

## Обновление

```bash
git pull
docker compose up -d --build
```

Миграции применяются сервисом `migrate` при каждом запуске.

## Резервные копии

```bash
chmod +x scripts/backup-db.sh
./scripts/backup-db.sh
```

Пример cron-задачи на каждый день в 03:00:

```cron
0 3 * * * cd /opt/estatev2 && BACKUP_DIR=/opt/estatev2/backups ./scripts/backup-db.sh >> /var/log/estatev2-backup.log 2>&1
```

Восстановление:

```bash
gunzip -c backups/estatev2-YYYYMMDD-HHMMSS.sql.gz \
  | docker compose exec -T db psql -U estatev2 -d estatev2
```

## Пересборка сайта после изменений

Сайт собирается сервисом `site-build` из опубликованных объектов API. После
создания, изменения или удаления объекта пересоберите статику:

```bash
docker compose run --rm site-build
```

Caddy сразу начнёт отдавать новую версию из общего тома `site-dist`.
Автоматическая очередь пересборки после изменений в БД — следующий этап.

## Безопасность

- Порты PostgreSQL наружу не публикуются.
- API защищён токеном `API_TOKEN`; публичное чтение доступно без токена.
- Caddy добавляет базовые security-заголовки и сжимает ответы.
- Для администрирования используйте только HTTPS.
