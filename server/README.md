# estatev2 API

Fastify + PostgreSQL + Drizzle ORM. API отдаёт каталог недвижимости и принимает
изменения по токену. Рассчитан на сайт и будущий Telegram-бот.

## Локальный запуск

```bash
cd server
cp .env.example .env
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Нужен запущенный PostgreSQL и заполненный `DATABASE_URL`.

## Переменные окружения

| Переменная | Обязательна | Описание |
| --- | --- | --- |
| `DATABASE_URL` | да | Строка подключения PostgreSQL |
| `API_TOKEN` | да | Токен для изменения данных, минимум 16 символов |
| `HOST` | нет | По умолчанию `0.0.0.0` |
| `PORT` | нет | По умолчанию `3000` |
| `SITE_ORIGIN` | нет | Origin сайта для CORS, можно несколько через запятую |
| `LOG_LEVEL` | нет | `info`, `debug`, `silent` и т.д. |
| `TRUST_PROXY` | нет | `true`, если API стоит за Caddy |
| `RATE_LIMIT_MAX` | нет | Запросов в минуту, по умолчанию 120 |
| `UPLOAD_DIR` | нет | Каталог загруженных фото, по умолчанию `./uploads` |
| `UPLOAD_PUBLIC_PREFIX` | нет | Публичный префикс URL, по умолчанию `/uploads` |
| `UPLOAD_MAX_BYTES` | нет | Максимальный размер файла, по умолчанию 10 МБ |
| `REBUILD_WEBHOOK_URL` | нет | URL сервиса пересборки статики |
| `REBUILD_TOKEN` | нет | Токен для сервиса пересборки |

## Авторизация

Публичное чтение доступно без токена. Изменения требуют заголовок:

```http
Authorization: Bearer <API_TOKEN>
```

или:

```http
X-API-Token: <API_TOKEN>
```

## Эндпоинты

| Метод | Путь | Доступ | Назначение |
| --- | --- | --- | --- |
| `GET` | `/health` | публичный | Проверка API и БД |
| `GET` | `/api/properties` | публичный | Список опубликованных объектов |
| `GET` | `/api/properties/:slug` | публичный | Объект по slug |
| `GET` | `/api/properties/by-id/:id` | токен | Объект по id, включая черновики |
| `POST` | `/api/properties` | токен | Создать объект |
| `PATCH` | `/api/properties/:id` | токен | Обновить объект |
| `DELETE` | `/api/properties/:id` | токен | Архивировать объект |
| `DELETE` | `/api/properties/:id?hard=true` | токен | Удалить навсегда |
| `POST` | `/api/properties/:id/images` | токен | Добавить изображение по URL |
| `POST` | `/api/properties/:id/images/upload` | токен | Загрузить файл и добавить изображение |
| `PATCH` | `/api/properties/:id/images/:imageId` | токен | Изменить изображение |
| `DELETE` | `/api/properties/:id/images/:imageId` | токен | Удалить изображение |
| `PUT` | `/api/properties/:id/images/order` | токен | Задать порядок изображений |

С токеном `GET /api/properties` показывает все статусы. Параметры:

- `status` — `draft`, `published`, `sold`, `archived`, `all`;
- `limit` — 1..200, по умолчанию 50;
- `offset` — смещение.

Ответ списка:

```json
{
  "items": [],
  "total": 0,
  "limit": 50,
  "offset": 0
}
```

## Создание объекта

```bash
curl -X POST http://localhost:3000/api/properties \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Квартира 2 комнаты, 60 м²",
    "address": "Москва, ул. Тестовая, д. 1",
    "price": 12000000,
    "area": 60,
    "rooms": 2,
    "floor": 5,
    "floorsTotal": 10,
    "status": "published",
    "images": [
      { "url": "/img/property1-1.jpg", "alt": "Главное фото" }
    ]
  }'
```

Если `slug` не передан, он генерируется из названия и адреса. Если
`pricePerM2` не передан, считается как `price / area`.

Публикация без изображения отклоняется с `422 image_required`.

## Обновление

```bash
curl -X PATCH http://localhost:3000/api/properties/<id> \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "price": 11500000, "status": "published" }'
```

## Удаление

```bash
# мягкое удаление: статус archived, объект и slug сохраняются
curl -X DELETE http://localhost:3000/api/properties/<id> \
  -H "Authorization: Bearer $API_TOKEN"

# полное удаление вместе с изображениями
curl -X DELETE "http://localhost:3000/api/properties/<id>?hard=true" \
  -H "Authorization: Bearer $API_TOKEN"
```

## Изображения

Загрузка файла (`multipart/form-data`, поле `file`, до 10 МБ):

```bash
curl -X POST http://localhost:3000/api/properties/<id>/images/upload \
  -H "Authorization: Bearer $API_TOKEN" \
  -F "file=@photo.jpg" \
  -F "alt=Фасад" \
  -F "isCover=true"
```

Поддерживаются JPEG, PNG, WebP, AVIF и GIF. Файл сохраняется в `UPLOAD_DIR`,
а в объект записывается URL вида `/uploads/<имя>`. Необязательные поля формы:
`alt` и `isCover`.

```bash
# добавить по URL
curl -X POST http://localhost:3000/api/properties/<id>/images \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "url": "/img/property1-2.jpg", "alt": "Кухня" }'

# изменить
curl -X PATCH http://localhost:3000/api/properties/<id>/images/<imageId> \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "isCover": true }'

# задать порядок
curl -X PUT http://localhost:3000/api/properties/<id>/images/order \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "imageIds": ["<imageId1>", "<imageId2>"] }'
```

## Ошибки

```json
{
  "error": "validation_error",
  "message": "Некорректные данные запроса",
  "details": [
    { "path": "floor", "message": "Этаж не может быть больше количества этажей" }
  ]
}
```

Коды: `400` — валидация, `401` — токен, `404` — не найдено, `409` — конфликт
slug, `422` — нарушено бизнес-правило, `500` — внутренняя ошибка.

## Тесты

```bash
npm test
```

Тесты используют in-memory репозиторий и не требуют PostgreSQL.
