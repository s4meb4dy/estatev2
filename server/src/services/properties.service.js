import { slugify } from '../../../shared/catalog/slug.js'
import { AppError } from '../errors.js'

const DEFAULT_CONDITION = 'Свободная продажа'

function computePricePerM2(price, area) {
    if (!price || !area) {
        return undefined
    }
    return Math.round(price / area)
}

function specialistValues(specialist) {
    if (!specialist) {
        return {}
    }

    return {
        specialistName: specialist.name,
        specialistRole: specialist.role ?? 'Риэлтор',
        specialistPhone: specialist.phone ?? '',
        specialistWhatsapp: specialist.whatsapp ?? '',
        specialistPhoto: specialist.photo ?? '',
    }
}

export function createPropertyService(repository, { now = () => new Date() } = {}) {
    async function resolveSlug(requestedSlug, title, address, { ignoreId } = {}) {
        if (requestedSlug) {
            const existing = await repository.findBySlug(requestedSlug)
            if (existing && existing.id !== ignoreId) {
                throw new AppError(
                    409,
                    'slug_conflict',
                    `Slug «${requestedSlug}» уже занят`
                )
            }
            return requestedSlug
        }

        const base =
            slugify(`${title} ${address}`) || slugify(title) || 'object'
        let candidate = base
        let counter = 2

        while (await repository.slugExists(candidate)) {
            candidate = `${base}-${counter}`
            counter += 1
        }

        return candidate
    }

    async function list(query, { includeAll = false } = {}) {
        const status = includeAll
            ? query.status === 'all'
                ? undefined
                : query.status
            : 'published'

        const { items, total } = await repository.list({
            status,
            limit: query.limit,
            offset: query.offset,
        })

        return {
            items,
            total,
            limit: query.limit,
            offset: query.offset,
        }
    }

    async function getBySlug(slug, { includeAll = false } = {}) {
        const property = await repository.findBySlug(slug)

        if (!property) {
            return null
        }
        if (!includeAll && property.status !== 'published') {
            return null
        }

        return property
    }

    async function create(input) {
        const status = input.status ?? 'draft'
        const images = (input.images ?? []).map((image, index) => ({
            url: image.url,
            alt: image.alt ?? '',
            sortOrder: image.sortOrder ?? index,
            isCover: image.isCover ?? index === 0,
        }))

        if (status === 'published' && images.length === 0) {
            throw new AppError(
                422,
                'image_required',
                'Для публикации объекта нужно хотя бы одно изображение'
            )
        }

        const slug = await resolveSlug(input.slug, input.title, input.address)
        const createdAt = now()
        const publishedAt =
            input.publishedAt ?? (status === 'published' ? createdAt : undefined)

        return repository.create(
            {
                slug,
                title: input.title,
                address: input.address,
                price: input.price,
                pricePerM2:
                    input.pricePerM2 ?? computePricePerM2(input.price, input.area),
                area: input.area,
                rooms: input.rooms ?? 0,
                floor: input.floor,
                floorsTotal: input.floorsTotal,
                description: input.description ?? '',
                about: input.about ?? '',
                condition: input.condition ?? DEFAULT_CONDITION,
                status,
                sortOrder: input.sortOrder ?? 0,
                phone: input.phone ?? '',
                whatsapp: input.whatsapp ?? '',
                ...specialistValues(input.specialist),
                publishedAt,
                createdAt,
                updatedAt: createdAt,
            },
            images
        )
    }

    async function update(id, input) {
        const existing = await repository.findById(id)

        if (!existing) {
            throw new AppError(404, 'property_not_found', 'Объект не найден')
        }

        const status = input.status ?? existing.status
        const floor = input.floor ?? existing.floor
        const floorsTotal = input.floorsTotal ?? existing.floorsTotal

        if (floor > floorsTotal) {
            throw new AppError(
                400,
                'validation_error',
                'Этаж не может быть больше количества этажей'
            )
        }

        if (status === 'published' && existing.images.length === 0) {
            throw new AppError(
                422,
                'image_required',
                'Для публикации объекта нужно хотя бы одно изображение'
            )
        }

        const slug =
            input.slug !== undefined
                ? await resolveSlug(
                      input.slug,
                      input.title ?? existing.title,
                      input.address ?? existing.address,
                      { ignoreId: id }
                  )
                : existing.slug

        const price = input.price ?? existing.price
        const area = input.area ?? existing.area
        const pricePerM2 =
            input.pricePerM2 ??
            (input.price !== undefined || input.area !== undefined
                ? computePricePerM2(price, area)
                : existing.pricePerM2)

        const updatedAt = now()
        const publishedAt =
            status === 'published'
                ? existing.publishedAt ?? updatedAt
                : existing.publishedAt

        const specialist =
            input.specialist !== undefined ? input.specialist : existing.specialist

        return repository.update(id, {
            slug,
            title: input.title ?? existing.title,
            address: input.address ?? existing.address,
            price,
            pricePerM2,
            area,
            rooms: input.rooms ?? existing.rooms,
            floor,
            floorsTotal,
            description: input.description ?? existing.description,
            about: input.about ?? existing.about,
            condition: input.condition ?? existing.condition,
            status,
            sortOrder: input.sortOrder ?? existing.sortOrder,
            phone: input.phone ?? existing.phone,
            whatsapp: input.whatsapp ?? existing.whatsapp,
            ...specialistValues(specialist),
            publishedAt,
            updatedAt,
        })
    }

    async function archive(id) {
        const existing = await repository.findById(id)

        if (!existing) {
            throw new AppError(404, 'property_not_found', 'Объект не найден')
        }

        return repository.archive(id, now())
    }

    async function remove(id, { hard = false } = {}) {
        const existing = await repository.findById(id)

        if (!existing) {
            throw new AppError(404, 'property_not_found', 'Объект не найден')
        }

        if (hard) {
            await repository.remove(id)
            return null
        }

        return repository.archive(id, now())
    }

    async function addImage(id, input) {
        const existing = await repository.findById(id)

        if (!existing) {
            throw new AppError(404, 'property_not_found', 'Объект не найден')
        }

        await repository.addImage(id, {
            url: input.url,
            alt: input.alt ?? '',
            sortOrder: input.sortOrder ?? existing.images.length,
            isCover: input.isCover ?? existing.images.length === 0,
        })

        return repository.findById(id)
    }

    async function updateImage(id, imageId, input) {
        const existing = await repository.findById(id)

        if (!existing) {
            throw new AppError(404, 'property_not_found', 'Объект не найден')
        }
        if (!existing.images.some((image) => image.id === imageId)) {
            throw new AppError(404, 'image_not_found', 'Изображение не найдено')
        }

        await repository.updateImage(id, imageId, input)
        return repository.findById(id)
    }

    async function removeImage(id, imageId) {
        const existing = await repository.findById(id)

        if (!existing) {
            throw new AppError(404, 'property_not_found', 'Объект не найден')
        }
        if (!existing.images.some((image) => image.id === imageId)) {
            throw new AppError(404, 'image_not_found', 'Изображение не найдено')
        }
        if (existing.status === 'published' && existing.images.length <= 1) {
            throw new AppError(
                422,
                'image_required',
                'Нельзя удалить последнее изображение опубликованного объекта'
            )
        }

        await repository.removeImage(id, imageId)
        return repository.findById(id)
    }

    async function reorderImages(id, imageIds) {
        const existing = await repository.findById(id)

        if (!existing) {
            throw new AppError(404, 'property_not_found', 'Объект не найден')
        }

        const existingIds = new Set(existing.images.map((image) => image.id))
        const hasAllImages =
            imageIds.length === existing.images.length &&
            imageIds.every((imageId) => existingIds.has(imageId))

        if (!hasAllImages) {
            throw new AppError(
                400,
                'invalid_image_order',
                'Список imageIds должен содержать все изображения объекта'
            )
        }

        await repository.reorderImages(id, imageIds)
        return repository.findById(id)
    }

    return {
        list,
        getBySlug,
        create,
        update,
        archive,
        remove,
        addImage,
        updateImage,
        removeImage,
        reorderImages,
    }
}
