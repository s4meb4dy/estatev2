import { z } from 'zod'

const imageSchema = z.union([
    z.string().min(1).transform((url) => ({ url, alt: '' })),
    z.object({
        url: z.string().min(1),
        alt: z.string().optional().default(''),
        sortOrder: z.number().int().optional(),
        isCover: z.boolean().optional(),
    }),
])

const specialistSchema = z.object({
    name: z.string().min(1),
    role: z.string().optional().default('Риэлтор'),
    phone: z.string().optional().default(''),
    whatsapp: z.string().optional().default(''),
    photo: z.string().optional().default(''),
})

export const propertySchema = z
    .object({
        id: z.union([z.string(), z.number()]).transform(String),
        slug: z
            .string()
            .min(1)
            .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must contain only latin letters, digits and hyphens'),
        title: z.string().min(1),
        address: z.string().min(1),
        price: z.number().positive(),
        pricePerM2: z.number().positive().optional(),
        area: z.number().positive(),
        rooms: z.number().int().nonnegative().optional().default(0),
        floor: z.number().int().positive(),
        floorsTotal: z.number().int().positive(),
        description: z.string().optional().default(''),
        about: z.string().optional().default(''),
        condition: z.string().optional().default('Свободная продажа'),
        status: z.enum(['draft', 'published', 'sold', 'archived']).optional().default('published'),
        specialist: specialistSchema.optional(),
        images: z.array(imageSchema).min(1, 'Property must have at least one image'),
        sortOrder: z.number().int().optional().default(0),
        phone: z.string().optional().default(''),
        whatsapp: z.string().optional().default(''),
        createdAt: z.string().optional(),
        updatedAt: z.string().optional(),
        publishedAt: z.string().optional(),
    })
    .refine((property) => property.floor <= property.floorsTotal, {
        message: 'Floor cannot be greater than floorsTotal',
        path: ['floor'],
    })

export function normalizeProperty(input) {
    const parsed = propertySchema.parse(input)

    const images = parsed.images
        .map((image, index) => ({
            ...image,
            sortOrder: image.sortOrder ?? index,
        }))
        .sort((first, second) => first.sortOrder - second.sortOrder)

    const coverIndex = images.findIndex((image) => image.isCover)
    if (coverIndex > 0) {
        images.unshift(images.splice(coverIndex, 1)[0])
    }

    return {
        ...parsed,
        images,
        pricePerM2: parsed.pricePerM2 ?? Math.round(parsed.price / parsed.area),
    }
}

export function normalizeProperties(input) {
    if (!Array.isArray(input)) {
        throw new Error('Catalog data must be an array')
    }

    const properties = input.map(normalizeProperty)
    const ids = new Set()
    const slugs = new Set()

    for (const property of properties) {
        if (ids.has(property.id)) {
            throw new Error(`Duplicate property id: ${property.id}`)
        }
        if (slugs.has(property.slug)) {
            throw new Error(`Duplicate property slug: ${property.slug}`)
        }
        ids.add(property.id)
        slugs.add(property.slug)
    }

    return properties
}
