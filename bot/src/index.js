import { Bot, InlineKeyboard } from 'grammy'
import { ApiError, createApiClient } from './api.js'
import { loadConfig } from './config.js'
import {
    DRAFT_STEPS,
    createDraftPayload,
    getDraftStep,
    getNextDraftStep,
    validateDraftValue,
} from './draft.js'
import { formatPropertyCard, statusIcon } from './format.js'
import { createStateStore } from './state.js'

const config = loadConfig()
const api = createApiClient({
    baseUrl: config.apiUrl,
    token: config.apiToken,
})
const states = createStateStore()
const bot = new Bot(config.botToken)

const PAGE_SIZE = 20

function mainKeyboard() {
    return new InlineKeyboard()
        .text('Объекты', 'list')
        .row()
        .text('Добавить объект', 'add')
}

function cardKeyboard(property) {
    const keyboard = new InlineKeyboard()

    if (property.status === 'published') {
        keyboard.text('Снять с публикации', `unpublish:${property.id}`).row()
    } else {
        keyboard.text('Опубликовать', `publish:${property.id}`).row()
    }

    keyboard
        .text('Изменить цену', `price:${property.id}`)
        .row()
        .text('Архивировать', `archive:${property.id}`)
        .row()
        .text('← К списку', 'list')

    return keyboard
}

function formatApiError(error) {
    if (error instanceof ApiError) {
        if (error.code === 'image_required') {
            return 'Нельзя опубликовать объект без фото. Сначала отправьте фото.'
        }
        if (error.status === 401) {
            return 'API отклонил токен. Проверьте API_TOKEN.'
        }

        return `Ошибка API: ${error.message}`
    }

    console.error('Ошибка бота:', error)
    return 'Не удалось выполнить действие. Попробуйте позже.'
}

async function showList(ctx, page = 0) {
    states.clear(ctx.chat.id)

    const { items, total } = await api.list({
        status: 'all',
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
    })

    if (items.length === 0) {
        await ctx.reply('Объектов пока нет.', { reply_markup: mainKeyboard() })
        return
    }

    const keyboard = new InlineKeyboard()

    for (const item of items) {
        const label = `${statusIcon(item.status)} ${item.title}`.slice(0, 60)
        keyboard.text(label, `card:${item.id}`).row()
    }

    if ((page + 1) * PAGE_SIZE < total) {
        keyboard.text('Ещё →', `list:${page + 1}`).row()
    }

    keyboard.text('← Меню', 'menu')

    const title =
        page === 0
            ? `Объекты (${total}):`
            : `Объекты (${total}), страница ${page + 1}:`

    await ctx.reply(title, { reply_markup: keyboard })
}

async function showCard(ctx, id) {
    try {
        const property = await api.getById(id)

        states.set(ctx.chat.id, { propertyId: id })
        await ctx.reply(formatPropertyCard(property), {
            reply_markup: cardKeyboard(property),
        })
    } catch (error) {
        await ctx.reply(formatApiError(error))
    }
}

async function startDraft(ctx) {
    states.set(ctx.chat.id, { step: DRAFT_STEPS[0].key, draft: {} })
    await ctx.reply(DRAFT_STEPS[0].prompt)
}

async function setStatus(ctx, id, status) {
    try {
        const property = await api.update(id, { status })

        states.set(ctx.chat.id, { propertyId: id })
        await ctx.reply(
            status === 'published'
                ? 'Объект опубликован.'
                : 'Объект снят с публикации.',
            { reply_markup: cardKeyboard(property) }
        )
    } catch (error) {
        await ctx.reply(formatApiError(error))
    }
}

async function archiveProperty(ctx, id) {
    try {
        await api.remove(id)

        states.clear(ctx.chat.id)
        await ctx.reply('Объект архивирован.')
        await showList(ctx, 0)
    } catch (error) {
        await ctx.reply(formatApiError(error))
    }
}

async function askPrice(ctx, id) {
    states.set(ctx.chat.id, { step: 'edit-price', propertyId: id })
    await ctx.reply('Введите новую цену, ₽ (только цифры):')
}

async function uploadFromTelegram(
    ctx,
    propertyId,
    fileId,
    filename,
    contentType,
    alt
) {
    try {
        const file = await ctx.api.getFile(fileId)

        if (!file.file_path) {
            throw new Error('Telegram не вернул путь к файлу')
        }

        const response = await fetch(
            `https://api.telegram.org/file/bot${config.botToken}/${file.file_path}`
        )

        if (!response.ok) {
            throw new Error(`Telegram вернул ${response.status}`)
        }

        const buffer = Buffer.from(await response.arrayBuffer())
        const property = await api.uploadImage(propertyId, {
            buffer,
            filename,
            contentType,
            alt,
        })

        states.set(ctx.chat.id, { propertyId })
        await ctx.reply(
            `Фото добавлено. Всего фото: ${property.images.length}.`,
            { reply_markup: cardKeyboard(property) }
        )
    } catch (error) {
        await ctx.reply(formatApiError(error))
    }
}

bot.use(async (ctx, next) => {
    if (ctx.chat?.type !== 'private') {
        return
    }

    const userId = ctx.from?.id

    if (!userId || !config.adminIds.has(userId)) {
        await ctx.reply(
            `Доступ закрыт.\nВаш Telegram id: ${userId ?? 'неизвестен'}`
        )
        return
    }

    await next()
})

bot.catch(async (error) => {
    console.error('Необработанная ошибка бота:', error.error)

    try {
        await error.ctx.reply(
            'Не удалось выполнить действие. Попробуйте позже.'
        )
    } catch {
        // ignore
    }
})

bot.command('start', async (ctx) => {
    states.clear(ctx.chat.id)
    await ctx.reply(
        'Бот каталога «Город».\n\n/list — объекты\n/add — новый объект\n/cancel — отменить действие',
        { reply_markup: mainKeyboard() }
    )
})

bot.command('help', async (ctx) => {
    await ctx.reply(
        '/list — объекты\n/add — новый объект\n/cancel — отменить действие',
        { reply_markup: mainKeyboard() }
    )
})

bot.command('list', async (ctx) => {
    await showList(ctx, 0)
})

bot.command('add', async (ctx) => {
    await startDraft(ctx)
})

bot.command('cancel', async (ctx) => {
    states.clear(ctx.chat.id)
    await ctx.reply('Действие отменено.', { reply_markup: mainKeyboard() })
})

bot.callbackQuery('menu', async (ctx) => {
    await ctx.answerCallbackQuery()
    states.clear(ctx.chat.id)
    await ctx.reply('Меню:', { reply_markup: mainKeyboard() })
})

bot.callbackQuery('list', async (ctx) => {
    await ctx.answerCallbackQuery()
    await showList(ctx, 0)
})

bot.callbackQuery(/^list:(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery()
    await showList(ctx, Number(ctx.match[1]))
})

bot.callbackQuery('add', async (ctx) => {
    await ctx.answerCallbackQuery()
    await startDraft(ctx)
})

bot.callbackQuery(/^card:(.+)$/, async (ctx) => {
    await ctx.answerCallbackQuery()
    await showCard(ctx, ctx.match[1])
})

bot.callbackQuery(/^publish:(.+)$/, async (ctx) => {
    await ctx.answerCallbackQuery()
    await setStatus(ctx, ctx.match[1], 'published')
})

bot.callbackQuery(/^unpublish:(.+)$/, async (ctx) => {
    await ctx.answerCallbackQuery()
    await setStatus(ctx, ctx.match[1], 'draft')
})

bot.callbackQuery(/^price:(.+)$/, async (ctx) => {
    await ctx.answerCallbackQuery()
    await askPrice(ctx, ctx.match[1])
})

bot.callbackQuery(/^archive:(.+)$/, async (ctx) => {
    await ctx.answerCallbackQuery()
    await archiveProperty(ctx, ctx.match[1])
})

bot.on('message:text', async (ctx) => {
    const text = ctx.message.text

    if (text.startsWith('/')) {
        return
    }

    const state = states.get(ctx.chat.id)

    if (!state) {
        return
    }

    if (state.step === 'edit-price') {
        const value = Number(text.replace(/\s/g, ''))

        if (!Number.isInteger(value) || value <= 0) {
            await ctx.reply('Введите целое число больше нуля.')
            return
        }

        try {
            const property = await api.update(state.propertyId, {
                price: value,
            })

            states.set(ctx.chat.id, { propertyId: state.propertyId })
            await ctx.reply('Цена обновлена.', {
                reply_markup: cardKeyboard(property),
            })
        } catch (error) {
            await ctx.reply(formatApiError(error))
        }

        return
    }

    const step = getDraftStep(state.step)

    if (!step) {
        return
    }

    const result = validateDraftValue(step, text, state.draft)

    if (!result.ok) {
        await ctx.reply(result.error)
        return
    }

    state.draft[step.key] = result.value
    const following = getNextDraftStep(step.key)

    if (following) {
        state.step = following.key
        await ctx.reply(following.prompt)
        return
    }

    states.clear(ctx.chat.id)

    try {
        const property = await api.create(createDraftPayload(state.draft))

        states.set(ctx.chat.id, { propertyId: property.id })
        await ctx.reply(
            `Черновик создан.\n\n${formatPropertyCard(
                property
            )}\n\nОтправьте фото, затем опубликуйте объект.`,
            { reply_markup: cardKeyboard(property) }
        )
    } catch (error) {
        await ctx.reply(formatApiError(error))
    }
})

bot.on('message:photo', async (ctx) => {
    const state = states.get(ctx.chat.id)

    if (!state?.propertyId) {
        await ctx.reply(
            'Сначала выберите объект в /list или создайте новый через /add.'
        )
        return
    }

    const photo = ctx.message.photo[ctx.message.photo.length - 1]

    await uploadFromTelegram(
        ctx,
        state.propertyId,
        photo.file_id,
        'photo.jpg',
        'image/jpeg',
        ctx.message.caption ?? ''
    )
})

bot.on('message:document', async (ctx) => {
    const document = ctx.message.document

    if (!document.mime_type?.startsWith('image/')) {
        return
    }

    const state = states.get(ctx.chat.id)

    if (!state?.propertyId) {
        await ctx.reply(
            'Сначала выберите объект в /list или создайте новый через /add.'
        )
        return
    }

    await uploadFromTelegram(
        ctx,
        state.propertyId,
        document.file_id,
        document.file_name ?? 'photo.jpg',
        document.mime_type,
        ctx.message.caption ?? ''
    )
})

bot.api
    .setMyCommands([
        { command: 'start', description: 'Меню' },
        { command: 'list', description: 'Объекты' },
        { command: 'add', description: 'Новый объект' },
        { command: 'cancel', description: 'Отменить действие' },
    ])
    .catch((error) => {
        console.error('Не удалось обновить команды бота:', error)
    })

bot.start({
    onStart: (info) => {
        console.log(`Бот @${info.username} запущен`)
    },
}).catch((error) => {
    console.error('Не удалось запустить бота:', error)
    process.exit(1)
})

process.once('SIGINT', () => bot.stop())
process.once('SIGTERM', () => bot.stop())
