import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { eq } from 'drizzle-orm'
import { normalizeProperties } from '../../shared/catalog/schema.js'
import { db, pool } from '../src/db/client.js'
import { properties, propertyImages } from '../src/db/schema.js'

const currentDir = path.dirname(fileURLToPath(import.meta.url))
const seedPath =
    process.env.SEED_FILE ||
    path.resolve(currentDir, '../../src/data/properties.seed.json')

function toDate(value) {
    if (!value) {
        return undefined
    }

    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? undefined : date
}

const raw = JSON.parse(fs.readFileSync(seedPath, 'utf8'))
const items = normalizeProperties(raw)

try {
    for (const item of items) {
        const values = {
            slug: item.slug,
            title: item.title,
            address: item.address,
            price: item.price,
            pricePerM2: item.pricePerM2,
            area: item.area,
            rooms: item.rooms,
            floor: item.floor,
            floorsTotal: item.floorsTotal,
            description: item.description,
            about: item.about,
            condition: item.condition,
            status: item.status,
            sortOrder: item.sortOrder,
            phone: item.phone,
            whatsapp: item.whatsapp,
            specialistName: item.specialist?.name,
            specialistRole: item.specialist?.role,
            specialistPhone: item.specialist?.phone,
            specialistWhatsapp: item.specialist?.whatsapp,
            specialistPhoto: item.specialist?.photo,
            publishedAt: toDate(item.publishedAt),
            createdAt: toDate(item.createdAt) ?? new Date(),
            updatedAt: toDate(item.updatedAt) ?? new Date(),
        }
        const updateValues = Object.fromEntries(
            Object.entries(values).filter(
                ([key, value]) => key !== 'createdAt' && value !== undefined
            )
        )

        await db.transaction(async (tx) => {
            const [row] = await tx
                .insert(properties)
                .values(values)
                .onConflictDoUpdate({
                    target: properties.slug,
                    set: updateValues,
                })
                .returning({ id: properties.id })

            await tx
                .delete(propertyImages)
                .where(eq(propertyImages.propertyId, row.id))

            if (item.images.length > 0) {
                await tx.insert(propertyImages).values(
                    item.images.map((image, index) => ({
                        propertyId: row.id,
                        url: image.url,
                        alt: image.alt ?? '',
                        sortOrder: image.sortOrder ?? index,
                        isCover: image.isCover ?? index === 0,
                    }))
                )
            }
        })

        console.log(`Импортирован объект: ${item.slug}`)
    }

    console.log(`Готово. Объектов импортировано: ${items.length}`)
} catch (error) {
    console.error('Ошибка импорта:', error)
    process.exitCode = 1
} finally {
    await pool.end()
}
