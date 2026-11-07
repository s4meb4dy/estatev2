# estatev2 Telegram-бот

Бот управляет каталогом через API. Работает в личных сообщениях и пускает только
id из `TELEGRAM_ADMIN_IDS`.

## Возможности

- `/list` — список объектов с кнопками;
- карточка объекта: публикация, снятие с публикации, изменение цены, архив;
- `/add` — пошаговое создание черновика;
- отправка фото в выбранный объект (сжатое фото или файл-изображение);
- `/cancel` — отменить текущее действие.

Публикация без фото отклоняется API — бот покажет понятное сообщение.

## Настройка

Создайте бота у [@BotFather](https://t.me/BotFather) и узнайте свой id через
[@userinfobot](https://t.me/userinfobot).

```bash
cd bot
cp .env.example .env
```

Заполните:

```bash
TELEGRAM_BOT_TOKEN=123456789:...
TELEGRAM_ADMIN_IDS=123456789
API_URL=http://localhost:3000
API_TOKEN=<тот же API_TOKEN, что у сервера>
LOG_LEVEL=info
```

`TELEGRAM_ADMIN_IDS` — один или несколько id через запятую.

## Локальный запуск

Нужен запущенный API.

```bash
cd bot
npm install
npm start
```

Разработка с перезапуском:

```bash
npm run dev
```

## Docker

В корне проекта:

```bash
docker compose --profile bot up -d --build bot
```

Логи:

```bash
docker compose logs -f bot
```

Без профиля `bot` контейнер не запускается, поэтому сайт и API можно поднимать
без Telegram-бота.

## Тесты

```bash
npm test
```

Тесты не требуют Telegram-токена: проверяются клиент API и шаги создания
объекта.
