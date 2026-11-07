import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
    TELEGRAM_BOT_TOKEN: z
        .string()
        .min(1, 'TELEGRAM_BOT_TOKEN обязателен'),
    TELEGRAM_ADMIN_IDS: z.string().min(1, 'TELEGRAM_ADMIN_IDS обязателен'),
    API_URL: z.string().url().default('http://localhost:3000'),
    API_TOKEN: z.string().min(16, 'API_TOKEN должен быть не короче 16 символов'),
    LOG_LEVEL: z
        .enum(['debug', 'info', 'warn', 'error', 'silent'])
        .default('info'),
})

export function loadConfig(env = process.env) {
    const parsed = envSchema.parse(env)
    const adminIds = parsed.TELEGRAM_ADMIN_IDS.split(',')
        .map((id) => Number(id.trim()))
        .filter((id) => Number.isInteger(id) && id > 0)

    if (adminIds.length === 0) {
        throw new Error('TELEGRAM_ADMIN_IDS не содержит корректных id')
    }

    return {
        botToken: parsed.TELEGRAM_BOT_TOKEN,
        adminIds: new Set(adminIds),
        apiUrl: parsed.API_URL.replace(/\/$/, ''),
        apiToken: parsed.API_TOKEN,
        logLevel: parsed.LOG_LEVEL,
    }
}
