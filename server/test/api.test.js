import assert from 'node:assert/strict'
import test from 'node:test'
import { buildApp } from '../src/app.js'
import { createInMemoryRepository } from '../test-support/in-memory-repository.js'

const TOKEN = 'test-token-1234567890'
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
}
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
