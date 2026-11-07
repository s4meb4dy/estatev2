import seedData from '@/data/properties.seed.json'
import { normalizeProperties } from '@shared/catalog/schema'

const source = process.env.CATALOG_SOURCE || 'seed'
const apiUrl = (process.env.CATALOG_API_URL || '').replace(/\/$/, '')

function sortProperties(properties) {
    return properties
        .filter((property) => property.status === 'published')
        .sort((first, second) => {
            if (first.sortOrder !== second.sortOrder) {
                return first.sortOrder - second.sortOrder
            }
            return String(second.publishedAt || '').localeCompare(
                String(first.publishedAt || '')
            )
        })
}

const seedProperties = sortProperties(normalizeProperties(seedData))

let apiPropertiesPromise

async function fetchAllFromApi() {
    if (!apiUrl) {
        throw new Error(
            'CATALOG_API_URL обязателен при CATALOG_SOURCE=api'
        )
    }

    const limit = 200
    const items = []
    let offset = 0

    while (true) {
        const response = await fetch(
            `${apiUrl}/api/properties?limit=${limit}&offset=${offset}`,
            { headers: { accept: 'application/json' } }
        )

        if (!response.ok) {
            throw new Error(
                `API каталога вернул ${response.status} ${response.statusText}`
            )
        }

        const payload = await response.json()

        if (!Array.isArray(payload.items)) {
            throw new Error('API каталога вернул некорректный ответ')
        }

        items.push(...payload.items)

        const total = Number(payload.total)

        if (
            payload.items.length < limit ||
            (Number.isFinite(total) && items.length >= total)
        ) {
            break
        }

        offset += limit
    }

    return sortProperties(normalizeProperties(items))
}

function loadFromApi() {
    if (!apiPropertiesPromise) {
        apiPropertiesPromise = fetchAllFromApi()
    }

    return apiPropertiesPromise
}

/**
 * Единственная точка чтения каталога для страниц.
 * seed — локальные данные для разработки и первичной сборки,
 * api — опубликованные объекты из Fastify API.
 */
export async function getPublishedProperties() {
    if (source === 'seed') {
        return seedProperties
    }

    if (source === 'api') {
        return loadFromApi()
    }

    throw new Error(
        `CATALOG_SOURCE="${source}" не поддерживается. Используй seed или api.`
    )
}

export async function getPropertyBySlug(slug) {
    const properties = await getPublishedProperties()
    return properties.find((property) => property.slug === slug) || null
}

export async function getRelatedProperties(property, limit = 3) {
    const properties = await getPublishedProperties()
    return properties
        .filter((item) => item.id !== property.id)
        .sort((first, second) => {
            const firstSameAddress = first.address === property.address ? 0 : 1
            const secondSameAddress = second.address === property.address ? 0 : 1
            return firstSameAddress - secondSameAddress
        })
        .slice(0, limit)
}
