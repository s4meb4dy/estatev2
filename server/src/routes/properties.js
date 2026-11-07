import {
    imageCreateSchema,
    imageOrderSchema,
    imageUpdateSchema,
    propertyCreateSchema,
    propertyIdSchema,
    propertyQuerySchema,
    propertySlugSchema,
    propertyUpdateSchema,
} from '../schemas/property.js'
import { createPropertyService } from '../services/properties.service.js'

export async function propertyRoutes(app, { repository }) {
    const service = createPropertyService(repository)

    app.get(
        '/api/properties',
        { preHandler: app.optionalAuthenticate },
        async (request) => {
            const query = propertyQuerySchema.parse(request.query)

            return service.list(query, { includeAll: request.isAdmin })
        }
    )

    app.get(
        '/api/properties/:slug',
        { preHandler: app.optionalAuthenticate },
        async (request, reply) => {
            const slug = propertySlugSchema.parse(request.params.slug)
            const property = await service.getBySlug(slug, {
                includeAll: request.isAdmin,
            })

            if (!property) {
                return reply.code(404).send({
                    error: 'property_not_found',
                    message: 'Объект не найден',
                })
            }

            return property
        }
    )

    app.post(
        '/api/properties',
        {
            preHandler: app.authenticate,
            config: { rateLimit: { max: 30, timeWindow: '1 minute' } },
        },
        async (request, reply) => {
            const input = propertyCreateSchema.parse(request.body)
            const property = await service.create(input)

            return reply.code(201).send(property)
        }
    )

    app.patch(
        '/api/properties/:id',
        {
            preHandler: app.authenticate,
            config: { rateLimit: { max: 60, timeWindow: '1 minute' } },
        },
        async (request) => {
            const id = propertyIdSchema.parse(request.params.id)
            const input = propertyUpdateSchema.parse(request.body)

            return service.update(id, input)
        }
    )

    app.delete(
        '/api/properties/:id',
        {
            preHandler: app.authenticate,
            config: { rateLimit: { max: 30, timeWindow: '1 minute' } },
        },
        async (request, reply) => {
            const id = propertyIdSchema.parse(request.params.id)
            const hard =
                request.query?.hard === 'true' || request.query?.hard === '1'

            await service.remove(id, { hard })

            return reply.code(204).send()
        }
    )

    app.post(
        '/api/properties/:id/images',
        { preHandler: app.authenticate },
        async (request, reply) => {
            const id = propertyIdSchema.parse(request.params.id)
            const input = imageCreateSchema.parse(request.body)
            const property = await service.addImage(id, input)

            return reply.code(201).send(property)
        }
    )

    app.patch(
        '/api/properties/:id/images/:imageId',
        { preHandler: app.authenticate },
        async (request) => {
            const id = propertyIdSchema.parse(request.params.id)
            const imageId = propertyIdSchema.parse(request.params.imageId)
            const input = imageUpdateSchema.parse(request.body)

            return service.updateImage(id, imageId, input)
        }
    )

    app.delete(
        '/api/properties/:id/images/:imageId',
        { preHandler: app.authenticate },
        async (request) => {
            const id = propertyIdSchema.parse(request.params.id)
            const imageId = propertyIdSchema.parse(request.params.imageId)

            return service.removeImage(id, imageId)
        }
    )

    app.put(
        '/api/properties/:id/images/order',
        { preHandler: app.authenticate },
        async (request) => {
            const id = propertyIdSchema.parse(request.params.id)
            const { imageIds } = imageOrderSchema.parse(request.body)

            return service.reorderImages(id, imageIds)
        }
    )
}
