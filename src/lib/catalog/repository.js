import seedData from '@/data/properties.seed.json'
import { normalizeProperties } from '@shared/catalog/schema'

const source = process.env.CATALOG_SOURCE || 'seed'

const seedProperties = normalizeProperties(seedData)
    .filter((property) => property.status === 'published')
    .sort((first, second) => {
        if (first.sortOrder !== second.sortOrder) {
            return first.sortOrder - second.sortOrder
        }
        return String(second.publishedAt || '').localeCompare(String(first.publishedAt || ''))
    })

/**
 * Единственная точка чтения каталога для страниц.
 * На этапе 2 сюда добавится источник `db` (PostgreSQL),
 * а интерфейс страниц останется прежним.
 */
export async function getPublishedProperties() {
    if (source === 'seed') {
        return seedProperties
    }

    throw new Error(
        `CATALOG_SOURCE="${source}" пока не подключён. Используй CATALOG_SOURCE=seed или добавь repository.db.js на этапе сервера.`
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
