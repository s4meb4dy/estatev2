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

export async function propertyRoutes(
    app,
    { repository, uploadStorage, rebuildNotifier }
) {
    const service = createPropertyService(repository)

    function notifyRebuild(reason) {
        if (rebuildNotifier) {
            void rebuildNotifier.notify(reason)
        }
    }

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

            notifyRebuild('property.created')

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
            const property = await service.update(id, input)

            notifyRebuild('property.updated')

            return property
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

            notifyRebuild('property.deleted')

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

            notifyRebuild('image.added')

            return reply.code(201).send(property)
        }
    )

    app.post(
        '/api/properties/:id/images/upload',
        {
            preHandler: app.authenticate,
            config: { rateLimit: { max: 60, timeWindow: '1 minute' } },
        },
        async (request, reply) => {
            const id = propertyIdSchema.parse(request.params.id)

            if (!request.isMultipart()) {
                return reply.code(415).send({
                    error: 'unsupported_media_type',
                    message: 'Ожидается multipart/form-data с полем file',
                })
            }

            const fields = {}
            let uploaded = null

            try {
                for await (const part of request.parts()) {
                    if (part.type === 'file') {
                        if (part.fieldname !== 'file' || uploaded) {
                            part.file.resume()
                            continue
                        }

                        uploaded = await uploadStorage.saveStream(
                            part.file,
                            part.mimetype
                        )
                    } else {
                        fields[part.fieldname] = String(part.value)
                    }
                }

                if (!uploaded) {
                    return reply.code(400).send({
                        error: 'file_required',
                        message: 'Нужно передать файл в поле file',
                    })
                }

                const property = await service.addImage(id, {
                    url: uploaded.url,
                    alt: fields.alt ?? '',
                    isCover:
                        fields.isCover === 'true' || fields.isCover === '1',
                })

                notifyRebuild('image.uploaded')

                return reply.code(201).send(property)
            } catch (error) {
                if (uploaded) {
                    await uploadStorage.remove(uploaded.url).catch(() => {})
                }

                throw error
            }
        }
    )

    app.patch(
        '/api/properties/:id/images/:imageId',
        { preHandler: app.authenticate },
        async (request) => {
            const id = propertyIdSchema.parse(request.params.id)
            const imageId = propertyIdSchema.parse(request.params.imageId)
            const input = imageUpdateSchema.parse(request.body)
            const property = await service.updateImage(id, imageId, input)

            notifyRebuild('image.updated')

            return property
        }
    )

    app.delete(
        '/api/properties/:id/images/:imageId',
        { preHandler: app.authenticate },
        async (request) => {
            const id = propertyIdSchema.parse(request.params.id)
            const imageId = propertyIdSchema.parse(request.params.imageId)
            const property = await service.removeImage(id, imageId)

            notifyRebuild('image.deleted')

            return property
        }
    )

    app.put(
        '/api/properties/:id/images/order',
        { preHandler: app.authenticate },
        async (request) => {
            const id = propertyIdSchema.parse(request.params.id)
            const { imageIds } = imageOrderSchema.parse(request.body)
            const property = await service.reorderImages(id, imageIds)

            notifyRebuild('image.reordered')

            return property
        }
    )
}
