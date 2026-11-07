import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test, { after } from 'node:test'
import { buildApp } from '../src/app.js'
import { createInMemoryRepository } from '../test-support/in-memory-repository.js'

const TOKEN = 'test-token-1234567890'
const uploadDir = path.join(
    os.tmpdir(),
    `estatev2-test-uploads-${process.pid}`
)
const config = {
    nodeEnv: 'test',
    host: '127.0.0.1',
    port: 0,
    databaseUrl: 'postgres://test',
    apiToken: TOKEN,
    siteOrigins: [],
    logLevel: 'silent',
    trustProxy: false,
    rateLimitMax: 0,
    uploadDir,
    uploadPublicPrefix: '/uploads',
    uploadMaxBytes: 1024 * 1024,
    rebuildWebhookUrl: '',
    rebuildToken: '',
}

after(async () => {
    await fs.rm(uploadDir, { recursive: true, force: true })
})
const auth = { authorization: `Bearer ${TOKEN}` }

function sample(overrides = {}) {
    return {
        title: 'Квартира 2 комнаты, 60 м²',
        address: 'Москва, ул. Тестовая, д. 1',
        price: 12000000,
        area: 60,
        floor: 5,
        floorsTotal: 10,
        rooms: 2,
        status: 'published',
        images: [{ url: '/img/property1-1.jpg', alt: 'Главное фото' }],
        ...overrides,
    }
}

async function setup(initial = []) {
    const repository = createInMemoryRepository(initial)
    const app = await buildApp({ repository, config })

    return { app, repository }
}

async function createProperty(app, overrides = {}) {
    const response = await app.inject({
        method: 'POST',
        url: '/api/properties',
        headers: auth,
        payload: sample(overrides),
    })

    assert.equal(response.statusCode, 201, response.body)
    return response.json()
}

test('health отвечает ok', async () => {
    const { app } = await setup()

    try {
        const response = await app.inject({ method: 'GET', url: '/health' })

        assert.equal(response.statusCode, 200)
        assert.equal(response.json().status, 'ok')
        assert.equal(response.json().db, 'ok')
    } finally {
        await app.close()
    }
})

test('публичный список показывает только опубликованные объекты', async () => {
    const { app } = await setup()

    try {
        const published = await createProperty(app)
        await createProperty(app, {
            title: 'Черновик',
            slug: 'draft-object',
            status: 'draft',
            images: [],
        })

        const publicResponse = await app.inject({
            method: 'GET',
            url: '/api/properties',
        })
        const publicPayload = publicResponse.json()

        assert.equal(publicResponse.statusCode, 200)
        assert.equal(publicPayload.total, 1)
        assert.equal(publicPayload.items[0].id, published.id)

        const adminResponse = await app.inject({
            method: 'GET',
            url: '/api/properties',
            headers: auth,
        })

        assert.equal(adminResponse.statusCode, 200)
        assert.equal(adminResponse.json().total, 2)
    } finally {
        await app.close()
    }
})

test('объект открывается по slug, черновик скрыт от публики', async () => {
    const { app } = await setup()

    try {
        const published = await createProperty(app)
        const draft = await createProperty(app, {
            title: 'Черновик',
            slug: 'draft-object',
            status: 'draft',
            images: [],
        })

        const ok = await app.inject({
            method: 'GET',
            url: `/api/properties/${published.slug}`,
        })

        assert.equal(ok.statusCode, 200)
        assert.equal(ok.json().id, published.id)

        const hidden = await app.inject({
            method: 'GET',
            url: `/api/properties/${draft.slug}`,
        })

        assert.equal(hidden.statusCode, 404)

        const admin = await app.inject({
            method: 'GET',
            url: `/api/properties/${draft.slug}`,
            headers: auth,
        })

        assert.equal(admin.statusCode, 200)

        const missing = await app.inject({
            method: 'GET',
            url: '/api/properties/nope',
        })

        assert.equal(missing.statusCode, 404)
    } finally {
        await app.close()
    }
})

test('создание требует API-токен', async () => {
    const { app } = await setup()

    try {
        const noToken = await app.inject({
            method: 'POST',
            url: '/api/properties',
            payload: sample(),
        })

        assert.equal(noToken.statusCode, 401)

        const wrongToken = await app.inject({
            method: 'POST',
            url: '/api/properties',
            headers: { authorization: 'Bearer wrong-token-1234567890' },
            payload: sample(),
        })

        assert.equal(wrongToken.statusCode, 401)
    } finally {
        await app.close()
    }
})

test('создание считает slug и цену за метр', async () => {
    const { app } = await setup()

    try {
        const property = await createProperty(app, { slug: undefined })

        assert.equal(property.pricePerM2, 200000)
        assert.match(property.slug, /^kvartira-2-komnaty-60-m2-moskva/)
        assert.equal(property.images.length, 1)
        assert.equal(property.images[0].isCover, true)
    } finally {
        await app.close()
    }
})

test('валидация не пропускает этаж выше дома', async () => {
    const { app } = await setup()

    try {
        const response = await app.inject({
            method: 'POST',
            url: '/api/properties',
            headers: auth,
            payload: sample({ floor: 20, floorsTotal: 10 }),
        })

        assert.equal(response.statusCode, 400)
        assert.equal(response.json().error, 'validation_error')
    } finally {
        await app.close()
    }
})

test('нельзя опубликовать объект без изображений', async () => {
    const { app } = await setup()

    try {
        const response = await app.inject({
            method: 'POST',
            url: '/api/properties',
            headers: auth,
            payload: sample({ images: [] }),
        })

        assert.equal(response.statusCode, 422)
        assert.equal(response.json().error, 'image_required')
    } finally {
        await app.close()
    }
})

test('обновление меняет поля и проверяет публикацию', async () => {
    const { app } = await setup()

    try {
        const property = await createProperty(app, {
            status: 'draft',
            images: [],
        })

        const updated = await app.inject({
            method: 'PATCH',
            url: `/api/properties/${property.id}`,
            headers: auth,
            payload: { title: 'Новое название' },
        })

        assert.equal(updated.statusCode, 200)
        assert.equal(updated.json().title, 'Новое название')

        const publish = await app.inject({
            method: 'PATCH',
            url: `/api/properties/${property.id}`,
            headers: auth,
            payload: { status: 'published' },
        })

        assert.equal(publish.statusCode, 422)
        assert.equal(publish.json().error, 'image_required')
    } finally {
        await app.close()
    }
})

test('удаление архивирует объект, hard=true удаляет навсегда', async () => {
    const { app } = await setup()

    try {
        const first = await createProperty(app)

        const archived = await app.inject({
            method: 'DELETE',
            url: `/api/properties/${first.id}`,
            headers: auth,
        })

        assert.equal(archived.statusCode, 204)

        const publicAfter = await app.inject({
            method: 'GET',
            url: `/api/properties/${first.slug}`,
        })

        assert.equal(publicAfter.statusCode, 404)

        const adminAfter = await app.inject({
            method: 'GET',
            url: `/api/properties/${first.slug}`,
            headers: auth,
        })

        assert.equal(adminAfter.statusCode, 200)
        assert.equal(adminAfter.json().status, 'archived')

        const second = await createProperty(app, {
            title: 'Второй объект',
            slug: 'second-object',
        })

        const hard = await app.inject({
            method: 'DELETE',
            url: `/api/properties/${second.id}?hard=true`,
            headers: auth,
        })

        assert.equal(hard.statusCode, 204)

        const gone = await app.inject({
            method: 'GET',
            url: `/api/properties/${second.slug}`,
            headers: auth,
        })

        assert.equal(gone.statusCode, 404)
    } finally {
        await app.close()
    }
})

test('изображения добавляются, обновляются и удаляются', async () => {
    const { app } = await setup()

    try {
        const property = await createProperty(app, {
            status: 'draft',
            images: [],
        })

        const added = await app.inject({
            method: 'POST',
            url: `/api/properties/${property.id}/images`,
            headers: auth,
            payload: { url: '/img/property1-1.jpg', alt: 'Фото' },
        })

        assert.equal(added.statusCode, 201)
        assert.equal(added.json().images.length, 1)
        assert.equal(added.json().images[0].isCover, true)

        const imageId = added.json().images[0].id

        const updated = await app.inject({
            method: 'PATCH',
            url: `/api/properties/${property.id}/images/${imageId}`,
            headers: auth,
            payload: { alt: 'Новое описание' },
        })

        assert.equal(updated.statusCode, 200)
        assert.equal(updated.json().images[0].alt, 'Новое описание')

        const removed = await app.inject({
            method: 'DELETE',
            url: `/api/properties/${property.id}/images/${imageId}`,
            headers: auth,
        })

        assert.equal(removed.statusCode, 200)
        assert.equal(removed.json().images.length, 0)
    } finally {
        await app.close()
    }
})

test('нельзя удалить последнее фото опубликованного объекта', async () => {
    const { app } = await setup()

    try {
        const property = await createProperty(app)

        const response = await app.inject({
            method: 'DELETE',
            url: `/api/properties/${property.id}/images/${property.images[0].id}`,
            headers: auth,
        })

        assert.equal(response.statusCode, 422)
        assert.equal(response.json().error, 'image_required')
    } finally {
        await app.close()
    }
})

test('порядок изображений сохраняется', async () => {
    const { app } = await setup()

    try {
        const property = await createProperty(app, {
            images: [
                { url: '/img/property1-1.jpg' },
                { url: '/img/property1-2.jpg' },
            ],
        })
        const reversed = [...property.images]
            .reverse()
            .map((image) => image.id)

        const response = await app.inject({
            method: 'PUT',
            url: `/api/properties/${property.id}/images/order`,
            headers: auth,
            payload: { imageIds: reversed },
        })

        assert.equal(response.statusCode, 200)
        assert.deepEqual(
            response.json().images.map((image) => image.id),
            reversed
        )
        assert.deepEqual(
            response.json().images.map((image) => image.sortOrder),
            [0, 1]
        )
    } finally {
        await app.close()
    }
})

function multipartBody({
    content,
    contentType = 'image/jpeg',
    filename = 'photo.jpg',
    fields = {},
}) {
    const boundary = `----estatev2${Date.now().toString(16)}`
    const chunks = []

    for (const [name, value] of Object.entries(fields)) {
        chunks.push(
            Buffer.from(
                `--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`
            )
        )
    }

    chunks.push(
        Buffer.from(
            `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${filename}"\r\nContent-Type: ${contentType}\r\n\r\n`
        )
    )
    chunks.push(content)
    chunks.push(Buffer.from(`\r\n--${boundary}--\r\n`))

    return {
        payload: Buffer.concat(chunks),
        headers: {
            'content-type': `multipart/form-data; boundary=${boundary}`,
        },
    }
}

test('загрузка фото сохраняет файл и добавляет изображение', async () => {
    const { app } = await setup()

    try {
        const property = await createProperty(app, {
            status: 'draft',
            images: [],
        })
        const body = multipartBody({
            content: Buffer.from([0xff, 0xd8, 0xff, 0xd9]),
            fields: { alt: 'Фасад', isCover: 'true' },
        })

        const response = await app.inject({
            method: 'POST',
            url: `/api/properties/${property.id}/images/upload`,
            headers: { ...auth, ...body.headers },
            payload: body.payload,
        })

        assert.equal(response.statusCode, 201, response.body)

        const image = response.json().images[0]

        assert.match(image.url, /^\/uploads\/.+\.jpg$/)
        assert.equal(image.alt, 'Фасад')
        assert.equal(image.isCover, true)
        await fs.access(path.join(uploadDir, path.basename(image.url)))
    } finally {
        await app.close()
    }
})

test('загрузка отклоняет неподдерживаемый тип и не-multipart запрос', async () => {
    const { app } = await setup()

    try {
        const property = await createProperty(app, {
            status: 'draft',
            images: [],
        })
        const wrongType = multipartBody({
            content: Buffer.from('not an image'),
            contentType: 'text/plain',
            filename: 'notes.txt',
        })
        const rejected = await app.inject({
            method: 'POST',
            url: `/api/properties/${property.id}/images/upload`,
            headers: { ...auth, ...wrongType.headers },
            payload: wrongType.payload,
        })

        assert.equal(rejected.statusCode, 415)
        assert.equal(rejected.json().error, 'unsupported_media_type')

        const json = await app.inject({
            method: 'POST',
            url: `/api/properties/${property.id}/images/upload`,
            headers: auth,
            payload: { url: '/img/x.jpg' },
        })

        assert.equal(json.statusCode, 415)
    } finally {
        await app.close()
    }
})

test('загрузка требует токен и существующий объект', async () => {
    const { app } = await setup()

    try {
        const property = await createProperty(app, {
            status: 'draft',
            images: [],
        })
        const body = multipartBody({
            content: Buffer.from([0xff, 0xd8, 0xff, 0xd9]),
        })

        const noToken = await app.inject({
            method: 'POST',
            url: `/api/properties/${property.id}/images/upload`,
            headers: body.headers,
            payload: body.payload,
        })

        assert.equal(noToken.statusCode, 401)

        const missing = await app.inject({
            method: 'POST',
            url: '/api/properties/00000000-0000-4000-8000-000000000000/images/upload',
            headers: { ...auth, ...body.headers },
            payload: body.payload,
        })

        assert.equal(missing.statusCode, 404)
    } finally {
        await app.close()
    }
})

test('изменения уведомляют сервис пересборки', async () => {
    const calls = []
    const repository = createInMemoryRepository([])
    const app = await buildApp({
        repository,
        config,
        rebuildNotifier: {
            notify: async (reason) => calls.push(reason),
        },
    })

    try {
        const property = await createProperty(app)

        await app.inject({
            method: 'PATCH',
            url: `/api/properties/${property.id}`,
            headers: auth,
            payload: { title: 'Обновлено' },
        })

        await new Promise((resolve) => setImmediate(resolve))

        assert.deepEqual(calls, ['property.created', 'property.updated'])
    } finally {
        await app.close()
    }
})
