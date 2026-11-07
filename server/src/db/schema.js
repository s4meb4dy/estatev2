import { relations } from 'drizzle-orm'
import {
    bigint,
    boolean,
    index,
    integer,
    numeric,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uuid,
} from 'drizzle-orm/pg-core'

export const propertyStatusEnum = pgEnum('property_status', [
    'draft',
    'published',
    'sold',
    'archived',
])

export const properties = pgTable(
    'properties',
    {
        id: uuid('id').defaultRandom().primaryKey(),
        slug: text('slug').notNull().unique(),
        title: text('title').notNull(),
        address: text('address').notNull(),
        price: bigint('price', { mode: 'number' }).notNull(),
        pricePerM2: bigint('price_per_m2', { mode: 'number' }),
        area: numeric('area', { precision: 12, scale: 2 }).notNull(),
        rooms: integer('rooms').notNull().default(0),
        floor: integer('floor').notNull(),
        floorsTotal: integer('floors_total').notNull(),
        description: text('description').notNull().default(''),
        about: text('about').notNull().default(''),
        condition: text('condition').notNull().default('Свободная продажа'),
        status: propertyStatusEnum('status').notNull().default('draft'),
        sortOrder: integer('sort_order').notNull().default(0),
        phone: text('phone').notNull().default(''),
        whatsapp: text('whatsapp').notNull().default(''),
        specialistName: text('specialist_name'),
        specialistRole: text('specialist_role'),
        specialistPhone: text('specialist_phone'),
        specialistWhatsapp: text('specialist_whatsapp'),
        specialistPhoto: text('specialist_photo'),
        publishedAt: timestamp('published_at', { withTimezone: true }),
        createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
        updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    },
    (table) => [
        index('properties_status_idx').on(table.status),
        index('properties_sort_idx').on(table.sortOrder),
    ]
)

export const propertyImages = pgTable(
    'property_images',
    {
        id: uuid('id').defaultRandom().primaryKey(),
        propertyId: uuid('property_id')
            .notNull()
            .references(() => properties.id, { onDelete: 'cascade' }),
        url: text('url').notNull(),
        alt: text('alt').notNull().default(''),
        sortOrder: integer('sort_order').notNull().default(0),
        isCover: boolean('is_cover').notNull().default(false),
        createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    },
    (table) => [index('property_images_property_idx').on(table.propertyId)]
)

export const propertiesRelations = relations(properties, ({ many }) => ({
    images: many(propertyImages),
}))

export const propertyImagesRelations = relations(propertyImages, ({ one }) => ({
    property: one(properties, {
        fields: [propertyImages.propertyId],
        references: [properties.id],
    }),
}))
