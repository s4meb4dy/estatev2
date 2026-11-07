import { z } from 'zod'

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    HOST: z.string().min(1).default('0.0.0.0'),
    PORT: z.coerce.number().int().min(1).max(65535).default(3000),
    DATABASE_URL: z.string().min(1, 'DATABASE_URL обязателен'),
    API_TOKEN: z.string().min(16, 'API_TOKEN должен быть не короче 16 символов'),
    SITE_ORIGIN: z.string().optional().default(''),
    LOG_LEVEL: z
        .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
        .default('info'),
    TRUST_PROXY: z.string().optional().default('false'),
    RATE_LIMIT_MAX: z.coerce.number().int().min(0).default(120),
    UPLOAD_DIR: z.string().optional().default('./uploads'),
    UPLOAD_PUBLIC_PREFIX: z.string().optional().default('/uploads'),
    UPLOAD_MAX_BYTES: z.coerce
        .number()
        .int()
        .min(1024)
        .default(10 * 1024 * 1024),
    REBUILD_WEBHOOK_URL: z.string().optional().default(''),
    REBUILD_TOKEN: z.string().optional().default(''),
})

export function loadConfig(env = process.env) {
    const parsed = envSchema.parse(env)

    return {
        nodeEnv: parsed.NODE_ENV,
        host: parsed.HOST,
        port: parsed.PORT,
        databaseUrl: parsed.DATABASE_URL,
        apiToken: parsed.API_TOKEN,
        siteOrigins: parsed.SITE_ORIGIN.split(',')
            .map((origin) => origin.trim())
            .filter(Boolean),
        logLevel: parsed.LOG_LEVEL,
        trustProxy: parsed.TRUST_PROXY === 'true' || parsed.TRUST_PROXY === '1',
        rateLimitMax: parsed.RATE_LIMIT_MAX,
        uploadDir: parsed.UPLOAD_DIR,
        uploadPublicPrefix: parsed.UPLOAD_PUBLIC_PREFIX,
        uploadMaxBytes: parsed.UPLOAD_MAX_BYTES,
        rebuildWebhookUrl: parsed.REBUILD_WEBHOOK_URL,
        rebuildToken: parsed.REBUILD_TOKEN,
    }
}
