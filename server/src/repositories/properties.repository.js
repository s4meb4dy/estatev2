import { and, asc, desc, eq, sql } from 'drizzle-orm'
import { db } from '../db/client.js'
import { properties, propertyImages } from '../db/schema.js'

const imageOrder = [asc(propertyImages.sortOrder), asc(propertyImages.createdAt)]

function toIso(value) {
    return value instanceof Date ? value.toISOString() : value ?? undefined
}

function mapProperty(row) {
    if (!row) {
        return null
    }

    return {
        id: row.id,
        slug: row.slug,
        title: row.title,
        address: row.address,
        price: Number(row.price),
        pricePerM2:
            row.pricePerM2 === null || row.pricePerM2 === undefined
                ? undefined
                : Number(row.pricePerM2),
        area: Number(row.area),
        rooms: row.rooms,
        floor: row.floor,
        floorsTotal: row.floorsTotal,
        description: row.description,
        about: row.about,
        condition: row.condition,
        status: row.status,
        sortOrder: row.sortOrder,
        phone: row.phone,
        whatsapp: row.whatsapp,
        specialist: row.specialistName
            ? {
                  name: row.specialistName,
                  role: row.specialistRole ?? 'Риэлтор',
                  phone: row.specialistPhone ?? '',
                  whatsapp: row.specialistWhatsapp ?? '',
                  photo: row.specialistPhoto ?? '',
              }
            : undefined,
        images: (row.images ?? []).map((image) => ({
            id: image.id,
            url: image.url,
            alt: image.alt,
            sortOrder: image.sortOrder,
            isCover: image.isCover,
        })),
        createdAt: toIso(row.createdAt),
        updatedAt: toIso(row.updatedAt),
        publishedAt: toIso(row.publishedAt),
    }
}

function findWithImages(database, where) {
    return database.query.properties.findFirst({
        where,
        with: { images: { orderBy: imageOrder } },
    })
}

export function createDbRepository(database = db) {
    async function findById(id) {
        return mapProperty(await findWithImages(database, eq(properties.id, id)))
    }

    async function findBySlug(slug) {
        return mapProperty(
            await findWithImages(database, eq(properties.slug, slug))
        )
    }

    async function slugExists(slug) {
        const rows = await database
            .select({ id: properties.id })
            .from(properties)
            .where(eq(properties.slug, slug))
            .limit(1)

        return rows.length > 0
    }

    async function list({ status, limit = 50, offset = 0 } = {}) {
        const where = status ? eq(properties.status, status) : undefined

        const rows = await database.query.properties.findMany({
            where,
            orderBy: [
                asc(properties.sortOrder),
                sql`${properties.publishedAt} desc nulls last`,
                desc(properties.createdAt),
            ],
            limit,
            offset,
            with: { images: { orderBy: imageOrder } },
        })

        const countQuery = database
            .select({ count: sql`count(*)::int` })
            .from(properties)
        const countRows = where ? await countQuery.where(where) : await countQuery

        return {
            items: rows.map(mapProperty),
            total: Number(countRows[0]?.count ?? 0),
        }
    }

    async function create(values, images = []) {
        return database.transaction(async (tx) => {
            const [row] = await tx.insert(properties).values(values).returning()

            if (images.length > 0) {
                await tx.insert(propertyImages).values(
                    images.map((image) => ({
                        propertyId: row.id,
                        url: image.url,
                        alt: image.alt ?? '',
                        sortOrder: image.sortOrder ?? 0,
                        isCover: image.isCover ?? false,
                    }))
                )
            }

            return mapProperty(
                await findWithImages(tx, eq(properties.id, row.id))
            )
        })
    }

    async function update(id, values) {
        const setValues = Object.fromEntries(
            Object.entries(values).filter(([, value]) => value !== undefined)
        )

        if (Object.keys(setValues).length === 0) {
            return findById(id)
        }

        const rows = await database
            .update(properties)
            .set(setValues)
            .where(eq(properties.id, id))
            .returning({ id: properties.id })

        if (rows.length === 0) {
            return null
        }

        return findById(id)
    }

    async function archive(id, updatedAt = new Date()) {
        const rows = await database
            .update(properties)
            .set({ status: 'archived', updatedAt })
            .where(eq(properties.id, id))
            .returning({ id: properties.id })

        if (rows.length === 0) {
            return null
        }

        return findById(id)
    }

    async function remove(id) {
        const rows = await database
            .delete(properties)
            .where(eq(properties.id, id))
            .returning({ id: properties.id })

        return rows.length > 0
    }

    async function addImage(propertyId, image) {
        return database.transaction(async (tx) => {
            if (image.isCover) {
                await tx
                    .update(propertyImages)
                    .set({ isCover: false })
                    .where(eq(propertyImages.propertyId, propertyId))
            }

            const [row] = await tx
                .insert(propertyImages)
                .values({
                    propertyId,
                    url: image.url,
                    alt: image.alt ?? '',
                    sortOrder: image.sortOrder ?? 0,
                    isCover: image.isCover ?? false,
                })
                .returning()

            return row
        })
    }

    async function updateImage(propertyId, imageId, values) {
        return database.transaction(async (tx) => {
            if (values.isCover) {
                await tx
                    .update(propertyImages)
                    .set({ isCover: false })
                    .where(eq(propertyImages.propertyId, propertyId))
            }

            const rows = await tx
                .update(propertyImages)
                .set(values)
                .where(
                    and(
                        eq(propertyImages.id, imageId),
                        eq(propertyImages.propertyId, propertyId)
                    )
                )
                .returning()

            return rows[0] ?? null
        })
    }

    async function removeImage(propertyId, imageId) {
        return database.transaction(async (tx) => {
            const rows = await tx
                .delete(propertyImages)
                .where(
                    and(
                        eq(propertyImages.id, imageId),
                        eq(propertyImages.propertyId, propertyId)
                    )
                )
                .returning({ id: propertyImages.id })

            if (rows.length === 0) {
                return false
            }

            const remaining = await tx
                .select()
                .from(propertyImages)
                .where(eq(propertyImages.propertyId, propertyId))
                .orderBy(
                    asc(propertyImages.sortOrder),
                    asc(propertyImages.createdAt)
                )

            if (
                remaining.length > 0 &&
                !remaining.some((image) => image.isCover)
            ) {
                await tx
                    .update(propertyImages)
                    .set({ isCover: true })
                    .where(eq(propertyImages.id, remaining[0].id))
            }

            return true
        })
    }

    async function reorderImages(propertyId, imageIds) {
        return database.transaction(async (tx) => {
            for (const [index, imageId] of imageIds.entries()) {
                await tx
                    .update(propertyImages)
                    .set({ sortOrder: index })
                    .where(
                        and(
                            eq(propertyImages.id, imageId),
                            eq(propertyImages.propertyId, propertyId)
                        )
                    )
            }
        })
    }

    async function ping() {
        await database.execute(sql`select 1`)
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
