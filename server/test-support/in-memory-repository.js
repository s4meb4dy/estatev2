import { randomUUID } from 'node:crypto'

function clone(value) {
    return structuredClone(value)
}

function iso(value) {
    return value instanceof Date ? value.toISOString() : value
}

function normalizeImages(images = []) {
    return images.map((image, index) => ({
        id: image.id ?? randomUUID(),
        url: image.url,
        alt: image.alt ?? '',
        sortOrder: image.sortOrder ?? index,
        isCover: image.isCover ?? index === 0,
    }))
}

export function createInMemoryRepository(initial = []) {
    const items = new Map()

    for (const item of initial) {
        const property = {
            id: item.id ?? randomUUID(),
            ...clone(item),
            images: normalizeImages(item.images),
            createdAt: iso(item.createdAt) ?? new Date().toISOString(),
            updatedAt: iso(item.updatedAt) ?? new Date().toISOString(),
            publishedAt:
                iso(item.publishedAt) ??
                (item.status === 'published'
                    ? new Date().toISOString()
                    : undefined),
        }

        items.set(property.id, property)
    }

    async function findById(id) {
        return items.has(id) ? clone(items.get(id)) : null
    }

    async function findBySlug(slug) {
        const property = [...items.values()].find(
            (item) => item.slug === slug
        )

        return property ? clone(property) : null
    }

    async function slugExists(slug) {
        return [...items.values()].some((item) => item.slug === slug)
    }

    async function list({ status, limit = 50, offset = 0 } = {}) {
        let values = [...items.values()]

        if (status) {
            values = values.filter((item) => item.status === status)
        }

        values.sort(
            (first, second) =>
                first.sortOrder - second.sortOrder ||
                String(second.publishedAt ?? '').localeCompare(
                    String(first.publishedAt ?? '')
                ) ||
                String(second.createdAt).localeCompare(String(first.createdAt))
        )

        return {
            items: values.slice(offset, offset + limit).map(clone),
            total: values.length,
        }
    }

    async function create(values, images = []) {
        const id = randomUUID()
        const property = {
            id,
            ...clone(values),
            createdAt: iso(values.createdAt),
            updatedAt: iso(values.updatedAt),
            publishedAt: iso(values.publishedAt),
            images: normalizeImages(images),
        }

        items.set(id, property)
        return clone(property)
    }

    async function update(id, values) {
        const current = items.get(id)

        if (!current) {
            return null
        }

        const next = {
            ...current,
            ...clone(values),
            id,
            createdAt: current.createdAt,
            updatedAt: iso(values.updatedAt) ?? current.updatedAt,
            publishedAt: iso(values.publishedAt),
            images: current.images,
        }

        items.set(id, next)
        return clone(next)
    }

    async function archive(id, updatedAt = new Date()) {
        const current = items.get(id)

        if (!current) {
            return null
        }

        const next = {
            ...current,
            status: 'archived',
            updatedAt: iso(updatedAt),
        }

        items.set(id, next)
        return clone(next)
    }

    async function remove(id) {
        return items.delete(id)
    }

    async function addImage(propertyId, image) {
        const current = items.get(propertyId)

        if (!current) {
            return null
        }

        if (image.isCover) {
            current.images.forEach((item) => {
                item.isCover = false
            })
        }

        const next = {
            id: randomUUID(),
            url: image.url,
            alt: image.alt ?? '',
            sortOrder: image.sortOrder ?? current.images.length,
            isCover: image.isCover ?? false,
        }

        current.images.push(next)
        return clone(next)
    }

    async function updateImage(propertyId, imageId, values) {
        const current = items.get(propertyId)

        if (!current) {
            return null
        }

        const image = current.images.find((item) => item.id === imageId)

        if (!image) {
            return null
        }

        if (values.isCover) {
            current.images.forEach((item) => {
                item.isCover = false
            })
        }

        Object.assign(image, values)
        return clone(image)
    }

    async function removeImage(propertyId, imageId) {
        const current = items.get(propertyId)

        if (!current) {
            return false
        }

        const index = current.images.findIndex((item) => item.id === imageId)

        if (index === -1) {
            return false
        }

        current.images.splice(index, 1)

        if (
            current.images.length > 0 &&
            !current.images.some((item) => item.isCover)
        ) {
            current.images[0].isCover = true
        }

        return true
    }

    async function reorderImages(propertyId, imageIds) {
        const current = items.get(propertyId)

        if (!current) {
            return
        }

        current.images.sort(
            (first, second) =>
                imageIds.indexOf(first.id) - imageIds.indexOf(second.id)
        )
        current.images.forEach((image, index) => {
            image.sortOrder = index
        })
    }

    async function ping() {
        return true
    }

    return {
        list,
        findById,
        findBySlug,
        slugExists,
        create,
        update,
        archive,
        remove,
        addImage,
        updateImage,
        removeImage,
        reorderImages,
        ping,
    }
}
