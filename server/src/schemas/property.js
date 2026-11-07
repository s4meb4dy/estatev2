import { z } from 'zod'

const slugSchema = z
    .string()
    .min(1)
    .max(80)
    .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        'Slug может содержать только латинские буквы, цифры и дефисы'
    )

const imageUrlSchema = z
    .string()
    .min(1, 'URL изображения обязателен')
    .max(2000)
    .refine(
        (value) => /^(https?:\/\/|\/)/.test(value),
        'URL изображения должен начинаться с http(s):// или /'
    )

const imageInputSchema = z.object({
    url: imageUrlSchema,
    alt: z.string().max(300).optional().default(''),
    sortOrder: z.number().int().min(0).optional(),
    isCover: z.boolean().optional(),
})

const specialistSchema = z.object({
    name: z.string().min(1),
    role: z.string().max(100).optional().default('Риэлтор'),
    phone: z.string().max(50).optional().default(''),
    whatsapp: z.string().max(50).optional().default(''),
    photo: z.string().max(500).optional().default(''),
})

const propertyBaseSchema = z.object({
    slug: slugSchema.optional(),
    title: z.string().min(1).max(300),
    address: z.string().min(1).max(300),
    price: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
    pricePerM2: z.number().int().positive().max(Number.MAX_SAFE_INTEGER).optional(),
    area: z.number().positive().max(1000000),
    rooms: z.number().int().min(0).max(100).optional(),
    floor: z.number().int().positive().max(1000),
    floorsTotal: z.number().int().positive().max(1000),
    description: z.string().max(20000).optional(),
    about: z.string().max(50000).optional(),
    condition: z.string().max(200).optional(),
    status: z.enum(['draft', 'published', 'sold', 'archived']).optional(),
    sortOrder: z.number().int().min(0).optional(),
    phone: z.string().max(50).optional(),
    whatsapp: z.string().max(50).optional(),
    specialist: specialistSchema.optional(),
    images: z.array(imageInputSchema).max(50).optional(),
    publishedAt: z.coerce.date().optional(),
})

const floorIsValid = (value) =>
    value.floor === undefined ||
    value.floorsTotal === undefined ||
    value.floor <= value.floorsTotal

const floorError = {
    message: 'Этаж не может быть больше количества этажей',
    path: ['floor'],
}

export const propertyCreateSchema = propertyBaseSchema.refine(
    floorIsValid,
    floorError
)

export const propertyUpdateSchema = propertyBaseSchema
    .partial()
    .refine((value) => Object.keys(value).length > 0, {
        message: 'Нужно передать хотя бы одно поле',
    })
    .refine(floorIsValid, floorError)

export const propertyQuerySchema = z.object({
    status: z
        .enum(['draft', 'published', 'sold', 'archived', 'all'])
        .optional(),
    limit: z.coerce.number().int().min(1).max(200).default(50),
    offset: z.coerce.number().int().min(0).default(0),
})

export const propertyIdSchema = z.string().uuid('Некорректный id объекта')

export const propertySlugSchema = z.string().min(1).max(80)

export const imageCreateSchema = imageInputSchema

export const imageUpdateSchema = z
    .object({
        alt: z.string().max(300).optional(),
        sortOrder: z.number().int().min(0).optional(),
        isCover: z.boolean().optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
        message: 'Нужно передать хотя бы одно поле',
    })

export const imageOrderSchema = z.object({
    imageIds: z.array(z.string().uuid()).min(1).max(100),
})
