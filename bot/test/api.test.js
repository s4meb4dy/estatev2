import assert from 'node:assert/strict'
import test from 'node:test'
import { ApiError, createApiClient } from '../src/api.js'

function jsonResponse(body, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'content-type': 'application/json' },
    })
}

function createFetch(response) {
    const calls = []

    return {
        calls,
        fetchImpl: async (url, options) => {
            calls.push({ url, options })
            return response.clone()
        },
    }
}

const client = (fetchImpl) =>
    createApiClient({
        baseUrl: 'http://api:3000',
        token: 'test-token-1234567890',
        fetchImpl,
    })

test('список запрашивается с токеном и параметрами', async () => {
    const fake = createFetch(
        jsonResponse({ items: [], total: 0, limit: 20, offset: 0 })
    )
    const api = client(fake.fetchImpl)

    const result = await api.list({ status: 'all', limit: 20, offset: 40 })

    assert.equal(result.total, 0)
    assert.equal(fake.calls.length, 1)
    assert.equal(
        fake.calls[0].url,
        'http://api:3000/api/properties?status=all&limit=20&offset=40'
    )
    assert.equal(
        fake.calls[0].options.headers.authorization,
        'Bearer test-token-1234567890'
    )
})

test('создание отправляет JSON', async () => {
    const fake = createFetch(jsonResponse({ id: 'abc' }, 201))
    const api = client(fake.fetchImpl)

    const result = await api.create({ title: 'Объект', price: 100 })

    assert.equal(result.id, 'abc')
    assert.equal(fake.calls[0].options.method, 'POST')
    assert.equal(
        fake.calls[0].options.headers['content-type'],
        'application/json'
    )
    assert.deepEqual(JSON.parse(fake.calls[0].options.body), {
        title: 'Объект',
        price: 100,
    })
})

test('обновление, удаление и чтение по id используют нужные методы', async () => {
    const fake = createFetch(jsonResponse({ id: 'abc' }))
    const api = client(fake.fetchImpl)

    await api.getById('abc')
    await api.update('abc', { price: 200 })
    await api.remove('abc', { hard: true })

    assert.equal(fake.calls[0].url, 'http://api:3000/api/properties/by-id/abc')
    assert.equal(fake.calls[1].options.method, 'PATCH')
    assert.equal(fake.calls[2].url, 'http://api:3000/api/properties/abc?hard=true')
    assert.equal(fake.calls[2].options.method, 'DELETE')
})

test('загрузка фото отправляет multipart без ручного content-type', async () => {
    const fake = createFetch(jsonResponse({ id: 'abc', images: [] }))
    const api = client(fake.fetchImpl)

    await api.uploadImage('abc', {
        buffer: Buffer.from('image'),
        filename: 'photo.jpg',
        contentType: 'image/jpeg',
        alt: 'Фасад',
        isCover: true,
    })

    const call = fake.calls[0]

    assert.equal(
        call.url,
        'http://api:3000/api/properties/abc/images/upload'
    )
    assert.equal(call.options.method, 'POST')
    assert.equal(call.options.headers['content-type'], undefined)
    assert.ok(call.options.body instanceof FormData)
})

test('204 возвращает null', async () => {
    const fake = createFetch(new Response(null, { status: 204 }))
    const api = client(fake.fetchImpl)

    const result = await api.remove('abc')

    assert.equal(result, null)
})

test('ошибка API превращается в ApiError', async () => {
    const fake = createFetch(
        jsonResponse(
            {
                error: 'image_required',
                message: 'Нужно фото',
            },
            422
        )
    )
    const api = client(fake.fetchImpl)

    await assert.rejects(
        () => api.update('abc', { status: 'published' }),
        (error) => {
            assert.ok(error instanceof ApiError)
            assert.equal(error.status, 422)
            assert.equal(error.code, 'image_required')
            assert.equal(error.message, 'Нужно фото')
            return true
        }
    )
})
