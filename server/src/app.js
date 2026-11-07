import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import multipart from '@fastify/multipart'
import rateLimit from '@fastify/rate-limit'
import { createUploadStorage } from './storage/uploads.js'
import { createRebuildNotifier } from './services/rebuild.service.js'
import authPlugin from './plugins/auth.js'
import { registerErrorHandler } from './plugins/error-handler.js'
import { healthRoutes } from './routes/health.js'
import { propertyRoutes } from './routes/properties.js'

export async function buildApp({ repository, config, rebuildNotifier }) {
    const app = Fastify({
        logger:
            config.logLevel === 'silent'
                ? false
                : {
                      level: config.logLevel,
                      redact: [
                          'req.headers.authorization',
                          'req.headers["x-api-token"]',
                      ],
                  },
        trustProxy: config.trustProxy,
        bodyLimit: 1024 * 1024,
    })

    const uploadStorage = createUploadStorage({
        directory: config.uploadDir || './uploads',
        publicPrefix: config.uploadPublicPrefix || '/uploads',
        maxBytes: config.uploadMaxBytes || 10 * 1024 * 1024,
    })

    const notifier =
        rebuildNotifier ??
        createRebuildNotifier({
            url: config.rebuildWebhookUrl,
            token: config.rebuildToken,
            logger: app.log,
        })

    await app.register(helmet, {
        contentSecurityPolicy: false,
        crossOriginResourcePolicy: {
            policy:
                config.siteOrigins.length > 0 ? 'cross-origin' : 'same-origin',
        },
    })

    await app.register(multipart, {
        limits: {
            fileSize: uploadStorage.maxBytes,
            files: 1,
            fields: 10,
            parts: 20,
        },
    })

    if (config.siteOrigins.length > 0) {
        await app.register(cors, {
            origin: config.siteOrigins,
            methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
        })
    }

    if (config.rateLimitMax > 0) {
        await app.register(rateLimit, {
            max: config.rateLimitMax,
            timeWindow: '1 minute',
        })
    }

    app.decorate('repository', repository)
    app.decorate('config', config)
    app.decorate('uploadStorage', uploadStorage)
    app.decorate('rebuildNotifier', notifier)

    await app.register(authPlugin, { apiToken: config.apiToken })

    registerErrorHandler(app)

    await app.register(healthRoutes, { repository })
    await app.register(propertyRoutes, {
        repository,
        uploadStorage,
        rebuildNotifier: notifier,
    })

    return app
}
