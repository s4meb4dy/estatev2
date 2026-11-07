import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { formatPrice } from '../shared/catalog/format.js'
import { normalizeProperties, normalizeProperty } from '../shared/catalog/schema.js'
import { slugify, uniqueSlug } from '../shared/catalog/slug.js'

const currentDir = path.dirname(fileURLToPath(import.meta.url))
const seedPath = path.resolve(currentDir, '../src/data/properties.seed.json')
const seed = JSON.parse(fs.readFileSync(seedPath, 'utf8'))

test('slugify транслитерирует русский текст', () => {
    assert.equal(
        slugify('Квартира 3 комнаты, 131 м², 17/25 этаж'),
        'kvartira-3-komnaty-131-m2-17-25-etazh'
    )
})

test('uniqueSlug добавляет суффикс при совпадении', () => {
    assert.equal(uniqueSlug('Квартира', ['kvartira']), 'kvartira-2')
    assert.equal(uniqueSlug('Квартира', ['kvartira', 'kvartira-2']), 'kvartira-3')
})

test('normalizeProperty считает цену метра и сортирует фото', () => {
    const property = normalizeProperty({
        id: 1,
        slug: 'test-object',
        title: 'Тестовый объект',
        address: 'Москва',
        price: 10000000,
        area: 50,
        floor: 4,
        floorsTotal: 5,
        images: [
            { url: '/img/property2-2.jpg', sortOrder: 2 },
            { url: '/img/property2-1.jpg', sortOrder: 1, isCover: true },
        ],
    })

    assert.equal(property.id, '1')
    assert.equal(property.pricePerM2, 200000)
    assert.equal(property.images[0].url, '/img/property2-1.jpg')
})

test('normalizeProperties не пропускает дубли slug', () => {
    assert.throws(
        () =>
            normalizeProperties([
                {
                    id: 1,
                    slug: 'same-slug',
                    title: 'Первый',
                    address: 'Москва',
                    price: 1000000,
                    area: 50,
                    floor: 1,
                    floorsTotal: 5,
                    images: ['/img/property2-1.jpg'],
                },
                {
                    id: 2,
                    slug: 'same-slug',
                    title: 'Второй',
                    address: 'Москва',
                    price: 1000000,
                    area: 50,
                    floor: 1,
                    floorsTotal: 5,
                    images: ['/img/property2-2.jpg'],
                },
            ]),
        /Duplicate property slug/
    )
})

test('seed-данные каталога валидны', () => {
    const properties = normalizeProperties(seed)
    assert.ok(properties.length >= 1)
    assert.ok(properties.every((property) => property.images.length > 0))
})

test('formatPrice форматирует число', () => {
    assert.equal(formatPrice(25000000).replace(/\D/g, ''), '25000000')
    assert.equal(formatPrice(null), '')
})
