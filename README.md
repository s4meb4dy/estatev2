# estatev2

Сайт агентства недвижимости «Город» и API каталога.

## Структура

- `src/` — статический сайт на Minista + React.
- `shared/catalog/` — общие Zod-схемы, slug и форматирование.
- `src/lib/catalog/repository.js` — источник данных сайта: `seed` или `api`.
- `server/` — Fastify API, PostgreSQL, Drizzle ORM.
- `deploy/` — Caddy.
- `Dockerfile.site-builder` — сборка статики из API.
- `docker-compose.yml` — PostgreSQL, миграции, API, сборка сайта и Caddy.

## Локальная разработка сайта

```bash
npm install
npm start
```

Сборка:

```bash
npm run build
npm run preview
```

По умолчанию сайт читает `src/data/properties.seed.json`. Сборка из API:

```bash
CATALOG_SOURCE=api CATALOG_API_URL=http://localhost:3000 npm run build
```

## Локальная разработка API

```bash
cd server
cp .env.example .env
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Подробности: [server/README.md](server/README.md).

## Проверки

```bash
npm test
npm run validate:catalog
npm run api:test
npm run build
```

## Развёртывание

Инструкция для VPS: [docs/deploy.md](docs/deploy.md).

## Этапы

1. Сайт переведён на данные и единый шаблон объекта.
2. Добавлены PostgreSQL, Fastify API, миграции, Docker Compose, Caddy и сборка статики из API.
3. Следующий этап: очередь пересборки по событиям и Telegram-бот.
