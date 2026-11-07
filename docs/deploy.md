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
REBUILD_TOKEN=<openssl rand -hex 32>
REBUILD_DEBOUNCE_MS=5000
UPLOAD_MAX_BYTES=10485760
SITE_DOMAIN=example.com
LOG_LEVEL=info
```

`REBUILD_TOKEN` защищает внутренний сервис пересборки. Он не должен совпадать
с `API_TOKEN`.

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
- `rebuilder` — пересоберёт статику после изменений в БД;
- `site` — Caddy со статикой, загруженными фото и проксированием `/api/*` и `/health`.

Загруженные фотографии хранятся в томе `uploads` и раздаются по `/uploads/*`.

С профилем `bot` дополнительно запускается Telegram-бот:

```bash
docker compose --profile bot up -d --build bot
```

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
После импорта пересоберите статику, чтобы объекты появились на сайте:

```bash
docker compose run --rm site-build
```

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

База данных и загруженные фотографии резервируются отдельно:

```bash
chmod +x scripts/backup-db.sh scripts/backup-uploads.sh
./scripts/backup-db.sh
./scripts/backup-uploads.sh
```

Пример cron-задачи на каждый день в 03:00:

```cron
0 3 * * * cd /opt/estatev2 && BACKUP_DIR=/opt/estatev2/backups ./scripts/backup-db.sh >> /var/log/estatev2-backup.log 2>&1
10 3 * * * cd /opt/estatev2 && BACKUP_DIR=/opt/estatev2/backups ./scripts/backup-uploads.sh >> /var/log/estatev2-backup.log 2>&1
```

Восстановление базы:

```bash
gunzip -c backups/estatev2-YYYYMMDD-HHMMSS.sql.gz \
  | docker compose exec -T db psql -U estatev2 -d estatev2
```

Восстановление фотографий:

```bash
docker compose exec -T site tar -xzf - -C /srv/site \
  < backups/uploads-YYYYMMDD-HHMMSS.tar.gz
```

## Загрузка фотографий

```bash
curl -X POST http://localhost/api/properties/<id>/images/upload \
  -H "Authorization: Bearer <API_TOKEN>" \
  -F "file=@photo.jpg" \
  -F "alt=Фасад" \
  -F "isCover=true"
```

Файл сохраняется в томе `uploads`, объект получает URL `/uploads/<имя>`.
Поддерживаются JPEG, PNG, WebP, AVIF и GIF, размер ограничен
`UPLOAD_MAX_BYTES`.

## Пересборка сайта после изменений

API после создания, изменения или удаления объекта отправляет запрос сервису
`rebuilder`. Тот выдерживает паузу `REBUILD_DEBOUNCE_MS`, собирает статику из
API и заменяет файлы в общем томе `site-dist`. Caddy сразу отдаёт новую версию.

Проверить состояние пересборки:

```bash
docker compose exec api node -e "fetch('http://rebuilder:3001/health').then(r=>r.text()).then(console.log)"
```

Принудительная пересборка:

```bash
docker compose run --rm site-build
```

## Telegram-бот

1. Создайте бота у [@BotFather](https://t.me/BotFather) и получите токен.
2. Узнайте свой Telegram id через [@userinfobot](https://t.me/userinfobot).
3. Добавьте в `.env`:

```bash
TELEGRAM_BOT_TOKEN=123456789:...
TELEGRAM_ADMIN_IDS=123456789
```

4. Запустите бота:

```bash
docker compose --profile bot up -d --build bot
```

Логи и перезапуск:

```bash
docker compose logs -f bot
docker compose --profile bot restart bot
```

Бот работает через внутренний адрес `http://api:3000` и не публикует порты
наружу. Подробности: [bot/README.md](../bot/README.md).

## Безопасность

- Порты PostgreSQL наружу не публикуются.
- API защищён токеном `API_TOKEN`; публичное чтение доступно без токена.
- Caddy добавляет базовые security-заголовки и сжимает ответы.
- Для администрирования используйте только HTTPS.
